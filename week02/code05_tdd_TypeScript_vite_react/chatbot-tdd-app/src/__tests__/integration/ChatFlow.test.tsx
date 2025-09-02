import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('Chat Integration', () => {
  it('should handle complete conversation flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Check initial welcome message
    expect(screen.getByText(/welcome.*TDD/i)).toBeInTheDocument();

    // Send hello message
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'hello');
    await user.keyboard('{Enter}');

    // Verify user message appears
    expect(screen.getByText('hello')).toBeInTheDocument();

    // Wait for bot response
    await waitFor(() => {
      expect(screen.getByText(/Hello.*TDD.*chatbot/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Send vite message
    await user.type(input, 'vite');
    await user.keyboard('{Enter}');

    // Verify vite response
    await waitFor(() => {
      expect(screen.getByText(/Vite.*amazing.*TDD/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Check that we have multiple messages
    const messages = screen.getAllByRole('listitem');
    expect(messages.length).toBeGreaterThan(3); // Welcome + hello + response + vite + response
  });

  it('should handle empty input properly', async () => {
    const user = userEvent.setup();
    render(<App />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Button should be disabled initially
    expect(sendButton).toBeDisabled();

    // Clicking disabled button should not add message
    await user.click(sendButton);
    
    // Should only have welcome message
    const messages = screen.getAllByRole('listitem');
    expect(messages).toHaveLength(1);
  });

  it('should maintain message order', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText(/type your message/i);

    // Send first message
    await user.type(input, 'First message');
    await user.keyboard('{Enter}');

    // Wait for bot response (default response pattern)
    await waitFor(() => {
      expect(screen.getByText(/You said.*First message.*TDD-tested/i)).toBeInTheDocument();
    });

    // Send second message
    await user.type(input, 'Second message');
    await user.keyboard('{Enter}');

    // Check message order
    const messages = screen.getAllByRole('listitem');
    const messageTexts = messages.map(msg => msg.textContent);
    
    expect(messageTexts).toContain('First message');
    expect(messageTexts).toContain('Second message');
    // Welcome message should be first
    expect(messageTexts[0]).toMatch(/welcome.*TDD/i);
  });
});
