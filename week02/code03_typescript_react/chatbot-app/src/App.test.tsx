// Import testing utilities from React Testing Library
// - render: Creates a virtual DOM representation of a React component for testing
// - screen: Provides methods to query elements in the rendered component
import { render, screen } from '@testing-library/react';
import App from './App';

// Test case: Check if the chatbot input field is rendered correctly
test('renders chatbot input field', () => {
  // render() creates a virtual DOM of the App component
  // This doesn't open a browser - it creates an in-memory representation for testing
  render(<App />);
  
  // screen comes from @testing-library/react and provides query methods
  // getByPlaceholderText() searches for an element with specific placeholder text
  // /type your message/i is a case-insensitive regex pattern
  // REGEX BREAKDOWN:
  //   /              - Start of regex pattern
  //   type your message - Literal text to match (no special characters here)
  //   /              - End of regex pattern  
  //   i              - Flag meaning "case-insensitive" (ignores upper/lower case)
  // This will match: "Type your message", "TYPE YOUR MESSAGE", "type your message", etc.
  // This matches the placeholder="Type your message..." in App.tsx line 85
  const inputElement = screen.getByPlaceholderText(/type your message/i);
  
  // expect() creates an assertion - if this fails, the test fails
  // toBeInTheDocument() checks if the element exists in the virtual DOM
  expect(inputElement).toBeInTheDocument();
});

// Test case: Verify the send button is present
test('renders send button', () => {
  // Create virtual DOM representation of App component
  render(<App />);
  
  // Find button by its text content using case-insensitive search
  // getByText() looks for elements containing the specified text
  const buttonElement = screen.getByText(/send/i);
  
  // Assert that the button exists in the rendered component
  expect(buttonElement).toBeInTheDocument();
});

// Test case: Ensure the initial bot message appears
test('renders initial bot message', () => {
  // Render the App component in virtual DOM
  render(<App />);
  
  // Search for the bot's initial greeting message
  // This tests if the default state shows the expected welcome message
  const botMessage = screen.getByText(/how can i help/i);
  
  // Verify the initial message is displayed when component first loads
  expect(botMessage).toBeInTheDocument();
});
