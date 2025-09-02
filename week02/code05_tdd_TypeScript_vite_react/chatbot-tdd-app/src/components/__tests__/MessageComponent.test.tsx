// 📄 Step 10: Message Component Tests
// Import React Testing Library utilities for component testing
import { render, screen } from '@testing-library/react';
// Import the component we want to test
import { MessageComponent } from '../MessageComponent';
// Import the Message type for creating test data
import type { Message } from '../../types/Message';

// Test suite for the MessageComponent
describe('MessageComponent', () => {
  // Mock data: Create a sample user message for testing
  const mockUserMessage: Message = {
    id: 'test-1',                              // Unique identifier
    text: 'Hello there!',                      // Message content
    sender: 'user',                            // Sender type
    timestamp: new Date('2024-01-01T12:00:00Z') // Fixed timestamp for consistent testing
  };

  // Mock data: Create a sample bot message for testing
  const mockBotMessage: Message = {
    id: 'test-2',                              // Different ID from user message
    text: 'Hi! How can I help?',               // Bot response content
    sender: 'bot',                             // Bot sender type
    timestamp: new Date('2024-01-01T12:01:00Z') // One minute later
  };

  // Test 1: Verify user messages render with correct content and styling
  it('should render user message with correct styling', () => {
    // Render the component with user message data
    render(<MessageComponent message={mockUserMessage} />);
    
    // Find the rendered message text in the DOM
    const messageElement = screen.getByText('Hello there!');
    // Assert the message appears in the document
    expect(messageElement).toBeInTheDocument();
    // Assert it has the correct CSS class for user styling
    expect(messageElement).toHaveClass('user-message');
  });

  // Test 2: Verify bot messages render with correct content and different styling
  it('should render bot message with correct styling', () => {
    // Render the component with bot message data
    render(<MessageComponent message={mockBotMessage} />);
    
    // Find the bot's message text
    const messageElement = screen.getByText('Hi! How can I help?');
    // Assert the content is rendered
    expect(messageElement).toBeInTheDocument();
    // Assert it has different CSS class for bot styling
    expect(messageElement).toHaveClass('bot-message');
  });

  // Test 3: Ensure component has proper accessibility attributes for screen readers
  it('should have proper accessibility attributes', () => {
    // Render with user message
    render(<MessageComponent message={mockUserMessage} />);
    
    // Find element by its semantic role (list item in a chat)
    const messageElement = screen.getByRole('listitem');
    // Verify it has descriptive aria-label for accessibility
    expect(messageElement).toHaveAttribute('aria-label', 'Message from user');
  });
});