### Key Points
- Hugging Face provides **free inference** for models like MiniMaxAI/MiniMax-M2 through its **Inference Providers** router API at `https://router.huggingface.co/v1/chat/completions`, which is **OpenAI-compatible** and easier to use than the legacy inference API.
- An **hf_read token** (read-role user access token) or **fine-grained token with "Make calls to Inference Providers" permission** is required for authentication. Generate one at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
- The **router endpoint automatically selects the best provider** for your model (e.g., Together AI, SambaNova, etc.) with automatic failover if a provider is unavailable.
- MiniMax-M2 uses an **interleaved thinking format** where responses include `<think>...</think>` sections. These should be retained in conversation history for optimal performance but can be stripped for display.
- Request formats follow **OpenAI-compatible structures** (same as OpenAI's Chat Completions API), making it a drop-in replacement for existing OpenAI code.

### Getting Started with Inference Providers

#### Using the Router Endpoint (Recommended)

The **OpenAI-compatible router endpoint** is the easiest way to use MiniMax-M2:

```bash
curl https://router.huggingface.co/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_HF_TOKEN_HERE" \
    -d '{
      "model": "MiniMaxAI/MiniMax-M2",
      "messages": [
        {
          "role": "system",
          "content": "You are a helpful assistant."
        },
        {
          "role": "user",
          "content": "Write a Python function to calculate factorial."
        }
      ],
      "max_tokens": 500,
      "temperature": 1.0,
      "top_p": 0.95
    }'
```

#### Using Node.js with Axios

```javascript
const axios = require('axios');

const HUGGINGFACE_API_KEY = 'YOUR_HF_TOKEN_HERE';
const HUGGINGFACE_API_URL = 'https://router.huggingface.co/v1/chat/completions';

async function callHuggingFace(userMessage, systemPrompt = 'You are a helpful assistant.') {
  try {
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      {
        model: 'MiniMaxAI/MiniMax-M2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
        temperature: 1.0,
        top_p: 0.95
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
        }
      }
    );

    // Extract content from OpenAI-compatible response
    const content = response.data.choices[0].message.content;
    
    // Optional: Remove thinking tags for display
    const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    
    return cleanContent;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
callHuggingFace('Hello, how are you?')
  .then(response => console.log(response))
  .catch(err => console.error(err));
```


### Usage Tips

- **Recommended Parameters**: Set `temperature=1.0`, `top_p=0.95` for optimal performance (note: `top_k` is not supported in the router endpoint).
- **Handling Thinking Format**: The model outputs `<think>...</think>` sections. Keep them in conversation history for context, but you can strip them for display.
- **Limits and Upgrades**: The free tier is suitable for testing. For production, consider a PRO account for more credits. Rate limits apply (typically 10-50 requests per minute).
- **Provider Selection**: You can append `:fastest` or `:cheapest` to the model name (e.g., `MiniMaxAI/MiniMax-M2:fastest`) to optimize provider selection.

### Response Format

The response follows OpenAI's chat completions format:

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1730710027,
  "model": "MiniMaxAI/MiniMax-M2",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "<think>Reasoning about the problem...</think>\n\nHere's the factorial function:\n\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 85,
    "total_tokens": 110
  }
}
```

### Common Error Codes

- **401 Unauthorized**: Invalid or missing API token
- **429 Too Many Requests**: Rate limit exceeded (wait and retry)
- **503 Service Unavailable**: Model is loading (typically ~20 seconds on first request for free tier)

### Using with OpenAI SDK (Drop-in Replacement)

Since the router endpoint is OpenAI-compatible, you can use the OpenAI SDK:

```javascript
// Node.js
const { OpenAI } = require('openai');

const client = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: process.env.HUGGINGFACE_API
});

const completion = await client.chat.completions.create({
  model: 'MiniMaxAI/MiniMax-M2',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(completion.choices[0].message.content);
```

---

## Legacy Information (For Reference Only)

The sections below describe older methods that still work but are not recommended for new implementations.

To utilize it with an hf_read token, first generate one from your Hugging Face settings at https://huggingface.co/settings/tokens, selecting the "Read" role, which grants permissions for repository access, model downloads, and inference calls. This token type is explicitly sufficient for Inference API usage, as it allows read-only operations including running predictions on hosted models. In contrast, write tokens are for uploading or modifying content, and fine-grained tokens offer more targeted controls, such as limiting access to specific repositories. For inference specifically, while the documentation for the newer Inference Providers (a routed service to external hosts like AWS or SambaNova) mentions a fine-grained token with "inference.serverless.write" permission for making calls, the standard Inference API—which powers the free tier for models like MiniMax-M2—relies on read tokens for authentication. You can pass the token directly in code or HTTP headers to avoid anonymous rate limits, which are stricter (e.g., fewer requests per hour).

In Python, the recommended way is through the `InferenceClient` from the `huggingface_hub` library. After installation, initialize it with your token:

```python
from huggingface_hub import InferenceClient
client = InferenceClient(token="hf_xxxxxxxxxxxxxxx")  # Your hf_read token
```

For text-generation tasks, use `client.text_generation()` with a prompt string, optional parameters like `max_new_tokens` for output length, and sampling controls. However, given MiniMax-M2's chat-oriented design with interleaved thinking, the `chat_completion()` method is more appropriate, as it handles multi-turn conversations via a messages list. This aligns with OpenAI-compatible formats, making it easy to integrate into existing workflows.

The request format for chat_completion involves a JSON-like structure in the payload:

- **messages**: A list of dictionaries, each with "role" (system, user, or assistant) and "content" (string or list for multimodal, though MiniMax-M2 is text-only).
- **model**: "MiniMaxAI/MiniMax-M2" (optional if set in client init).
- **max_tokens**: Integer limiting output tokens.
- **temperature**, **top_p**, **top_k**: Floats/ints for generation diversity (recommended: 1.0, 0.95, 40).
- **stream**: Boolean for real-time token streaming.
- **stop**: List of strings to halt generation.
- **seed**: Integer for reproducibility.
- **tools**: Optional list for function calling in agentic scenarios.
- **response_format**: Dict to enforce JSON output, useful for structured coding responses.

A full example request in code:

```python
messages = [
    {"role": "system", "content": "You are a helpful coding assistant."},
    {"role": "user", "content": "Implement a binary search in Python."},
    # If previous response: {"role": "assistant", "content": "<think>Planning...</think> code here"}
]
response = client.chat_completion(
    messages=messages,
    max_tokens=300,
    temperature=1.0,
    top_p=0.95,
    top_k=40,
    stream=False
)
```

For raw HTTP requests without the client, POST to `https://api-inference.huggingface.co/models/MiniMaxAI/MiniMax-M2` or the router endpoint `https://router.huggingface.co/v1/chat/completions` for provider selection (e.g., append ":fastest" to model ID for quickest response). Include the token in the Authorization header. The body is JSON with the above parameters.

The response format mirrors OpenAI's chat completions API for consistency:

- **choices**: List of completion objects, typically one.
  - **message**: Dict with "role": "assistant" and "content": The generated text, including any `<think>...</think>` blocks.
  - **finish_reason**: String like "eos_token" or "stop".
- **model**: The used model ID.
- **usage**: Dict with "prompt_tokens", "completion_tokens", "total_tokens" for metering.
- If streaming: An iterator of chunks, each with "choices[0].delta.content" for partial text.

Example response JSON:

```json
{
    "id": "chatcmpl-abc123",
    "object": "chat.completion",
    "created": 1730710027,
    "model": "MiniMaxAI/MiniMax-M2",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "<think>Considering edge cases for binary search...</think>\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1"
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 25,
        "completion_tokens": 85,
        "total_tokens": 110
    }
}
```

Key to MiniMax-M2's effectiveness is preserving the thinking content in history; stripping it can lead to suboptimal performance, as the model relies on it for reasoning continuity. For free tier details, it's generous but unspecified in exact quotas—expect limits like 10-50 requests per minute or token-based caps, escalating with PRO ($9/month) for more. If exceeding, alternatives include self-hosting: Download weights from Hugging Face and deploy via SGLang (for high-performance serving), vLLM (with automatic model caching), or MLX (for Apple silicon). System requirements include Linux, Python 3.9-3.12, and GPUs with compute capability >=7.0 (e.g., NVIDIA A100 or better for full speed).

While the model excels in multi-file edits, code-run-fix loops, and test-validated repairs, its MoE design trades off some general capabilities for efficiency. Community feedback on Reddit and forums highlights its strength in developer workflows but notes the importance of the thinking format. For balanced views, counterpoints from sources like local LLM discussions suggest comparing it to denser models like Llama for non-coding tasks, where it may underperform. No major controversies surround it, given its open-source MIT-like license, but as a new release, long-term reliability depends on community adoption.

| Aspect | Details | Recommendations |
|--------|---------|-----------------|
| **Model Parameters** | 230B total, 10B active (MoE) | Use for low-latency agentic tasks; avoid if needing ultra-dense reasoning. |
| **Inference Cost** | Free tier: Generous but limited; PRO: Extra credits | Monitor usage via response "usage" field; switch to self-host for unlimited. |
| **Authentication** | hf_read token sufficient | Generate at https://huggingface.co/settings/tokens; use for all calls to bypass anonymous limits. |
| **Request Params** | messages, max_tokens, temperature=1.0, top_p=0.95, top_k=40 | Tune top_k for diversity in coding outputs; enable stream for interactive apps. |
| **Response Handling** | Retain full content including <think> | Parse "choices[0].message.content" but feed back unaltered in multi-turn. |
| **Alternatives** | Self-host with vLLM/SGLang | For production: vLLM for batching; SGLang for structured generation. |
| **Limitations** | Rate limits, no multimodal | Supplement with web searches for real-time data; use tools param for agents. |

In summary, this setup provides an accessible entry to powerful coding AI, backed by Hugging Face's infrastructure, with the hf_read token ensuring smooth operation.

### Key Citations
- [MiniMaxAI/MiniMax-M2 · Hugging Face](https://huggingface.co/MiniMaxAI/MiniMax-M2)
- [Inference Providers - Hugging Face](https://huggingface.co/docs/api-inference/index)
- [docs/vllm_deploy_guide.md · MiniMaxAI/MiniMax-M2 at main](https://huggingface.co/MiniMaxAI/MiniMax-M2/blob/main/docs/vllm_deploy_guide.md)
- [MiniMax M2 Model SGLang Deployment Guide - Hugging Face](https://huggingface.co/MiniMaxAI/MiniMax-M2/blob/main/docs/sglang_deploy_guide.md)
- [User access tokens - Hugging Face](https://huggingface.co/docs/hub/security-tokens)
- [Inference - Hugging Face](https://huggingface.co/docs/huggingface_hub/package_reference/inference_client)