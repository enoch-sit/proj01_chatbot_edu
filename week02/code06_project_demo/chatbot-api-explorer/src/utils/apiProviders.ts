import type { ApiProvider } from '../types';

export const API_PROVIDERS: Record<string, ApiProvider> = {
  huggingface: {
    id: 'huggingface',
    name: 'Hugging Face',
    baseUrl: 'https://api-inference.huggingface.co/models',
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    defaultModel: 'microsoft/DialoGPT-medium',
    models: [
      'microsoft/DialoGPT-medium',
      'microsoft/DialoGPT-large',
      'facebook/blenderbot-400M-distill',
      'google/flan-t5-large',
    ],
    requiresAuth: true,
    supportsStreaming: false,
  },
  grok: {
    id: 'grok',
    name: 'Grok (X.AI)',
    baseUrl: 'https://api.x.ai/v1',
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    defaultModel: 'grok-beta',
    models: ['grok-beta'],
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

export const getProviderEndpoint = (providerId: string, model?: string): string => {
  const provider = API_PROVIDERS[providerId];
  
  switch (providerId) {
    case 'grok':
      return `${provider.baseUrl}/chat/completions`;
    case 'huggingface':
      return `${provider.baseUrl}/${model || provider.defaultModel}`;
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
