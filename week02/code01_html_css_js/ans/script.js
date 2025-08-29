// Enhanced Chatbot JavaScript
class EnhancedChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.isTyping = false;
        
        this.initializeEventListeners();
        this.showWelcomeMessage();
        
        // Enhanced bot responses with different categories
        this.responses = {
            greetings: [
                "Hello! How can I help you today?",
                "Hi there! What's on your mind?",
                "Hey! Great to see you here!",
                "Greetings! How may I assist you?"
            ],
            questions: [
                "That's an interesting question! Let me think about that...",
                "Good question! Here's what I think:",
                "I'd be happy to help with that!",
                "That's something I can definitely help you with!"
            ],
            compliments: [
                "Thank you so much! You're very kind! 😊",
                "That really made my day! Thank you!",
                "You're too nice! I appreciate that!",
                "Aww, thank you! You're pretty awesome yourself!"
            ],
            help: [
                "I'm here to chat with you! You can ask me questions, tell me about your day, or just have a conversation.",
                "I can help with general conversation, answer simple questions, or just be here to listen!",
                "Try asking me about the weather, telling me a joke, or just saying hello!"
            ],
            weather: [
                "I wish I could check the weather for you! Unfortunately, I don't have access to real-time data. Try checking your local weather app! ☀️",
                "Weather is always interesting to talk about! I can't check current conditions, but I'd love to hear about the weather where you are! 🌤️"
            ],
            default: [
                "That's interesting! Tell me more about that.",
                "I see! Thanks for sharing that with me.",
                "Hmm, that's something to think about!",
                "I find that fascinating! What else can you tell me?",
                "That's a great point! I hadn't thought of it that way.",
                "Interesting perspective! I appreciate you sharing that."
            ]
        };
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        
        this.userInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !this.isTyping) {
                this.handleSendMessage();
            }
        });

        // Auto-resize input and focus
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.addMessage("Welcome! I'm your enhanced chatbot. I can have conversations, answer questions, and chat about various topics. How are you doing today? 🤖", false);
        }, 500);
    }

    handleSendMessage() {
        const message = this.userInput.value.trim();
        if (message && !this.isTyping) {
            this.addMessage(message, true);
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            
            // Show typing indicator and generate response
            this.showTypingIndicator();
            this.generateBotResponse(message);
        }
    }

    addMessage(text, isUser, showAvatar = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');

        const timestamp = this.getCurrentTimestamp();
        
        messageDiv.innerHTML = `
            ${showAvatar ? `
                <div class="message-info">
                    <div class="${isUser ? 'user-avatar' : 'bot-avatar'}">
                        ${isUser ? '👤' : '🤖'}
                    </div>
                    <span class="timestamp">${timestamp}</span>
                </div>
            ` : ''}
            <div class="message-content">${text}</div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        this.sendButton.disabled = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-info">
                <div class="bot-avatar">🤖</div>
                <span class="timestamp">${this.getCurrentTimestamp()}</span>
            </div>
            <div class="typing-indicator">
                <span>Bot is typing</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
        this.sendButton.disabled = false;
    }

    generateBotResponse(userMessage) {
        // Simulate realistic typing delay
        const typingDelay = Math.random() * 2000 + 1000; // 1-3 seconds
        
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const response = this.getBotResponse(userMessage.toLowerCase());
            this.addMessage(response, false);
        }, typingDelay);
    }

    getBotResponse(message) {
        // Enhanced response logic
        if (this.containsWords(message, ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'])) {
            return this.getRandomResponse('greetings');
        }
        
        if (this.containsWords(message, ['how are you', 'how do you feel', 'what\'s up', 'how\'s it going'])) {
            return "I'm doing great, thank you for asking! I'm always excited to chat with new people. How are you doing?";
        }
        
        if (this.containsWords(message, ['what', 'how', 'why', 'when', 'where', 'who', '?'])) {
            return this.getRandomResponse('questions');
        }
        
        if (this.containsWords(message, ['thank you', 'thanks', 'awesome', 'great', 'amazing', 'wonderful', 'fantastic', 'good job', 'well done'])) {
            return this.getRandomResponse('compliments');
        }
        
        if (this.containsWords(message, ['help', 'what can you do', 'features', 'commands', 'how does this work'])) {
            return this.getRandomResponse('help');
        }
        
        if (this.containsWords(message, ['weather', 'temperature', 'rain', 'sunny', 'cloudy', 'snow'])) {
            return this.getRandomResponse('weather');
        }
        
        if (this.containsWords(message, ['joke', 'funny', 'laugh', 'humor'])) {
            return "Here's a joke for you: Why don't scientists trust atoms? Because they make up everything! 😄";
        }
        
        if (this.containsWords(message, ['time', 'date', 'today', 'now'])) {
            const now = new Date();
            return `It's currently ${now.toLocaleString()}. Time flies when you're having fun chatting! 🕒`;
        }
        
        if (this.containsWords(message, ['name', 'who are you', 'what are you'])) {
            return "I'm an enhanced chatbot created to have friendly conversations! I don't have a specific name, but you can call me whatever you'd like. What should I call you?";
        }
        
        if (this.containsWords(message, ['bye', 'goodbye', 'see you', 'farewell', 'exit', 'quit'])) {
            return "It was great chatting with you! Feel free to come back anytime. Have a wonderful day! 👋";
        }
        
        if (this.containsWords(message, ['love', 'like', 'enjoy', 'favorite'])) {
            return "That's wonderful! It's always nice to hear about things that bring joy to people. What else do you enjoy?";
        }
        
        // Default response with some personalization
        const responses = this.getRandomResponse('default');
        return responses;
    }

    containsWords(message, words) {
        return words.some(word => message.includes(word));
    }

    getRandomResponse(category) {
        const responses = this.responses[category] || this.responses.default;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getCurrentTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedChatbot();
});
