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
      selectedProvider: 'openai',
      apiKey: '',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      
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
      
      setStreaming: (streaming: boolean) => set({ isStreaming: streaming }),
      
      setSystemPrompt: (prompt: string) => set({ systemPrompt: prompt }),
      
      addMessage: (message: Message) => {
        const messages = get().messages;
        set({ messages: [...messages, message] });
      },
      
      clearMessages: () => set({ messages: [] }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setError: (error: string | null) => set({ error }),
      
      setLastApiResponse: (response: ApiResponse | null) => set({ lastApiResponse: response }),
    }),
    {
      name: 'chatbot-api-explorer-storage',
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
