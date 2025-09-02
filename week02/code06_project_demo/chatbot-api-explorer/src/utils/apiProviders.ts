import type { ApiProvider } from '../types';

export const API_PROVIDERS: Record<string, ApiProvider> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    defaultModel: 'gpt-3.5-turbo',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
    requiresAuth: true,
    supportsStreaming: true,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultHeaders: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    defaultModel: 'claude-3-sonnet-20240229',
    models: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022',
    ],
    requiresAuth: true,
    supportsStreaming: true,
  },
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
  google: {
    id: 'google',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
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
    supportsStreaming: false,
  },
};

export const getProviderEndpoint = (providerId: string, model?: string): string => {
  const provider = API_PROVIDERS[providerId];
  
  switch (providerId) {
    case 'openai':
    case 'grok':
      return `${provider.baseUrl}/chat/completions`;
    case 'anthropic':
      return `${provider.baseUrl}/messages`;
    case 'huggingface':
      return `${provider.baseUrl}/${model || provider.defaultModel}`;
    case 'google':
      return `${provider.baseUrl}/models/${model || provider.defaultModel}:generateContent`;
    case 'custom':
      return '';
    default:
      return provider.baseUrl;
  }
};

export const getAuthHeader = (providerId: string, apiKey: string): Record<string, string> => {
  switch (providerId) {
    case 'openai':
    case 'grok':
      return { Authorization: `Bearer ${apiKey}` };
    case 'anthropic':
      return { 'x-api-key': apiKey };
    case 'huggingface':
      return { Authorization: `Bearer ${apiKey}` };
    case 'google':
      return {}; // Google uses query parameter
    default:
      return {};
  }
};
