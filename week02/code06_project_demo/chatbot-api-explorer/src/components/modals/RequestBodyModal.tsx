import React from 'react';
import { 
  Modal, 
  ModalDialog, 
  ModalClose, 
  Typography, 
  Box,
  Button,
  Divider
} from '@mui/joy';
import { JsonEditor } from '../editors/JsonEditor';

interface RequestBodyModalProps {
  open: boolean;
  onClose: () => void;
  requestBody: any;
  headers: Record<string, string>;
  endpoint: string;
  method: string;
}

export const RequestBodyModal: React.FC<RequestBodyModalProps> = ({
  open,
  onClose,
  requestBody,
  headers,
  endpoint,
  method
}) => {
  const formatCurlCommand = () => {
    const headersStr = Object.entries(headers)
      .map(([key, value]) => `  -H "${key}: ${value}"`)
      .join(' \\\n');
    
    const bodyStr = JSON.stringify(requestBody, null, 2);

    return `curl -X ${method} "${endpoint}" \\
${headersStr} \\
  -d '${bodyStr}'`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="outlined"
        role="alertdialog"
        sx={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: '800px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography level="h4" sx={{ mb: 2 }}>
          Actual Request Details
        </Typography>
        <ModalClose />

        {/* Request Summary */}
        <Box sx={{ 
          bgcolor: 'background.level1', 
          p: 2, 
          borderRadius: 'sm',
          mb: 2
        }}>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            <strong>Method:</strong> {method}
          </Typography>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            <strong>Endpoint:</strong> {endpoint}
          </Typography>
          <Typography level="body-sm">
            <strong>Content-Type:</strong> {headers['Content-Type'] || 'application/json'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Request Headers */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography level="title-sm">Request Headers</Typography>
            <Button
              size="sm"
              variant="soft"
              onClick={() => copyToClipboard(JSON.stringify(headers, null, 2))}
            >
              Copy Headers
            </Button>
          </Box>
          <JsonEditor
            value={JSON.stringify(headers, null, 2)}
            onChange={() => {}} // Read-only
            height="120px"
            readOnly={true}
          />
        </Box>

        {/* Request Body */}
        <Box sx={{ mb: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography level="title-sm">Request Body</Typography>
            <Button
              size="sm"
              variant="soft"
              onClick={() => copyToClipboard(JSON.stringify(requestBody, null, 2))}
            >
              Copy Body
            </Button>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <JsonEditor
              value={JSON.stringify(requestBody, null, 2)}
              onChange={() => {}} // Read-only
              height="300px"
              readOnly={true}
            />
          </Box>
        </Box>

        {/* cURL Command */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography level="title-sm">Equivalent cURL Command</Typography>
            <Button
              size="sm"
              variant="soft"
              onClick={() => copyToClipboard(formatCurlCommand())}
            >
              Copy cURL
            </Button>
          </Box>
          <Box sx={{ 
            bgcolor: 'background.surface',
            p: 2,
            borderRadius: 'sm',
            fontFamily: 'monospace',
            fontSize: '11px',
            overflow: 'auto',
            maxHeight: '200px',
            border: 1,
            borderColor: 'divider'
          }}>
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {formatCurlCommand()}
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2 }}>
          <Button variant="soft" onClick={onClose}>
            Close
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};
