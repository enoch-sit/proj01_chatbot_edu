import { API_PROVIDERS, getProviderEndpoint, getAuthHeader } from '../../utils/apiProviders';

describe('API Providers', () => {
  describe('API_PROVIDERS', () => {
    test('should contain expected providers', () => {
      expect(API_PROVIDERS).toHaveProperty('openai');
      expect(API_PROVIDERS).toHaveProperty('anthropic');
      expect(API_PROVIDERS).toHaveProperty('huggingface');
      expect(API_PROVIDERS).toHaveProperty('grok');
      expect(API_PROVIDERS).toHaveProperty('google');
      expect(API_PROVIDERS).toHaveProperty('custom');
    });

    test('OpenAI provider should have correct configuration', () => {
      const openai = API_PROVIDERS.openai;
      expect(openai.id).toBe('openai');
      expect(openai.name).toBe('OpenAI');
      expect(openai.baseUrl).toBe('https://api.openai.com/v1');
      expect(openai.requiresAuth).toBe(true);
      expect(openai.supportsStreaming).toBe(true);
      expect(openai.models).toContain('gpt-3.5-turbo');
    });

    test('Anthropic provider should have correct configuration', () => {
      const anthropic = API_PROVIDERS.anthropic;
      expect(anthropic.id).toBe('anthropic');
      expect(anthropic.name).toBe('Anthropic');
      expect(anthropic.baseUrl).toBe('https://api.anthropic.com/v1');
      expect(anthropic.requiresAuth).toBe(true);
      expect(anthropic.supportsStreaming).toBe(true);
      expect(anthropic.defaultHeaders).toHaveProperty('anthropic-version');
    });
  });

  describe('getProviderEndpoint', () => {
    test('should return correct endpoint for OpenAI', () => {
      const endpoint = getProviderEndpoint('openai');
      expect(endpoint).toBe('https://api.openai.com/v1/chat/completions');
    });

    test('should return correct endpoint for Anthropic', () => {
      const endpoint = getProviderEndpoint('anthropic');
      expect(endpoint).toBe('https://api.anthropic.com/v1/messages');
    });

    test('should return correct endpoint for Hugging Face with model', () => {
      const endpoint = getProviderEndpoint('huggingface', 'microsoft/DialoGPT-medium');
      expect(endpoint).toBe('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium');
    });

    test('should return correct endpoint for Google with model', () => {
      const endpoint = getProviderEndpoint('google', 'gemini-1.5-flash');
      expect(endpoint).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent');
    });

    test('should return empty string for custom provider', () => {
      const endpoint = getProviderEndpoint('custom');
      expect(endpoint).toBe('');
    });
  });

  describe('getAuthHeader', () => {
    test('should return Bearer token for OpenAI', () => {
      const headers = getAuthHeader('openai', 'test-api-key');
      expect(headers).toEqual({ Authorization: 'Bearer test-api-key' });
    });

    test('should return x-api-key for Anthropic', () => {
      const headers = getAuthHeader('anthropic', 'test-api-key');
      expect(headers).toEqual({ 'x-api-key': 'test-api-key' });
    });

    test('should return Bearer token for Hugging Face', () => {
      const headers = getAuthHeader('huggingface', 'test-api-key');
      expect(headers).toEqual({ Authorization: 'Bearer test-api-key' });
    });

    test('should return empty object for Google', () => {
      const headers = getAuthHeader('google', 'test-api-key');
      expect(headers).toEqual({});
    });

    test('should return empty object for unknown provider', () => {
      const headers = getAuthHeader('unknown', 'test-api-key');
      expect(headers).toEqual({});
    });
  });
});
