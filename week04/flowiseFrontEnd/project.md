# FlowiseAI Frontend Project Guide

## Project Overview

Create a Vite frontend application with base path "projectui" that integrates with the FlowiseAI Prediction API.

## Quick Start Example

```javascript
async function query(data) {
    const response = await fetch(
        "https://project-1-13.eduhk.hk/api/v1/prediction/415615d3-ee34-4dac-be19-f8a20910f692",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

// Example usage
query({"question": "Hey, how are you?"}).then((response) => {
    console.log(response);
});
```

## FlowiseAI Prediction API Documentation

### Endpoint

**POST** `/prediction/{id}`

Send a message to your flow and receive an AI-generated response. This is the primary endpoint for interacting with your flows and assistants.

**Authentication:** API key may be required depending on flow settings.

### Path Parameters

- **id** (string, required): Flow ID - the unique identifier of your flow
  - Example: `your-flow-id`

### Request Body Parameters

#### Core Parameters

- **question** (string): The question/message to send to the flow
  - Example: `"What is artificial intelligence?"`

- **form** (object): The form object to send to the flow (alternative to question for Agentflow V2)
  - Example: `{"title":"Example","count":1}`

- **streaming** (boolean): Enable streaming responses for real-time output
  - Default: `false`

#### Configuration Parameters

- **overrideConfig** (object): Override flow configuration and pass variables at runtime
  - Example:

    ```json
    {
      "sessionId": "user-session-123",
      "temperature": 0.7,
      "maxTokens": 500,
      "vars": {
        "user_name": "Alice"
      }
    }
    ```

#### Context Parameters

- **history** (array): Previous conversation messages for context
  - Example:

    ```json
    [
      {
        "role": "apiMessage",
        "content": "Hello! I'm an AI assistant. How can I help you today?"
      },
      {
        "role": "userMessage",
        "content": "Hi, my name is Sarah and I'm learning about AI"
      }
    ]
    ```

- **uploads** (array): Files to upload (images, audio, documents, etc.)
  - Example:

    ```json
    [
      {
        "type": "file",
        "name": "example.png",
        "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABjElEQVRIS+2Vv0oDQRDG",
        "mime": "image/png"
      }
    ]
    ```

#### Human Input Parameters

- **humanInput** (object): Return human feedback and resume execution from a stopped checkpoint
  - **type** (string): Type of human input response (`proceed` or `reject`)
  - **feedback** (string): Feedback to the last output
  - Example: `{"type":"reject","feedback":"Include more emoji"}`

### Response Codes

| Code | Description |
|------|-------------|
| 200  | Successful prediction response |
| 400  | Bad Request - Invalid input provided or request format is incorrect |
| 401  | Unauthorized - API key required or invalid |
| 404  | Not Found - Chatflow with specified ID does not exist |
| 413  | Payload Too Large - Request payload exceeds size limits |
| 422  | Validation Error - Request validation failed |
| 500  | Internal Server Error - Flow configuration or execution error |

### Example Response (200)

```json
{
  "text": "Artificial intelligence (AI) is a branch of computer science that focuses on creating systems capable of performing tasks that typically require human intelligence.",
  "json": {},
  "question": "What is artificial intelligence?",
  "chatId": "chat-12345",
  "chatMessageId": "msg-67890",
  "sessionId": "user-session-123",
  "memoryType": "Buffer Memory",
  "sourceDocuments": [
    {
      "pageContent": "This is the content of the page.",
      "metadata": {
        "author": "John Doe",
        "date": "2024-08-24"
      }
    }
  ],
  "usedTools": [
    {
      "tool": "Name of the tool",
      "toolInput": {
        "input": "search query"
      },
      "toolOutput": "text"
    }
  ]
}
```

### Request Examples

#### Non-Streaming Request

```http
POST /prediction/{id} HTTP/1.1
Host: your-flowise-host.com
Authorization: Bearer JWT
Content-Type: application/json
Accept: */*

{
  "question": "What is artificial intelligence?",
  "streaming": false,
  "overrideConfig": {
    "sessionId": "user-session-123",
    "temperature": 0.7,
    "maxTokens": 500,
    "vars": {
      "user_name": "Alice"
    }
  },
  "history": [
    {
      "role": "apiMessage",
      "content": "Hello! I'm an AI assistant. How can I help you today?"
    },
    {
      "role": "userMessage",
      "content": "Hi, my name is Sarah and I'm learning about AI"
    }
  ]
}
```

#### Streaming Request

```http
POST /prediction/{id} HTTP/1.1
Host: your-flowise-host.com
Authorization: Bearer JWT
Content-Type: application/json
Accept: text/event-stream

{
  "question": "What is the capital of France?",
  "streaming": true,
  "overrideConfig": {
    "sessionId": "user-session-123",
    "temperature": 0.7
  }
}
```

## Streaming Implementation

### Overview

When `streaming: true` is set in the request, FlowiseAI will send tokens as **Server-Sent Events (SSE)** as they become available, providing real-time response streaming.

### Streaming Response Format

The streaming response consists of several event types sent as SSE:

| Event Type | Description | Example Data |
|------------|-------------|--------------|
| `start` | Marks the beginning of streaming | `{}` |
| `token` | Individual tokens as they're generated | `"Once upon a time..."` |
| `error` | Error information if something goes wrong | `{"message": "Error details"}` |
| `metadata` | Flow metadata (chatId, messageId, etc.) | `{"chatId": "chat-123", "messageId": "msg-456"}` |
| `sourceDocuments` | Vector store sources used | `[{"pageContent": "...", "metadata": {...}}]` |
| `usedTools` | Tools utilized during processing | `[{"tool": "Calculator", "input": "...", "output": "..."}]` |
| `end` | Marks the end of streaming | `{}` |

### SSE Event Stream Example

```text
event: start
data: {}

event: token
data: The

event: token
data:  capital

event: token
data:  of

event: token
data:  France

event: token
data:  is

event: token
data:  Paris

event: metadata
data: {"chatId": "chat-12345", "messageId": "msg-67890", "sessionId": "user-session-123"}

event: end
data: {}
```

### JavaScript Implementation Example

#### Method 1: Using FlowiseClient SDK

**Installation:**
```bash
npm install flowise-sdk
```

**TypeScript Implementation:**
```typescript
import { FlowiseClient } from 'flowise-sdk'

async function test_streaming() {
  const client = new FlowiseClient({ baseUrl: 'http://localhost:3000' });

  try {
    // For streaming prediction
    const prediction = await client.createPrediction({
      chatflowId: '<flow-id>',
      question: 'What is the capital of France?',
      streaming: true,
    });

    for await (const chunk of prediction) {
      // chunk format: {event: "token", data: "hello"}
      console.log(chunk);
      
      // Handle different event types
      switch (chunk.event) {
        case 'start':
          console.log('Streaming started');
          break;
        case 'token':
          // Append token to UI
          appendTokenToMessage(chunk.data);
          break;
        case 'metadata':
          // Store metadata (chatId, messageId, etc.)
          handleMetadata(chunk.data);
          break;
        case 'end':
          console.log('Streaming finished');
          break;
        case 'error':
          console.error('Stream error:', chunk.data);
          break;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run streaming test
test_streaming()
```

#### Method 2: Using Native Fetch API

```javascript
async function streamWithFetch(question) {
  const response = await fetch('/api/v1/prediction/your-flow-id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      question,
      streaming: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(data);
            handleStreamChunk(parsed);
          } catch (e) {
            // Handle non-JSON data
            console.log('Raw data:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
```

#### Method 3: Using cURL

```bash
curl https://localhost:3000/api/v1/prediction/{flow-id} \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "question": "Hello world!",
    "streaming": true
  }'
```

**Response Stream:**
```text
event: start
data: {}

event: token
data: Hello

event: token
data:  world

event: token  
data: !

event: end
data: {}
```

### Integration Notes

- **Content-Type**: Use `text/event-stream` in Accept header for streaming
- **Error Handling**: Monitor for `error` events in the stream
- **Connection Management**: Properly close connections and handle network interruptions
- **UI Updates**: Update the interface incrementally as tokens arrive
- **Fallback**: Implement fallback to non-streaming if SSE is not supported

---

---

**Reference:** [FlowiseAI API Documentation](https://docs.flowiseai.com/api-reference/prediction)