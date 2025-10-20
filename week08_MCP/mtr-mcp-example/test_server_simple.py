"""
Simple test to verify MCP server is working correctly
"""

import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# For HTTP/SSE connection
import httpx
from mcp.client.sse import sse_client


async def test_mcp_server():
    """Test the MCP server connection and tools"""

    print("🔍 Testing MCP Server at http://127.0.0.1:8000/sse")
    print("=" * 60)

    try:
        # Connect using SSE
        async with httpx.AsyncClient() as client:
            async with sse_client(client, "http://127.0.0.1:8000/sse") as (read, write):
                async with ClientSession(read, write) as session:
                    # Initialize the session
                    await session.initialize()
                    print("✅ Connected to MCP server!")

                    # List available tools
                    tools = await session.list_tools()
                    print(f"\n📋 Available tools: {len(tools.tools)}")
                    for tool in tools.tools:
                        print(f"  • {tool.name}: {tool.description[:80]}...")

                    # Test the tool
                    print("\n🧪 Testing get_next_train_schedule tool...")
                    print("   Query: TKO station on Tseung Kwan O Line")

                    result = await session.call_tool(
                        "get_next_train_schedule",
                        arguments={"line": "TKL", "sta": "TKO", "lang": "EN"},
                    )

                    print("\n✅ Tool executed successfully!")
                    print(f"   Result preview: {str(result)[:200]}...")

                    print("\n" + "=" * 60)
                    print("🎉 MCP Server is working correctly!")

    except Exception as e:
        print(f"\n❌ Error connecting to MCP server: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure the server is running: python mcp_server.py")
        print("2. Check the server is at http://127.0.0.1:8000")
        print("3. Verify the endpoint is /sse (not just /)")


if __name__ == "__main__":
    asyncio.run(test_mcp_server())
