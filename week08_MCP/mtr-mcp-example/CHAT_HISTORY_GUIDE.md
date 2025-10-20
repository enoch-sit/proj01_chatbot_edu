# Chat History in LangGraph Agents

## Problem: The Original Demo Has No Memory

### ❌ Original Implementation (`langgraph_demo.py`)

```python
# Each call is independent - no memory
result = await app.ainvoke({
    "messages": [
        HumanMessage(content="When is the next train at TKO?")
    ]
})
```

**What happens:**
```
User: "When is the next train at Tseung Kwan O?"
Agent: "Next train in 3 minutes..."

User: "What about the one after that?"
Agent: ❌ "I don't have context about which station you mean"
```

**Why?** Each `ainvoke()` call starts fresh with no conversation history.

## Solution: Add Memory with Checkpointer

### ✅ Enhanced Implementation (`langgraph_demo_with_history.py`)

```python
from langgraph.checkpoint.memory import MemorySaver

# Compile graph WITH memory
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)

# Use a thread_id to maintain conversation context
config = {"configurable": {"thread_id": "demo-conversation"}}

# Now each call remembers previous messages
result = await app.ainvoke(
    {"messages": [HumanMessage(content="What about the one after that?")]},
    config=config  # ← This links to the conversation thread
)
```

**What happens:**
```
User: "When is the next train at Tseung Kwan O?"
Agent: "Next train in 3 minutes to Po Lam..."

User: "What about the one after that?"
Agent: ✅ "The train after that arrives in 8 minutes, also heading to Po Lam"
```

## Key Changes

### 1. Import MemorySaver

```python
from langgraph.checkpoint.memory import MemorySaver
```

### 2. Compile with Checkpointer

```python
# OLD (no memory)
app = workflow.compile()

# NEW (with memory)
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)
```

### 3. Use Thread Configuration

```python
# Create a conversation thread
config = {"configurable": {"thread_id": "unique-conversation-id"}}

# Pass config to every invoke call
result = await app.ainvoke({"messages": [...]}, config=config)
```

### 4. Messages Accumulate

```python
# First call
await app.ainvoke(
    {"messages": [HumanMessage("Train at TKO?")]},
    config
)

# Second call - previous message is remembered!
await app.ainvoke(
    {"messages": [HumanMessage("What about the next one?")]},
    config  # Same thread_id = same conversation
)
```

## How Memory Works

### LangGraph State Management

```
┌─────────────────────────────────────┐
│  Thread ID: "conversation-123"      │
├─────────────────────────────────────┤
│  Message 1: SystemMessage           │
│  Message 2: HumanMessage (User)     │
│  Message 3: AIMessage (Agent)       │
│  Message 4: ToolMessage (MTR API)   │
│  Message 5: AIMessage (Response)    │
│  Message 6: HumanMessage (User)     │ ← New message added
│  Message 7: AIMessage (Agent)       │ ← With full context!
└─────────────────────────────────────┘
```

### Memory Checkpointer

The `MemorySaver` stores the entire state after each step:

```python
# After first query
state = {
    "messages": [
        SystemMessage(...),
        HumanMessage("Train at TKO?"),
        AIMessage("Next train in 3 minutes...")
    ]
}

# After second query (same thread_id)
state = {
    "messages": [
        SystemMessage(...),
        HumanMessage("Train at TKO?"),
        AIMessage("Next train in 3 minutes..."),
        HumanMessage("What about the next one?"),  # ← Appended
        AIMessage("Train after that in 8 minutes...")  # ← Has context!
    ]
}
```

## Multi-Turn Conversation Example

```python
config = {"configurable": {"thread_id": "user-123"}}

# Turn 1
await chat("When is the next train at TKO?", config)
# → "Next train in 3 minutes to Po Lam, Platform 1"

# Turn 2 - Uses context
await chat("What about the other direction?", config)
# → "Trains going UP (towards North Point) arrive in 5 minutes"

# Turn 3 - Different topic
await chat("Now check Hong Kong station on AEL", config)
# → "At Hong Kong station, Airport Express arrives in 4 minutes"

# Turn 4 - References earlier conversation
await chat("Compare it with the first station", config)
# → "TKO has trains every 3-5 minutes, while HOK on AEL runs every 10-12 minutes"
```

## Thread Management

### Single User Session

```python
# One conversation per user
config = {"configurable": {"thread_id": f"user-{user_id}"}}
```

### Multiple Conversations

```python
# Different threads for different conversations
config_conversation_1 = {"configurable": {"thread_id": "conv-abc"}}
config_conversation_2 = {"configurable": {"thread_id": "conv-xyz"}}

# These are completely separate
await app.ainvoke({...}, config_conversation_1)  # ← Independent
await app.ainvoke({...}, config_conversation_2)  # ← Independent
```

### Reset Conversation

```python
# Start fresh conversation
config = {"configurable": {"thread_id": "new-thread-456"}}
```

## Benefits of Chat History

### 1. Natural Conversations

```
✅ "What about the next one?"
✅ "Compare that with Central station"
✅ "What's the delay status?"
✅ "Thanks! Check the same line at Quarry Bay"
```

### 2. Context Awareness

The agent can:
- Remember which station was discussed
- Recall which line the user is interested in
- Compare current query with previous ones
- Provide relevant follow-up information

### 3. Better UX

Users don't need to repeat information:
```
❌ "Check TKL line at TKO station"
❌ "Check TKL line at HAH station"
❌ "Check TKL line at POA station"

✅ "Check TKL line at TKO"
✅ "Now check HAH"
✅ "And POA"
```

## Implementation Comparison

### Without History (Original)

```python
# langgraph_demo.py
app = workflow.compile()  # No checkpointer

# Each query is isolated
result1 = await app.ainvoke({"messages": [HumanMessage("Query 1")]})
result2 = await app.ainvoke({"messages": [HumanMessage("Query 2")]})
# result2 has NO memory of result1 ❌
```

### With History (Enhanced)

```python
# langgraph_demo_with_history.py
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)  # ✅ With checkpointer

config = {"configurable": {"thread_id": "chat-1"}}

# Conversation with memory
result1 = await app.ainvoke(
    {"messages": [HumanMessage("Query 1")]}, 
    config
)
result2 = await app.ainvoke(
    {"messages": [HumanMessage("Query 2")]}, 
    config  # Same thread
)
# result2 remembers result1 ✅
```

## Viewing Chat History

```python
# Get current state of conversation
state = await app.aget_state(config)

# Access all messages
for msg in state.values["messages"]:
    if isinstance(msg, HumanMessage):
        print(f"User: {msg.content}")
    elif isinstance(msg, AIMessage):
        print(f"Agent: {msg.content}")
```

## Production Considerations

### 1. Persistent Storage

For production, use a persistent checkpointer instead of `MemorySaver`:

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# Save to database
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
app = workflow.compile(checkpointer=checkpointer)
```

### 2. Memory Management

Conversations can grow large. Consider:

```python
# Limit message history
MAX_MESSAGES = 20

# Trim old messages
messages = state["messages"][-MAX_MESSAGES:]
```

### 3. Cost Management

More messages = more tokens = higher cost

```python
# Monitor conversation length
message_count = len(state.values["messages"])
if message_count > 50:
    # Start new thread or summarize
```

## Summary

| Feature | Without History | With History |
|---------|----------------|--------------|
| **Memory** | ❌ None | ✅ Full conversation |
| **Context** | ❌ Each query isolated | ✅ Maintains context |
| **Follow-ups** | ❌ Must repeat info | ✅ Natural follow-ups |
| **Implementation** | `compile()` | `compile(checkpointer=memory)` |
| **Config** | Not needed | `{"thread_id": "..."}` |
| **Use Case** | Single queries | Conversations |

## Files

- **`langgraph_demo.py`**: Original (no history)
- **`langgraph_demo_with_history.py`**: Enhanced (with history) ✅

Run the enhanced version to see multi-turn conversations in action! 🎯
