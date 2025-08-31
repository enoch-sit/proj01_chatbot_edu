import React, { useState } from 'react'
import './App.css'
import type { Message, BotResponse } from './types'

// Bot response logic
const getBotResponse = (userMessage: string): BotResponse => {
  const message = userMessage.toLowerCase().trim();
  
  // Simple response patterns
  if (message.includes('hello') || message.includes('hi')) {
    return { text: "Hello! I'm a Vite-powered chatbot. How can I help you today?", delay: 1000 };
  } else if (message.includes('vite')) {
    return { text: "Vite is amazing! ⚡ Super fast development and builds. Did you notice how quickly I responded?", delay: 800 };
  } else if (message.includes('react')) {
    return { text: "React with TypeScript is a powerful combination! And with Vite, it's even better. 🚀", delay: 1200 };
  } else if (message.includes('bye')) {
    return { text: "Goodbye! Thanks for trying out this Vite-powered chatbot! 👋", delay: 600 };
  } else {
    return { text: `You said: "${userMessage}". This response was generated super fast thanks to Vite! ⚡`, delay: 1000 };
  }
};

function App(): React.JSX.Element {
  // State management with TypeScript
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm a chatbot built with Vite + React + TypeScript. Try typing 'hello', 'vite', or 'react'!",
      sender: 'bot'
    }
  ]);

  const [input, setInput] = useState<string>('');

  // Event handlers with proper TypeScript typing
  const handleSend = (): void => {
    if (input.trim() === '') return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');

    // Get bot response with delay
    const botResponse = getBotResponse(input.trim());
    
    setTimeout(() => {
      const newBotMessage: Message = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot'
      };

      setMessages(prev => [...prev, newBotMessage]);
    }, botResponse.delay);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInput(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}-message`}>
            {message.text}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (try 'hello', 'vite', or 'react')"
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
    </div>
  );
}

export default App;
