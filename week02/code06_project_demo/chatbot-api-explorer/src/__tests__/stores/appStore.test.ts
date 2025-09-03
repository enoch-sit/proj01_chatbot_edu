import { useAppStore } from '../../stores/appStore';
import type { Message } from '../../types';

// Mock crypto-js with default import
jest.mock('crypto-js', () => ({
  __esModule: true,
  default: {
    AES: {
      encrypt: jest.fn().mockReturnValue({ toString: () => 'encrypted-value' }),
      decrypt: jest.fn().mockReturnValue({ toString: () => 'decrypted-value' }),
    },
    enc: {
      Utf8: 'utf8',
    },
  },
}));

describe('App Store', () => {
  beforeEach(() => {
    // Clear the store state before each test
    useAppStore.setState({
      selectedProvider: 'openai',
      apiKey: '',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      headers: { 'Content-Type': 'application/json' },
      requestBody: {},
      isStreaming: true,
      httpMethod: 'POST',
      messages: [],
      systemPrompt: 'You are a helpful AI assistant.',
      isLoading: false,
      error: null,
    });
  });

  test('initial state should be correct', () => {
    const state = useAppStore.getState();
    expect(state.selectedProvider).toBe('openai');
    expect(state.apiKey).toBe('');
    expect(state.endpoint).toBe('https://api.openai.com/v1/chat/completions');
    expect(state.model).toBe('gpt-3.5-turbo');
    expect(state.isStreaming).toBe(true);
    expect(state.messages).toEqual([]);
    expect(state.systemPrompt).toBe('You are a helpful AI assistant.');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  test('setProvider should update selected provider', () => {
    const { setProvider } = useAppStore.getState();
    setProvider('anthropic');
    expect(useAppStore.getState().selectedProvider).toBe('anthropic');
  });

  test('setApiKey should update API key', () => {
    const { setApiKey } = useAppStore.getState();
    setApiKey('test-key');
    expect(useAppStore.getState().apiKey).toBe('test-key');
  });

  test('setEndpoint should update endpoint', () => {
    const { setEndpoint } = useAppStore.getState();
    setEndpoint('https://api.example.com');
    expect(useAppStore.getState().endpoint).toBe('https://api.example.com');
  });

  test('setModel should update model', () => {
    const { setModel } = useAppStore.getState();
    setModel('gpt-4');
    expect(useAppStore.getState().model).toBe('gpt-4');
  });

  test('setHeaders should update headers', () => {
    const { setHeaders } = useAppStore.getState();
    const newHeaders = { 'Authorization': 'Bearer token' };
    setHeaders(newHeaders);
    expect(useAppStore.getState().headers).toEqual(newHeaders);
  });

  test('setStreaming should update streaming flag', () => {
    const { setStreaming } = useAppStore.getState();
    setStreaming(false);
    expect(useAppStore.getState().isStreaming).toBe(false);
  });

  test('setSystemPrompt should update system prompt', () => {
    const { setSystemPrompt } = useAppStore.getState();
    setSystemPrompt('You are a coding assistant.');
    expect(useAppStore.getState().systemPrompt).toBe('You are a coding assistant.');
  });

  test('addMessage should add message to the list', () => {
    const { addMessage } = useAppStore.getState();
    const message: Message = {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date(),
    };
    
    addMessage(message);
    expect(useAppStore.getState().messages).toHaveLength(1);
    expect(useAppStore.getState().messages[0]).toEqual(message);
  });

  test('addMessage should append to existing messages', () => {
    const { addMessage } = useAppStore.getState();
    const message1: Message = {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date(),
    };
    const message2: Message = {
      id: '2',
      role: 'assistant',
      content: 'Hi there!',
      timestamp: new Date(),
    };
    
    addMessage(message1);
    addMessage(message2);
    
    const messages = useAppStore.getState().messages;
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual(message1);
    expect(messages[1]).toEqual(message2);
  });

  test('clearMessages should remove all messages', () => {
    const { addMessage, clearMessages } = useAppStore.getState();
    const message: Message = {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date(),
    };
    
    addMessage(message);
    expect(useAppStore.getState().messages).toHaveLength(1);
    
    clearMessages();
    expect(useAppStore.getState().messages).toHaveLength(0);
  });

  test('setLoading should update loading state', () => {
    const { setLoading } = useAppStore.getState();
    setLoading(true);
    expect(useAppStore.getState().isLoading).toBe(true);
    
    setLoading(false);
    expect(useAppStore.getState().isLoading).toBe(false);
  });

  test('setError should update error state', () => {
    const { setError } = useAppStore.getState();
    setError('Something went wrong');
    expect(useAppStore.getState().error).toBe('Something went wrong');
    
    setError(null);
    expect(useAppStore.getState().error).toBe(null);
  });
});
