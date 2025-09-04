import { ApiService } from '../apiService';

// Mock fetch
global.fetch = jest.fn();

describe('ApiService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendChatCompletion', () => {
    test('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const endpoint = 'https://api.example.com/chat/completions';
      const headers = {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      };
      const messages = [
        { id: '1', role: 'user' as const, content: 'Hello', timestamp: new Date() },
      ];
      const systemPrompt = 'You are a helpful assistant';
      const model = 'test-model';

      await expect(
        ApiService.sendChatCompletion(endpoint, headers, messages, systemPrompt, model, false)
      ).rejects.toMatchObject({
        error: 'Network error',
      });
    });
  });
});
