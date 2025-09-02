// 🤖 Step 8: Bot Response Logic Tests
// Import the function we want to test
import { getBotResponse } from '../botService';

// Test suite for bot response service
describe('botService', () => {
  // Nested describe for organizing getBotResponse tests
  describe('getBotResponse', () => {
    // Test 1: Bot should respond to "hello"
    it('should respond to hello', () => {
      const response = getBotResponse('hello');
      // Response text should contain "Hello" (case-insensitive check)
      expect(response.text).toContain('Hello');
    });

    // Test 2: Bot should respond to "hi" similarly
    it('should respond to hi', () => {
      const response = getBotResponse('hi');
      // Both "hello" and "hi" should get Hello response
      expect(response.text).toContain('Hello');
    });

    // Test 3: Bot should handle different cases
    it('should be case insensitive', () => {
      const response = getBotResponse('HELLO');  // Test uppercase input
      // Should still respond with Hello regardless of input case
      expect(response.text).toContain('Hello');
    });

    // Test 4: Bot should respond to vite-related questions
    it('should respond to vite questions', () => {
      const response = getBotResponse('tell me about vite');
      // Response should mention vite (convert to lowercase for case-insensitive check)
      expect(response.text.toLowerCase()).toContain('vite');
    });

    // Test 5: Bot should have default response for unknown inputs
    it('should have a default response for unknown inputs', () => {
      const response = getBotResponse('xyz123');  // Random input
      // Should have some response (not empty)
      expect(response.text).toBeDefined();
      expect(response.text.length).toBeGreaterThan(0);
    });

    // Test 6: Response should include delay for realistic chat experience
    it('should return response with delay', () => {
      const response = getBotResponse('hello');
      // Delay should be reasonable (> 0 but < 3 seconds)
      expect(response.delay).toBeGreaterThan(0);
      expect(response.delay).toBeLessThan(3000);
    });
  });
});