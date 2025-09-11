# Chatbot API Explorer - UI Components Tutorial

## Overview
The Chatbot API Explorer is a React-based web application built with TypeScript, Vite, and Material-UI Joy components. This tutorial explores the key UI components that make up the application, including headers configuration, request body management, and streaming chunks handling.

## 🏗️ Application Architecture

### Main Layout Structure
The app follows a **two-panel layout**:
- **Left Panel (500px wide)**: Configuration panels
- **Right Panel (flex-1)**: Chat interface

```
┌─────────────────────────────────────────────────────────────┐
│                     App Container                           │
│  ┌─────────────────┐ ┌───────────────────────────────────┐  │
│  │   Left Panel    │ │         Main Chat Area            │  │
│  │  (Config)       │ │                                   │  │
│  │                 │ │                                   │  │
│  └─────────────────┘ └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Key UI Components

### 1. **API Configuration Panel** (`ApiConfigPanel.tsx`)

This panel handles the setup of API providers and authentication.

#### Features:
- **Provider Selection**: Dropdown with pre-configured providers (Hugging Face, Grok)
- **API Key Management**: Secure input field with show/hide toggle (automatically cleared when switching providers)
- **Model Configuration**: 
  - Dropdown for standard models
  - Custom model name input (enabled by default)
  - Toggle between standard and custom models
- **Endpoint Management**: Auto-populated for all providers

#### Key UI Elements:
```typescript
// Provider dropdown
<Select value={selectedProvider} onChange={handleProviderChange}>
  {Object.values(API_PROVIDERS).map((provider) => (
    <Option key={provider.id} value={provider.id}>
      {provider.name}
    </Option>
  ))}
</Select>

// API key with visibility toggle
<Input
  type={showApiKey ? "text" : "password"}
  value={apiKey}
  onChange={(e) => handleApiKeyChange(e.target.value)}
/>
<IconButton onClick={() => setShowApiKey(!showApiKey)}>
  {showApiKey ? "😊" : "🫣"}
</IconButton>
```

### Default Custom Model Names
Each provider has a default custom model that gets automatically set:

**Hugging Face:**
- Default: `meta-llama/Llama-3.1-8B-Instruct:cerebras`
- Endpoint: `https://router.huggingface.co/v1/chat/completions`

**Grok (X.AI):**
- Default: `grok-3-mini` 
- Endpoint: `https://api.x.ai/v1/chat/completions`

#### Provider Information Display:
- **Streaming Support**: Visual indicator
- **Authentication Requirements**: Badge system
- **Custom Model Support**: Status display

### 2. **Request Configuration Panel** (`RequestConfigPanel.tsx`)

This panel manages the actual HTTP request parameters that will be sent to the API.

#### Features:
- **HTTP Method Selection**: POST, GET, PUT, DELETE options
- **Streaming Toggle**: Enable/disable real-time response streaming
- **Headers Editor**: JSON editor for request headers
- **Request Body Editor**: JSON editor for the complete request payload

#### Headers Management:
```typescript
// Headers are managed as JSON and can include:
{
  "Content-Type": "application/json",
  "Authorization": "Bearer your-api-key",
  "x-api-key": "your-api-key",
  // Custom headers...
}
```

#### Request Body Management:
```typescript
// Example request body structure:
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 1000
}
```

#### Utility Functions:
- **Reset to Defaults**: Restore provider default settings
- **Add Common Parameters**: Inject temperature, max_tokens, etc.
- **Clear Chat History**: Remove messages from request body

### 3. **Chat Interface** (`ChatInterface.tsx`)

The main interaction area with a sophisticated layout structure.

#### Layout Strategy:
```
Header (Fixed)
├── Title & Clear Button
├── System Prompt Input
├── Raw Chunks Toggle
└── Custom Parser Accordion

Messages Area (Scrollable - flex-1)
├── Message Bubbles
├── Loading Indicator
└── Raw Chunks Display

Input Area (Fixed)
├── Message Textarea
├── Preview Button
└── Send Button
```

#### Message Display:
- **User Messages**: Right-aligned with blue styling
- **Assistant Messages**: Left-aligned with neutral styling
- **Timestamps**: Displayed for each message
- **Role Indicators**: "U" for user, "A" for assistant

#### Advanced Features:

##### **Raw Chunks Display**
When enabled, shows the actual streaming data received from the API:
```typescript
// Raw chunks are stored and displayed for debugging
{rawChunks.map((chunk, index) => (
  <Box key={index}>
    <Typography>Chunk {index + 1}:</Typography>
    <Typography component="pre">{chunk}</Typography>
  </Box>
))}
```

##### **Custom Chunk Parser**
Allows users to write custom JavaScript functions to parse streaming responses:
```javascript
// Default parser function example
function parseChunk(chunk) {
  // Handle Server-Sent Events (OpenAI format)
  if (chunk.startsWith('data: ')) {
    const data = chunk.slice(6);
    if (data.trim() === '[DONE]') return '';
    
    const parsed = JSON.parse(data);
    return parsed.choices?.[0]?.delta?.content || '';
  }
  
  // Handle raw JSON chunks
  if (chunk.trim().startsWith('{')) {
    const parsed = JSON.parse(chunk.trim());
    return parsed.choices?.[0]?.delta?.content || '';
  }
  
  // Handle plain text chunks
  return chunk;
}
```

### 4. **JSON Editor Component** (`JsonEditor.tsx`)

A Monaco Editor wrapper for editing JSON configuration.

#### Features:
- **Syntax Highlighting**: Full JSON syntax support
- **Auto-formatting**: Automatic indentation and validation
- **Error Detection**: Real-time JSON validation
- **Configurable Height**: Adjustable editor size

```typescript
<Editor
  height={height}
  language="json"
  value={value}
  onChange={handleEditorChange}
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on',
    formatOnPaste: true,
    tabSize: 2,
  }}
/>
```

## 🔄 Data Flow and State Management

### State Management (Zustand)
The app uses Zustand for global state management:

```typescript
interface AppState {
  // API Configuration
  selectedProvider: string;
  apiKey: string;
  endpoint: string;
  model: string;
  
  // Request Configuration  
  headers: Record<string, string>;
  requestBody: object;
  isStreaming: boolean;
  httpMethod: string;
  
  // Chat State
  messages: Message[];
  systemPrompt: string;
  
  // UI State
  isLoading: boolean;
  error: string | null;
}
```

### Provider Switching Security Feature
**Important Security Enhancement:** When switching between providers, the API key is automatically cleared to prevent accidental cross-provider key usage. This ensures:
- No accidental key leakage between providers
- Each provider requires its own valid API key
- Headers are reset to provider defaults (without auth until new key is entered)
- Model defaults are applied for the new provider

### Message Flow:
1. **User Input** → Added to messages array
2. **API Request** → Built from configuration panels
3. **Streaming Response** → Parsed and accumulated
4. **Assistant Message** → Added to messages array

## 🎛️ Headers Configuration Deep Dive

### Automatic Headers
Headers are automatically configured based on the selected provider:

```typescript
// Provider-specific headers
const authHeaders = getAuthHeader(providerId, apiKey);
setHeaders({
  ...provider.defaultHeaders,
  ...authHeaders,
});
```

### Manual Headers Override
Users can manually edit headers in the Request Configuration panel:
- **JSON Format**: Headers must be valid JSON
- **Real-time Validation**: Immediate feedback on JSON errors
- **Save Confirmation**: Changes must be explicitly saved

### Common Header Patterns:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer sk-...",
  "User-Agent": "ChatbotAPIExplorer/1.0",
  "Accept": "text/event-stream"
}
```

## 📦 Request Body Management

### Automatic Body Generation
The request body is automatically built from:
- **System Prompt**: Added as system message
- **Chat History**: All previous messages
- **Model Configuration**: Selected model name
- **Streaming Settings**: Stream parameter

### Manual Body Override
Users can completely customize the request body:
- **Full JSON Control**: Edit the entire request structure
- **Parameter Addition**: Add temperature, max_tokens, etc.
- **Message History Control**: Include/exclude chat history

### Body Structure Examples:

#### Standard OpenAI Format:
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 1000
}
```

#### Custom API Format:
```json
{
  "prompt": "Hello!",
  "max_length": 100,
  "temperature": 0.8,
  "stream": true
}
```

## 🌊 Streaming Chunks Handling

### Streaming Architecture
The app supports streaming for both providers:
1. **Hugging Face**: Full streaming support with SSE format
2. **Grok**: Full streaming support with custom reasoning content

### Chunk Processing Pipeline:
```
Raw Chunk → Custom Parser → Content Extraction → UI Update
```

### Chunk Format Examples:

#### Server-Sent Events (SSE):
```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" world"}}]}
data: [DONE]
```

#### Raw JSON Chunks:
```
{"choices":[{"delta":{"content":"Hello"}}]}
{"choices":[{"delta":{"content":" world"}}]}
```

#### Plain Text Chunks:
```
Hello
 world
```

### Custom Parser Features:
- **Flexible Parsing**: Handle any streaming format
- **Error Recovery**: Fallback to default parsing
- **Debug Support**: Raw chunk inspection
- **Real-time Processing**: Live content accumulation

## 🎨 UI Design Patterns

### Material-UI Joy Components
The app uses Material-UI Joy for consistent design:
- **Cards**: Main container components
- **Typography**: Hierarchical text system
- **FormControl**: Input field wrappers
- **Buttons**: Action triggers
- **Alerts**: Error and info messages

### Responsive Layout:
- **Fixed Left Panel**: 500px configuration area
- **Flexible Right Panel**: Expands to fill remaining space
- **Scrollable Areas**: Independent scroll regions
- **Sticky Elements**: Fixed headers and input bars

### Color Coding:
- **Primary**: User messages and actions
- **Neutral**: Assistant messages and defaults
- **Success**: Successful operations
- **Warning**: Important notices
- **Danger**: Errors and destructive actions

## 🔧 Hands-On Exercises

### Exercise 1: Headers Exploration
1. Open the Request Configuration panel
2. View the current headers JSON
3. Add a custom header: `"X-Custom-Header": "MyValue"`
4. Save the headers and send a test message
5. Check if your custom header appears in the request

### Exercise 2: Request Body Customization
1. Add common parameters using the "Add Common Params" button
2. Modify the temperature value to 0.9
3. Add a new parameter: `"top_p": 0.95`
4. Save the body and test the API call
5. Observe how the parameters affect the response

### Exercise 3: Custom Chunk Parser
1. Enable "Show raw streaming chunks"
2. Send a message and observe the raw chunk format
3. Modify the custom parser to add emoji prefixes: `"🤖 " + content`
4. Test the parser with another message
5. Experiment with parsing different chunk formats

### Exercise 4: Provider Comparison
1. Configure Hugging Face with your API key
2. Send a test message and note the response format
3. Switch to "Grok" provider
4. Configure with a Grok API key
5. Compare the request/response structures between providers

## 💡 Advanced Tips

### Debug Streaming Issues:
1. Enable raw chunks display
2. Check custom parser errors in console
3. Verify chunk format matches parser expectations
4. Test with fallback parsing logic

### Optimize Performance:
1. Use appropriate max_tokens values
2. Enable streaming for faster perceived response
3. Clear chat history for shorter requests
4. Monitor request body size

### Custom API Integration:
1. Note: Custom API provider has been removed in current version
2. Use Hugging Face provider for custom models via their router
3. Grok provider for X.AI API access
4. Both providers support custom model names
5. Write appropriate chunk parser for provider-specific formats

## 📚 Component Reference

### Main Components:
- `App.tsx`: Root layout container
- `ApiConfigPanel.tsx`: Provider and authentication setup
- `RequestConfigPanel.tsx`: HTTP request configuration
- `ChatInterface.tsx`: Main chat interaction area
- `JsonEditor.tsx`: Monaco-based JSON editor

### Utility Components:
- `RequestBodyModal.tsx`: Preview request modal
- `RequestPreviewPanel.tsx`: Request inspection
- `RawResponsePanel.tsx`: Raw API response display

### Services:
- `apiService.ts`: HTTP request handling
- `appStore.ts`: Global state management
- `apiProviders.ts`: Provider configurations

This tutorial provides a comprehensive overview of the Chatbot API Explorer's UI components, focusing on the practical aspects of headers, request body, and streaming chunks that make the application a powerful tool for API exploration and testing.
