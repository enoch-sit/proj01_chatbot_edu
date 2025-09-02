import { getChatResponse } from '../chatService';

// Mock fetch globally for this test file
const mockFetch = global.fetch as jest.Mock;

describe('Chat Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockFetch.mockClear();
  });

  it('should return chat response on successful API call', async () => {
    // Arrange: Setup mock response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        message: 'Hello! How can I help you?' 
      })
    });

    // Act: Call the function
    const response = await getChatResponse('Hello');

    // Assert: Check the result
    expect(response).toEqual({ 
      message: 'Hello! How can I help you?' 
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' })
    });
  });

  it('should handle API errors gracefully', async () => {
    // Arrange: Setup mock error
    mockFetch.mockRejectedValue(new Error('Network error'));

    // Act & Assert: Expect the function to throw
    await expect(getChatResponse('Hello')).rejects.toThrow('Network error');
  });

  it('should handle HTTP error status', async () => {
    // Arrange: Setup mock HTTP error
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    // Act & Assert
    await expect(getChatResponse('Hello')).rejects.toThrow('HTTP error: 500');
  });
});
