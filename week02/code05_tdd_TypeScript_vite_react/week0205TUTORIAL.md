# Week 02 - Code 05: Test-Driven Development with TypeScript, Vite & React

## The TDD Journey: Building Quality Software from the Inside Out

```text
Traditional Development:
Write Code → Test Later → Debug Forever → Fear Changes
     ↓           ↓            ↓              ↓
   Fast       Stressful    Time Sink     Brittle Code

TDD Approach:
Write Test → Write Code → Refactor → Repeat
     ↓           ↓           ↓          ↓
   Think      Minimal    Improve    Confidence
```

## Learning Objectives

By the end of this tutorial, you will:

1. Understand Test-Driven Development (TDD) principles and methodology
2. Experience the Red-Green-Refactor cycle firsthand
3. Build the same chatbot from Week 02-04 using TDD approach
4. Write unit tests, integration tests, and end-to-end tests
5. Use Jest, React Testing Library, and Cypress for comprehensive testing
6. Understand how TDD improves code quality and developer confidence
7. Learn testing best practices for React TypeScript applications

## Table of Contents

1. [Understanding Test-Driven Development](#understanding-test-driven-development)
2. [Setting Up the TDD Environment](#setting-up-the-tdd-environment)
3. [TDD Fundamentals: Red-Green-Refactor](#tdd-fundamentals-red-green-refactor)
4. [Building Our Chatbot with TDD](#building-our-chatbot-with-tdd)
5. [Unit Testing with Jest](#unit-testing-with-jest)
6. [Component Testing with React Testing Library](#component-testing-with-react-testing-library)
7. [Integration Testing](#integration-testing)
8. [End-to-End Testing with Cypress](#end-to-end-testing-with-cypress)
9. [Advanced TDD Techniques](#advanced-tdd-techniques)
10. [TDD Best Practices and Common Pitfalls](#tdd-best-practices-and-common-pitfalls)

## Understanding Test-Driven Development

### What is TDD?

**Test-Driven Development (TDD)** is a software development process where you write tests before writing the actual code. It's not just about testing—it's a design methodology that helps you build better, more maintainable software.

### The Problem with Code-First Development

**Traditional Approach Problems:**

- ❌ High level of defects discovered late
- ❌ Lengthy testing phases after development
- ❌ Poor code maintainability
- ❌ Fear of making changes (brittle code)
- ❌ Running out of time for proper testing
- ❌ Expensive bug fixes in production

### The TDD Solution

**TDD Benefits:**

- ✅ Reduces bugs through early detection
- ✅ Improves code quality and design
- ✅ Makes refactoring safer
- ✅ Ensures code meets requirements
- ✅ Builds developer confidence
- ✅ Creates comprehensive test library
- ✅ Acts as living documentation
- ✅ Achieves excellent code coverage

### The Red-Green-Refactor Cycle

**🔴 RED: Write a Failing Test**

- Write the smallest possible test that fails
- Think about the desired behavior first
- Focus on the interface, not implementation

**🟢 GREEN: Make It Pass**

- Write the minimal code to make the test pass
- Don't worry about perfection
- Just make it work

**🔵 REFACTOR: Improve the Code**

- Clean up both test and production code
- Remove duplication
- Improve readability
- Tests ensure nothing breaks

## Setting Up the TDD Environment

### Prerequisites

Before starting, ensure you have completed Week 02-04 or have Node.js installed.

### Step 1: Create TDD Project

```bash
# Navigate to the TDD directory
cd "c:\Users\user\Documents\proj01_chatbot_edu\week02\code05_tdd_TypeScript_vite_react"

# Create a new Vite React TypeScript project
# Select React + TypeScript
npm create vite@latest chatbot-tdd-app --template react-ts

# Navigate into the project
cd chatbot-tdd-app

# Install dependencies
npm install
```

### Step 2: Install Testing Dependencies

```bash
# Install Jest and React Testing Library (Vite doesn't include Jest by default)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install Jest and TypeScript support
npm install --save-dev jest ts-jest @types/jest

# Install Cypress for E2E testing
npm install --save-dev cypress

# Install Mock Service Worker for API mocking
npm install --save-dev msw

# Install additional testing utilities
npm install --save-dev jest-environment-jsdom identity-obj-proxy
```

### Step 3: Configure Testing Environment

**Update `package.json` scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress open",
    "test:e2e:headless": "cypress run"
  }
}
```

**Create `jest.config.js`:**

```javascript
// Jest configuration for React TypeScript project
export default {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  // Use jsdom to simulate browser environment for React components
  testEnvironment: 'jsdom',
  // Run setup file after Jest environment is set up
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // Mock CSS imports so tests don't break on style imports
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Transform TypeScript and TSX files using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  // Define where Jest should look for test files
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}', // Tests in __tests__ folders
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',  // Files ending with .test or .spec
  ],
  // Collect coverage from these files
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',     // Include all TypeScript files
    '!src/**/*.d.ts',        // Exclude type definition files
    '!src/main.tsx',         // Exclude entry point
    '!src/vite-env.d.ts',    // Exclude Vite environment types
  ],
};
```

**Create `src/setupTests.ts`:**

```typescript
// Import Jest DOM matchers for enhanced testing assertions
// This adds custom matchers like toBeInTheDocument(), toHaveClass(), etc.
import '@testing-library/jest-dom';
```

**Why do we need `setupTests.ts`?**

The `setupTests.ts` file is automatically executed by Jest before running tests and serves several important purposes:

1. **Enhanced Matchers**: `@testing-library/jest-dom` provides additional Jest matchers specifically for DOM testing:
   - `toBeInTheDocument()` - checks if element exists in DOM
   - `toHaveClass()` - checks if element has specific CSS class
   - `toHaveAttribute()` - checks element attributes
   - `toBeDisabled()` - checks if form elements are disabled
   - And many more!

2. **Global Test Setup**: Any code here runs before each test file, perfect for:
   - Mock setup (like our MSW server)
   - Global configurations
   - Custom matchers or utilities

3. **TypeScript Support**: Ensures TypeScript recognizes the new matcher types.

Without this file, assertions like `expect(element).toBeInTheDocument()` would fail with TypeScript errors.

### Step 4: Verify Setup

```bash
# Run the test command to ensure everything is configured
npm test
```

**Troubleshooting Common Issues:**

If you get `'jest' is not recognized` error:

1. Make sure Jest is installed: `npm install --save-dev jest ts-jest @types/jest`
2. Check that your `package.json` has the test script: `"test": "jest"`
3. Try running: `npx jest` instead of `npm test`

If you get module resolution errors:

1. Ensure `jest.config.js` is in your project root
2. Check that `moduleNameMapping` is correctly configured for CSS imports
3. Verify TypeScript files are being transformed with `ts-jest`

## TDD Fundamentals: Red-Green-Refactor

Let's start with a simple example to understand the TDD cycle.

### Example 1: Testing a Simple Utility Function

**🔴 RED: Write the failing test first**

**Create `src/utils/__tests__/messageUtils.test.ts`:**

```typescript
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
});
```

**Run the test - it should FAIL:**

```bash
npm test
# Error: Cannot find module '../messageUtils'
```

**🟢 GREEN: Write minimal code to make it pass**

**Create `src/utils/messageUtils.ts`:**

```typescript
// Define the TypeScript interface for our formatted message
export interface FormattedMessage {
  text: string;      // The message content
  sender: string;    // Who sent it ('user' or 'bot')
  timestamp: Date;   // When it was created
  id: string;        // Unique identifier
}

// Function to format a message with metadata
export function formatMessage(text: string, sender: string): FormattedMessage {
  return {
    text,                                    // Keep original text
    sender,                                  // Keep original sender
    timestamp: new Date(),                   // Add current timestamp
    id: Math.random().toString(36)           // Generate simple random ID
  };
}
```

**Run the test - it should PASS:**

```bash
npm test
# ✓ should format a simple message
```

**🔵 REFACTOR: Improve the code**

Let's improve the ID generation:

```typescript
// Improved function with better ID generation
export function formatMessage(text: string, sender: string): FormattedMessage {
  return {
    text,                                                           // Keep original text
    sender,                                                         // Keep original sender
    timestamp: new Date(),                                          // Add current timestamp
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Better ID: timestamp + random string
  };
}
```

**Run tests again to ensure they still pass:**

```bash
npm test
# ✓ should format a simple message
```

### TDD Strategies in Action

**1. Faking It:**
Start with the simplest implementation, even hardcoded values.

**2. Obvious Implementation:**
If the solution is clear, implement it directly.

**3. Triangulation:**
Add more tests to drive out generalization.

Let's add more tests to triangulate:

```typescript
// Test suite for formatMessage function with multiple test cases
describe('formatMessage', () => {
  // Test 1: Basic functionality
  it('should format a simple message', () => {
    const text = 'Hello World';
    const sender = 'user';
    
    const result = formatMessage(text, sender);
    
    // Verify all expected properties are present and correct
    expect(result).toEqual({
      text: 'Hello World',              // Text should be preserved exactly
      sender: 'user',                   // Sender should be preserved exactly
      timestamp: expect.any(Date),      // Should have a timestamp (any Date)
      id: expect.any(String)            // Should have an ID (any string)
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
```

## Building Our Chatbot with TDD

Now let's build our chatbot application using TDD. We'll start with the smallest pieces and build up.

### Step 1: Message Types (Inside-Out Approach)

**🔴 RED: Test the Message interface**

**Create `src/types/__tests__/Message.test.ts`:**

```typescript
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
```

**🟢 GREEN: Implement the Message type**

**Create `src/types/Message.ts`:**

```typescript
// Define the TypeScript interface for a chat message
export interface Message {
  id: string;                    // Unique identifier for the message
  text: string;                  // The actual message content
  sender: 'user' | 'bot';        // Union type: only 'user' or 'bot' allowed
  timestamp: Date;               // When the message was created
}

// Type guard function to validate if an object is a valid Message
export function isValidMessage(message: any): message is Message {
  return (
    typeof message === 'object' &&                                    // Must be an object
    typeof message.id === 'string' &&                                 // ID must be string
    typeof message.text === 'string' &&                               // Text must be string
    message.text.length > 0 &&                                        // Text cannot be empty
    (message.sender === 'user' || message.sender === 'bot') &&        // Sender must be 'user' or 'bot'
    message.timestamp instanceof Date                                  // Timestamp must be Date object
  );
}
```

### Step 2: Bot Response Logic

**🔴 RED: Test the bot response function**

**Create `src/services/__tests__/botService.test.ts`:**

```typescript
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
```

**🟢 GREEN: Implement the bot service**

**Create `src/services/botService.ts`:**

```typescript
// Define the interface for bot responses
export interface BotResponse {
  text: string;    // The response message
  delay: number;   // Milliseconds to wait before showing response
}

// Main function to generate bot responses based on user input
export function getBotResponse(userMessage: string): BotResponse {
  // Normalize input: convert to lowercase and remove whitespace
  const message = userMessage.toLowerCase().trim();
  
  // Check for greeting keywords
  if (message.includes('hello') || message.includes('hi')) {
    return {
      text: "Hello! I'm a TDD-built chatbot. How can I help you today?",
      delay: 1000    // 1 second delay
    };
  }
  
  // Check for vite-related questions
  if (message.includes('vite')) {
    return {
      text: "Vite is amazing! ⚡ Super fast development and builds. This bot was built using TDD!",
      delay: 800     // Slightly faster response
    };
  }
  
  // Check for react-related questions
  if (message.includes('react')) {
    return {
      text: "React with TypeScript is powerful! And with TDD, we build it right the first time. 🚀",
      delay: 1200    // Slightly longer response
    };
  }
  
  // Check for goodbye
  if (message.includes('bye')) {
    return {
      text: "Goodbye! Thanks for trying this TDD-built chatbot! 👋",
      delay: 600     // Quick goodbye
    };
  }
  
  // Default response for unrecognized input
  return {
    text: `You said: "${userMessage}". This response was generated by TDD-tested code! ⚡`,
    delay: 1000    // Standard delay
  };
}
```

**🔵 REFACTOR: Extract response patterns**

```typescript
// Refactored version with extracted response patterns

// Define the interface for bot responses
export interface BotResponse {
  text: string;    // The response message
  delay: number;   // Milliseconds to wait before showing response
}

// Define structure for response patterns (makes it easier to add new responses)
interface ResponsePattern {
  keywords: string[];    // Array of trigger words
  response: string;      // What to respond with
  delay: number;         // How long to wait before responding
}

// Configuration array of all possible responses (easy to maintain and extend)
const responsePatterns: ResponsePattern[] = [
  {
    keywords: ['hello', 'hi'],  // Greeting keywords
    response: "Hello! I'm a TDD-built chatbot. How can I help you today?",
    delay: 1000                 // 1 second delay
  },
  {
    keywords: ['vite'],         // Vite-related keywords
    response: "Vite is amazing! ⚡ Super fast development and builds. This bot was built using TDD!",
    delay: 800                  // Faster response for tech topics
  },
  {
    keywords: ['react'],        // React-related keywords
    response: "React with TypeScript is powerful! And with TDD, we build it right the first time. 🚀",
    delay: 1200                 // Slightly longer for detailed tech response
  },
  {
    keywords: ['bye'],          // Farewell keywords
    response: "Goodbye! Thanks for trying this TDD-built chatbot! 👋",
    delay: 600                  // Quick goodbye
  }
];

// Improved bot response function using pattern matching
export function getBotResponse(userMessage: string): BotResponse {
  // Normalize input: convert to lowercase and remove whitespace
  const message = userMessage.toLowerCase().trim();
  
  // Find the first pattern that matches any keyword in the user message
  const pattern = responsePatterns.find(p => 
    p.keywords.some(keyword => message.includes(keyword))  // Check if any keyword is found
  );
  
  // If we found a matching pattern, use it
  if (pattern) {
    return {
      text: pattern.response,
      delay: pattern.delay
    };
  }
  
  // Default response if no patterns match
  return {
    text: `You said: "${userMessage}". This response was generated by TDD-tested code! ⚡`,
    delay: 1000
  };
}
```

### Step 3: Message Creation Hook

**🔴 RED: Test the custom hook**

**Create `src/hooks/__tests__/useMessages.test.ts`:**

```typescript
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
```

**🟢 GREEN: Implement the hook**

**Create `src/hooks/useMessages.ts`:**

```typescript
// Import React's useState hook for managing component state
import { useState } from 'react';
// Import our Message type for type safety
import { Message } from '../types/Message';

// Custom hook to manage a collection of messages
export function useMessages() {
  // State to hold an array of Message objects, starting empty
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to add a new message to the collection
  const addMessage = (text: string, sender: 'user' | 'bot') => {
    // Create a new message object with all required properties
    const newMessage: Message = {
      // Generate unique ID using timestamp + random string for React keys
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,     // The message content
      sender,   // Who sent it: 'user' or 'bot'
      timestamp: new Date()  // When the message was created
    };

    // Update state by adding the new message to the end of the array
    // Using spread operator to create new array (immutable update)
    setMessages(prev => [...prev, newMessage]);
  };

  // Return the current state and functions for external components to use
  return {
    messages,     // Current array of messages
    addMessage    // Function to add new messages
  };
}
```

## Component Testing with React Testing Library

Now let's test our React components using React Testing Library.

### Step 4: Message Component

**🔴 RED: Test the Message component**

**Create `src/components/__tests__/MessageComponent.test.tsx`:**

```typescript
// Import React Testing Library utilities for component testing
import { render, screen } from '@testing-library/react';
// Import the component we want to test
import { MessageComponent } from '../MessageComponent';
// Import the Message type for creating test data
import { Message } from '../../types/Message';

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
```

**🟢 GREEN: Implement the MessageComponent**

**Create `src/components/MessageComponent.tsx`:**

```typescript
// Import React for JSX and component definition
import React from 'react';
// Import our Message type for prop validation
import { Message } from '../types/Message';

// Define the props interface for type safety
interface MessageComponentProps {
  message: Message;  // The message object to display
}

// Functional component to render a single message
export function MessageComponent({ message }: MessageComponentProps): React.JSX.Element {
  return (
    <li 
      // Dynamic CSS class based on sender: 'message user-message' or 'message bot-message'
      className={`message ${message.sender}-message`}
      // Semantic HTML role for screen readers
      role="listitem"
      // Descriptive aria-label for accessibility
      aria-label={`Message from ${message.sender}`}
    >
      {/* Display the message text content */}
      {message.text}
    </li>
  );
}
```

### Step 5: Chat Input Component

**🔴 RED: Test the ChatInput component**

**Create `src/components/__tests__/ChatInput.test.tsx`:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
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
```

**🟢 GREEN: Implement the ChatInput component**

**Create `src/components/ChatInput.tsx`:**

```typescript
import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps): React.JSX.Element {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    
    onSend(input.trim());
    setInput('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="user-input"
      />
      <button
        onClick={handleSend}
        disabled={input.trim() === ''}
        className="send-button"
      >
        Send
      </button>
    </div>
  );
}
```

### Step 6: Main Chat Component

**🔴 RED: Test the main Chat component**

**Create `src/components/__tests__/Chat.test.tsx`:**

```typescript
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

describe('Chat', () => {
  it('should render chat container', () => {
    render(<Chat />);
    
    expect(screen.getByRole('main')).toHaveClass('chat-container');
  });

  it('should render welcome message initially', () => {
    render(<Chat />);
    
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
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
    
    // Mock scrollIntoView
    const mockScrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Hello');
    await user.keyboard('{Enter}');
    
    expect(mockScrollIntoView).toHaveBeenCalled();
  });
});
```

**🟢 GREEN: Implement the Chat component**

**Create `src/components/Chat.tsx`:**

```typescript
import React, { useEffect, useRef } from 'react';
import { useMessages } from '../hooks/useMessages';
import { getBotResponse } from '../services/botService';
import { MessageComponent } from './MessageComponent';
import { ChatInput } from './ChatInput';

export function Chat(): React.JSX.Element {
  const { messages, addMessage } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    addMessage(
      "Welcome! I'm a chatbot built with TDD. Try typing 'hello', 'vite', or 'react'!",
      'bot'
    );
  }, []);

  const handleSendMessage = (text: string) => {
    // Add user message immediately
    addMessage(text, 'user');

    // Get bot response and add it after delay
    const botResponse = getBotResponse(text);
    setTimeout(() => {
      addMessage(botResponse.text, 'bot');
    }, botResponse.delay);
  };

  return (
    <main className="chat-container" role="main">
      <div className="chat-messages">
        <ul role="log" aria-label="Chat messages">
          {messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
        </ul>
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSend={handleSendMessage} />
    </main>
  );
}
```

### Step 7: App Component Integration

**🔴 RED: Test the complete App**

**Create `src/__tests__/App.test.tsx`:**

```typescript
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
```

**🟢 GREEN: Implement the App component**

**Create `src/App.tsx`:**

```typescript
import React from 'react';
import { Chat } from './components/Chat';
import './App.css';

function App(): React.JSX.Element {
  return (
    <div className="App">
      <Chat />
    </div>
  );
}

export default App;
```

**Add CSS (create `src/App.css`):**

```css
/* App.css - TDD Chatbot Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.App {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 400px;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  border-bottom: 1px solid #ddd;
}

.chat-messages ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.message {
  margin: 10px 0;
  padding: 8px 12px;
  border-radius: 20px;
  max-width: 80%;
  display: block;
}

.user-message {
  background-color: #007bff;
  color: white;
  margin-left: auto;
  text-align: right;
}

.bot-message {
  background-color: #e0e0e0;
  color: black;
  margin-right: auto;
}

.input-container {
  display: flex;
  padding: 10px;
}

.user-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.send-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.send-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.send-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
```

## Integration Testing

Now let's test how our components work together.

### Step 8: Integration Tests

**Create `src/__tests__/integration/ChatFlow.test.tsx`:**

```typescript
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

    // Wait for bot response
    await waitFor(() => {
      expect(screen.getByText(/First message.*TDD/i)).toBeInTheDocument();
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
```

## End-to-End Testing with Cypress

### Step 9: E2E Tests

**Create `cypress.config.ts`:**

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
```

**Create `cypress/e2e/chatbot.cy.ts`:**

```typescript
describe('Chatbot E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the chatbot application', () => {
    cy.get('[role="main"]').should('be.visible');
    cy.contains(/welcome.*TDD/i).should('be.visible');
  });

  it('should handle user interaction flow', () => {
    // Type and send a message
    cy.get('input[placeholder*="Type your message"]')
      .type('hello');
    
    cy.get('button').contains('Send').click();

    // Verify user message appears
    cy.contains('hello').should('be.visible');

    // Wait for and verify bot response
    cy.contains(/Hello.*TDD.*chatbot/i, { timeout: 2000 })
      .should('be.visible');
  });

  it('should handle Enter key submission', () => {
    cy.get('input[placeholder*="Type your message"]')
      .type('vite{enter}');

    cy.contains('vite').should('be.visible');
    cy.contains(/Vite.*amazing.*TDD/i, { timeout: 2000 })
      .should('be.visible');
  });

  it('should disable send button for empty input', () => {
    cy.get('button').contains('Send')
      .should('be.disabled');

    cy.get('input[placeholder*="Type your message"]')
      .type('hello');

    cy.get('button').contains('Send')
      .should('not.be.disabled');

    cy.get('input[placeholder*="Type your message"]')
      .clear();

    cy.get('button').contains('Send')
      .should('be.disabled');
  });

  it('should maintain conversation history', () => {
    // Send multiple messages
    cy.get('input[placeholder*="Type your message"]')
      .type('hello{enter}');

    cy.contains(/Hello.*TDD.*chatbot/i, { timeout: 2000 });

    cy.get('input[placeholder*="Type your message"]')
      .type('vite{enter}');

    cy.contains(/Vite.*amazing.*TDD/i, { timeout: 2000 });

    // Check that all messages are still visible
    cy.contains('hello').should('be.visible');
    cy.contains('vite').should('be.visible');
    cy.contains(/Hello.*TDD.*chatbot/i).should('be.visible');
    cy.contains(/Vite.*amazing.*TDD/i).should('be.visible');
  });

  it('should have proper accessibility attributes', () => {
    cy.get('[role="main"]').should('exist');
    cy.get('[role="log"]').should('exist');
    cy.get('input').should('have.attr', 'placeholder');
    
    // Send a message to create list items
    cy.get('input[placeholder*="Type your message"]')
      .type('hello{enter}');

    cy.get('[role="listitem"]').should('exist');
  });
});
```

## Advanced TDD Techniques

### Step 10: Mocking External Dependencies

**Test with Mock Service Worker for API calls**

**Create `src/mocks/handlers.ts`:**

```typescript
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/chat/history', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'mock-1',
          text: 'Previous conversation',
          sender: 'user',
          timestamp: new Date().toISOString()
        }
      ])
    );
  }),

  rest.post('/api/chat/message', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'mock-response',
        text: 'Mocked server response',
        sender: 'bot',
        timestamp: new Date().toISOString()
      })
    );
  })
];
```

**Create `src/mocks/server.ts`:**

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Update `src/setupTests.ts`:**

```typescript
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Step 11: Testing Custom Hooks with More Complexity

**Create `src/hooks/__tests__/useChatWithAPI.test.ts`:**

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChatWithAPI } from '../useChatWithAPI';
import { server } from '../../mocks/server';
import { rest } from 'msw';

describe('useChatWithAPI', () => {
  it('should load chat history on mount', async () => {
    const { result } = renderHook(() => useChatWithAPI());

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].text).toBe('Previous conversation');
    });
  });

  it('should handle API errors gracefully', async () => {
    server.use(
      rest.get('/api/chat/history', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useChatWithAPI());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should send message to API', async () => {
    const { result } = renderHook(() => useChatWithAPI());

    act(() => {
      result.current.sendMessage('Test message');
    });

    await waitFor(() => {
      expect(result.current.messages).toContainEqual(
        expect.objectContaining({
          text: 'Test message',
          sender: 'user'
        })
      );
    });

    await waitFor(() => {
      expect(result.current.messages).toContainEqual(
        expect.objectContaining({
          text: 'Mocked server response',
          sender: 'bot'
        })
      );
    });
  });
});
```

## TDD Best Practices and Common Pitfalls

### Best Practices We've Demonstrated

1. **Start Small**: Begin with simple utility functions
2. **Red-Green-Refactor**: Always follow the cycle
3. **Test Behavior, Not Implementation**: Focus on what the code does
4. **Meaningful Test Names**: Describe the expected behavior
5. **Arrange-Act-Assert**: Structure tests clearly
6. **Mock External Dependencies**: Keep tests fast and isolated

### Common Pitfalls to Avoid

1. **Writing Tests After Code** (retrofitting)
2. **Over-mocking**: Mocking too many dependencies
3. **Ignoring the Refactor Phase**: Not cleaning up code
4. **Testing Implementation Details**: Testing how instead of what
5. **Writing Too Many Tests at Once**: Stick to one failing test

### Refactoring Principles Applied

```typescript
// Before refactoring (duplication)
const handleSend = () => {
  if (input.trim() === '') return;
  const newMessage = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: input.trim(),
    sender: 'user' as const,
    timestamp: new Date()
  };
  setMessages(prev => [...prev, newMessage]);
  setInput('');
};

// After refactoring (extracted logic)
const handleSend = () => {
  if (input.trim() === '') return;
  addMessage(input.trim(), 'user');
  setInput('');
};
```

## Running All Tests

### Test Scripts

**Run different types of tests:**

```bash
# Run all unit/integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (make sure dev server is running)
npm run dev &
npm run test:e2e

# Run E2E tests headless
npm run test:e2e:headless
```

### Coverage Report

```bash
npm run test:coverage
```

This should show high coverage percentages across your codebase:

```
File                     | % Stmts | % Branch | % Funcs | % Lines
-------------------------|---------|----------|---------|--------
All files               |     95+ |      90+ |     95+ |     95+
 src/components          |     100 |      100 |     100 |     100
 src/hooks              |     100 |       95 |     100 |     100
 src/services           |     100 |      100 |     100 |     100
 src/utils              |     100 |      100 |     100 |     100
```

## Key TDD Takeaways

### What We've Learned

1. **TDD Process**: Red-Green-Refactor cycle in practice
2. **Test Types**: Unit, integration, and E2E tests
3. **Testing Tools**: Jest, React Testing Library, Cypress
4. **Code Quality**: Better design through test-first thinking
5. **Confidence**: Refactoring without fear
6. **Documentation**: Tests as specifications

### Benefits Realized

- ✅ **Bug Prevention**: Caught issues before they became problems
- ✅ **Better Design**: API design driven by usage in tests
- ✅ **Refactor Safety**: Changed code confidently with test coverage
- ✅ **Living Documentation**: Tests describe what code should do
- ✅ **Development Speed**: Faster debugging and fewer manual tests

### Time Investment vs. Returns

**Initial Investment:**

- More time writing tests upfront
- Learning testing tools and techniques
- Setting up testing infrastructure

**Long-term Returns:**

- Fewer bugs in production
- Faster development cycles
- Safer refactoring
- Better code maintainability
- Higher developer confidence

## Conclusion

Test-Driven Development is more than just testing—it's a design methodology that leads to better software. By writing tests first, we:

1. **Think about design before implementation**
2. **Build only what's needed to satisfy requirements**
3. **Create comprehensive test coverage naturally**
4. **Develop confidence in our code**
5. **Enable fearless refactoring**

The chatbot we built is functionally identical to the one from Week 02-04, but it's built on a foundation of tests that give us confidence in its quality and make future changes much safer.

### Next Steps

1. **Practice TDD** on your own projects
2. **Experiment with different testing strategies**
3. **Learn advanced testing patterns**
4. **Share TDD knowledge with your team**
5. **Measure the impact** on your development process

Remember: TDD is a skill that improves with practice. Start small, be consistent, and gradually build your TDD muscles. The investment in learning TDD pays dividends throughout your entire career as a developer.

**Happy TDD coding!** 🚀✅
