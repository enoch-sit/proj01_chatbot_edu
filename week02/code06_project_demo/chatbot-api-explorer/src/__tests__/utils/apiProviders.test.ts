import { API_PROVIDERS, getProviderEndpoint, getAuthHeader } from '../../utils/apiProviders';

describe('API Providers', () => {
  describe('API_PROVIDERS', () => {
    test('should contain expected providers', () => {
      expect(API_PROVIDERS).toHaveProperty('huggingface');
      expect(API_PROVIDERS).toHaveProperty('grok');
      expect(API_PROVIDERS).toHaveProperty('custom');
    });

    test('Hugging Face provider should have correct configuration', () => {
      const huggingface = API_PROVIDERS.huggingface;
      expect(huggingface.id).toBe('huggingface');
      expect(huggingface.name).toBe('Hugging Face');
      expect(huggingface.baseUrl).toBe('https://router.huggingface.co/v1');
      expect(huggingface.requiresAuth).toBe(true);
      expect(huggingface.supportsStreaming).toBe(true);
      expect(huggingface.defaultModel).toBe('meta-llama/Llama-3.1-8B-Instruct:cerebras');
    });

    test('Grok provider should have correct configuration', () => {
      const grok = API_PROVIDERS.grok;
      expect(grok.id).toBe('grok');
      expect(grok.name).toBe('Grok (X.AI)');
      expect(grok.baseUrl).toBe('https://api.x.ai/v1');
      expect(grok.requiresAuth).toBe(true);
      expect(grok.supportsStreaming).toBe(true);
    });
  });

  describe('getProviderEndpoint', () => {
    test('should return correct endpoint for Hugging Face', () => {
      const endpoint = getProviderEndpoint('huggingface');
      expect(endpoint).toBe('https://router.huggingface.co/v1/chat/completions');
    });

    test('should return correct endpoint for Grok', () => {
      const endpoint = getProviderEndpoint('grok');
      expect(endpoint).toBe('https://api.x.ai/v1/chat/completions');
    });

    test('should return empty string for custom provider', () => {
      const endpoint = getProviderEndpoint('custom');
      expect(endpoint).toBe('');
    });
  });

  describe('getAuthHeader', () => {
    test('should return Bearer token for Hugging Face', () => {
      const headers = getAuthHeader('huggingface', 'test-api-key');
      expect(headers).toEqual({ Authorization: 'Bearer test-api-key' });
    });

    test('should return Bearer token for Grok', () => {
      const headers = getAuthHeader('grok', 'test-api-key');
      expect(headers).toEqual({ Authorization: 'Bearer test-api-key' });
    });

    test('should return Bearer token for custom provider', () => {
      const headers = getAuthHeader('custom', 'test-api-key');
      expect(headers).toEqual({ Authorization: 'Bearer test-api-key' });
    });

    test('should return Bearer token for unknown provider', () => {
      const headers = getAuthHeader('unknown', 'test-api-key');
      expect(headers).toEqual({ Authorization: 'Bearer test-api-key' });
    });
  });
});
