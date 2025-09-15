# Azure OpenAI Mimic API Documentation

## Overview

This service mimics the Azure OpenAI Chat Completions API, providing both streaming and non-streaming responses. It supports two modes:

- **Mock Mode**: Returns predefined responses (default)
- **Proxy Mode**: Forwards requests to EdUHK API and reformats responses

## Base URLs

- **Production**: `https://aai02.eduhk.hk`
- **Local HTTP**: `http://localhost:5555`
- **Local HTTPS**: `https://localhost:5556` (requires SSL certificates)

## Authentication

### API Key Configuration

API key validation is configurable via environment variables:

```bash
# Enable API key requirement
REQUIRE_API_KEY=true

# Define valid API keys (comma-separated)
VALID_API_KEYS=test-key-123,dev-key-456,demo-key-789
```

### Header Format

```http
api-key: your-api-key-here
```

## Endpoints

### 1. Chat Completions

**POST** `/openai/deployments/{deployment}/chat/completions`

#### Path Parameters

- `deployment` (string): The deployment name (e.g., "gpt-4o-mini", "gpt-4", "gpt-35-turbo")

#### Query Parameters

- `api-version` (string, optional): API version (e.g., "2024-02-15-preview")

#### Request Headers

```http
Content-Type: application/json
api-key: your-api-key-here
```

#### Request Body

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "content": "Hello, how are you?"
    }
  ],
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "max_tokens": 800,
  "stream": true,
  "stream_options": {
    "include_usage": true
  }
}
```

#### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | array | Yes | Array of message objects |
| `model` | string | No | Model name (defaults to "gpt-4o-mini") |
| `temperature` | number | No | Sampling temperature (0-2) |
| `max_tokens` | number | No | Maximum tokens in response |
| `stream` | boolean | No | Enable streaming response |
| `stream_options` | object | No | Streaming configuration |

#### Message Object Format

```json
{
  "role": "user|assistant|system",
  "content": "Message content"
}
```

#### Stream Options

```json
{
  "include_usage": true
}
```

### Response Formats

#### Streaming Response (stream: true)

The API uses Server-Sent Events (SSE) format with the following headers:

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

#### Streaming Response Flow

1. **Initial Filter Chunk**

```text
data: {"choices":[],"created":0,"id":"","model":"","object":"","prompt_filter_results":[{"prompt_index":0,"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"},"jailbreak":{"filtered":false,"detected":false}}}]}

```

2. **Role Assignment Chunk**

```text
data: {"choices":[{"content_filter_results":{},"delta":{"content":"","refusal":null,"role":"assistant"},"finish_reason":null,"index":0,"logprobs":null}],"created":1726041600,"id":"chatcmpl-abc123def456","model":"gpt-4.1-2025-04-14","object":"chat.completion.chunk","system_fingerprint":"fp_abc123def4"}

```

3. **Content Chunks** (multiple)

```text
data: {"choices":[{"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}},"delta":{"content":"Hello! "},"finish_reason":null,"index":0,"logprobs":null}],"created":1726041600,"id":"chatcmpl-abc123def456","model":"gpt-4.1-2025-04-14","object":"chat.completion.chunk","system_fingerprint":"fp_abc123def4"}

```

4. **Final Chunk**

```text
data: {"choices":[{"content_filter_results":{},"delta":{},"finish_reason":"stop","index":0,"logprobs":null}],"created":1726041600,"id":"chatcmpl-abc123def456","model":"gpt-4.1-2025-04-14","object":"chat.completion.chunk","system_fingerprint":"fp_abc123def4"}

```

5. **Usage Chunk** (if `stream_options.include_usage` is true)

```text
data: {"choices":[],"created":1726041600,"id":"chatcmpl-abc123def456","model":"gpt-4.1-2025-04-14","object":"chat.completion.chunk","system_fingerprint":"fp_abc123def4","usage":{"prompt_tokens":25,"completion_tokens":15,"total_tokens":40}}

```

6. **End Marker**

```text
data: [DONE]

```

#### Non-Streaming Response (stream: false)

```json
{
  "choices": [
    {
      "message": {
        "content": "Hello! I'm doing well, thank you for asking. How can I assist you today?"
      }
    }
  ]
}
```

### 2. Health Check

**GET** `/health`

#### Response

```json
{
  "status": "ok",
  "timestamp": "2024-09-11T10:30:00.000Z"
}
```

### 3. CORS Preflight

**OPTIONS** `/openai/deployments/{deployment}/chat/completions`

Handles CORS preflight requests with appropriate headers.

## Error Responses

### 401 Unauthorized (Missing API Key)

```json
{
  "error": {
    "code": "Unauthorized",
    "message": "Access denied due to missing api-key header"
  }
}
```

### 401 Unauthorized (Invalid API Key)

```json
{
  "error": {
    "code": "Unauthorized", 
    "message": "Access denied due to invalid api-key"
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "NotFound",
    "message": "The requested resource '/invalid/path' was not found."
  }
}
```

## Example Usage

### cURL Examples

#### Streaming Request

```bash
curl -X POST "https://aai02.eduhk.hk/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-15-preview" \
  -H "Content-Type: application/json" \
  -H "api-key: test-key-123" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "model": "gpt-4o-mini",
    "stream": true,
    "stream_options": {
      "include_usage": true
    }
  }' \
  --no-buffer
```

#### Non-Streaming Request

```bash
curl -X POST "https://aai02.eduhk.hk/openai/deployments/gpt-4o-mini/chat/completions" \
  -H "Content-Type: application/json" \
  -H "api-key: test-key-123" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "model": "gpt-4o-mini",
    "stream": false
  }'
```

### JavaScript/TypeScript Example

```typescript
const response = await fetch('https://aai02.eduhk.hk/openai/deployments/gpt-4o-mini/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': 'test-key-123'
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    model: 'gpt-4o-mini',
    stream: true,
    stream_options: {
      include_usage: true
    }
  })
});

if (response.body) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.substring(6);
        if (data === '[DONE]') {
          console.log('Stream complete');
          break;
        }
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            console.log('Content:', content);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}
```

### Python Example

```python
import requests
import json

# Non-streaming request
response = requests.post(
    'https://aai02.eduhk.hk/openai/deployments/gpt-4o-mini/chat/completions',
    headers={
        'Content-Type': 'application/json',
        'api-key': 'test-key-123'
    },
    json={
        'messages': [
            {'role': 'user', 'content': 'Hello, how are you?'}
        ],
        'model': 'gpt-4o-mini',
        'stream': False
    }
)

print(response.json())

# Streaming request
response = requests.post(
    'https://aai02.eduhk.hk/openai/deployments/gpt-4o-mini/chat/completions',
    headers={
        'Content-Type': 'application/json',
        'api-key': 'test-key-123'
    },
    json={
        'messages': [
            {'role': 'user', 'content': 'Hello, how are you?'}
        ],
        'model': 'gpt-4o-mini',
        'stream': True,
        'stream_options': {
            'include_usage': True
        }
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        line = line.decode('utf-8')
        if line.startswith('data: '):
            data = line[6:]
            if data == '[DONE]':
                break
            try:
                parsed = json.loads(data)
                content = parsed.get('choices', [{}])[0].get('delta', {}).get('content')
                if content:
                    print(content, end='', flush=True)
            except json.JSONDecodeError:
                pass
```

## Chunking Format Details

### Streaming Chunks Structure

Each streaming chunk follows this format:

```text
data: <JSON_OBJECT>\n\n
```

### Chunk Types

1. **Filter Results Chunk**: Content filtering information
2. **Role Chunk**: Assistant role assignment
3. **Content Chunks**: Actual response content (word-by-word)
4. **Final Chunk**: Marks completion with `finish_reason: "stop"`
5. **Usage Chunk**: Token usage statistics (optional)
6. **Done Marker**: `data: [DONE]` signals end of stream

### Content Chunking Strategy

- Content is split by spaces (word-level chunking)
- Each word is sent as a separate chunk with 200ms delay
- Maintains spaces between words in the final assembled message

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5555 | HTTP port |
| `HTTPS_PORT` | 5556 | HTTPS port |
| `REQUIRE_API_KEY` | false | Enable API key validation |
| `VALID_API_KEYS` | test-key-123,dev-key-456,demo-key-789 | Valid API keys (comma-separated) |
| `USE_EDUHK_PROXY` | false | Enable EdUHK proxy mode |

### SSL Certificates

For HTTPS mode, certificates must be present in the `certs/` directory:

- `certs/server.key` - Private key
- `certs/server.crt` - Certificate

Generate certificates using: `npm run generate-certs`

## Start Commands

```bash
# HTTP server
npm run start:http

# HTTPS server  
npm run start:https

# Mock mode (HTTPS)
npm run start:mock

# Proxy mode (HTTPS)
npm run start:proxy

# Docker
npm run docker:up
```

## Logging

The server provides extensive logging for debugging:

- Request details (method, URL, headers, body)
- Response chunks and timing
- Authentication status
- Proxy mode status

All requests are logged with timestamps and detailed information for troubleshooting.
