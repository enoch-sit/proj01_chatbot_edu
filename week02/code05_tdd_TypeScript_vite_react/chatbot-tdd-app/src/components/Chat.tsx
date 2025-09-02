// 💬 Step 12: Chat Component Implementation (FIXED)
import React, { useEffect, useRef } from 'react';
import { useMessages } from '../hooks/useMessages';
import { getBotResponse } from '../services/botService';
import { MessageComponent } from './MessageComponent';
import { ChatInput } from './ChatInput';

export function Chat(): React.JSX.Element {
  const { messages, addMessage } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false); // ✅ Track if welcome message was added

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ FIXED: Use useRef to prevent duplicate welcome messages in StrictMode
  useEffect(() => {
    if (!isInitialized.current) {
      addMessage(
        "Welcome! I'm a chatbot built with TDD. Try typing 'hello', 'vite', or 'react'!",
        'bot'
      );
      isInitialized.current = true;
    }
  }, [addMessage]);

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