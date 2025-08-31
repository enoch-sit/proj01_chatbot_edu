// src/types.ts - Chatbot Type Definitions
export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export interface ChatbotProps {
  title?: string;
  placeholder?: string;
}

export interface BotResponse {
  text: string;
  delay?: number;
}
