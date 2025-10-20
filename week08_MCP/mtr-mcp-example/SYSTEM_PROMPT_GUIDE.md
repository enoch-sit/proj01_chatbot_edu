# System Prompt Enhancement for LangGraph Agent

## What Was Added

I've enhanced the LangGraph demo with a comprehensive **system prompt** that guides the AI agent on how to effectively use the MTR API tool.

## Changes Made

### 1. Added SystemMessage Import
```python
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, SystemMessage
```

### 2. Created Comprehensive System Prompt

The system prompt includes:

#### Agent Role Definition
```
You are a helpful Hong Kong MTR train assistant with access to real-time train schedules.
```

#### Tool Usage Instructions
- Explains required parameters (line, sta, lang)
- Lists all valid line codes
- Provides common station codes for each line

#### Response Guidelines
- How to summarize train data
- What information to highlight (minutes, destination, platform)
- How to handle service delays
- Being conversational and helpful

#### Common MTR Lines Reference
Complete list of all 10 MTR lines with their station codes:
- TKL, AEL, TCL, ISL, TWL, KTL, EAL, TML, SIL, DRL

### 3. System Prompt Injection

The system prompt is automatically injected into every conversation:

```python
async def call_model(state: AgentState):
    """Call the LLM with current state"""
    messages = state["messages"]
    
    # Inject system prompt if not already present
    if not any(isinstance(msg, SystemMessage) for msg in messages):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
    
    response = await llm_with_tools.ainvoke(messages)
    return {"messages": [response]}
```

### 4. Updated Example Queries

Changed from explicit instructions to natural language:

**Before:**
```python
"When is the next train at Tseung Kwan O station? (Use station code TKO and line code TKL)"
```

**After:**
```python
"When is the next train at Tseung Kwan O station on the Tseung Kwan O line?"
```

## Why This Matters

### Without System Prompt:
- ❌ Agent might not know how to format tool calls
- ❌ May hallucinate station codes
- ❌ Unclear response format
- ❌ No context about MTR system

### With System Prompt:
- ✅ Agent understands MTR system structure
- ✅ Knows all valid line and station codes
- ✅ Provides consistent, helpful responses
- ✅ Can handle natural language queries
- ✅ Includes service alerts and delays

## Flow Diagram

```
User Query (Natural Language)
    ↓
System Prompt Injected
    ↓
Agent (Nova Lite) + System Context
    ↓
Understands: Need to call mtr_train_schedule
    ↓
Extracts: line=TKL, sta=TKO, lang=EN
    ↓
Calls MCP Tool
    ↓
Receives: Train schedule data
    ↓
Formats Response (Guided by System Prompt)
    ↓
User-Friendly Answer
```

## Example Interaction

### User Query:
```
"I'm at Hong Kong station. When does the next Airport Express train arrive?"
```

### Agent Processing (with System Prompt):
1. Recognizes "Hong Kong station" → HOK
2. Recognizes "Airport Express" → AEL
3. Calls tool: `mtr_train_schedule(line="AEL", sta="HOK", lang="EN")`
4. Receives data
5. Formats response following prompt guidelines

### Agent Response:
```
The next Airport Express train at Hong Kong station will arrive in 3 minutes.
- Destination: Airport (AIR)
- Arrival Time: 15:23
- Platform: 1

The train after that arrives in 13 minutes.
```

## Best Practices Implemented

1. **Domain Knowledge**: System prompt contains MTR-specific knowledge
2. **Tool Usage Guidance**: Clear instructions on parameter formats
3. **Response Consistency**: Guidelines ensure uniform responses
4. **Error Handling**: Prompts agent to explain issues clearly
5. **Natural Language**: Agent can understand casual queries

## Testing the Enhancement

Run the demo with these natural queries:

```python
# More natural tests you can try:
"When is the next train to Central?"
"I'm at Tseung Kwan O, going towards North Point"
"Show me trains at Admiralty on the Island Line"
"What's the next train to the airport from Kowloon?"
"Check train times at Mong Kok on Kwun Tong Line"
```

The agent will now intelligently map these to the correct line and station codes!

## Summary

The system prompt transforms the agent from a generic AI into a **specialized MTR assistant** that:
- Understands Hong Kong's MTR system
- Knows how to use the API correctly
- Provides helpful, formatted responses
- Handles natural language queries effectively

This is a crucial component for any production LangGraph agent! 🎯
