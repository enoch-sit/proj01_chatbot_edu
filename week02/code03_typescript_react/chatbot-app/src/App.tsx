// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// TypeScript Interface Definitions
interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

// Main Chatbot Component
function App(): React.JSX.Element {
    // STATE MANAGEMENT with TypeScript
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "How can I help?",
            sender: "bot",
            timestamp: new Date()
        }
    ]);

    const [input, setInput] = useState<string>("");

    // REF for auto-scrolling
    const messagesRef = useRef<HTMLDivElement>(null);

    // SIDE EFFECTS - Auto-scroll when messages change
    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    // EVENT HANDLERS with proper TypeScript typing
    const handleSend = (): void => {
        if (input.trim() === "") return;

        // Add user message
        const newUserMessage: Message = {
            id: Date.now(),
            text: input,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInput("");

        // Simulate bot response
        setTimeout(() => {
            const botReply: Message = {
                id: Date.now() + 1,
                text: `Bot says: You typed "${input}"! How can I help?`,
                sender: "bot",
                timestamp: new Date()
            };
            setMessages(prevMessages => [...prevMessages, botReply]);
        }, 1000);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setInput(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === "Enter") {
            handleSend();
        }
    };

    // RENDER JSX
    return (
        <div className="chat-container">
            <div className="chat-messages" ref={messagesRef}>
                {messages.map((message: Message) => (
                    <div
                        key={message.id}
                        className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}
                    >
                        {message.text}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    className="user-input"
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                />
                <button className="send-button" onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default App;
