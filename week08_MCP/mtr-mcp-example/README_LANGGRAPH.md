# LangGraph + MCP + AWS Bedrock Nova Lite Demo

This demo shows how to integrate:
- **MCP (Model Context Protocol)**: Standardized way to connect AI to external tools
- **LangGraph**: Framework for building agentic workflows with cycles and state
- **AWS Bedrock Nova Lite**: Fast, cost-effective LLM from Amazon

## Architecture

```
┌─────────────────┐
│   LangGraph     │
│     Agent       │
│  (Nova Lite)    │
└────────┬────────┘
         │
         │ Uses MCP Protocol
         │
         ▼
┌─────────────────┐
│   MCP Server    │
│  (HTTP + SSE)   │
└────────┬────────┘
         │
         │ Calls
         │
         ▼
┌─────────────────┐
│  MTR API        │
│ (Train Data)    │
└─────────────────┘
```

## Prerequisites

1. **Python 3.10+** installed
2. **Docker** installed (for MCP server)
3. **AWS Credentials** with Bedrock access

## Setup Instructions

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Configure Environment

Create a `.env` file (copy from `.env.example`):

```bash
# AWS credentials for Bedrock
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# Optional: override default model
BEDROCK_MODEL=amazon.nova-lite-v1:0

# Optional: MCP server URL (default: http://localhost:8080/mcp)
MCP_SERVER_URL=http://localhost:8080/mcp
```

### Step 3: Start MCP Server

In one terminal, start the MCP server with Docker:

```bash
docker build -t mtr-mcp-server .
docker run -p 8080:8080 mtr-mcp-server
```

Or run directly with Python:

```bash
python mcp_server.py
```

### Step 4: Run LangGraph Demo

In another terminal:

```bash
python langgraph_demo.py
```

## What This Demo Does

1. **Connects to MCP Server**: Discovers available tools (MTR train schedule API)
2. **Initializes Nova Lite**: Sets up AWS Bedrock LLM
3. **Creates LangGraph Agent**: Builds an agentic workflow with:
   - Agent node (calls LLM)
   - Tools node (executes MCP tools)
   - Conditional routing (continues until task is done)
4. **Runs Example Queries**: Shows natural language → tool calling → response

## Example Output

```
🚀 Starting LangGraph MCP Demo...

✓ Environment variables loaded
✓ Using model: amazon.nova-lite-v1:0
✓ AWS Region: us-east-1

✓ Connected to MCP server
✓ Discovered 1 tools: ['get_next_train_schedule']

============================================================
LangGraph + MCP + Nova Lite Demo
============================================================

📍 Query 1: When is the next train at Tseung Kwan O station?
------------------------------------------------------------

🤖 Agent Response:
The next trains at Tseung Kwan O station are:
- UP direction: arriving in 2 minutes
- DOWN direction: arriving in 5 minutes
...
```

## Key Concepts

### LangGraph State
```python
class AgentState(TypedDict):
    messages: Annotated[list, "The messages in the conversation"]
```

### Agent Workflow
```
START → agent (LLM) → [has tools?] → tools → agent → END
                           ↓
                          [no]
                           ↓
                          END
```

### MCP Integration
- MCP server runs independently (containerized)
- Agent connects via HTTP + SSE
- Tools are discovered dynamically
- Results are passed back to LLM

## MTR Line and Station Codes

Common examples:
- **TKL** (Tseung Kwan O Line): TKO, HAH, POA, YAT, TIK, etc.
- **AEL** (Airport Express): HOK, KOW, TSY, AWE, AIR
- **TCL** (Tung Chung Line): HOK, KOW, OLY, NAC, TSY
- **ISL** (Island Line): KET, SAW, HKU, SYP, CEN, etc.

Full list: [MTR API Documentation](https://data.gov.hk/en-data/dataset/mtr-data2-nexttrain-data)

## Extending This Demo

1. **Add More Tools**: Extend MCP server with additional APIs
2. **Multi-Turn Conversations**: Add conversation memory
3. **Error Handling**: Improve tool call error recovery
4. **Streaming**: Add streaming responses from Nova Lite
5. **Human-in-the-Loop**: Add approval steps for certain actions

## Troubleshooting

**Error: Cannot connect to MCP server**
- Ensure Docker container is running: `docker ps`
- Check port 8080 is not blocked
- Verify URL in .env matches server

**Error: AWS credentials not found**
- Check .env file exists and has correct credentials
- Verify AWS credentials have Bedrock access
- Test with: `aws bedrock list-foundation-models --region us-east-1`

**Error: Module not found**
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.10+)

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [AWS Bedrock Nova](https://aws.amazon.com/bedrock/nova/)
- [MTR Open Data](https://data.gov.hk/en-data/dataset/mtr-data2-nexttrain-data)
