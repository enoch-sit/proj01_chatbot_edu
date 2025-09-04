import { useAppStore } from '../appStore';
import { renderHook, act } from '@testing-library/react';

// Mock crypto-js
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn().mockReturnValue({ toString: () => 'encrypted-key' }),
    decrypt: jest.fn().mockReturnValue({ toString: () => 'decrypted-key' }),
  },
  enc: {
    Utf8: 'utf8',
  },
}));

describe('App Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should have default state', () => {
    const { result } = renderHook(() => useAppStore());
    
    expect(result.current.selectedProvider).toBe('grok');
    expect(result.current.apiKey).toBe('');
    expect(result.current.endpoint).toBe('https://api.x.ai/v1/chat/completions');
    expect(result.current.model).toBe('grok-3-mini');
    expect(result.current.isStreaming).toBe(true);
    expect(result.current.messages).toEqual([]);
    expect(result.current.systemPrompt).toBe('You are a helpful AI assistant.');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('should set provider', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setProvider('huggingface');
    });
    
    expect(result.current.selectedProvider).toBe('huggingface');
  });

  test('should set API key', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setApiKey('test-key');
    });
    
    expect(result.current.apiKey).toBe('test-key');
  });

  test('should set endpoint', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setEndpoint('https://api.example.com');
    });
    
    expect(result.current.endpoint).toBe('https://api.example.com');
  });

  test('should set model', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setModel('test-model');
    });
    
    expect(result.current.model).toBe('test-model');
  });

  test('should toggle streaming', () => {
    const { result } = renderHook(() => useAppStore());
    
    expect(result.current.isStreaming).toBe(true);
    
    act(() => {
      result.current.setStreaming(false);
    });
    
    expect(result.current.isStreaming).toBe(false);
  });

  test('should set system prompt', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setSystemPrompt('Custom system prompt');
    });
    
    expect(result.current.systemPrompt).toBe('Custom system prompt');
  });

  test('should add message', () => {
    const { result } = renderHook(() => useAppStore());
    
    const testMessage = {
      id: '1',
      role: 'user' as const,
      content: 'Hello',
      timestamp: new Date(),
    };
    
    act(() => {
      result.current.addMessage(testMessage);
    });
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(testMessage);
  });

  test('should update message', () => {
    const { result } = renderHook(() => useAppStore());
    
    const testMessage = {
      id: '1',
      role: 'user' as const,
      content: 'Hello',
      timestamp: new Date(),
    };
    
    act(() => {
      result.current.addMessage(testMessage);
    });
    
    act(() => {
      result.current.updateMessage('1', 'Updated content');
    });
    
    expect(result.current.messages[0].content).toBe('Updated content');
  });

  test('should clear messages', () => {
    const { result } = renderHook(() => useAppStore());
    
    // Clear any existing messages first
    act(() => {
      result.current.clearMessages();
    });
    
    const testMessage = {
      id: '1',
      role: 'user' as const,
      content: 'Hello',
      timestamp: new Date(),
    };
    
    act(() => {
      result.current.addMessage(testMessage);
    });
    
    expect(result.current.messages).toHaveLength(1);
    
    act(() => {
      result.current.clearMessages();
    });
    
    expect(result.current.messages).toHaveLength(0);
  });

  test('should set loading state', () => {
    const { result } = renderHook(() => useAppStore());
    
    expect(result.current.isLoading).toBe(false);
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
  });

  test('should set error', () => {
    const { result } = renderHook(() => useAppStore());
    
    expect(result.current.error).toBe(null);
    
    act(() => {
      result.current.setError('Test error');
    });
    
    expect(result.current.error).toBe('Test error');
  });

  test('should set headers', () => {
    const { result } = renderHook(() => useAppStore());
    
    const testHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test',
    };
    
    act(() => {
      result.current.setHeaders(testHeaders);
    });
    
    expect(result.current.headers).toEqual(testHeaders);
  });
});
