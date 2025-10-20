# Tool Documentation Design: MCP Server vs LangGraph Agent

## The Question: Where Should Station/Line Information Live?

When building an MCP server with a LangGraph agent, you need to decide where to document the valid parameters (like station codes and line codes).

## ✅ Recommended Approach: Both Layers (With Different Purposes)

### MCP Server Tool Description
**Purpose:** Technical documentation for ANY client
**Audience:** Developers, other AI systems, API consumers

```python
@mcp.tool()
def get_next_train_schedule(line: str, sta: str, lang: str = "EN") -> Dict:
    """
    Get the next train arrival schedule for an MTR line and station.
    
    Args:
        line: MTR line code. Valid values:
            - AEL: Airport Express (HOK, KOW, TSY, AIR, AWE)
            - TCL: Tung Chung Line (HOK, KOW, OLY, NAC, LAK, TSY, SUN, TUC)
            - TKL: Tseung Kwan O Line (NOP, QUB, YAT, TIK, TKO, LHP, HAH, POA)
            ... [more lines]
        sta: Station code for the specified line
        lang: 'EN' or 'TC'
    
    Returns:
        JSON response with train schedule
    """
```

**Benefits:**
- ✅ Self-documenting API
- ✅ Works with ANY client (not just your agent)
- ✅ Shows up in MCP tool discovery
- ✅ Helps developers understand the API
- ✅ No AI-specific behavior or prompting

### LangGraph Agent System Prompt
**Purpose:** Guide the AI on HOW to use the tool conversationally
**Audience:** The AI agent itself

```python
SYSTEM_PROMPT = """You are a helpful Hong Kong MTR train assistant.

Common MTR lines and stations:
- Tseung Kwan O Line (TKL): TKO, HAH, POA, YAT, TIK, NOP, QUB
- Airport Express (AEL): HOK, KOW, TSY, AIR, AWE
...

When you receive train data:
- Summarize the key information clearly
- Mention the minutes until arrival
- Be conversational and helpful
"""
```

**Benefits:**
- ✅ Teaches the AI behavior and tone
- ✅ Provides context for common queries
- ✅ Includes response formatting guidelines
- ✅ Can be customized per use case

## 📊 Comparison Table

| Aspect | MCP Server | LangGraph Agent |
|--------|-----------|----------------|
| **Purpose** | Define WHAT the tool does | Define HOW to use it conversationally |
| **Audience** | Any API consumer | The AI agent |
| **Content** | Technical specs, valid parameters | Usage examples, tone, formatting |
| **Discoverability** | Via MCP protocol | Via system prompt |
| **Reusability** | Used by all clients | Specific to this agent |
| **Updates** | Rare (API changes) | Frequent (behavior tuning) |

## 🎯 Best Practice: Layered Documentation

```
┌─────────────────────────────────────────┐
│  LangGraph Agent System Prompt          │
│  - Conversational guidance              │
│  - Common use cases                     │
│  - Response formatting                  │
│  - Tone and behavior                    │
└────────────────┬────────────────────────┘
                 │ Reads tool description
                 │ via MCP discovery
                 ▼
┌─────────────────────────────────────────┐
│  MCP Server Tool Description            │
│  - Complete parameter specs             │
│  - All valid values                     │
│  - Return format                        │
│  - Error conditions                     │
└────────────────┬────────────────────────┘
                 │ Calls
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Actual API Implementation              │
│  - Business logic                       │
│  - External API calls                   │
│  - Data transformation                  │
└─────────────────────────────────────────┘
```

## 🔍 When an AI Agent Uses the Tool:

1. **Agent reads system prompt** → Learns it's an MTR assistant
2. **Agent discovers MCP tool** → Sees all valid line/station codes
3. **User asks question** → "When's the next train at TKO?"
4. **Agent uses tool** → Calls with correct parameters
5. **Agent formats response** → Following system prompt guidelines

## ❌ Anti-Patterns to Avoid:

### Bad: Only in System Prompt
```python
# MCP Server
@mcp.tool()
def get_next_train_schedule(line: str, sta: str) -> Dict:
    """Get train schedule."""  # ❌ Too vague!
```

**Problem:** Other clients can't discover valid parameters

### Bad: AI Behavior in MCP Server
```python
# MCP Server
@mcp.tool()
def get_next_train_schedule(line: str, sta: str) -> Dict:
    """
    Get train schedule. When you use this tool, make sure to:
    - Be friendly and conversational  # ❌ Wrong layer!
    - Format the response nicely      # ❌ Wrong layer!
    """
```

**Problem:** Violates separation of concerns, not reusable

### Bad: Duplicate Everything
```python
# System prompt has full API docs
# MCP server has conversation guidelines
```

**Problem:** Maintenance nightmare, wasted tokens

## ✅ Correct Pattern (What We Implemented):

### MCP Server (`mcp_server.py`)
```python
@mcp.tool()
def get_next_train_schedule(line: str, sta: str, lang: str = "EN") -> Dict:
    """
    Get the next train arrival schedule for an MTR line and station.
    
    Args:
        line: MTR line code. Valid values:
            - AEL: Airport Express (HOK, KOW, TSY, AIR, AWE)
            [... complete technical documentation ...]
    
    Returns:
        JSON response with train schedule including:
        - sys_time, curr_time, data, status, message, isdelay
    """
    # Implementation
```

**✓ Technical, complete, reusable**

### LangGraph Agent (`langgraph_demo.py`)
```python
SYSTEM_PROMPT = """You are a helpful Hong Kong MTR train assistant.

When using the mtr_train_schedule tool, you need to provide:
1. line: MTR line code
2. sta: Station code
3. lang: 'EN' or 'TC'

Common MTR lines and stations:
- Tseung Kwan O Line (TKL): TKO, HAH, POA...
[... conversational examples ...]

When you receive train data:
- Summarize clearly
- Be conversational and helpful
"""
```

**✓ Behavioral, conversational, agent-specific**

## 📝 Summary

**Question:** Should we add station definitions to MCP Server?

**Answer:** Yes! But keep it technical and complete.

**MCP Server should have:**
- ✅ Complete list of valid parameters
- ✅ Return format specification
- ✅ Error conditions
- ✅ Example usage (optional)
- ❌ NO AI behavior instructions
- ❌ NO tone/formatting guidelines

**LangGraph Agent should have:**
- ✅ How to interpret user queries
- ✅ Common use cases and examples
- ✅ Response formatting preferences
- ✅ Conversational tone guidelines
- ❌ NO complete API specification (refer to tool)
- ❌ NO low-level implementation details

## 🎓 Teaching Point

This separation demonstrates the **Model Context Protocol** design philosophy:

> "MCP servers provide capabilities (tools/data).
> Clients decide how to use those capabilities."

The MCP server is like a library API - it documents what it can do.
The LangGraph agent is like application code - it decides when and how to use that library.

This is what makes MCP powerful: one server, many use cases! 🚀
