import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Textarea, 
  Button, 
  Box, 
  Avatar, 
  Alert,
  CircularProgress,
  Checkbox,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from '@mui/joy';
import { useAppStore } from '../../stores/appStore';
import { ApiService } from '../../services/apiService';
import { RequestBodyModal } from '../modals/RequestBodyModal';
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
    requestBody,
    httpMethod,
    selectedProvider,
    addMessage,
    updateMessage,
    clearMessages,
    setSystemPrompt,
    setLoading,
    setError,
    setLastApiResponse,
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const [showRawChunks, setShowRawChunks] = useState(false);
  const [rawChunks, setRawChunks] = useState<string[]>([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [customParser, setCustomParser] = useState(`// Default parser function
function parseChunk(chunk) {
  // Handle different streaming formats
  try {
    // Format 1: Server-Sent Events (OpenAI standard)
    if (chunk.startsWith('data: ')) {
      const data = chunk.slice(6);
      if (data === '[DONE]') return null;
      
      const parsed = JSON.parse(data);
      return parsed.choices?.[0]?.delta?.content || '';
    }
    
    // Format 2: Plain text chunks (Grok, some other APIs)
    // If it's not SSE format and not empty, return as-is
    if (chunk && typeof chunk === 'string' && chunk.trim()) {
      return chunk;
    }
    
    return '';
  } catch (e) {
    console.warn('Parse error:', e);
    // If JSON parsing fails, treat as plain text
    return chunk && typeof chunk === 'string' ? chunk : '';
  }
}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Custom parser function executor
  const executeCustomParser = (chunk: string): string => {
    try {
      // Create a safe function context
      const func = new Function('chunk', `
        ${customParser}
        return parseChunk(chunk);
      `);
      return func(chunk) || '';
    } catch (error) {
      console.error('Custom parser error:', error);
      // Fallback to default parsing
      try {
        // Handle Server-Sent Events format
        if (chunk.startsWith('data: ')) {
          const data = chunk.slice(6);
          if (data === '[DONE]') return '';
          const parsed = JSON.parse(data);
          return parsed.choices?.[0]?.delta?.content || '';
        }
        // Handle plain text chunks (Grok format)
        if (chunk && typeof chunk === 'string' && chunk.trim()) {
          return chunk;
        }
        return '';
      } catch {
        // If all else fails, return as plain text
        return chunk && typeof chunk === 'string' ? chunk : '';
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate preview request body including the current input
  const generatePreviewRequest = () => {
    const requestMessages = [];
    if (systemPrompt && systemPrompt.trim()) {
      requestMessages.push({ role: 'system', content: systemPrompt });
    }
    
    // Add existing messages
    messages.forEach(msg => {
      requestMessages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current input as user message if it exists
    if (inputMessage.trim()) {
      requestMessages.push({
        role: 'user',
        content: inputMessage.trim()
      });
    }

    return {
      model: model || 'gpt-3.5-turbo',
      messages: requestMessages,
      stream: isStreaming,
      temperature: 0.7,
      max_tokens: 1000,
    };
  };

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
    setRawChunks([]); // Clear previous raw chunks

    try {
      // Check if this is a custom API that only supports streaming
      const forceStreaming = selectedProvider === 'custom' || isStreaming;
      
      if (forceStreaming) {
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
            console.log('Raw streaming chunk received:', chunk);
            
            // Store raw chunk
            setRawChunks(prev => [...prev, chunk]);
            
            // Parse chunk using custom parser
            const parsedContent = executeCustomParser(chunk);
            console.log('Parsed content:', parsedContent);
            
            if (parsedContent) {
              accumulatedContent += parsedContent;
              // Update the assistant message with accumulated content
              updateMessage(assistantMessageId, accumulatedContent);
            }
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
          },
          requestBody,
          httpMethod
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
          false,
          requestBody,
          httpMethod
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
        <Box sx={{ mb: 2 }}>
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

        {/* Raw Chunks & Custom Parser Controls */}
        <Box sx={{ mb: 1 }}>
          <Checkbox
            checked={showRawChunks}
            onChange={(e) => setShowRawChunks(e.target.checked)}
            label="Show raw streaming chunks"
            size="sm"
          />
        </Box>

        {/* Custom Parser */}
        <Accordion>
          <AccordionSummary>
            <Typography level="title-sm">Custom Chunk Parser</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography level="body-xs" sx={{ mb: 1, color: 'text.secondary' }}>
              Write a JavaScript function to parse streaming chunks. The function should be named 'parseChunk' and return the text content to display.
            </Typography>
            <Textarea
              value={customParser}
              onChange={(e) => setCustomParser(e.target.value)}
              placeholder="function parseChunk(chunk) { ... }"
              minRows={8}
              maxRows={15}
              sx={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </AccordionDetails>
        </Accordion>
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
                      {message.timestamp instanceof Date 
                        ? message.timestamp.toLocaleTimeString() 
                        : new Date(message.timestamp).toLocaleTimeString()}
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

          {/* Raw Chunks Display */}
          {showRawChunks && rawChunks.length > 0 && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'background.level1', 
              borderRadius: 'md',
              border: 1,
              borderColor: 'divider'
            }}>
              <Typography level="title-sm" sx={{ mb: 1, color: 'warning.600' }}>
                Raw Streaming Chunks ({rawChunks.length})
              </Typography>
              <Box sx={{ 
                maxHeight: '200px', 
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '11px',
                bgcolor: 'background.surface',
                p: 1,
                borderRadius: 'sm'
              }}>
                {rawChunks.map((chunk, index) => (
                  <Box key={index} sx={{ mb: 1, borderBottom: index < rawChunks.length - 1 ? 1 : 0, borderColor: 'divider', pb: 1 }}>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      Chunk {index + 1}:
                    </Typography>
                    <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {chunk}
                    </Typography>
                  </Box>
                ))}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="soft"
              color="neutral"
              size="sm"
              onClick={() => setPreviewModalOpen(true)}
              disabled={isLoading}
            >
              Preview
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              variant="solid"
            >
              Send
            </Button>
          </Box>
        </Box>
        <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Box>

      {/* Preview Request Modal */}
      <RequestBodyModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        requestBody={generatePreviewRequest()}
        headers={headers}
        endpoint={endpoint}
        method="POST"
      />
    </Card>
  );
};
