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
    updateMessage,
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

    // Console log the raw input
    console.log('Raw user input:', inputMessage);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    console.log('User message added to store:', userMessage);
    
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      if (isStreaming) {
        console.log('Starting streaming response...');
        
        // Create assistant message placeholder for streaming
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        
        addMessage(assistantMessage);
        console.log('Assistant message placeholder created:', assistantMessage);

        let accumulatedContent = '';

        await ApiService.handleStreamingResponse(
          endpoint,
          headers,
          messages.concat(userMessage), // Include the user message we just added
          systemPrompt,
          model,
          (chunk: string) => {
            console.log('Streaming chunk received:', chunk);
            accumulatedContent += chunk;
            // Update the assistant message with accumulated content
            updateMessage(assistantMessageId, accumulatedContent);
          },
          (apiResponse) => {
            console.log('Streaming completed. Final content:', accumulatedContent);
            console.log('Final API response:', apiResponse);
            setLastApiResponse(apiResponse);
            setLoading(false);
          },
          (error, apiResponse) => {
            console.error('Streaming error:', error);
            console.log('Error API response:', apiResponse);
            setError(error);
            setLastApiResponse(apiResponse);
            setLoading(false);
          }
        );
      } else {
        console.log('Starting non-streaming response...');
        
        // Handle regular response
        const { response: content, apiResponse } = await ApiService.sendChatCompletion(
          endpoint,
          headers,
          messages.concat(userMessage), // Include the user message we just added
          systemPrompt,
          model,
          false
        );

        console.log('Non-streaming response received:', content);
        console.log('API response:', apiResponse);

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
      console.error('Chat completion error:', err);
      
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
    <Card variant="outlined" sx={{ 
      height: '100%', 
      display: 'flex',           // flex
      flexDirection: 'column'    // flex-col - Creates the "sandwich" layout
    }}>
      {/* Header - Fixed at top (no flex-grow, maintains natural height) */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider', 
        flexShrink: 0    // Fixed size - doesn't shrink
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
            minRows={1}
            maxRows={3}
          />
        </Box>
      </Box>

      {/* Messages Area - flex-1 overflow-y-auto (grows and scrolls) */}
      <Box sx={{ 
        flex: 1,                 // flex-1 - Takes up all available space between header and input
        overflow: 'hidden',      // Container doesn't scroll
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0             // Essential for flex child with overflow
      }}>
        <Box sx={{
          flex: 1,               // flex-1 - Grows to fill container
          overflowY: 'auto',     // overflow-y-auto - Scrollable when content exceeds space
          p: 2
        }}>
          {messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography level="body-md" sx={{ color: 'text.tertiary' }}>
                No messages yet. Start a conversation!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                      p: 1.5,
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
              {/* <Avatar size="sm" sx={{ bgcolor: 'neutral.500', color: 'white' }}>A</Avatar> */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'neutral.50', borderRadius: 'md' }}>
                <CircularProgress size="sm" />
                <Typography level="body-sm">Thinking...</Typography>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Error Display - Fixed size when present */}
      {error && (
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <Alert color="danger" size="sm">
            <Typography level="body-sm">
              <strong>Error:</strong> {error}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Input Area - Fixed at bottom (no flex-grow, maintains natural height) */}
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider', 
        flexShrink: 0    // Fixed size - input bar stays visible
      }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
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
