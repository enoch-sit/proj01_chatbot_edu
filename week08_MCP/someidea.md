### Step-by-Step Guide to Creating an MCP Server and Client for the MTR Next Train API

Based on the provided documents (the PDF spec and the MD guide), I'll create a simple MCP server and client that integrates the MTR Next Train API. The server will expose a tool (`get_next_train_schedule`) that calls the API with the specified parameters (line, sta, lang). The client will connect via HTTP SSE to discover and invoke the tool.

This is similar to the arXiv example but tailored to this API. We'll use Python, `fastmcp` for the server, `mcp` for the client, and `requests` for API calls. Containerize the server with Docker.

#### Prerequisites
1. Python 3.10+ and Docker installed (as in previous guide).
2. Install packages: In terminal, run `pip install fastmcp mcp requests`.

#### Step 1: Create Project Folder
- Make `mtr-mcp-api-example`.
- Navigate: `cd path/to/mtr-mcp-api-example`.

#### Step 2: Create MCP Server File (`mcp_server.py`)
- Copy-paste this code:
  ```python
  import requests
  from typing import Dict
  from mcp.server.fastmcp import FastMCP

  mcp = FastMCP("mtr_next_train_api")

  @mcp.tool()
  def get_next_train_schedule(line: str, sta: str, lang: str = "EN") -> Dict:
      """
      Get the next train arrival schedule for an MTR line and station.
      
      Args:
          line: MTR line code (e.g., 'AEL', 'TCL', 'TML', 'TKL', 'EAL', 'SIL', 'TWL', 'ISL', 'KTL', 'DRL').
          sta: Station code for the line (e.g., 'HOK' for Hong Kong on AEL).
          lang: Language ('EN' for English, 'TC' for Traditional Chinese). Default: 'EN'.
      
      Returns:
          JSON response with train schedule, or error details.
      """
      # Validate parameters (basic check; full validation can be added)
      valid_lines = ['AEL', 'TCL', 'TML', 'TKL', 'EAL', 'SIL', 'TWL', 'ISL', 'KTL', 'DRL']
      if line.upper() not in valid_lines:
          return {"error": f"Invalid line code: {line}. Valid lines: {valid_lines}"}
      
      url = f"https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line={line.upper()}&sta={sta.upper()}&lang={lang.upper()}"
      try:
          response = requests.get(url, timeout=10)
          response.raise_for_status()
          return response.json()
      except requests.exceptions.RequestException as e:
          return {"error": f"API request failed: {str(e)}"}

  if __name__ == "__main__":
      mcp.run(transport='http+sse', host='0.0.0.0', port=8080)  # HTTP SSE for remote access
  ```
- Save in folder.
- Explanation: The tool calls the API, handles basic validation/errors. Returns JSON as per spec.

#### Step 3: Create Dockerfile
- Copy-paste:
  ```dockerfile
  FROM python:3.10-slim

  RUN pip install --no-cache-dir fastmcp mcp requests

  WORKDIR /app
  COPY mcp_server.py .

  EXPOSE 8080

  CMD ["python", "mcp_server.py"]
  ```
- Save as `Dockerfile`.
- Explanation: Builds image with dependencies, runs server on port 8080.

#### Step 4: Build Docker Image
- In terminal: `docker build -t mtr-mcp-server .`
- Verify: `docker images`.

#### Step 5: Run MCP Server in Docker
- Run: `docker run -p 8080:8080 mtr-mcp-server`
- Server runs at http://localhost:8080.

#### Step 6: Create MCP Client File (`mcp_client.py`)
- Copy-paste:
  ```python
  import asyncio
  from mcp import http_sse_client, HttpSseServerParameters

  async def main():
      params = HttpSseServerParameters(url="http://localhost:8080/mcp")  # Adjust if needed
      async with http_sse_client(params) as session:
          await session.initialize()
          tools = await session.list_tools()
          print("Discovered tools:", [tool.name for tool in tools])
          
          # Example: Get schedule for TKL line, TKO station, English
          result = await session.call_tool("get_next_train_schedule", {"line": "TKL", "sta": "TKO", "lang": "EN"})
          print("API Response:", result)
          
          # Another example: Invalid line to test error
          error_result = await session.call_tool("get_next_train_schedule", {"line": "INVALID", "sta": "TKO"})
          print("Error Response:", error_result)

  asyncio.run(main())
  ```
- Save.
- Explanation: Connects, lists tools, invokes with examples (valid and invalid for testing).

#### Step 7: Run MCP Client
- Server running? In new terminal: `python mcp_client.py`.
- Output: Tools list and API JSON (train schedules or errors).

#### Testing and Notes
- **Valid Call**: Returns schedule with UP/DOWN trains, status, etc.
- **Invalid Call**: Tool returns {"error": "..."}.
- **API Notes**: From docs, handles delays/suspensions. No auth needed.
- **Troubleshoot**: Check ports, reinstall packages if library errors.

This integrates the API as a tool. Expand with more features if needed!