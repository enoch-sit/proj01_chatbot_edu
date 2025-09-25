# FlowiseAI Frontend

A modern React-based chat interface for FlowiseAI with real-time streaming support and Docker deployment capabilities.

## ✨ Features

- **Real-time Streaming**: Character-by-character response streaming using FlowiseAI SDK
- **Dual Mode Support**: Toggle between streaming and standard response modes
- **Environment Configuration**: Configurable via environment variables
- **Docker Ready**: Complete Docker and nginx configuration for production deployment
- **Responsive Design**: Modern UI with animations and mobile support
- **Authentication Support**: Optional API key or username/password authentication
- **Session Management**: Proper chat history and conversation flow
- **Error Handling**: Comprehensive error handling with fallback mechanisms

## Project Structure

```
src/
├── components/
│   ├── ChatWindow.jsx      # Main chat display component
│   ├── Message.jsx         # Individual message component
│   └── MessageInput.jsx    # Message input form component
├── services/
│   └── flowiseService.js   # FlowiseAI API integration
├── App.jsx                 # Main application component
├── App.css                 # Main application styles
├── main.jsx               # React entry point
└── index.css              # Global styles
```

## Configuration

The project is configured with:
- **Base Path**: `/projectui/` (as specified in requirements)
- **FlowiseAI Endpoint**: `https://project-1-13.eduhk.hk/api/v1/prediction/415615d3-ee34-4dac-be19-f8a20910f692`
- **Port**: 3000 (development server)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## API Integration

The app integrates with FlowiseAI using the prediction endpoint with both streaming and non-streaming support.

### Streaming Features

- **Real-time Responses**: Messages appear as they're generated using Server-Sent Events
- **Stream Toggle**: Easy switch between streaming and standard modes
- **Visual Indicators**: Streaming cursors, progress indicators, and mode badges
- **Robust Error Handling**: Graceful fallback and connection management
- **Message History**: Full conversation context maintained in both modes

### API Service Methods

```javascript
// Non-streaming methods (backward compatibility)
flowiseService.sendMessage("Hello, how are you?")
flowiseService.sendMessageWithHistory("Follow up question", previousMessages)

// New streaming methods
flowiseService.streamMessage("Question", history, options, {
  onStart: () => console.log('Stream started'),
  onToken: (token, fullText) => console.log('Token:', token),
  onEnd: (fullResponse) => console.log('Complete:', fullResponse),
  onError: (error) => console.error('Error:', error)
})

// Low-level streaming generator
for await (const chunk of flowiseService.streamQuery(payload)) {
  console.log('Chunk:', chunk)
}
```

### Core Features

## Styling

The interface features:
- **Gradient backgrounds** for modern appearance
- **Smooth animations** for message transitions
- **Responsive design** that works on all devices
- **Custom scrollbars** for better UX
- **Loading indicators** for visual feedback

## Components Overview

### ChatWindow
- Displays all messages in conversation
- Auto-scrolls to newest messages
- Shows typing indicators when AI is responding
- Welcome message for new conversations

### Message
- Individual message display
- Different styling for user vs AI messages
- Timestamp display
- Responsive design

### MessageInput
- Text area with auto-resize
- Send button with loading states
- Enter key support (Shift+Enter for new line)
- Character and line limits

## Development

The project uses:
- **React 18** with functional components and hooks
- **Vite** for fast development and building
- **Modern CSS** with flexbox and grid
- **ES6+ JavaScript** with async/await

## Deployment Notes

When deploying:
1. The base path is set to `/projectui/` in `vite.config.js`
2. All assets will be served from this subdirectory
3. Ensure your web server is configured to handle the base path correctly

## Browser Support

Supports all modern browsers including:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+