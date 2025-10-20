"""
LangGraph Demo with MCP Server, AWS Bedrock Nova Lite, and Chat History

This enhanced demo shows how to:
1. Connect to an MCP server (MTR train API)
2. Use AWS Bedrock Nova Lite model
3. Create an agent that can query MTR train schedules using LangGraph
4. Maintain conversation history for multi-turn interactions
"""

import asyncio
import os
from typing import TypedDict, Annotated
from dotenv import load_dotenv

from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from mcp import http_sse_client, HttpSseServerParameters

# Load environment variables
load_dotenv()

# State definition for LangGraph with conversation history
class AgentState(TypedDict):
    messages: Annotated[list, "The messages in the conversation"]


async def create_mcp_agent_with_history():
    """Create a LangGraph agent with MCP tools, Nova Lite, and chat history"""
    
    # Connect to MCP server
    mcp_url = os.getenv("MCP_SERVER_URL", "http://localhost:8000/sse")
    params = HttpSseServerParameters(url=mcp_url)
    
    async with http_sse_client(params) as mcp_session:
        await mcp_session.initialize()
        
        # Get tools from MCP server
        mcp_tools = await mcp_session.list_tools()
        print(f"✓ Connected to MCP server")
        print(f"✓ Discovered {len(mcp_tools)} tools: {[t.name for t in mcp_tools]}\n")
        
        # Initialize AWS Bedrock Nova Lite
        llm = ChatBedrock(
            model_id=os.getenv("BEDROCK_MODEL", "amazon.nova-lite-v1:0"),
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            model_kwargs={
                "temperature": 0.7,
                "max_tokens": 5000,
            }
        )
        
        # Create a simple tool function that the LLM can call
        async def get_train_schedule(line: str, sta: str, lang: str = "EN") -> str:
            """
            Get the next train arrival schedule for an MTR line and station.
            
            Args:
                line: MTR line code (e.g., 'TKL', 'AEL', 'TCL')
                sta: Station code (e.g., 'TKO', 'HOK')
                lang: Language ('EN' or 'TC')
            """
            result = await mcp_session.call_tool(
                "get_next_train_schedule",
                {"line": line, "sta": sta, "lang": lang}
            )
            return str(result)
        
        # Bind the tool to the LLM
        from langchain_core.tools import tool
        
        @tool
        async def mtr_train_schedule(line: str, sta: str, lang: str = "EN") -> str:
            """Get MTR train schedule. Use line codes like TKL, AEL, TCL and station codes like TKO, HOK."""
            return await get_train_schedule(line, sta, lang)
        
        llm_with_tools = llm.bind_tools([mtr_train_schedule])
        
        # System prompt to guide the agent
        SYSTEM_PROMPT = """You are a helpful Hong Kong MTR train assistant. You have access to real-time train schedules through the MTR API.

Your capabilities:
- Check next train arrival times for any MTR station
- Provide train schedules in English or Traditional Chinese
- Help users plan their MTR journeys
- Remember context from previous messages in the conversation

When using the mtr_train_schedule tool, you need to provide:
1. line: MTR line code (e.g., 'TKL', 'AEL', 'TCL', 'ISL', 'TWL', 'KTL', 'EAL', 'TML', 'SIL', 'DRL')
2. sta: Station code (e.g., 'TKO', 'HOK', 'CEN', 'TST')
3. lang: 'EN' for English or 'TC' for Traditional Chinese (default: 'EN')

Common MTR lines and stations:
- Tseung Kwan O Line (TKL): TKO, HAH, POA, YAT, TIK, NOP, QUB
- Airport Express (AEL): HOK, KOW, TSY, AIR, AWE
- Tung Chung Line (TCL): HOK, KOW, OLY, NAC, LAK, TSY, SUN, TUC
- Island Line (ISL): CEN, ADM, CAB, NOP, QUB, TAK, CHW
- Tsuen Wan Line (TWL): CEN, ADM, TST, JOR, YMT, MOK, SSP, TSW
- Kwun Tong Line (KTL): WHA, YMT, MOK, KOT, DIH, KWT, YAT, TIK
- East Rail Line (EAL): ADM, HUH, MKK, KOT, TAW, SHT, UNI, SHS
- Tuen Ma Line (TML): WKS, TAW, HUH, NAC, TWW, TUM
- South Island Line (SIL): ADM, OCP, WCH, LET, SOH
- Disneyland Resort Line (DRL): SUN, DIS

When you receive train data:
- Summarize the key information clearly
- Mention the minutes until arrival
- Include the destination and platform number
- If there's a service delay, alert the user
- Be conversational and helpful
- Use context from previous messages when relevant

If a user refers to "that station" or "the same line", use context from conversation history."""
        
        # Define the agent logic
        async def call_model(state: AgentState):
            """Call the LLM with current state"""
            messages = state["messages"]
            
            # Inject system prompt if not already present
            if not any(isinstance(msg, SystemMessage) for msg in messages):
                messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
            
            response = await llm_with_tools.ainvoke(messages)
            return {"messages": [response]}
        
        async def execute_tools(state: AgentState):
            """Execute any tool calls from the LLM"""
            messages = state["messages"]
            last_message = messages[-1]
            
            tool_results = []
            if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
                for tool_call in last_message.tool_calls:
                    # Execute the tool
                    result = await get_train_schedule(**tool_call["args"])
                    tool_results.append(
                        ToolMessage(
                            content=result,
                            tool_call_id=tool_call["id"]
                        )
                    )
            
            return {"messages": tool_results}
        
        def should_continue(state: AgentState):
            """Determine if we should continue or end"""
            last_message = state["messages"][-1]
            if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
                return "tools"
            return "end"
        
        # Build the graph
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("agent", call_model)
        workflow.add_node("tools", execute_tools)
        
        # Set entry point
        workflow.set_entry_point("agent")
        
        # Add conditional edges
        workflow.add_conditional_edges(
            "agent",
            should_continue,
            {
                "tools": "tools",
                "end": END
            }
        )
        
        # After tools, go back to agent
        workflow.add_edge("tools", "agent")
        
        # Compile the graph WITH memory (checkpointer)
        memory = MemorySaver()
        app = workflow.compile(checkpointer=memory)
        
        # Configuration for the conversation thread
        config = {"configurable": {"thread_id": "demo-conversation"}}
        
        # Helper function to chat with memory
        async def chat(user_message: str, config: dict):
            """Send a message and get response while maintaining history"""
            result = await app.ainvoke(
                {"messages": [HumanMessage(content=user_message)]},
                config=config
            )
            
            # Extract the final AI response
            for msg in reversed(result["messages"]):
                if isinstance(msg, AIMessage) and msg.content and not hasattr(msg, 'tool_calls'):
                    return msg.content
            return "No response generated"
        
        # Run multi-turn conversation demo
        print("=" * 60)
        print("LangGraph + MCP + Nova Lite Demo (With Chat History)")
        print("=" * 60)
        
        # Turn 1
        print("\n💬 Turn 1:")
        print("User: When is the next train at Tseung Kwan O station?")
        print("-" * 60)
        response = await chat(
            "When is the next train at Tseung Kwan O station on the Tseung Kwan O line?",
            config
        )
        print(f"🤖 Agent: {response}")
        
        # Turn 2 - Using context from previous conversation
        print("\n\n💬 Turn 2:")
        print("User: What about trains going the other direction?")
        print("-" * 60)
        response = await chat(
            "What about trains going the other direction?",
            config
        )
        print(f"🤖 Agent: {response}")
        
        # Turn 3 - Different station
        print("\n\n💬 Turn 3:")
        print("User: Now check Hong Kong station on Airport Express")
        print("-" * 60)
        response = await chat(
            "Now check Hong Kong station on Airport Express",
            config
        )
        print(f"🤖 Agent: {response}")
        
        # Turn 4 - Referring back to previous context
        print("\n\n💬 Turn 4:")
        print("User: Compare it with the first station I asked about")
        print("-" * 60)
        response = await chat(
            "Compare it with the first station I asked about",
            config
        )
        print(f"🤖 Agent: {response}")
        
        print("\n" + "=" * 60)
        print("Demo completed! The agent remembered the entire conversation!")
        print("=" * 60)
        
        # Show conversation history
        print("\n📜 Conversation History:")
        print("-" * 60)
        final_state = await app.aget_state(config)
        for i, msg in enumerate(final_state.values["messages"], 1):
            if isinstance(msg, HumanMessage):
                print(f"{i}. 👤 User: {msg.content}")
            elif isinstance(msg, AIMessage) and msg.content:
                print(f"{i}. 🤖 Agent: {msg.content[:100]}...")
            elif isinstance(msg, SystemMessage):
                print(f"{i}. ⚙️ System: [System prompt loaded]")


def main():
    """Main entry point"""
    print("\n🚀 Starting LangGraph MCP Demo with Chat History...\n")
    
    # Check environment variables
    required_vars = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please create a .env file based on .env.example")
        return
    
    print("✓ Environment variables loaded")
    print(f"✓ Using model: {os.getenv('BEDROCK_MODEL', 'amazon.nova-lite-v1:0')}")
    print(f"✓ AWS Region: {os.getenv('AWS_REGION', 'us-east-1')}\n")
    
    # Run the async agent
    asyncio.run(create_mcp_agent_with_history())


if __name__ == "__main__":
    main()
