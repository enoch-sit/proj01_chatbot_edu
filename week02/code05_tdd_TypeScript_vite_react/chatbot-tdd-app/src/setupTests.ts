// ⚙️ Step 16: Advanced Testing Environment Setup
// Import Jest DOM matchers for enhanced testing assertions
// This adds custom matchers like toBeInTheDocument(), toHaveClass(), etc.
import '@testing-library/jest-dom';

// Global mock for scrollIntoView - jsdom doesn't implement this browser API
// This is needed for all tests since the Chat component calls scrollToBottom on mount
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

// Global fetch mock - we'll override this in individual tests
global.fetch = jest.fn();