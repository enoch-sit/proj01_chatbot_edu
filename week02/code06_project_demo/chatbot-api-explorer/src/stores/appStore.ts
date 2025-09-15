import { create } from 'zustand';
import type { AppState, Message, ApiResponse } from '../types';
import { persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'chatbot-api-explorer-key';

// Encrypt sensitive data
const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

// Decrypt sensitive data
const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // API Configuration
      selectedProvider: 'grok',
      apiKey: '',
      endpoint: 'https://api.x.ai/v1/chat/completions',
      model: 'grok-3-mini',
      
      // Request Configuration
      headers: {
        'Content-Type': 'application/json',
      },
      requestBody: {},
      isStreaming: true,
      httpMethod: 'POST',
      
      // Chat State
      messages: [],
      systemPrompt: 'You are a helpful AI assistant.',
      
      // API Response State
      lastApiResponse: null,
      
      // UI State
      isLoading: false,
      error: null,
      
      // Actions
      setProvider: (provider: string) => set({ selectedProvider: provider }),
      
      setApiKey: (key: string) => set({ apiKey: key }),
      
      setEndpoint: (endpoint: string) => set({ endpoint }),
      
      setModel: (model: string) => set({ model }),
      
      setHeaders: (headers: Record<string, string>) => set({ headers }),
      
      setRequestBody: (body: object) => set({ requestBody: body }),
      
      setStreaming: (streaming: boolean) => {
        set({ isStreaming: streaming });
        // Update the request body to reflect the new streaming setting
        get().updateRequestBodyFromMessages();
      },
      
      setHttpMethod: (method: 'GET' | 'POST' | 'PUT' | 'DELETE') => set({ httpMethod: method }),
      
      setSystemPrompt: (prompt: string) => set({ systemPrompt: prompt }),
      
      addMessage: (message: Message) => {
        const messages = get().messages;
        set({ messages: [...messages, message] });
        
        // Only auto-update request body after assistant responses
        if (message.role === 'assistant') {
          get().updateRequestBodyFromMessages();
        }
      },
      
      updateMessage: (messageId: string, content: string) => {
        const messages = get().messages;
        const updatedMessages = messages.map(msg => 
          msg.id === messageId ? { ...msg, content } : msg
        );
        set({ messages: updatedMessages });
        
        // Only auto-update request body if updating an assistant message
        const updatedMessage = updatedMessages.find(msg => msg.id === messageId);
        if (updatedMessage?.role === 'assistant') {
          get().updateRequestBodyFromMessages();
        }
      },
      
      clearMessages: () => set({ messages: [] }),
      
      updateRequestBodyFromMessages: () => {
        const state = get();
        const { messages, systemPrompt, model, isStreaming } = state;
        
        // Build the messages array for the request
        const requestMessages = [];
        if (systemPrompt && systemPrompt.trim()) {
          requestMessages.push({ role: 'system', content: systemPrompt });
        }
        
        // Add existing messages
        messages.forEach(msg => {
          requestMessages.push({
            role: msg.role,
            content: msg.content
          });
        });

        // Build actual request body - preserve existing properties but override key ones
        const updatedBody = {
          ...state.requestBody, // Preserve existing parameters
          model: model || (state.requestBody as any).model || 'gpt-3.5-turbo',
          messages: requestMessages,
          stream: isStreaming,
        };

        set({ requestBody: updatedBody });
      },
      
      setMessagesFromRequestBody: (requestBody: any) => {
        try {
          if (requestBody?.messages && Array.isArray(requestBody.messages)) {
            const chatMessages: Message[] = requestBody.messages
              .filter((msg: any) => msg.role !== 'system') // Exclude system messages
              .map((msg: any, index: number) => ({
                id: `msg-${Date.now()}-${index}`,
                role: msg.role as 'user' | 'assistant',
                content: typeof msg.content === 'string' ? msg.content : 
                        Array.isArray(msg.content) ? 
                        msg.content.map((c: any) => c.text || c.content || '').join(' ') : 
                        String(msg.content || ''),
                timestamp: new Date()
              }));
            set({ messages: chatMessages });
          }
        } catch (error) {
          console.log('Could not parse messages from request body:', error);
        }
      },
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setError: (error: string | null) => set({ error }),
      
      setLastApiResponse: (response: ApiResponse | null) => set({ lastApiResponse: response }),
    }),
    {
      name: 'chatbot-api-explorer-storage-v2', // Changed version to force reset
      partialize: (state) => ({
        selectedProvider: state.selectedProvider,
        apiKey: state.apiKey ? encrypt(state.apiKey) : '',
        endpoint: state.endpoint,
        model: state.model,
        headers: state.headers,
        systemPrompt: state.systemPrompt,
        isStreaming: state.isStreaming,
        httpMethod: state.httpMethod,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.apiKey) {
          try {
            state.apiKey = decrypt(state.apiKey);
          } catch {
            console.warn('Failed to decrypt API key');
            state.apiKey = '';
          }
        }
      },
    }
  )
);
