"""
Simple standalone MCP client for testing the MCP server
"""
import asyncio
from mcp import http_sse_client, HttpSseServerParameters


async def test_mcp_server():
    """Test connection to MCP server and call tools"""
    
    # Connect to MCP server
    print("🔌 Connecting to MCP server...")
    params = HttpSseServerParameters(url="http://localhost:8000/sse")
    
    async with http_sse_client(params) as session:
        # Initialize connection
        await session.initialize()
        print("✓ Connected!\n")
        
        # List available tools
        tools = await session.list_tools()
        print(f"📦 Available tools ({len(tools)}):")
        for tool in tools:
            print(f"  - {tool.name}: {tool.description}")
        print()
        
        # Test 1: Call with valid parameters
        print("🧪 Test 1: Get TKL line schedule at TKO station")
        print("-" * 60)
        result = await session.call_tool(
            "get_next_train_schedule",
            {"line": "TKL", "sta": "TKO", "lang": "EN"}
        )
        print(f"Result: {result}\n")
        
        # Test 2: Call with different station
        print("🧪 Test 2: Get AEL line schedule at HOK station")
        print("-" * 60)
        result = await session.call_tool(
            "get_next_train_schedule",
            {"line": "AEL", "sta": "HOK", "lang": "EN"}
        )
        print(f"Result: {result}\n")
        
        # Test 3: Test error handling (invalid line)
        print("🧪 Test 3: Test with invalid line code")
        print("-" * 60)
        result = await session.call_tool(
            "get_next_train_schedule",
            {"line": "INVALID", "sta": "TKO", "lang": "EN"}
        )
        print(f"Result: {result}\n")
        
        print("✅ All tests completed!")


if __name__ == "__main__":
    print("=" * 60)
    print("MCP Client Test")
    print("=" * 60)
    print()
    asyncio.run(test_mcp_server())
