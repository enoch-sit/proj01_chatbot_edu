// 🪝 Step 9: Message Creation Hook Tests
// Import React Testing Library utilities for testing hooks
import { renderHook, act } from '@testing-library/react';
// Import the custom hook we want to test
import { useMessages } from '../useMessages';

// Test suite for the useMessages hook
describe('useMessages', () => {
  // Test 1: Check that the hook initializes with empty state
  it('should initialize with empty messages', () => {
    // Render the hook in isolation
    const { result } = renderHook(() => useMessages());
    
    // Assert that messages array starts empty
    expect(result.current.messages).toEqual([]);
  });

  // Test 2: Verify we can add user messages correctly
  it('should add a user message', () => {
    // Render the hook
    const { result } = renderHook(() => useMessages());
    
    // Use act() to wrap state updates for proper testing
    act(() => {
      // Add a user message using the hook's function
      result.current.addMessage('Hello', 'user');
    });
    
    // Check that one message was added
    expect(result.current.messages).toHaveLength(1);
    // Verify the message text is correct
    expect(result.current.messages[0].text).toBe('Hello');
    // Verify the sender is set correctly
    expect(result.current.messages[0].sender).toBe('user');
  });

  // Test 3: Verify we can add bot messages correctly
  it('should add a bot message', () => {
    // Render the hook
    const { result } = renderHook(() => useMessages());
    
    // Add a bot message
    act(() => {
      result.current.addMessage('Hi there', 'bot');
    });
    
    // Verify one message was added with correct sender
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].sender).toBe('bot');
  });

  // Test 4: Ensure each message gets a unique identifier
  it('should generate unique IDs for messages', () => {
    // Render the hook
    const { result } = renderHook(() => useMessages());
    
    // Add two messages
    act(() => {
      result.current.addMessage('First', 'user');
      result.current.addMessage('Second', 'user');
    });
    
    // Verify that the IDs are different (important for React keys)
    expect(result.current.messages[0].id).not.toBe(result.current.messages[1].id);
  });
});