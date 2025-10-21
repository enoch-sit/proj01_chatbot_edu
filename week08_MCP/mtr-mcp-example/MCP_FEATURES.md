# MCP Server Feature Implementation

## 📋 MCP Specification Compliance

This MTR MCP server implements the full Model Context Protocol specification with **Tools**, **Resources**, and **Prompts**.

---

## ✅ Implemented Features

### 1. **Tools** (Model-Controlled) ✅

Tools enable AI models to perform actions. The model decides when to invoke these functions based on user requests.

| Tool | Purpose | Control | Status |
|------|---------|---------|--------|
| `get_next_train_schedule` | Human-friendly train schedules with emojis | **Model** | ✅ Implemented |
| `get_next_train_structured` | Machine-readable JSON for agents | **Model** | ✅ Implemented |

**Example:** User asks "When is the next train?" → AI model decides to call `get_next_train_schedule` tool.

**Implementation:**
```python
@mcp.tool()
def get_next_train_schedule(line: str, sta: str, lang: str = "EN") -> str:
    """Returns human-readable formatted train schedule..."""
    # 80+ stations, fuzzy matching, direction guide
    # Returns formatted text with emojis
```

---

### 2. **Resources** (Application-Controlled) ✅

Resources provide read-only data sources that AI applications can retrieve and use as context.

| Resource | URI | Purpose | Control | Status |
|----------|-----|---------|---------|--------|
| Station List | `mtr://stations/list` | Complete reference of 80+ MTR stations | **Application** | ✅ Implemented |
| Line Map | `mtr://lines/map` | MTR network connectivity & interchanges | **Application** | ✅ Implemented |

**Example:** Application retrieves `mtr://lines/map` to provide context when user asks "How do I get from Tseung Kwan O to Central?"

**Implementation:**
```python
@mcp.resource("mtr://stations/list")
def get_station_list() -> str:
    """Resource: Complete list of all MTR stations with codes"""
    # Returns markdown formatted station reference
    # Organized by line with station codes
```

**Usage Flow:**
1. Application reads resource: `session.read_resource("mtr://lines/map")`
2. Application provides context to AI model
3. AI model uses context to answer routing questions
4. AI model may also call tools to get real-time schedules

---

### 3. **Prompts** (User-Controlled) ✅

Prompts are pre-built instruction templates that users explicitly invoke for common tasks.

| Prompt | Arguments | Purpose | Control | Status |
|--------|-----------|---------|---------|--------|
| `check_next_train` | line, station | Quick train schedule check | **User** | ✅ Implemented |
| `plan_mtr_journey` | origin, destination | Plan route between stations | **User** | ✅ Implemented |
| `compare_stations` | station1, station2, station3 | Compare train frequencies | **User** | ✅ Implemented |

**Example:** User invokes `/plan-mtr-journey` → selects template → fills in "TKO" and "Central" → AI receives structured instructions.

**Implementation:**
```python
@mcp.prompt()
def plan_mtr_journey(origin: str, destination: str) -> str:
    """Prompt: Plan MTR journey between two stations"""
    return f"""Help me plan an MTR journey from {origin} to {destination}.
    
    Please:
    1. Use the mtr://lines/map resource to find the route
    2. Check next trains at {origin} using get_next_train_schedule
    3. Identify any interchange stations needed
    4. Estimate total journey time
    5. Provide step-by-step directions"""
```

**User Experience:**
- User selects "Plan MTR Journey" from prompt menu
- Fills in parameters: Origin="Tseung Kwan O", Destination="Central"
- AI receives complete template with instructions
- AI uses Resources (line map) + Tools (train schedules) to complete task

---

## 🔄 How Features Work Together

### Example: Complete Journey Planning Flow

**Scenario:** User wants to travel from Tseung Kwan O to Central

```
1. USER ACTION (User-Controlled)
   └─> Invokes "plan_mtr_journey" prompt
   └─> Parameters: origin="TKO", destination="Central"

2. PROMPT PROVIDES INSTRUCTIONS
   └─> "Use mtr://lines/map resource to find route"
   └─> "Check next trains using get_next_train_schedule"
   └─> "Identify interchange stations"

3. APPLICATION RETRIEVES RESOURCES (Application-Controlled)
   └─> Reads mtr://lines/map
   └─> Provides context: "TKO is on TKL line, Central is on ISL/TWL"
   └─> AI learns: "Need to interchange at Quarry Bay (QUB)"

4. AI MODEL USES TOOLS (Model-Controlled)
   └─> Calls get_next_train_schedule(line="TKL", sta="TKO")
   └─> Gets: "Next train to North Point in 2 minutes, Platform 2"
   └─> Calls get_next_train_schedule(line="ISL", sta="QUB")
   └─> Gets: "Next train to Central in 5 minutes, Platform 1"

5. AI RESPONDS TO USER
   └─> "Take TKL downbound train from TKO (2 min, Platform 2)"
   └─> "Change at Quarry Bay to Island Line"
   └─> "Take ISL train to Central (5 min wait, Platform 1)"
   └─> "Total journey: ~25 minutes"
```

---

## 📊 Feature Comparison: MCP Specification

| Feature | Who Controls | Purpose | MTR Server Implementation |
|---------|--------------|---------|---------------------------|
| **Tools** | Model | Actions the AI can perform | 2 tools: human text + machine JSON |
| **Resources** | Application | Read-only data for context | 2 resources: station list + line map |
| **Prompts** | User | Pre-built instruction templates | 3 prompts: check, plan, compare |

---

## 🎯 Client Features (Not Implemented - Client-Side)

These features are provided by **MCP clients**, not servers:

| Feature | Purpose | Implementation | Status |
|---------|---------|----------------|--------|
| **Sampling** | Server requests LLM completions | Client-side only | ❌ N/A |
| **Roots** | Filesystem boundary specification | Client-side only | ❌ N/A |
| **Elicitation** | Request info from users | Client-side only | ❌ N/A |

**Why Not Implemented?**
- These are client responsibilities (e.g., LangGraph client, Claude Desktop)
- Servers cannot control sampling, roots, or elicitation
- Our MTR server provides Tools, Resources, and Prompts (server-side features)

---

## 🧪 Testing

### Test Resources & Prompts:
```bash
python test_resources_prompts.py
```

**Expected Output:**
```
✓ Found 2 resources:
  • mtr://stations/list
  • mtr://lines/map

✓ Found 3 prompts:
  • check_next_train
  • plan_mtr_journey
  • compare_stations
```

---

## 📚 Further Reading

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [whatismcp.md](./whatismcp.md) - Complete MCP overview
- [MCP_SERVER_SUMMARY.md](./MCP_SERVER_SUMMARY.md) - Detailed implementation docs

---

## 🎉 Summary

Our MTR MCP Server is **fully compliant** with the MCP specification's server-side features:

✅ **Tools** - 2 implemented (human + machine interfaces)  
✅ **Resources** - 2 implemented (station list + line map)  
✅ **Prompts** - 3 implemented (check, plan, compare)  
✅ **Natural Language** - 80+ stations with fuzzy matching  
✅ **Error Handling** - Comprehensive with suggestions  
✅ **Documentation** - Complete with examples  

**Total:** 7 MCP features exposed (2 tools + 2 resources + 3 prompts)
