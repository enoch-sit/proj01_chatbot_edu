export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ApiProvider {
  id: string;
  name: string;
  baseUrl: string;
  defaultHeaders: Record<string, string>;
  defaultModel: string;
  models: string[];
  requiresAuth: boolean;
  supportsStreaming: boolean;
}

export interface ApiConfiguration {
  provider: ApiProvider;
  apiKey: string;
  endpoint: string;
  model: string;
  headers: Record<string, string>;
  parameters: Record<string, any>;
}

export interface RequestConfiguration {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body: object;
  isStreaming: boolean;
}

export interface ApiResponse {
  rawResponse: string;
  statusCode: number;
  headers: Record<string, string>;
  timestamp: Date;
  requestConfig: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: any;
  };
}

export interface AppState {
  // API Configuration
  selectedProvider: string;
  apiKey: string;
  endpoint: string;
  model: string;
  
  // Request Configuration
  headers: Record<string, string>;
  requestBody: object;
  isStreaming: boolean;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  
  // Chat State
  messages: Message[];
  systemPrompt: string;
  
  // API Response State
  lastApiResponse: ApiResponse | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProvider: (provider: string) => void;
  setApiKey: (key: string) => void;
  setEndpoint: (endpoint: string) => void;
  setModel: (model: string) => void;
  setHeaders: (headers: Record<string, string>) => void;
  setRequestBody: (body: object) => void;
  setStreaming: (streaming: boolean) => void;
  setHttpMethod: (method: 'GET' | 'POST' | 'PUT' | 'DELETE') => void;
  setSystemPrompt: (prompt: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, content: string) => void;
  clearMessages: () => void;
  updateRequestBodyFromMessages: () => void;
  setMessagesFromRequestBody: (requestBody: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastApiResponse: (response: ApiResponse | null) => void;
}

export interface StreamResponse {
  chunk: string;
  isComplete: boolean;
  error?: string;
}
