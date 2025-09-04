import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Alert,
  Button
} from '@mui/joy';
import { useAppStore } from '../../stores/appStore';
import { JsonEditor } from '../editors/JsonEditor';
import { RequestBodyModal } from '../modals/RequestBodyModal';

export const RequestPreviewPanel: React.FC = () => {
  const {
    endpoint,
    headers,
    model,
    systemPrompt,
    messages,
    isStreaming,
    httpMethod,
  } = useAppStore();

  const [actualHeaders, setActualHeaders] = useState<Record<string, string>>({});
  const [actualBody, setActualBody] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);

  // Generate the actual request data that would be sent
  useEffect(() => {
    // Build actual headers (including computed ones)
    const computedHeaders = {
      ...headers,
      // Add any additional headers that might be computed
    };

    // Build the messages array for the request
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

    // Build actual request body
    const computedBody = {
      model: model || 'gpt-3.5-turbo',
      messages: requestMessages,
      stream: isStreaming,
      // Add common default parameters
      temperature: 0.7,
      max_tokens: 1000,
    };

    setActualHeaders(computedHeaders);
    setActualBody(computedBody);
  }, [endpoint, headers, model, systemPrompt, messages, isStreaming]);

  const formatCurlCommand = () => {
    const headersStr = Object.entries(actualHeaders)
      .map(([key, value]) => `    -H "${key}: ${value}"`)
      .join(' \\\n');
    
    const bodyStr = JSON.stringify(actualBody, null, 2);

    return `curl -X ${httpMethod} "${endpoint}" \\
${headersStr} \\
    -d '${bodyStr}'`;
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h3">
          Request Preview
        </Typography>
        <Button
          variant="solid"
          color="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
        >
          View Full Request
        </Button>
      </Box>

      {/* Request Summary */}
      <Box sx={{ 
        bgcolor: 'background.level1', 
        p: 2, 
        borderRadius: 'sm',
        mb: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm">Method:</Typography>
          <Chip color="primary" size="sm">{httpMethod}</Chip>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm">Endpoint:</Typography>
          <Typography level="body-xs" sx={{ fontFamily: 'monospace', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {endpoint}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm">Streaming:</Typography>
          <Chip color={isStreaming ? 'success' : 'neutral'} size="sm">
            {isStreaming ? 'Enabled' : 'Disabled'}
          </Chip>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm">Messages:</Typography>
          <Chip color="neutral" size="sm">
            {messages.length}{systemPrompt && systemPrompt.trim() ? ' + 1 system' : ''}
          </Chip>
        </Box>
      </Box>

      {/* Actual Headers */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary>
          <Typography level="title-sm">Actual Request Headers</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography level="body-xs" sx={{ mb: 1, color: 'text.secondary' }}>
            These are the exact headers that will be sent with your request.
          </Typography>
          <JsonEditor
            value={JSON.stringify(actualHeaders, null, 2)}
            onChange={() => {}} // Read-only
            height="150px"
            readOnly={true}
          />
        </AccordionDetails>
      </Accordion>

      {/* Actual Request Body */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary>
          <Typography level="title-sm">Actual Request Body</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography level="body-xs" sx={{ mb: 1, color: 'text.secondary' }}>
            This is the exact JSON payload that will be sent to the API.
          </Typography>
          <JsonEditor
            value={JSON.stringify(actualBody, null, 2)}
            onChange={() => {}} // Read-only
            height="300px"
            readOnly={true}
          />
        </AccordionDetails>
      </Accordion>

      {/* cURL Command */}
      <Accordion>
        <AccordionSummary>
          <Typography level="title-sm">Equivalent cURL Command</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography level="body-xs" sx={{ mb: 1, color: 'text.secondary' }}>
            Copy this cURL command to test the same request in your terminal.
          </Typography>
          <Box sx={{ 
            bgcolor: 'background.surface',
            p: 2,
            borderRadius: 'sm',
            fontFamily: 'monospace',
            fontSize: '11px',
            overflow: 'auto',
            border: 1,
            borderColor: 'divider'
          }}>
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {formatCurlCommand()}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Help Text */}
      <Alert color="primary" variant="soft" sx={{ mt: 2 }}>
        <Typography level="body-sm">
          <strong>Live Preview:</strong> This panel shows the exact request that will be sent when you click "Send" in the chat interface. 
          It updates automatically as you change configuration settings.
        </Typography>
      </Alert>

      {/* Request Body Modal */}
      <RequestBodyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        requestBody={actualBody}
        headers={actualHeaders}
        endpoint={endpoint}
        method={httpMethod}
      />
    </Card>
  );
};
