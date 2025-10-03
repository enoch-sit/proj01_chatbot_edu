# LangChain & LangGraph Study Notes

## LangChain Expression Language (LCEL) - Key Concepts

### What is LCEL?
LangChain Expression Language is a way to chain components together using the pipe (`|`) operator. It makes building AI applications intuitive and modular.

### Core Components

**Prompts** - Templates that format your input
**Models** - AI models (like GPT-4) that process the prompts  
**Parsers** - Format the model's output into usable data
**Tools** - External functions the AI can call

### The Runnable Protocol
Every component implements these standard methods:

- `invoke()` - Process single input
- `batch()` - Process multiple inputs at once
- `stream()` - Get responses in real-time
- `ainvoke()`, `abatch()`, `astream()` - Async versions

### Basic Chain Example

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Create components
prompt = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
model = ChatOpenAI()
parser = StrOutputParser()

# Chain them together
chain = prompt | model | parser

# Use it
result = chain.invoke({"topic": "cats"})
```

### How the Pipe Operator (`|`) Works

The `|` operator is "overloaded" in Python:

- Normal use: `5 | 3` = bitwise OR (equals 7)
- LangChain use: `prompt | model` = creates a chain

This works because LangChain components implement the `__or__` method, which customizes what happens when you use `|`.

### Advanced Features

**Parallel Execution**
```python
from langchain_core.runnables import RunnableParallel

parallel_chain = RunnableParallel(
    joke=joke_chain,
    fact=fact_chain
)
```

**Fallbacks**
```python
# If primary model fails, try backup
chain_with_fallback = primary_model.with_fallbacks([backup_model])
```

**RAG Pattern (Retrieval-Augmented Generation)**
```python
# Retrieve relevant documents, then generate answer
rag_chain = retriever | prompt | model | parser
```

---

## LangGraph - Stateful AI Applications

### Why LangGraph?
LangChain is great for simple chains, but LangGraph adds:

- **Memory** - Remembers past conversations
- **Multi-step workflows** - Complex decision making
- **Human approval** - Pause for user input
- **Persistence** - Save and resume conversations

### Key Concepts with Phone Analogy

**THREAD** = Individual chat conversation
- Like texting with different friends
- Each thread is separate and isolated
- Identified by a unique `thread_id`

**STATE** = The conversation history + context
- Like your entire chat history with one person
- Remembers what was discussed before
- Can store custom data (user preferences, etc.)

**PERSISTENCE** = Saving conversations
- Like your phone saving messages when you close the app
- `MemorySaver` = RAM only (lost when program stops)
- `SqliteSaver` = Database (survives restarts)

**STREAMING** = Real-time updates
- Like seeing "..." when someone is typing
- Watch the AI think step-by-step

### Basic Agent Structure

```python
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode

# Define what the agent can do
def should_continue(state):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"  # Use tools
    return END  # Done

def call_model(state):
    response = model.bind_tools(tools).invoke(state["messages"])
    return {"messages": [response]}

# Build the workflow
workflow = StateGraph(MessagesState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(tools))

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["tools", END])
workflow.add_edge("tools", "agent")

# Create the agent
agent = workflow.compile()
```

### Using Threads for Multiple Users

```python
# Different users, different conversations
config_sarah = {"configurable": {"thread_id": "user_sarah"}}
config_john = {"configurable": {"thread_id": "user_john"}}

# Sarah's conversation about Paris
agent.invoke({"messages": [HumanMessage("Plan a trip to Paris")]}, config_sarah)

# John's separate conversation about Tokyo  
agent.invoke({"messages": [HumanMessage("Plan a trip to Tokyo")]}, config_john)

# Conversations stay separate!
```

### Human-in-the-Loop

```python
# Pause before using tools for approval
agent_with_approval = workflow.compile(
    checkpointer=memory,
    interrupt_before=["tools"]
)

# Execute and pause
response = agent_with_approval.invoke(input_data, config)
state = agent_with_approval.get_state(config)

if state.next:  # Paused for approval
    print(f"Agent wants to use: {state.values['messages'][-1].tool_calls}")
    approval = input("Approve? (y/n): ")
    
    if approval == 'y':
        # Continue execution
        agent_with_approval.stream(None, config)
```

### Time Travel with Checkpoints

```python
# Get conversation history
history = list(agent.get_state_history(config))

# Go back to earlier point and continue differently
old_checkpoint = history[2]
new_response = agent.invoke(new_input, config=old_checkpoint.config)
```

---

## When to Use What?

### Use LangChain (LCEL) when:
- Simple prompt → model → response flows
- Stateless operations
- Quick prototypes
- RAG applications

### Use LangGraph when:
- Multi-turn conversations
- Need to remember context
- Complex decision workflows
- Human approval required
- Long-running processes

---

## Common Patterns

### Customer Support Bot
```python
class SupportState(TypedDict):
    messages: Annotated[list, add_messages]
    issue_type: str
    severity: int
    escalated: bool

# Workflow: classify → attempt resolution → escalate if needed
```

### Travel Planning Agent
```python
class TravelState(TypedDict):
    messages: Annotated[list, add_messages]
    destination: str
    budget: float
    dates: dict
    itinerary: list

# Workflow: extract info → search flights → find hotels → create itinerary
```

### Content Creation Pipeline
```python
# Workflow: outline → research → draft → review → format
# With human approval at each step
```

---

## Best Practices

### State Design
- Keep it minimal but complete
- Use type hints for better debugging
- Include metadata for tracking

### Error Handling
- Always handle tool failures
- Implement retry logic
- Log state changes for debugging

### Performance
- Use batch operations when possible
- Cache expensive computations
- Clean up old state data

### Security
- Validate inputs before tool calls
- Use approval workflows for sensitive actions
- Implement proper authentication for multi-user systems

---

## Key Takeaways

1. **LangChain** makes AI chains easy with the pipe operator
2. **LangGraph** adds memory and complex workflows
3. **Threads** keep conversations separate
4. **State** remembers context across interactions
5. **Persistence** saves progress across sessions
6. **Human-in-the-loop** adds control and safety
7. Choose the right tool for your use case

The frameworks are designed to be modular and composable - start simple with LangChain, then add LangGraph features as your application becomes more complex.