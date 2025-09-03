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
    isStreaming: boolean = false
  ): Promise<{ response: string; apiResponse: ApiResponse }> {
    
    // Build the request body based on the provider format
    const requestBody: ChatCompletionRequest = {
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

    const requestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(requestBody)
    };

    try {
      const response = await fetch(endpoint, requestConfig);
      const responseText = await response.text();
      
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
            content = jsonResponse.choices[0].message?.content || 
                     jsonResponse.choices[0].text || 
                     'No content in response';
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
          } else {
            content = 'Unexpected response format';
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
    onError: (error: string, apiResponse: ApiResponse) => void
  ): Promise<void> {
    const requestBody: ChatCompletionRequest = {
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

    const requestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(requestBody)
    };

    try {
      const response = await fetch(endpoint, requestConfig);
      
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
                const content = parsed.choices?.[0]?.delta?.content || '';
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
