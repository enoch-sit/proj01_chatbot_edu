import type { Message, ApiResponse } from '../types';

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export class ApiService {
  static async sendChatCompletion(
    endpoint: string,
    headers: Record<string, string>,
    messages: Message[],
    systemPrompt: string,
    model: string,
    isStreaming: boolean = false,
    customRequestBody?: any,
    httpMethod: string = 'POST'
  ): Promise<{ response: string; apiResponse: ApiResponse }> {
    
    // Use custom request body if provided, otherwise build default format
    let requestBody: any;
    
    if (customRequestBody && Object.keys(customRequestBody).length > 0) {
      // Use the custom request body as-is, but ensure it has messages if they exist in the body
      requestBody = { ...customRequestBody };
      
      // If custom body doesn't have messages but we have them, add them
      if (!requestBody.messages && (messages.length > 0 || systemPrompt)) {
        requestBody.messages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
        ];
      }
      
      // Ensure model is set if not in custom body
      if (!requestBody.model && model) {
        requestBody.model = model;
      }
      
      // Ensure streaming is set correctly
      if (requestBody.stream === undefined) {
        requestBody.stream = isStreaming;
      }
    } else {
      // Build the default request body format
      requestBody = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
        ],
        stream: isStreaming,
        temperature: 0.7,
        max_tokens: 1000
      };
    }

    const requestConfig = {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(requestBody)
    };

    // Debug logging for non-streaming requests
    console.log('🚀 API Request Debug (Non-Streaming):');
    console.log('📍 Endpoint:', endpoint);
    console.log('📋 Method:', httpMethod);
    console.log('📝 Headers:', requestConfig.headers);
    console.log('📦 Body:', JSON.stringify(requestBody, null, 2));
    console.log('🌐 CORS Origin Check: Will be sent from:', window.location.origin);

    try {
      const response = await fetch(endpoint, requestConfig);
      const responseText = await response.text();
      
      // Log response details for debugging
      console.log('📡 Response Status:', response.status);
      console.log('📋 Response Headers:');
      for (const [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Create API response object
      const apiResponse: ApiResponse = {
        rawResponse: responseText,
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date(),
        requestConfig: {
          method: requestConfig.method,
          url: endpoint,
          headers: requestConfig.headers,
          body: requestBody
        }
      };

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      // Parse the response based on whether it's streaming or not
      let content = '';
      
      if (isStreaming) {
        // For streaming responses, we'll handle this differently
        // For now, just return the raw response
        content = responseText;
      } else {
        try {
          const jsonResponse = JSON.parse(responseText);
          
          // Handle different provider response formats
          if (jsonResponse.choices && jsonResponse.choices[0]) {
            // OpenAI/compatible format
            const choice = jsonResponse.choices[0];
            
            // Handle different content formats
            if (choice.message?.content) {
              // Standard string content
              if (typeof choice.message.content === 'string') {
                content = choice.message.content;
              }
              // Array content format
              else if (Array.isArray(choice.message.content)) {
                content = choice.message.content
                  .map((item: any) => item.text || item.content || JSON.stringify(item))
                  .join('');
              }
              // Object content
              else if (typeof choice.message.content === 'object') {
                content = choice.message.content.text || 
                         choice.message.content.content || 
                         JSON.stringify(choice.message.content);
              } else {
                content = String(choice.message.content);
              }
            } else if (choice.text) {
              content = choice.text;
            } else {
              content = 'No content in response';
            }
          } else if (jsonResponse.content) {
            // Anthropic format
            content = Array.isArray(jsonResponse.content) 
              ? jsonResponse.content[0]?.text || 'No content in response'
              : jsonResponse.content;
          } else if (jsonResponse.response) {
            // Ollama format
            content = jsonResponse.response;
          } else if (jsonResponse.message) {
            // Generic message format
            content = jsonResponse.message;
          } else if (jsonResponse.text) {
            // Simple text response
            content = jsonResponse.text;
          } else {
            // Fallback: try to extract any text content
            content = JSON.stringify(jsonResponse, null, 2);
          }
        } catch {
          // If JSON parsing fails, return the raw text
          content = responseText;
        }
      }

      return { response: content, apiResponse };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Create error API response
      const apiResponse: ApiResponse = {
        rawResponse: `Error: ${errorMessage}`,
        statusCode: 0,
        headers: {},
        timestamp: new Date(),
        requestConfig: {
          method: requestConfig.method,
          url: endpoint,
          headers: requestConfig.headers,
          body: requestBody
        }
      };

      throw { error: errorMessage, apiResponse };
    }
  }

  static async handleStreamingResponse(
    endpoint: string,
    headers: Record<string, string>,
    messages: Message[],
    systemPrompt: string,
    model: string,
    onChunk: (chunk: string) => void,
    onComplete: (apiResponse: ApiResponse) => void,
    onError: (error: string, apiResponse: ApiResponse) => void,
    customRequestBody?: any,
    httpMethod: string = 'POST'
  ): Promise<void> {
    
    // Use custom request body if provided, otherwise build default format
    let requestBody: any;
    
    if (customRequestBody && Object.keys(customRequestBody).length > 0) {
      requestBody = { ...customRequestBody };
      
      // Ensure streaming is enabled
      requestBody.stream = true;
      
      // If custom body doesn't have messages but we have them, add them
      if (!requestBody.messages && (messages.length > 0 || systemPrompt)) {
        requestBody.messages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
        ];
      }
      
      // Ensure model is set if not in custom body
      if (!requestBody.model && model) {
        requestBody.model = model;
      }
    } else {
      // Build the default request body format
      requestBody = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      };
    }

    const requestConfig = {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(requestBody)
    };

    // Debug logging for streaming requests
    console.log('🚀 API Request Debug (Streaming):');
    console.log('📍 Endpoint:', endpoint);
    console.log('📋 Method:', httpMethod);
    console.log('📝 Headers:', requestConfig.headers);
    console.log('📦 Body:', JSON.stringify(requestBody, null, 2));
    console.log('🌐 CORS Origin Check: Will be sent from:', window.location.origin);

    try {
      const response = await fetch(endpoint, requestConfig);
      
      // Log response details for debugging
      console.log('📡 Response Status:', response.status);
      console.log('📋 Response Headers:');
      for (const [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        const apiResponse: ApiResponse = {
          rawResponse: errorText,
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date(),
          requestConfig: {
            method: requestConfig.method,
            url: endpoint,
            headers: requestConfig.headers,
            body: requestBody
          }
        };
        
        onError(`HTTP ${response.status}: ${errorText}`, apiResponse);
        return;
      }

      if (!response.body) {
        throw new Error('No response body available for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let rawResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          rawResponse += chunk;

          // Process Server-Sent Events format
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                
                // Handle different streaming content formats
                let content = '';
                
                if (parsed.choices?.[0]?.delta?.content) {
                  const deltaContent = parsed.choices[0].delta.content;
                  
                  // Handle string content
                  if (typeof deltaContent === 'string') {
                    content = deltaContent;
                  }
                  // Handle array content
                  else if (Array.isArray(deltaContent)) {
                    content = deltaContent
                      .map((item: any) => item.text || item.content || JSON.stringify(item))
                      .join('');
                  }
                  // Handle object content
                  else if (typeof deltaContent === 'object') {
                    content = deltaContent.text || deltaContent.content || JSON.stringify(deltaContent);
                  } else {
                    content = String(deltaContent);
                  }
                } else if (parsed.delta?.content) {
                  // Alternative delta format
                  content = parsed.delta.content;
                } else if (parsed.content) {
                  // Direct content format
                  content = parsed.content;
                }
                
                if (content) {
                  onChunk(content);
                }
              } catch {
                // Skip invalid JSON chunks
              }
            }
          }
        }

        // Create final API response
        const apiResponse: ApiResponse = {
          rawResponse,
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date(),
          requestConfig: {
            method: requestConfig.method,
            url: endpoint,
            headers: requestConfig.headers,
            body: requestBody
          }
        };

        onComplete(apiResponse);

      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const apiResponse: ApiResponse = {
        rawResponse: `Error: ${errorMessage}`,
        statusCode: 0,
        headers: {},
        timestamp: new Date(),
        requestConfig: {
          method: requestConfig.method,
          url: endpoint,
          headers: requestConfig.headers,
          body: requestBody
        }
      };

      onError(errorMessage, apiResponse);
    }
  }
}
