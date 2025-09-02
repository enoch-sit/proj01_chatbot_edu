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