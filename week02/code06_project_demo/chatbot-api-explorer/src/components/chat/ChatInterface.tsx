import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Textarea, 
  Button, 
  Box, 
  Avatar, 
  Alert,
  CircularProgress
} from '@mui/joy';
import { useAppStore } from '../../stores/appStore';
import { ApiService } from '../../services/apiService';
import type { Message } from '../../types';

export const ChatInterface: React.FC = () => {
  const {
    messages,
    systemPrompt,
    isLoading,
    error,
    endpoint,
    headers,
    model,
    isStreaming,
    addMessage,
    clearMessages,
    setSystemPrompt,
    setLoading,
    setError,
    setLastApiResponse,
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      if (isStreaming) {
        // Handle streaming response
        let assistantContent = '';
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        
        addMessage(assistantMessage);

        await ApiService.handleStreamingResponse(
          endpoint,
          headers,
          messages.concat(userMessage), // Include the user message we just added
          systemPrompt,
          model,
          (chunk: string) => {
            assistantContent += chunk;
            // Update the assistant message with accumulated content
            assistantMessage.content = assistantContent;
            // Note: In a real implementation, you'd want to update the message in the store
            // For now, this will show the final content when streaming completes
          },
          (apiResponse) => {
            // Update the final message content
            assistantMessage.content = assistantContent;
            setLastApiResponse(apiResponse);
            setLoading(false);
          },
          (error, apiResponse) => {
            setError(error);
            setLastApiResponse(apiResponse);
            setLoading(false);
          }
        );
      } else {
        // Handle regular response
        const { response: content, apiResponse } = await ApiService.sendChatCompletion(
          endpoint,
          headers,
          messages.concat(userMessage), // Include the user message we just added
          systemPrompt,
          model,
          false
        );

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: new Date(),
        };

        addMessage(assistantMessage);
        setLastApiResponse(apiResponse);
        setLoading(false);
      }
    } catch (err: any) {
      if (err.apiResponse) {
        setLastApiResponse(err.apiResponse);
        setError(err.error || 'API request failed');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography level="h3">Chat Interface</Typography>
          <Button
            variant="soft"
            color="danger"
            size="sm"
            onClick={clearMessages}
          >
            Clear Chat
          </Button>
        </Box>
        
        {/* System Prompt */}
        <Box>
          <Typography level="title-sm" sx={{ mb: 1 }}>
            System Prompt
          </Typography>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter system prompt..."
            minRows={2}
            maxRows={4}
          />
        </Box>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography level="body-md" sx={{ color: 'text.tertiary' }}>
              No messages yet. Start a conversation!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{ 
                  display: 'flex', 
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  gap: 2
                }}
              >
                <Avatar
                  size="sm"
                  sx={{ 
                    bgcolor: message.role === 'user' ? 'primary.500' : 'neutral.500',
                    color: 'white'
                  }}
                >
                  {message.role === 'user' ? 'U' : 'A'}
                </Avatar>
                <Box
                  sx={{
                    maxWidth: '70%',
                    bgcolor: message.role === 'user' ? 'primary.50' : 'neutral.50',
                    p: 2,
                    borderRadius: 'md',
                  }}
                >
                  <Typography level="body-xs" sx={{ mb: 1, textTransform: 'capitalize', fontWeight: 'bold' }}>
                    {message.role}
                  </Typography>
                  <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
        
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Avatar size="sm" sx={{ bgcolor: 'neutral.500', color: 'white' }}>A</Avatar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'neutral.50', borderRadius: 'md' }}>
              <CircularProgress size="sm" />
              <Typography level="body-sm">Thinking...</Typography>
            </Box>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert color="danger" size="sm">
            <Typography level="body-sm">
              <strong>Error:</strong> {error}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Input Area */}
      <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            minRows={1}
            maxRows={3}
            disabled={isLoading}
            sx={{ flex: 1 }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            variant="solid"
            sx={{ alignSelf: 'flex-end' }}
          >
            Send
          </Button>
        </Box>
        <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Box>
    </Card>
  );
};
