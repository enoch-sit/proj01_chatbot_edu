import React, { useState } from 'react';
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
    setHeaders,
    setRequestBody,
    setStreaming,
  } = useAppStore();

  const [headersText, setHeadersText] = useState(JSON.stringify(headers, null, 2));
  const [bodyText, setBodyText] = useState(JSON.stringify(requestBody, null, 2));
  const [headersError, setHeadersError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);

  const currentProvider = API_PROVIDERS[selectedProvider];

  const handleHeadersChange = (value: string) => {
    setHeadersText(value);
    try {
      const parsed = JSON.parse(value);
      setHeaders(parsed);
      setHeadersError(null);
    } catch {
      setHeadersError('Invalid JSON format');
    }
  };

  const handleBodyChange = (value: string) => {
    setBodyText(value);
    try {
      const parsed = JSON.parse(value);
      setRequestBody(parsed);
      setBodyError(null);
    } catch {
      setBodyError('Invalid JSON format');
    }
  };

  const resetToDefaults = () => {
    const defaultHeaders = {
      ...currentProvider.defaultHeaders,
    };
    const defaultBody = {};
    
    setHeaders(defaultHeaders);
    setRequestBody(defaultBody);
    setHeadersText(JSON.stringify(defaultHeaders, null, 2));
    setBodyText(JSON.stringify(defaultBody, null, 2));
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
    setBodyText(JSON.stringify(newBody, null, 2));
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h3">Request Configuration</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
        </Box>
      </Box>

      {/* HTTP Method */}
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>HTTP Method</FormLabel>
        <Select
          value={httpMethod}
          onChange={() => {/* Handle method change */}}
        >
          <Option value="POST">POST</Option>
          <Option value="GET">GET</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>
      </FormControl>

      {/* Streaming Toggle */}
      {currentProvider.supportsStreaming && (
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

      {/* Headers Editor */}
      <Box sx={{ mb: 3 }}>
        <Typography level="title-sm" sx={{ mb: 1 }}>
          Request Headers
        </Typography>
        <JsonEditor
          value={headersText}
          onChange={handleHeadersChange}
          height="150px"
          placeholder='{\n  "Content-Type": "application/json"\n}'
        />
        {headersError && (
          <Alert color="danger" size="sm" sx={{ mt: 1 }}>
            {headersError}
          </Alert>
        )}
      </Box>

      {/* Request Body Editor */}
      <Box sx={{ mb: 3 }}>
        <Typography level="title-sm" sx={{ mb: 1 }}>
          Request Body
        </Typography>
        <JsonEditor
          value={bodyText}
          onChange={handleBodyChange}
          height="250px"
          placeholder='{\n  "model": "gpt-3.5-turbo",\n  "messages": [],\n  "temperature": 0.7\n}'
        />
        {bodyError && (
          <Alert color="danger" size="sm" sx={{ mt: 1 }}>
            {bodyError}
          </Alert>
        )}
      </Box>

      {/* Help Text */}
      <Alert color="primary" variant="soft">
        <Typography level="body-sm">
          <strong>Tip:</strong> The request body will be automatically populated with your messages and system prompt when sending requests. 
          You can add additional parameters here like temperature, max_tokens, etc.
        </Typography>
      </Alert>
    </Card>
  );
};
