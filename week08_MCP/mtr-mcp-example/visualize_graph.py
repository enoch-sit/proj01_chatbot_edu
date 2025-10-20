"""
Visualize LangGraph Structure

This script generates a visual diagram of the LangGraph agent workflow.
It creates a PNG image showing nodes, edges, and decision points.
"""

import asyncio
import os
from typing import TypedDict, Annotated
from dotenv import load_dotenv

from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.tools import tool

# Load environment variables
load_dotenv()


# State definition
class AgentState(TypedDict):
    messages: Annotated[list, "The messages in the conversation"]


async def build_graph():
    """Build the LangGraph workflow for visualization"""
    
    # Initialize AWS Bedrock Nova Lite (dummy for visualization)
    llm = ChatBedrock(
        model_id=os.getenv("BEDROCK_MODEL", "amazon.nova-lite-v1:0"),
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        model_kwargs={"temperature": 0.7, "max_tokens": 5000}
    )
    
    # Create dummy tool
    @tool
    async def mtr_train_schedule(line: str, sta: str, lang: str = "EN") -> str:
        """Get MTR train schedule."""
        return "dummy"
    
    llm_with_tools = llm.bind_tools([mtr_train_schedule])
    
    # Define nodes
    async def call_model(state: AgentState):
        """Call the LLM with current state"""
        messages = state["messages"]
        response = await llm_with_tools.ainvoke(messages)
        return {"messages": [response]}
    
    async def execute_tools(state: AgentState):
        """Execute any tool calls from the LLM"""
        return {"messages": []}
    
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
    
    # Compile with memory
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app


def main():
    """Generate graph visualization"""
    print("🎨 Generating LangGraph visualization...\n")
    
    # Build the graph
    app = asyncio.run(build_graph())
    
    # Method 1: Generate Mermaid diagram (text-based)
    try:
        mermaid_code = app.get_graph().draw_mermaid()
        print("✓ Mermaid diagram generated!")
        print("\n" + "=" * 60)
        print("MERMAID DIAGRAM CODE:")
        print("=" * 60)
        print(mermaid_code)
        print("=" * 60)
        print("\nℹ️  Copy this code to https://mermaid.live/ to visualize online")
        
        # Save to file
        with open("graph_mermaid.txt", "w", encoding="utf-8") as f:
            f.write(mermaid_code)
        print("✓ Saved to: graph_mermaid.txt\n")
    except Exception as e:
        print(f"⚠️  Mermaid generation failed: {e}\n")
    
    # Method 2: Generate PNG image (requires graphviz)
    try:
        from IPython.display import Image
        png_data = app.get_graph().draw_mermaid_png()
        
        with open("graph_diagram.png", "wb") as f:
            f.write(png_data)
        
        print("✓ PNG diagram generated!")
        print("✓ Saved to: graph_diagram.png")
        print("\n📊 Open graph_diagram.png to see the visual diagram!\n")
    except ImportError:
        print("⚠️  PNG generation requires 'graphviz' package")
        print("   Install with: uv pip install pygraphviz")
        print("   Or view the Mermaid diagram online instead\n")
    except Exception as e:
        print(f"⚠️  PNG generation failed: {e}")
        print("   Try the Mermaid diagram instead\n")
    
    # Method 3: ASCII representation
    print("\n" + "=" * 60)
    print("ASCII GRAPH STRUCTURE:")
    print("=" * 60)
    print("""
    ┌─────────────────┐
    │  START (Entry)  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │     agent       │  ◄─────┐
    │  (Call Model)   │        │
    └────────┬────────┘        │
             │                 │
             ▼                 │
    ┌─────────────────┐        │
    │ should_continue │        │
    │   (Decision)    │        │
    └────┬───────┬────┘        │
         │       │             │
   tools │       │ end         │
         │       │             │
         ▼       ▼             │
    ┌────────┐  END            │
    │ tools  │                 │
    │(Execute│                 │
    │ Tools) │                 │
    └────┬───┘                 │
         │                     │
         └─────────────────────┘
         
    """)
    print("=" * 60)
    
    print("\n📋 GRAPH COMPONENTS:")
    print("-" * 60)
    print("Nodes:")
    print("  • agent      - Calls AWS Bedrock Nova Lite with tools")
    print("  • tools      - Executes MCP tool calls")
    print("\nEdges:")
    print("  • START → agent           (Entry point)")
    print("  • agent → should_continue (Conditional routing)")
    print("  • should_continue → tools (If tool_calls present)")
    print("  • should_continue → END   (If no tool_calls)")
    print("  • tools → agent           (Loop back for response)")
    print("\nState:")
    print("  • messages: List[BaseMessage]  (Conversation history)")
    print("\nCheckpointer:")
    print("  • MemorySaver  (In-memory conversation state)")
    print("-" * 60)
    
    print("\n✅ Visualization complete!")
    print("\nℹ️  The graph shows an agentic loop:")
    print("   1. User sends message")
    print("   2. Agent (Nova Lite) decides to call tools or respond")
    print("   3. If tools needed, execute MCP call and loop back")
    print("   4. Agent generates final response")
    print("   5. State saved to memory for next turn\n")


if __name__ == "__main__":
    main()
