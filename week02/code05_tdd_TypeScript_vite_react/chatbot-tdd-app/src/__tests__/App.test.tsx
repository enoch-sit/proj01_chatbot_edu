// 🚀 Step 13: App Component Integration Tests
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App', () => {
  it('should render the chat application', () => {
    render(<App />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('should handle complete chat flow', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'hello');
    await user.keyboard('{Enter}');
    
    // Check user message appears
    expect(screen.getByText('hello')).toBeInTheDocument();
    
    // Check bot response appears (with original bot service, not mocked)
    await screen.findByText(/Hello.*TDD.*chatbot/i, {}, { timeout: 2000 });
  });
});