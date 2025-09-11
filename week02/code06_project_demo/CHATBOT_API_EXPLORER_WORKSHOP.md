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
- Access to at least one API key (OpenAI, Anthropic, etc.) OR a local API endpoint

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

**Questions to Answer:**
- What are the two main panels in the application?
- Where would you configure your API key?
- Where would you type a message to send to the chatbot?

---

### **Exercise 2: API Provider Configuration**

**Objective:** Set up an API provider and understand authentication

**Steps:**

1. **In the API Configuration Panel:**
   - Click on the **Provider** dropdown
   - Explore the available options (OpenAI, Anthropic, Grok, Custom)
   - Select **OpenAI** (or your preferred provider)

2. **Configure Authentication:**
   - Enter your API key in the **API Key** field
   - Click the eye icon (😊/🫣) to toggle visibility
   - Observe how the endpoint URL auto-populates

3. **Model Selection:**
   - Check the **"Use custom model name"** checkbox
   - Try entering: `gpt-4` or `gpt-3.5-turbo`
   - Uncheck the box and select from the dropdown

4. **Provider Information:**
   - Note the colored badges showing:
     - Streaming Support
     - Authentication requirements
     - Custom Model support

**✅ Checkpoint Questions:**
- What happens to the endpoint URL when you change providers?
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

### **Exercise 7: Custom API Integration**

**Objective:** Connect to a non-standard API endpoint

**Steps:**

1. **Switch to Custom Provider:**
   - Change provider to **"Custom API"**
   - Notice how the interface changes

2. **Configure Custom Endpoint:**
   - Enter a custom endpoint URL (use a test API like `httpbin.org`):
   ```
   https://httpbin.org/post
   ```

3. **Customize Request Format:**
   - Modify the request body to match your API:
   ```json
   {
     "prompt": "Hello, custom API!",
     "user_id": "workshop_user",
     "timestamp": "2024-01-01T00:00:00Z"
   }
   ```

4. **Test the Integration:**
   - Send a test message
   - Examine the response in the chat interface
   - Check raw chunks if streaming is enabled

**🔧 Troubleshooting Tips:**
- Check the browser console for errors
- Verify your endpoint URL is correct
- Ensure CORS is properly configured for external APIs
- Test with simple requests first

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
   - Configure multiple providers (if you have keys)
   - Send the same message to different providers
   - Compare response styles and speeds

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

**Scenario C: API Development**
1. Use custom API mode
2. Test your own API endpoints
3. Debug request/response format issues

---

## 🎓 Workshop Wrap-Up

### **Key Takeaways:**

1. **UI Structure:** Two-panel layout with configuration and chat areas
2. **Headers:** Control authentication and request metadata
3. **Request Body:** Customize API parameters and message format
4. **Streaming:** Real-time response processing with custom parsers
5. **Debugging:** Preview requests and inspect responses

### **Best Practices Learned:**

- Always validate JSON before saving
- Use appropriate temperature settings for your use case
- Monitor token usage with max_tokens parameter
- Test with simple requests before complex integrations
- Use custom parsers for non-standard streaming formats

### **Next Steps:**

1. **Experiment** with different API providers
2. **Build** custom chunk parsers for specific APIs
3. **Integrate** with your own applications
4. **Share** interesting configurations with others

### **Troubleshooting Checklist:**

- ✅ API key is correct and active
- ✅ Endpoint URL is valid and accessible
- ✅ Headers are properly formatted JSON
- ✅ Request body matches API expectations
- ✅ CORS is configured for external APIs
- ✅ Browser console shows no errors

### **Resources for Further Learning:**

- OpenAI API Documentation
- Anthropic Claude API docs
- MDN Web Docs for HTTP methods
- JSON specification and validation tools

---

**🌟 Congratulations!** You've completed the Chatbot API Explorer workshop. You now have hands-on experience with all the major UI components and can effectively use the tool for API exploration and testing.
