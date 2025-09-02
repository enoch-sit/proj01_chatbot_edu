// 📝 Step 7: Message Types Implementation
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