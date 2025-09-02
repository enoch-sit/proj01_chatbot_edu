// Import React's useState hook for managing component state
import { useState } from 'react';
// Import our Message type for type safety (type-only import)
import type { Message } from '../types/Message';

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