"""
LangGraph Demo - Full MCP Feature Showcase
===========================================

This demo demonstrates ALL MCP features:
1. Tools (Model-controlled): get_next_train_schedule, get_next_train_structured
2. Resources (Application-controlled): mtr://stations/list, mtr://lines/map
3. Prompts (User-controlled): check_next_train, plan_mtr_journey, compare_stations

Flow:
- Discovers and loads MCP Resources as context
- Uses Prompts to guide user interactions
- Invokes both human-friendly and structured Tools
- Demonstrates complete journey planning workflow
"""

import asyncio
import os
from typing import Annotated

from langchain_aws import ChatBedrock
from langgraph.graph import StateGraph, END, add_messages
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from mcp import ClientSession
from mcp.client.sse import sse_client
from typing import TypedDict, Annotated

# Environment setup (disable LangSmith if you don't have valid API key)
os.environ["LANGSMITH_TRACING"] = "false"  # Set to "true" if you have valid LangSmith API key
# os.environ["LANGSMITH_API_KEY"] = "your-api-key-here"
# os.environ["LANGSMITH_PROJECT"] = "your-project-name"

# AWS Bedrock LLM (with error handling for credentials)
try:
    llm = ChatBedrock(
        model_id="amazon.nova-lite-v1:0",
        region_name="us-east-1",
        model_kwargs={
            "temperature": 0.7,
            "max_tokens": 5000,
        }
    )
    print("✓ AWS Bedrock LLM initialized")
except Exception as e:
    print(f"⚠️  Warning: AWS Bedrock initialization failed: {e}")
    print("   Make sure your AWS credentials are configured:")
    print("   - Run: aws configure")
    print("   - Or set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY")
    print("\n   Continuing anyway to demonstrate MCP features...")
    llm = None  # Will be handled later


class AgentState(TypedDict):
    """State for LangGraph agent - same as working demo."""
    messages: Annotated[list, add_messages]


async def load_mcp_resources(session: ClientSession) -> dict:
    """
    Load all MCP Resources as context.
    
    Returns:
        dict with 'stations' and 'network' keys containing resource content
    """
    print("\n📚 Loading MCP Resources...")
    
    # List available resources
    resources = await session.list_resources()
    print(f"   Found {len(resources.resources)} resources:")
    for res in resources.resources:
        print(f"   - {res.uri}: {res.name}")
    
    # Read station list resource
    station_content = await session.read_resource("mtr://stations/list")
    stations_text = station_content.contents[0].text
    print(f"   ✓ Loaded station reference ({len(stations_text)} chars)")
    
    # Read network map resource
    network_content = await session.read_resource("mtr://lines/map")
    network_text = network_content.contents[0].text
    print(f"   ✓ Loaded network map ({len(network_text)} chars)")
    
    return {
        "stations": stations_text,
        "network": network_text
    }


async def demonstrate_prompts(session: ClientSession):
    """
    Demonstrate all MCP Prompts (user-controlled templates).
    """
    print("\n💬 Demonstrating MCP Prompts...")
    
    # List available prompts
    prompts = await session.list_prompts()
    print(f"   Found {len(prompts.prompts)} prompts:")
    for p in prompts.prompts:
        args = ", ".join([a.name for a in p.arguments]) if p.arguments else "none"
        print(f"   - {p.name}({args}): {p.description}")
    
    # Example 1: Quick schedule check
    print("\n   Example 1: Quick Schedule Check")
    prompt1 = await session.get_prompt(
        "check_next_train",
        arguments={"line": "TKL", "station": "TKO"}
    )
    print(f"   Prompt: {prompt1.messages[0].content.text[:100]}...")
    
    # Example 2: Journey planning
    print("\n   Example 2: Journey Planning")
    prompt2 = await session.get_prompt(
        "plan_mtr_journey",
        arguments={"origin": "Tseung Kwan O", "destination": "Central"}
    )
    print(f"   Prompt: {prompt2.messages[0].content.text[:100]}...")
    
    # Example 3: Station comparison
    print("\n   Example 3: Station Comparison")
    prompt3 = await session.get_prompt(
        "compare_stations",
        arguments={
            "station1": "Tseung Kwan O",
            "station2": "North Point",
            "station3": "Admiralty"
        }
    )
    print(f"   Prompt: {prompt3.messages[0].content.text[:100]}...")


async def create_mcp_tools(session: ClientSession):
    """
    Discover and wrap MCP Tools for LangChain.
    
    Returns:
        Tuple of (tool_decorators, tool_functions)
        - tool_decorators: List for .bind_tools()
        - tool_functions: Dict for manual execution
    """
    print("\n🔧 Loading MCP Tools...")
    
    # List available tools
    tools_list = await session.list_tools()
    print(f"   Found {len(tools_list.tools)} tools:")
    for t in tools_list.tools:
        print(f"   - {t.name}: {t.description}")
    
    # Create actual async functions that call MCP
    async def get_next_train_schedule_func(line: str, sta: str, lang: str = "EN") -> str:
        """Execute get_next_train_schedule via MCP"""
        result = await session.call_tool("get_next_train_schedule", arguments={"line": line, "sta": sta, "lang": lang})
        if result.content:
            return str(result.content[0].text if hasattr(result.content[0], 'text') else result.content[0])
        return str(result)
    
    async def get_next_train_structured_func(line: str, sta: str, lang: str = "EN") -> str:
        """Execute get_next_train_structured via MCP"""
        result = await session.call_tool("get_next_train_structured", arguments={"line": line, "sta": sta, "lang": lang})
        if result.content:
            return str(result.content[0].text if hasattr(result.content[0], 'text') else result.content[0])
        return str(result)
    
    # Create tool decorators for LangChain
    @tool
    async def get_next_train_schedule(line: str, sta: str, lang: str = "EN") -> str:
        """Get MTR train schedule (human-friendly). Use line codes like TKL, AEL and station codes like TKO, HOK."""
        return await get_next_train_schedule_func(line, sta, lang)
    
    @tool
    async def get_next_train_structured(line: str, sta: str, lang: str = "EN") -> str:
        """Get MTR train schedule (JSON format). Use line codes like TKL, AEL and station codes like TKO, HOK."""
        return await get_next_train_structured_func(line, sta, lang)
    
    tool_decorators = [get_next_train_schedule, get_next_train_structured]
    tool_functions = {
        "get_next_train_schedule": get_next_train_schedule_func,
        "get_next_train_structured": get_next_train_structured_func
    }
    
    print(f"   ✓ Wrapped {len(tool_decorators)} tools for LangChain")
    
    return tool_decorators, tool_functions


def create_agent_graph(mcp_tools, resources: dict, tool_functions: dict):
    """
    Create LangGraph agent with MCP tools and resource context.
    Uses MANUAL tool execution like langgraph_demo_with_history.py (WORKING pattern)
    
    Args:
        mcp_tools: List of wrapped MCP tool decorators
        resources: Dict with station and network resource content
        tool_functions: Dict mapping tool names to actual async functions
    """
    if llm is None:
        print("\n❌ Error: Cannot create agent without AWS Bedrock LLM")
        print("   Please configure AWS credentials and restart")
        return None
    
    # Bind tools to LLM
    llm_with_tools = llm.bind_tools(mcp_tools)
    
    # System message with resource context
    SYSTEM_PROMPT = f"""You are an MTR (Hong Kong Mass Transit Railway) assistant with access to:

🔧 TOOLS (Model-controlled - you decide when to call):
- get_next_train_schedule: Returns human-friendly text format (use line and sta codes like TKL, TKO)
- get_next_train_structured: Returns JSON with programmatic data (use line and sta codes)

📚 RESOURCES (Application-provided context):

{resources['stations']}

{resources['network']}

When helping users:
1. Use the station reference and network map to understand locations
2. Always use station CODES (TKO, HOK, CEN) and line CODES (TKL, AEL, ISL) in tool calls
3. Choose the appropriate tool:
   - get_next_train_schedule for direct user responses
   - get_next_train_structured when analyzing data programmatically
4. Translate user's station names to codes (e.g., "Tseung Kwan O" → "TKO")

Be concise and helpful!"""
    
    # Define agent node
    async def call_model(state: AgentState):
        """Call the LLM with current state"""
        messages = state["messages"]
        
        # Inject system prompt if not already present
        if not any(isinstance(msg, SystemMessage) for msg in messages):
            messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
        
        response = await llm_with_tools.ainvoke(messages)
        return {"messages": [response]}
    
    # Define tool execution node (MANUAL - like working demo)
    async def execute_tools(state: AgentState):
        """Execute any tool calls from the LLM - MANUAL EXECUTION"""
        messages = state["messages"]
        last_message = messages[-1]
        
        tool_results = []
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            for tool_call in last_message.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                
                # Execute the tool function directly
                if tool_name in tool_functions:
                    result = await tool_functions[tool_name](**tool_args)
                    tool_results.append(
                        ToolMessage(
                            content=str(result),
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
    
    return workflow.compile()


async def run_full_mcp_demo():
    """
    Main demo: showcases all MCP features in action.
    """
    print("=" * 70)
    print("🚇 MTR MCP Demo - Full Feature Showcase")
    print("=" * 70)
    
    # Start the MCP server in background
    print("\n🚀 Starting MCP server...")
    print("   (If server is already running, you can ignore this)")
    import subprocess
    server_process = subprocess.Popen(
        ["python", "mcp_server.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
    )
    
    # Wait for server to initialize
    print("   ⏳ Waiting 5 seconds for server initialization...")
    await asyncio.sleep(5)
    print("   ✓ Attempting to connect to http://127.0.0.1:8000/sse")
    
    try:
        # Connect to MCP server via SSE
        async with sse_client("http://127.0.0.1:8000/sse") as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                
                # Phase 1: Load Resources (Application-controlled)
                resources = await load_mcp_resources(session)
                
                # Phase 2: Demonstrate Prompts (User-controlled)
                await demonstrate_prompts(session)
                
                # Phase 3: Create Tools (Model-controlled)
                mcp_tools, tool_functions = await create_mcp_tools(session)
                
                # Phase 4: Build agent with full context
                print("\n🤖 Building LangGraph Agent...")
                app = create_agent_graph(mcp_tools, resources, tool_functions)
                
                if app is None:
                    print("\n" + "=" * 70)
                    print("⚠️  Demo stopped - AWS credentials required for agent")
                    print("=" * 70)
                    print("\n✅ MCP Features Successfully Demonstrated:")
                    print("   ✓ Resources: Loaded 2 resources (stations list, network map)")
                    print("   ✓ Prompts: Demonstrated 3 prompts (check, plan, compare)")
                    print("   ✓ Tools: Wrapped 2 tools for LangChain")
                    print("\nTo run the full agent demo:")
                    print("   1. Configure AWS credentials: aws configure")
                    print("   2. Or set environment variables:")
                    print("      set AWS_ACCESS_KEY_ID=your-key")
                    print("      set AWS_SECRET_ACCESS_KEY=your-secret")
                    print("   3. Run again: python langgraph_demo_full_mcp.py")
                    return
                
                print("   ✓ Agent ready with Tools, Resources, and Prompts")
                
                # Phase 5: Interactive conversation
                print("\n" + "=" * 70)
                print("💬 Starting Interactive Conversation")
                print("=" * 70)
                
                # Initialize state - Resources are embedded in system prompt, not stored in state
                state: AgentState = {
                    "messages": []
                }
                
                # Conversation scenarios demonstrating different features
                scenarios = [
                    {
                        "user": "What's the next train from Tseung Kwan O to Hong Kong?",
                        "demonstrates": "Human-friendly tool usage"
                    },
                    {
                        "user": "Compare the next 3 trains at Tseung Kwan O, North Point, and Admiralty. Which station has the soonest train?",
                        "demonstrates": "Structured tool for programmatic comparison"
                    },
                    {
                        "user": "Plan my journey from TKO to Central",
                        "demonstrates": "Multi-step planning with resources"
                    }
                ]
                
                for i, scenario in enumerate(scenarios, 1):
                    print(f"\n{'─' * 70}")
                    print(f"Scenario {i}: {scenario['demonstrates']}")
                    print(f"{'─' * 70}")
                    print(f"👤 User: {scenario['user']}")
                    
                    # Add user message
                    state["messages"].append(HumanMessage(content=scenario['user']))
                    
                    # Get agent response
                    result = await app.ainvoke(state)
                    state = result
                    
                    # Print assistant response
                    last_message = state["messages"][-1]
                    if isinstance(last_message, AIMessage):
                        print(f"\n🤖 Assistant: {last_message.content}")
                    
                    # Show tool calls if any
                    for msg in state["messages"][-3:]:  # Check last few messages
                        if hasattr(msg, "tool_calls") and msg.tool_calls:
                            for tc in msg.tool_calls:
                                print(f"\n   🔧 Tool Called: {tc['name']}")
                                print(f"      Args: {tc['args']}")
                
                print("\n" + "=" * 70)
                print("✅ Full MCP Demo Complete!")
                print("=" * 70)
                print("\nFeatures Demonstrated:")
                print("✓ Resources: Loaded station list and network map as context")
                print("✓ Prompts: Showed check_next_train, plan_mtr_journey, compare_stations")
                print("✓ Tools: Used both human-friendly and structured tools")
                print("✓ LangGraph: Multi-turn conversation with tool routing")
                print("\nAll MCP server-side features successfully integrated! 🎉")
    
    finally:
        # Clean up server process
        print("\n🛑 Shutting down MCP server...")
        server_process.terminate()
        server_process.wait(timeout=5)


if __name__ == "__main__":
    asyncio.run(run_full_mcp_demo())
