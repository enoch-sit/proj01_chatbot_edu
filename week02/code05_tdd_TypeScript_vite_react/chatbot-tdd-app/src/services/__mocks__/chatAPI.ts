// Simple JavaScript Mock Example (Alternative to MSW)
export const mockChatAPI = {
  sendMessage: jest.fn((message: string) => {
    return Promise.resolve({
      id: 'mock-response',
      text: `Mocked response to: ${message}`,
      sender: 'bot',
      timestamp: new Date().toISOString()
    });
  }),

  getChatHistory: jest.fn(() => {
    return Promise.resolve([
      {
        id: 'mock-1',
        text: 'Previous conversation',
        sender: 'user',
        timestamp: new Date().toISOString()
      }
    ]);
  })
};

// Simple mock for fetch
global.fetch = jest.fn((url: string, options?: any) => {
  if (url.includes('/api/chat/message')) {
    const body = JSON.parse(options?.body || '{}');
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        id: 'mock-response',
        text: `Mocked server response to: ${body.message || 'your message'}`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      })
    });
  }
  
  if (url.includes('/api/chat/history')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([
        {
          id: 'mock-1',
          text: 'Previous conversation',
          sender: 'user',
          timestamp: new Date().toISOString()
        }
      ])
    });
  }
  
  return Promise.reject(new Error('Unmocked URL'));
}) as jest.Mock;
