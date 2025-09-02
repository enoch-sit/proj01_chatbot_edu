// 📝 Step 7: TDD Red Phase - Message Types Test
// Import the types and functions we want to test
import { Message, isValidMessage } from '../Message';

// Test suite for Message type and validation
describe('Message', () => {
  // Test 1: Valid message should pass validation
  it('should validate a correct message', () => {
    // Create a properly formatted message object
    const message: Message = {
      id: 'test-id',               // Unique identifier
      text: 'Hello',               // Message content
      sender: 'user',              // Must be 'user' or 'bot'
      timestamp: new Date()        // Creation time
    };

    // Should return true for valid message
    expect(isValidMessage(message)).toBe(true);
  });

  // Test 2: Invalid message with empty text should fail
  it('should reject message with empty text', () => {
    // Create message with empty text (invalid)
    const message = {
      id: 'test-id',
      text: '',                    // Empty text should be invalid
      sender: 'user',
      timestamp: new Date()
    };

    // Should return false for invalid message
    expect(isValidMessage(message)).toBe(false);
  });

  // Test 3: Invalid sender should fail validation
  it('should reject message with invalid sender', () => {
    // Create message with invalid sender
    const message = {
      id: 'test-id',
      text: 'Hello',
      sender: 'invalid',           // Not 'user' or 'bot' - invalid
      timestamp: new Date()
    };

    // Should return false for invalid sender
    expect(isValidMessage(message)).toBe(false);
  });
});