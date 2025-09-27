# Chatbot MVP

A simple chatbot application using the EDUHK AIDCEC AI API with a clean web interface.

## Features

- 🤖 Clean, responsive chat interface
- 🔄 Real-time conversation with AI
- 📱 Mobile-friendly design
- ⚡ Fast API responses
- 🛡️ Error handling and status indicators
- 🎨 Modern gradient UI design

## Architecture

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **AI Service**: EDUHK AIDCEC AI API (GPT-4o-mini)

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- EDUHK AIDCEC AI API key

### Installation

1. **Clone/Download the project**
   ```bash
   cd chatbotMVP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   copy .env.example .env
   ```
   
   Edit the `.env` file and add your EDUHK API key:
   ```
   EDUHK_API_KEY=your_actual_api_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   
   For development (with auto-reload):
   ```bash
   npm run dev
   ```

5. **Access the application**
   - **Development**: `http://localhost:3000`
   - **Production (via Nginx)**: `https://project-1-XX.eduhk.hk/chatbot01/`

## Nginx Configuration

This project is designed to work with a multi-project Nginx setup. The following Nginx configuration handles this application:

```nginx
# Chatbot 01 - Configuration (Pure backend service, frontend provided by backend)
location /chatbot01/ {
    proxy_pass http://127.0.0.1:3000/;  # Forward to local port 3000
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
}

# Handle access without trailing slash
location = /chatbot01 {
    return 301 /chatbot01/;
}
```

### Production Deployment

When deployed behind Nginx, the application:
- Runs on port 3000 (localhost only)
- Serves both frontend and API endpoints
- Is accessible via `https://project-1-XX.eduhk.hk/chatbot01/`
- Automatically handles SSL termination through Nginx

## API Endpoints

### Frontend
- `GET /` - Serves the chat interface

### Backend API
- `GET /api/health` - Health check endpoint
- `POST /api/chat` - Chat with AI
  ```json
  {
    "message": "Your message here"
  }
  ```

## Project Structure

```
chatbotMVP/
├── public/
│   ├── index.html      # Main chat interface
│   ├── style.css       # UI styling
│   └── script.js       # Frontend JavaScript
├── server.js           # Express server
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md          # This file
```

## Configuration

The application can be configured through environment variables:

- `EDUHK_API_KEY` - Your EDUHK AIDCEC AI API key (required)
- `PORT` - Server port (default: 3000)

## Usage

1. Open the application in your web browser
2. Wait for the "Ready to chat!" status
3. Type your message in the input field
4. Press Enter or click Send
5. View the AI response in the chat history

## Troubleshooting

### Common Issues

**"Server unavailable" message:**
- Check if the server is running (`npm start`)
- Verify the server is accessible on the correct port

**"Authentication failed" error:**
- Verify your `EDUHK_API_KEY` is correct in the `.env` file
- Ensure the API key is valid and active

**"Request timeout" error:**
- Check your internet connection
- The EDUHK API service might be temporarily unavailable

### Development

For development mode with automatic restart:
```bash
npm run dev
```

### Logs

Server logs will show:
- API requests and responses
- Error details
- Server startup information

## Security Notes

- Never commit your `.env` file to version control
- Keep your API key secure and don't share it
- The frontend makes requests to your backend only, not directly to EDUHK API

## License

MIT License - feel free to use and modify as needed.

## Support

For issues related to:
- **EDUHK API**: Contact EDUHK AIDCEC support
- **This application**: Check the troubleshooting section above