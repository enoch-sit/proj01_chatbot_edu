// 🔧 Step 6: Message Utils Implementation (After TDD Refactor)
// Define the TypeScript interface for our formatted message
export interface FormattedMessage {
  text: string;      // The message content
  sender: string;    // Who sent it ('user' or 'bot')
  timestamp: Date;   // When it was created
  id: string;        // Unique identifier
}

// Improved function with better ID generation
export function formatMessage(text: string, sender: string): FormattedMessage {
  return {
    text,                                                           // Keep original text
    sender,                                                         // Keep original sender
    timestamp: new Date(),                                          // Add current timestamp
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Better ID: timestamp + random string
  };
}