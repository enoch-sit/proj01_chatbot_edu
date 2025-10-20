"""
Debug script to check FastMCP SSE endpoint configuration
"""

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("debug_server")


@mcp.tool()
def test_tool() -> str:
    """A test tool"""
    return "Hello from MCP!"


if __name__ == "__main__":
    import sys
    import uvicorn

    print("\n" + "=" * 60)
    print("🔍 FastMCP Debug Info")
    print("=" * 60)

    # Check FastMCP version
    import fastmcp

    print(
        f"FastMCP version: {fastmcp.__version__ if hasattr(fastmcp, '__version__') else 'Unknown'}"
    )

    print("\nℹ️  FastMCP SSE endpoints:")
    print("   • Main endpoint: http://127.0.0.1:8000/sse")
    print("   • Alternative:   http://127.0.0.1:8000/mcp/sse")
    print("\n⚠️  For MCP Inspector, try BOTH URLs above!")
    print("=" * 60 + "\n")

    # Run the server
    mcp.run(transport="sse")
