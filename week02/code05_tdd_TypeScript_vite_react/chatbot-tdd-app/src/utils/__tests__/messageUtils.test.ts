// 🧪 Step 5: TDD Red Phase - Message Utils Test
// Import the function we want to test (doesn't exist yet - this will fail)
import { formatMessage } from '../messageUtils';

// Describe block groups related tests together
describe('formatMessage', () => {
  // Individual test case using 'it' function
  it('should format a simple message', () => {
    // Arrange: Set up test data
    const text = 'Hello World';    // Message text to format
    const sender = 'user';         // Who sent the message
    
    // Act: Call the function we're testing
    const result = formatMessage(text, sender);
    
    // Assert: Check that the result matches our expectations
    expect(result).toEqual({
      text: 'Hello World',              // Should preserve original text
      sender: 'user',                   // Should preserve sender
      timestamp: expect.any(Date),      // Should have a Date (any Date is fine)
      id: expect.any(String)            // Should have a string ID (any string is fine)
    });
  });

  // Test 2: Different sender type (triangulation)
  it('should format bot messages differently', () => {
    const text = 'How can I help?';
    const sender = 'bot';              // Testing with 'bot' instead of 'user'
    
    const result = formatMessage(text, sender);
    
    // Check specific properties individually
    expect(result.sender).toBe('bot');           // Should preserve 'bot' sender
    expect(result.text).toBe('How can I help?'); // Should preserve bot text
  });

  // Test 3: Uniqueness requirement (triangulation)
  it('should generate unique IDs for each message', () => {
    // Create two messages with same content
    const message1 = formatMessage('First', 'user');
    const message2 = formatMessage('Second', 'user');
    
    // IDs should be different even for similar messages
    expect(message1.id).not.toBe(message2.id);
  });
});