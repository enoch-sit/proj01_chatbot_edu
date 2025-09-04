import type { ApiProvider } from '../types';

export const API_PROVIDERS: Record<string, ApiProvider> = {
  huggingface: {
    id: 'huggingface',
    name: 'Hugging Face',
    baseUrl: 'https://router.huggingface.co/v1',
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    defaultModel: 'meta-llama/Llama-3.1-8B-Instruct:cerebras',
    models: [
      'meta-llama/Llama-3.1-8B-Instruct:cerebras',
    ],
    requiresAuth: true,
    supportsStreaming: true,
  },
  grok: {
    id: 'grok',
    name: 'Grok (X.AI)',
    baseUrl: 'https://api.x.ai/v1',
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    defaultModel: 'grok-3-mini',
    models: ['grok-3-mini'],
    requiresAuth: true,
    supportsStreaming: true,
  },
  custom: {
    id: 'custom',
    name: 'Custom API',
    baseUrl: '',
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    defaultModel: '',
    models: [],
    requiresAuth: false,
    supportsStreaming: true,
  },
};

export const getProviderEndpoint = (providerId: string): string => {
  const provider = API_PROVIDERS[providerId];
  
  if (!provider) {
    return '';
  }
  
  switch (providerId) {
    case 'grok':
      return `${provider.baseUrl}/chat/completions`;
    case 'huggingface':
      return `${provider.baseUrl}/chat/completions`;
    case 'custom':
      return '';
    default:
      return provider.baseUrl;
  }
};

export const getAuthHeader = (providerId: string, apiKey: string): Record<string, string> => {
  switch (providerId) {
    case 'custom':
    default:
      return { Authorization: `Bearer ${apiKey}` };
  }
};
