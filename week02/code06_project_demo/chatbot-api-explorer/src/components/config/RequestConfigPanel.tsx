import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  FormControl, 
  FormLabel, 
  Select, 
  Option, 
  Checkbox, 
  Button, 
  Box,
  Alert
} from '@mui/joy';
import { useAppStore } from '../../stores/appStore';
import { JsonEditor } from '../editors/JsonEditor';
import { API_PROVIDERS } from '../../utils/apiProviders';

export const RequestConfigPanel: React.FC = () => {
  const {
    headers,
    requestBody,
    isStreaming,
    httpMethod,
    selectedProvider,
    messages,
    systemPrompt,
    model,
    setHeaders,
    setRequestBody,
    setStreaming,
    setHttpMethod,
    setMessagesFromRequestBody,
  } = useAppStore();

  const [actualHeadersText, setActualHeadersText] = useState('');
  const [actualBodyText, setActualBodyText] = useState('');
  const [headersError, setHeadersError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [isEditingHeaders, setIsEditingHeaders] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [hasUnsavedHeaderChanges, setHasUnsavedHeaderChanges] = useState(false);
  const [hasUnsavedBodyChanges, setHasUnsavedBodyChanges] = useState(false);

  const currentProvider = API_PROVIDERS[selectedProvider];

  // Safety check: if the selected provider doesn't exist, return early
  if (!currentProvider) {
    return (
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography level="h3" sx={{ mb: 3 }}>
          Request Configuration
        </Typography>
        <Typography level="body-sm">Loading provider configuration...</Typography>
      </Card>
    );
  }

  // Compute actual request headers and body that will be sent
  useEffect(() => {
    if (!isEditingHeaders && !hasUnsavedHeaderChanges) {
      const actualHeaders = {
        ...headers,
        // Any additional computed headers could go here
      };
      setActualHeadersText(JSON.stringify(actualHeaders, null, 2));
    }
  }, [headers, selectedProvider, isEditingHeaders, hasUnsavedHeaderChanges]);

  useEffect(() => {
    if (!isEditingBody && !hasUnsavedBodyChanges) {
      // Only update when requestBody changes from the store (not from chat state changes)
      if (requestBody && Object.keys(requestBody).length > 0) {
        setActualBodyText(JSON.stringify(requestBody, null, 2));
      } else {
        // Initial empty state - build from chat state only once
        const requestMessages = [];
        if (systemPrompt && systemPrompt.trim()) {
          requestMessages.push({ role: 'system', content: systemPrompt });
        }
        
        messages.forEach(msg => {
          requestMessages.push({
            role: msg.role,
            content: msg.content
          });
        });

        const initialBody = {
          model: model || 'gpt-3.5-turbo',
          messages: requestMessages,
          stream: isStreaming,
        };
        setActualBodyText(JSON.stringify(initialBody, null, 2));
      }
    }
  }, [requestBody, selectedProvider, model, isStreaming, isEditingBody, hasUnsavedBodyChanges]);

  const handleHeadersChange = (value: string) => {
    setIsEditingHeaders(true);
    setActualHeadersText(value);
    setHasUnsavedHeaderChanges(true);
    setHeadersError(null);
    setTimeout(() => setIsEditingHeaders(false), 100);
  };

  const handleBodyChange = (value: string) => {
    setIsEditingBody(true);
    setActualBodyText(value);
    setHasUnsavedBodyChanges(true);
    setBodyError(null);
    setTimeout(() => setIsEditingBody(false), 100);
  };

  const saveHeaders = () => {
    try {
      const parsed = JSON.parse(actualHeadersText);
      setHeaders(parsed);
      setHeadersError(null);
      setHasUnsavedHeaderChanges(false);
      alert('Headers saved successfully!');
    } catch (error) {
      setHeadersError('Invalid JSON format');
    }
  };

  const saveBody = () => {
    try {
      const parsed = JSON.parse(actualBodyText);
      setRequestBody(parsed);
      setBodyError(null);
      setHasUnsavedBodyChanges(false);
      
      // Update chat interface messages from request body
      setMessagesFromRequestBody(parsed);
      alert('Request body saved successfully!');
    } catch (error) {
      setBodyError('Invalid JSON format');
    }
  };

  const resetToDefaults = () => {
    if (!currentProvider) return;
    
    const defaultHeaders = {
      ...currentProvider.defaultHeaders,
    };
    const defaultBody = {};
    
    setHeaders(defaultHeaders);
    setRequestBody(defaultBody);
    setActualHeadersText(JSON.stringify(defaultHeaders, null, 2));
    setActualBodyText(JSON.stringify(defaultBody, null, 2));
    setHasUnsavedHeaderChanges(false);
    setHasUnsavedBodyChanges(false);
  };

  const addCommonParameters = () => {
    const commonParams = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
    
    const newBody = {
      ...requestBody,
      ...commonParams,
    };
    
    setRequestBody(newBody);
    setActualBodyText(JSON.stringify(newBody, null, 2));
  };

  const clearChatHistoryFromBody = () => {
    const newBody = { ...requestBody } as any;
    delete newBody.messages;
    
    setRequestBody(newBody);
    setActualBodyText(JSON.stringify(newBody, null, 2));
    setHasUnsavedBodyChanges(false);
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h3">Actual Request Data</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="soft"
            color="neutral"
            size="sm"
            onClick={resetToDefaults}
          >
            Reset Defaults
          </Button>
          <Button
            variant="soft"
            color="primary"
            size="sm"
            onClick={addCommonParameters}
          >
            Add Common Params
          </Button>
          <Button
            variant="soft"
            color="warning"
            size="sm"
            onClick={clearChatHistoryFromBody}
          >
            Clear History
          </Button>
        </Box>
      </Box>

      {/* HTTP Method */}
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>HTTP Method</FormLabel>
        <Select
          value={httpMethod}
          onChange={(_, value) => value && setHttpMethod(value)}
        >
          <Option value="POST">POST</Option>
          <Option value="GET">GET</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>
        <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
          Most chat APIs use POST, but you can change this for custom endpoints
        </Typography>
      </FormControl>

      {/* Streaming Toggle */}
      {currentProvider?.supportsStreaming && (
        <FormControl sx={{ mb: 3 }}>
          <Checkbox
            checked={isStreaming}
            onChange={(e) => setStreaming(e.target.checked)}
            label="Enable Streaming"
          />
          <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
            Stream responses in real-time for faster perceived performance
          </Typography>
        </FormControl>
      )}

      {/* Custom API Streaming Notice */}
      {selectedProvider === 'custom' && (
        <Alert color="warning" variant="soft" sx={{ mb: 3 }}>
          <Typography level="body-sm">
            <strong>Streaming-Only Mode:</strong> Custom APIs will use streaming mode regardless of the toggle above. 
            Make sure your API endpoint supports streaming responses with Server-Sent Events (SSE) format.
          </Typography>
        </Alert>
      )}

      {/* Headers Editor */}
      <Box sx={{ mb: 3 }}>
        <Typography level="title-sm" sx={{ mb: 1 }}>
          Actual Request Headers
        </Typography>
        <Typography level="body-xs" sx={{ mb: 1, color: 'text.secondary' }}>
          These are the exact headers that will be sent with your request.
        </Typography>
        <JsonEditor
          value={actualHeadersText}
          onChange={handleHeadersChange}
          height="150px"
          placeholder='{\n  "Content-Type": "application/json"\n}'
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Button
            variant="solid"
            color={hasUnsavedHeaderChanges ? "warning" : "primary"}
            size="sm"
            onClick={saveHeaders}
          >
            {hasUnsavedHeaderChanges ? "Save Headers JSON *" : "Save Headers JSON"}
          </Button>
          {headersError && (
            <Alert color="danger" size="sm" sx={{ flex: 1, ml: 2 }}>
              {headersError}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Request Body Editor */}
      <Box sx={{ mb: 3 }}>
        <Typography level="title-sm" sx={{ mb: 1 }}>
          Actual Request Body
        </Typography>
        <Typography level="body-xs" sx={{ mb: 1, color: 'text.secondary' }}>
          This is the exact JSON payload that will be sent to the API.
        </Typography>
        <JsonEditor
          value={actualBodyText}
          onChange={handleBodyChange}
          height="250px"
          placeholder='{\n  "model": "gpt-3.5-turbo",\n  "messages": [],\n  "temperature": 0.7\n}'
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Button
            variant="solid"
            color={hasUnsavedBodyChanges ? "warning" : "success"}
            size="sm"
            onClick={saveBody}
          >
            {hasUnsavedBodyChanges ? "Save Body JSON *" : "Save Body JSON"}
          </Button>
          {bodyError && (
            <Alert color="danger" size="sm" sx={{ flex: 1, ml: 2 }}>
              {bodyError}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Help Text */}
      <Alert color="primary" variant="soft">
        <Typography level="body-sm">
          <strong>Configuration Tips:</strong>
          <br />• <strong>Headers:</strong> Configure authentication, content type, and custom headers for your API
          <br />• <strong>Request Body:</strong> Customize parameters like temperature, max_tokens, etc.
          <br />• <strong>Chat History:</strong> Control whether to include conversation context in requests
          <br />• <strong>Custom APIs:</strong> For custom endpoints, ensure your request format matches the expected API schema
          <br />• <strong>Streaming-Only APIs:</strong> Custom APIs will automatically use streaming mode regardless of the streaming toggle
        </Typography>
      </Alert>
    </Card>
  );
};
