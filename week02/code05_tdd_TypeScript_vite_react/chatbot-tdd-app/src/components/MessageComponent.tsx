// Import React for JSX and component definition
import React from 'react';
// Import our Message type for prop validation
import type { Message } from '../types/Message';

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