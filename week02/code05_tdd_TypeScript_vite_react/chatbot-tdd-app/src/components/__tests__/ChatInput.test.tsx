// ⌨️ Step 11: Chat Input Component Tests
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('should render input and send button', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should call onSend when button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.type(input, 'Hello world');
    await user.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello world');
  });

  it('should call onSend when Enter is pressed', async () => {
    const user = userEvent.setup();
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    
    await user.type(input, 'Hello world');
    await user.keyboard('{Enter}');
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello world');
  });

  it('should clear input after sending', async () => {
    const user = userEvent.setup();
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const input = screen.getByPlaceholderText(/type your message/i) as HTMLInputElement;
    
    await user.type(input, 'Hello world');
    await user.keyboard('{Enter}');
    
    expect(input.value).toBe('');
  });

  it('should not send empty messages', async () => {
    const user = userEvent.setup();
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should disable send button when input is empty', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });
});