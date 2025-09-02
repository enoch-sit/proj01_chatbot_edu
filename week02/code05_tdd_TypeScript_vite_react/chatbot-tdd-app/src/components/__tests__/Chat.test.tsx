// 💬 Step 12: Main Chat Component Tests
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chat } from '../Chat';

// Mock the bot service
jest.mock('../../services/botService', () => ({
  getBotResponse: jest.fn(() => ({
    text: 'Mocked bot response',
    delay: 100
  }))
}));

// Global mock for scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe('Chat', () => {
  it('should render welcome message only once', () => {
    render(<Chat />);
    
    const welcomeMessages = screen.getAllByText(/welcome.*TDD/i);
    expect(welcomeMessages).toHaveLength(1);
  });

  it('should render chat container', () => {
    render(<Chat />);
    
    expect(screen.getByRole('main')).toHaveClass('chat-container');
  });

  it('should add user message when sent', async () => {
    const user = userEvent.setup();
    render(<Chat />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Hello');
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should add bot response after user message', async () => {
    const user = userEvent.setup();
    render(<Chat />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Hello');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Mocked bot response')).toBeInTheDocument();
    });
  });

  it('should scroll to bottom when new message is added', async () => {
    const user = userEvent.setup();
    render(<Chat />);
    
    // Clear any previous calls from component mount
    jest.clearAllMocks();
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Hello');
    await user.keyboard('{Enter}');
    
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});