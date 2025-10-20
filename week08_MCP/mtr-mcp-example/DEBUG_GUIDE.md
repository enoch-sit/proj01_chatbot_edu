# Debug Guide - Running Without Docker

## Quick Start (Debugging Setup)

### 1. Create Virtual Environment with uv

```powershell
# Navigate to project directory
cd c:\Users\user\Documents\proj01_chatbot_edu\week08_MCP\mtr-mcp-example

# Create virtual environment
uv venv

# Activate it
.venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
```

### 2. Configure Environment Variables

Make sure you have a `.env` file with your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
BEDROCK_MODEL=amazon.nova-lite-v1:0
MCP_SERVER_URL=http://localhost:8000/sse
```

### 3. Run MCP Server (Terminal 1)

```powershell
# Make sure venv is activated
.venv\Scripts\activate

# Run the server
python mcp_server.py
```

You should see output like:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The server is now running at `http://localhost:8000/sse`

### 4. Run LangGraph Demo (Terminal 2)

Open a **new terminal** and run:

```powershell
# Navigate to project
cd c:\Users\user\Documents\proj01_chatbot_edu\week08_MCP\mtr-mcp-example

# Activate venv
.venv\Scripts\activate

# Run the demo
python langgraph_demo.py
```

## Debugging Tips

### Using VS Code Debugger

1. **Debug MCP Server:**
   - Open `mcp_server.py`
   - Set breakpoints where you want to inspect
   - Press F5 or use "Run and Debug"
   - Select "Python File"

2. **Debug LangGraph Demo:**
   - Open `langgraph_demo.py`
   - Set breakpoints in the agent logic
   - Press F5
   - Watch variables in the Debug panel

### Adding Print Statements

For quick debugging, add print statements:

```python
# In mcp_server.py
@mcp.tool()
def get_next_train_schedule(line: str, sta: str, lang: str = "EN") -> Dict:
    print(f"🔧 DEBUG: Called with line={line}, sta={sta}, lang={lang}")
    url = f"https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line={line}&sta={sta}&lang={lang}"
    print(f"🔧 DEBUG: URL={url}")
    response = requests.get(url)
    print(f"🔧 DEBUG: Status={response.status_code}")
    # ... rest of code
```

### Testing MCP Server Directly

You can test if the MCP server is working by creating a simple test script:

```python
# test_mcp_server.py
import asyncio
from mcp import http_sse_client, HttpSseServerParameters

async def test():
    params = HttpSseServerParameters(url="http://localhost:8000/sse")
    async with http_sse_client(params) as session:
        await session.initialize()
        
        # List tools
        tools = await session.list_tools()
        print("Tools:", [t.name for t in tools])
        
        # Test call
        result = await session.call_tool(
            "get_next_train_schedule",
            {"line": "TKL", "sta": "TKO", "lang": "EN"}
        )
        print("Result:", result)

asyncio.run(test())
```

Run it:
```powershell
python test_mcp_server.py
```

## Common Issues

### Issue: "Cannot connect to MCP server"
**Solution:** Make sure `mcp_server.py` is running in another terminal

### Issue: "AWS credentials not found"
**Solution:** Check your `.env` file exists and has correct values

### Issue: "Module not found"
**Solution:** Make sure virtual environment is activated:
```powershell
.venv\Scripts\activate
```

### Issue: "Port already in use"
**Solution:** Kill the process using port 8000 or change the port:
```python
# In mcp_server.py, you can set environment variable:
# In PowerShell before running:
$env:PORT = "8001"
python mcp_server.py
```

## Architecture Overview

```
┌─────────────────────────────────────┐
│   Terminal 1: MCP Server            │
│   python mcp_server.py              │
│   Running on http://localhost:8000  │
└────────────────┬────────────────────┘
                 │
                 │ HTTP + SSE
                 │
┌────────────────▼────────────────────┐
│   Terminal 2: LangGraph Demo        │
│   python langgraph_demo.py          │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  Nova Lite (AWS Bedrock)    │  │
│   │  Decides when to call tools │  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Next Steps

Once everything works, you can:

1. **Add more tools** to `mcp_server.py`
2. **Modify the agent logic** in `langgraph_demo.py`
3. **Add conversation memory** for multi-turn interactions
4. **Create a web UI** using Streamlit or Gradio
5. **Deploy** using Docker when ready for production

Happy debugging! 🐛✨
