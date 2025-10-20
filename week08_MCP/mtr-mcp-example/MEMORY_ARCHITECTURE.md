# LangGraph Memory Storage Architecture

## How Chat History is Stored

### State Structure

The `AgentState` defines what gets stored:

```python
class AgentState(TypedDict):
    messages: Annotated[list, "The messages in the conversation"]
```

This means the state contains a list of messages that grows with each interaction.

### Memory Flow

```
User Input → State Update → Checkpoint Save → Agent Processing → State Update → Checkpoint Save
     ↓            ↓              ↓                    ↓               ↓              ↓
  "Query 1"   Add message    Save to memory      LLM processes   Add response   Save to memory
```

### Step-by-Step Example

#### Initial State (Empty)
```python
state = {
    "messages": []
}
```

#### After Turn 1 (User asks question)
```python
state = {
    "messages": [
        SystemMessage(content="You are a helpful MTR assistant..."),
        HumanMessage(content="When is the next train at TKO?")
    ]
}
# ✓ Checkpoint saved to memory
```

#### After Turn 1 (Agent calls tool)
```python
state = {
    "messages": [
        SystemMessage(content="..."),
        HumanMessage(content="When is the next train at TKO?"),
        AIMessage(content="", tool_calls=[{...}])  # ← Agent decides to use tool
    ]
}
# ✓ Checkpoint saved to memory
```

#### After Turn 1 (Tool executes)
```python
state = {
    "messages": [
        SystemMessage(content="..."),
        HumanMessage(content="When is the next train at TKO?"),
        AIMessage(content="", tool_calls=[{...}]),
        ToolMessage(content="{'data': {...}}", tool_call_id="...")  # ← Tool result
    ]
}
# ✓ Checkpoint saved to memory
```

#### After Turn 1 (Agent responds)
```python
state = {
    "messages": [
        SystemMessage(content="..."),
        HumanMessage(content="When is the next train at TKO?"),
        AIMessage(content="", tool_calls=[{...}]),
        ToolMessage(content="{'data': {...}}", tool_call_id="..."),
        AIMessage(content="The next train arrives in 3 minutes...")  # ← Final response
    ]
}
# ✓ Checkpoint saved to memory
# ✓ Turn 1 complete
```

#### After Turn 2 (User asks follow-up)
```python
state = {
    "messages": [
        SystemMessage(content="..."),
        HumanMessage(content="When is the next train at TKO?"),
        AIMessage(content="", tool_calls=[{...}]),
        ToolMessage(content="{'data': {...}}", tool_call_id="..."),
        AIMessage(content="The next train arrives in 3 minutes..."),
        HumanMessage(content="What about the other direction?")  # ← NEW! History preserved
    ]
}
# ✓ Checkpoint saved to memory
```

### Key Point: State Accumulates!

Each new message is **appended** to the existing state, not replacing it.

## 🔍 Memory Checkpointer Types

### 1. MemorySaver (In-Memory)

```python
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)
```

**Storage Location:** RAM (Python dictionary)

**Structure:**
```python
# Internal structure (simplified)
{
    "thread-id-123": {
        "checkpoint_id": "abc-123",
        "values": {
            "messages": [...]  # ← All messages here
        },
        "metadata": {...},
        "parent_checkpoint_id": None
    }
}
```

**Pros:**
- ✅ Fast
- ✅ Simple
- ✅ No dependencies

**Cons:**
- ❌ Lost when app restarts
- ❌ Not suitable for production
- ❌ Cannot share across instances

### 2. SqliteSaver (Persistent)

```python
from langgraph.checkpoint.sqlite import SqliteSaver

checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
app = workflow.compile(checkpointer=checkpointer)
```

**Storage Location:** SQLite database file

**Database Schema:**
```sql
CREATE TABLE checkpoints (
    thread_id TEXT,
    checkpoint_id TEXT,
    parent_id TEXT,
    values BLOB,  -- Serialized state (includes messages)
    metadata TEXT,
    timestamp INTEGER,
    PRIMARY KEY (thread_id, checkpoint_id)
);
```

**Pros:**
- ✅ Persistent across restarts
- ✅ File-based (portable)
- ✅ No server needed

**Cons:**
- ❌ Single file limitation
- ❌ Not ideal for high concurrency

### 3. PostgresSaver (Production)

```python
from langgraph.checkpoint.postgres import PostgresSaver

checkpointer = PostgresSaver.from_conn_string(
    "postgresql://user:pass@localhost/db"
)
app = workflow.compile(checkpointer=checkpointer)
```

**Storage Location:** PostgreSQL database

**Pros:**
- ✅ Fully persistent
- ✅ Scalable
- ✅ Multi-instance support
- ✅ Production-ready

**Cons:**
- ❌ Requires PostgreSQL server
- ❌ More complex setup

## 🔄 Accessing Stored State

### Get Current State

```python
# Get the current state of a conversation
config = {"configurable": {"thread_id": "conversation-123"}}
state = await app.aget_state(config)

# Access messages
messages = state.values["messages"]

# Print conversation
for msg in messages:
    if isinstance(msg, HumanMessage):
        print(f"User: {msg.content}")
    elif isinstance(msg, AIMessage):
        print(f"Agent: {msg.content}")
```

### Get State History (Time Travel)

```python
# Get all checkpoints for a thread
state_history = app.get_state_history(config)

# Iterate through history
for state in state_history:
    print(f"Checkpoint: {state.checkpoint_id}")
    print(f"Messages: {len(state.values['messages'])}")
    print(f"Timestamp: {state.metadata.get('timestamp')}")
```

### Update State Manually

```python
# Add a message without running the agent
config = {"configurable": {"thread_id": "conversation-123"}}

await app.aupdate_state(
    config,
    {
        "messages": [
            HumanMessage(content="Manually added message")
        ]
    }
)
```

## 💾 Where is Memory Physically Stored?

### MemorySaver (Current Demo)

```
Python Process Memory (RAM)
    ↓
memory._storage = {
    "demo-conversation": {
        "values": {
            "messages": [
                SystemMessage(...),
                HumanMessage(...),
                AIMessage(...),
                # ... all messages
            ]
        }
    }
}
```

**Location:** Exists only while Python process is running

### SqliteSaver

```
File System
    ↓
checkpoints.db (SQLite file)
    ↓
Table: checkpoints
    Row: thread_id="demo-conversation"
         values=<serialized_state_blob>
         ↓
    Deserialized to:
         {"messages": [...]}
```

**Location:** Persisted to disk in `checkpoints.db` file

### PostgresSaver

```
PostgreSQL Server
    ↓
Database: myapp_db
    ↓
Table: checkpoints
    Row: thread_id="demo-conversation"
         values=<serialized_state_json>
         ↓
    Deserialized to:
         {"messages": [...]}
```

**Location:** Persisted to PostgreSQL database

## 🎯 Key Concepts

### 1. State is Immutable (per checkpoint)

Each checkpoint creates a **new snapshot**:

```python
# Checkpoint 1 (after turn 1)
state_v1 = {"messages": [msg1, msg2, msg3]}

# Checkpoint 2 (after turn 2)
state_v2 = {"messages": [msg1, msg2, msg3, msg4, msg5]}  # ← New state

# Original checkpoint 1 is preserved
```

### 2. Thread ID = Conversation ID

```python
# Same thread = same conversation
config1 = {"configurable": {"thread_id": "user-alice"}}
config2 = {"configurable": {"thread_id": "user-alice"}}
# ✓ Shares history

# Different thread = different conversation
config3 = {"configurable": {"thread_id": "user-bob"}}
# ✗ Separate history
```

### 3. Messages Accumulate

```python
# Turn 1
await app.ainvoke({"messages": [HumanMessage("Q1")]}, config)
# State now has: [System, Q1, A1]

# Turn 2
await app.ainvoke({"messages": [HumanMessage("Q2")]}, config)
# State now has: [System, Q1, A1, Q2, A2]  ← Q1 and A1 still there!
```

## 📊 Memory Growth Example

```python
config = {"configurable": {"thread_id": "demo"}}

# Turn 1: 3 messages
await app.ainvoke({"messages": [HumanMessage("Hi")]}, config)
state = await app.aget_state(config)
print(len(state.values["messages"]))  # → 3 (System, User, Agent)

# Turn 2: 5 messages total
await app.ainvoke({"messages": [HumanMessage("Question")]}, config)
state = await app.aget_state(config)
print(len(state.values["messages"]))  # → 5 (added User, Agent)

# Turn 3 with tool: 8 messages total
await app.ainvoke({"messages": [HumanMessage("Check TKO")]}, config)
state = await app.aget_state(config)
print(len(state.values["messages"]))  # → 8 (added User, Agent+ToolCall, Tool, Agent)
```

## 🎓 Summary

| Aspect | Details |
|--------|---------|
| **What's stored** | Entire `AgentState` (mainly the `messages` list) |
| **Where (MemorySaver)** | Python process RAM (dictionary) |
| **Where (SqliteSaver)** | SQLite database file on disk |
| **Where (PostgresSaver)** | PostgreSQL database |
| **Keyed by** | `thread_id` from config |
| **When saved** | After each node execution (automatic) |
| **Lifetime (MemorySaver)** | Until process ends |
| **Lifetime (DB)** | Until explicitly deleted |
| **Access** | `app.aget_state(config)` |

## 🔑 Key Takeaway

**Yes, chat history is stored in the memory state!** Specifically:

1. The **state** contains a `messages` list
2. The **checkpointer** (MemorySaver, SqliteSaver, etc.) persists the state
3. Each **thread_id** has its own state/history
4. Messages **accumulate** in the state over the conversation
5. The agent can access the full history on each turn

This is why the agent can remember previous exchanges and handle follow-up questions! 🎯
