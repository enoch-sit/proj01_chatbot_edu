# Chatbot API Explorer - Hands-On Workshop

## 🎯 Workshop Objectives

By the end of this workshop, you will:

1. **Understand** the UI components of the Chatbot API Explorer
2. **Configure** API providers and authentication
3. **Customize** HTTP headers and request bodies
4. **Parse** streaming chunks with custom logic
5. **Debug** API calls and responses

## 📋 Prerequisites

- Basic knowledge of JSON format
- Understanding of HTTP requests
- Familiarity with JavaScript functions
- Access to at least one API key (Hugging Face, Grok/X.AI) OR knowledge of the available providers

## 🚀 Workshop Exercises

### **Exercise 1: Getting Started with the Interface**

**Objective:** Familiarize yourself with the main UI components

**Steps:**

1. **Open the Chatbot API Explorer** in your browser
2. **Identify the main sections:**
   - Left panel: Configuration area
   - Right panel: Chat interface
3. **Locate these key components:**
   - API Configuration Panel (top-left)
   - Request Configuration Panel (bottom-left)
   - Chat Interface (right side)

---

### **Exercise 2: API Provider Configuration**

**Objective:** Set up an API provider and understand authentication

**Steps:**

1. **In the API Configuration Panel:**
   - Click on the **Provider** dropdown
   - Explore the available options (Hugging Face, Grok)
   - Select **Hugging Face** (or your preferred provider)

2. **Configure Authentication:**
   - Enter your API key in the **API Key** field (note: API key is automatically cleared when switching providers)
   - Click the eye icon (😊/🫣) to toggle visibility
   - Observe how the endpoint URL auto-populates

3. **Model Selection:**
   - Notice that **"Use custom model name"** is checked by default
   - Default models: `meta-llama/Llama-3.1-8B-Instruct:cerebras` (Hugging Face) or `grok-3-mini` (Grok)
   - Try entering a different model name or uncheck to use dropdown

4. **Provider Information:**
   - Note the colored badges showing:
     - Streaming Support
     - Authentication requirements
     - Custom Model support

**✅ Checkpoint Questions:**
- What happens to the endpoint URL when you change providers?
- What happens to the API key when you switch providers?
- Which providers require authentication?
- What's the difference between standard and custom model selection?

---

### **Exercise 3: Headers Deep Dive**

**Objective:** Understand and customize HTTP headers

**Steps:**

1. **Navigate to Request Configuration Panel**
2. **Examine Current Headers:**
   - Look at the **"Actual Request Headers"** section
   - Notice the JSON format
   - Identify authentication headers (Authorization, x-api-key)

3. **Add Custom Headers:**
   - Add this line to the headers JSON:
   ```json
   "X-Custom-App": "ChatbotExplorer",
   "X-User-ID": "workshop-user-123"
   ```
   - Click **"Save Headers JSON"**

4. **Test Header Validation:**
   - Try adding invalid JSON (remove a comma)
   - Observe the error message
   - Fix the JSON and save again

**🧪 Experiment:**
Try adding these headers and see what happens:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer your-api-key",
  "X-Custom-App": "ChatbotExplorer",
  "User-Agent": "Workshop/1.0",
  "Accept": "text/event-stream"
}
```

---

### **Exercise 4: Request Body Customization**

**Objective:** Control the API request payload

**Steps:**

1. **Examine Default Request Body:**
   - Look at the **"Actual Request Body"** section
   - Identify these key fields:
     - `model`: The AI model being used
     - `messages`: Array of conversation messages
     - `stream`: Boolean for streaming mode

2. **Add Common Parameters:**
   - Click **"Add Common Params"** button
   - Observe the new parameters added:
     - `temperature`
     - `max_tokens`
     - `top_p`
     - `frequency_penalty`
     - `presence_penalty`

3. **Customize Parameters:**
   - Change `temperature` from `0.7` to `0.1` (more focused)
   - Change `max_tokens` from `1000` to `50` (shorter responses)
   - Add a new parameter: `"top_p": 0.9`
   - Click **"Save Body JSON"**

4. **Test Parameter Effects:**
   - Send a message: "Tell me a creative story"
   - Note the response length and creativity
   - Try again with `temperature: 1.5` and `max_tokens: 200`

**📊 Parameter Guide:**
- **temperature** (0.0-2.0): Controls randomness
- **max_tokens**: Maximum response length
- **top_p** (0.0-1.0): Controls diversity
- **frequency_penalty** (-2.0 to 2.0): Reduces repetition
- **presence_penalty** (-2.0 to 2.0): Encourages new topics

---

### **Exercise 5: Streaming and Chunks**

**Objective:** Understand real-time streaming responses

**Steps:**

1. **Enable Streaming Features:**
   - Check **"Enable Streaming"** (if available)
   - Check **"Show raw streaming chunks"**

2. **Send a Long Request:**
   - Type: "Write a detailed explanation of how AI language models work"
   - Click **Send**
   - Watch the response appear incrementally

3. **Examine Raw Chunks:**
   - Scroll down to see the **"Raw Streaming Chunks"** section
   - Observe the chunk format (usually JSON with `delta` content)
   - Count how many chunks were received

4. **Chunk Format Analysis:**
   - Look for patterns like:
   ```json
   {"choices":[{"delta":{"content":"Hello"}}]}
   {"choices":[{"delta":{"content":" world"}}]}
   ```

**🔍 Investigation Questions:**
- How many chunks were received for your response?
- What's the structure of each chunk?
- How does the content get assembled into the final message?

---

### **Exercise 6: Custom Chunk Parser**

**Objective:** Write custom logic to parse streaming responses

**Steps:**

1. **Open Custom Parser:**
   - Click on **"Custom Chunk Parser"** accordion
   - Examine the default parser function

2. **Understanding the Default Parser:**
   ```javascript
   function parseChunk(chunk) {
     // Handle Server-Sent Events (OpenAI format)
     if (chunk.startsWith('data: ')) {
       const data = chunk.slice(6);
       if (data.trim() === '[DONE]') return '';
       
       const parsed = JSON.parse(data);
       return parsed.choices?.[0]?.delta?.content || '';
     }
     // ... more parsing logic
   }
   ```

3. **Create a Custom Parser:**
   Replace the parser with this enhanced version:
   ```javascript
   function parseChunk(chunk) {
     try {
       if (!chunk) return '';
       
       // Add emoji prefixes for fun
       if (chunk.startsWith('data: ')) {
         const data = chunk.slice(6);
         if (data.trim() === '[DONE]') return '';
         
         const parsed = JSON.parse(data);
         const content = parsed.choices?.[0]?.delta?.content;
         
         // Add robot emoji to each word
         if (content) {
           return content.includes(' ') ? '🤖 ' + content : content;
         }
       }
       
       return chunk;
     } catch (e) {
       console.error('Custom parser error:', e);
       return '';
     }
   }
   ```

4. **Test Your Custom Parser:**
   - Send a message and watch for robot emojis
   - Try modifying the parser to add different emojis or formatting

**🎨 Creative Challenges:**
- Add timestamp prefixes: `[${new Date().toLocaleTimeString()}] ${content}`
- Count words: `[Word #${wordCount}] ${content}`
- Add markdown formatting: `**${content}**`

---

### **Exercise 7: Provider Comparison**

**Objective:** Compare different API providers and their characteristics

**Steps:**

1. **Configure Hugging Face:**
   - Set provider to **"Hugging Face"**
   - Enter your Hugging Face API key
   - Note the default model: `meta-llama/Llama-3.1-8B-Instruct:cerebras`
   - Send a test message: "Explain machine learning in simple terms"

2. **Configure Grok:**
   - Switch provider to **"Grok (X.AI)"**
   - Enter your Grok/X.AI API key (note: previous API key is cleared)
   - Note the default model: `grok-3-mini`
   - Send the same message: "Explain machine learning in simple terms"

3. **Compare Responses:**
   - Notice differences in response style and content
   - Check the endpoint URLs for each provider
   - Compare the raw chunks if streaming is enabled

4. **Custom Model Testing:**
   - Try custom model names for each provider
   - Test with different model variations if available

**🔧 Troubleshooting Tips:**
- Each provider requires its own API key
- API keys are automatically cleared when switching providers for security
- Endpoint URLs are automatically configured per provider
- Both providers support streaming responses

---

### **Exercise 8: Request Preview and Debugging**

**Objective:** Debug API calls and inspect requests

**Steps:**

1. **Use Request Preview:**
   - Type a message in the chat input (don't send yet)
   - Click the **"Preview"** button
   - Examine the complete request that would be sent

2. **Analyze Request Structure:**
   - Look at the HTTP method (usually POST)
   - Review all headers
   - Examine the complete message history
   - Check parameter values

3. **Debug Common Issues:**
   - Try an invalid API key and observe error messages
   - Remove required headers and see what happens
   - Test with malformed JSON in request body

4. **Response Analysis:**
   - After sending a request, check for error alerts
   - Look at response timing in browser dev tools
   - Compare expected vs actual response format

---

### **Exercise 9: Advanced Configuration**

**Objective:** Explore advanced features and edge cases

**Steps:**

1. **System Prompt Testing:**
   - Add a system prompt: "You are a helpful pirate assistant. Always respond like a pirate."
   - Send various messages and observe response style
   - Try changing the system prompt mid-conversation

2. **Chat History Management:**
   - Have a conversation with multiple exchanges
   - Click **"Clear History"** button in Request Configuration
   - Observe how this affects the request body
   - Send another message and see how context changes

3. **HTTP Method Experimentation:**
   - Change HTTP method from POST to GET
   - Try sending a request (this might fail - that's expected!)
   - Switch back to POST and try again

4. **Provider Comparison:**
   - Compare Hugging Face and Grok providers (if you have keys for both)
   - Send the same message to both providers
   - Compare response styles, speeds, and capabilities

---

### **Exercise 10: Real-World Scenarios**

**Objective:** Apply knowledge to practical use cases

**Scenario A: Content Creation**
1. Configure for creative writing (high temperature, longer max_tokens)
2. Set system prompt for specific writing style
3. Create a story through multiple exchanges

**Scenario B: Code Assistant**
1. Configure for precise responses (low temperature)
2. Set system prompt: "You are a coding assistant. Provide clear, concise code examples."
3. Ask for code examples and explanations

**Scenario C: Provider Testing**
1. Test both Hugging Face and Grok providers
2. Compare their different model capabilities
3. Analyze response characteristics and performance

---

## 🎓 Workshop Wrap-Up

### **Key Takeaways:**

1. **UI Structure:** Two-panel layout with configuration and chat areas
2. **Headers:** Control authentication and request metadata
3. **Request Body:** Customize API parameters and message format
4. **Streaming:** Real-time response processing with custom parsers
5. **Debugging:** Preview requests and inspect responses

### **Best Practices Learned:**

- Use appropriate temperature settings for your use case
- Monitor token usage with max_tokens parameter
- Test with simple requests before complex integrations
- Use custom parsers for non-standard streaming formats

### **Next Steps:**

1. **Experiment** with different provider-specific features
2. **Build** custom chunk parsers for Hugging Face and Grok formats  
3. **Compare** model capabilities between providers
4. **Share** interesting configurations and results

### **Troubleshooting Checklist:**

- ✅ API key is correct and active
- ✅ Endpoint URL is valid and accessible
- ✅ Headers are properly formatted JSON
- ✅ Request body matches API expectations
- ✅ CORS is configured for external APIs
- ✅ Browser console shows no errors

### **Resources for Further Learning:**

- Hugging Face API Documentation
- Grok/X.AI API Documentation  
- MDN Web Docs for HTTP methods
- JSON specification and validation tools

---

**🌟 Congratulations!** You've completed the Chatbot API Explorer workshop. You now have hands-on experience with all the major UI components and can effectively use the tool for API exploration and testing.
