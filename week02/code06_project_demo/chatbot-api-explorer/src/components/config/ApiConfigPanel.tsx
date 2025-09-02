import React from 'react';
import { 
  Card, 
  Typography, 
  FormControl, 
  FormLabel, 
  Select, 
  Option, 
  Input, 
  Box,
  Chip
} from '@mui/joy';
import { useAppStore } from '../../stores/appStore';
import { API_PROVIDERS, getProviderEndpoint, getAuthHeader } from '../../utils/apiProviders';

export const ApiConfigPanel: React.FC = () => {
  const {
    selectedProvider,
    apiKey,
    endpoint,
    model,
    headers,
    setProvider,
    setApiKey,
    setEndpoint,
    setModel,
    setHeaders,
  } = useAppStore();

  const currentProvider = API_PROVIDERS[selectedProvider];

  const handleProviderChange = (providerId: string) => {
    setProvider(providerId);
    const provider = API_PROVIDERS[providerId];
    setEndpoint(getProviderEndpoint(providerId, provider.defaultModel));
    setModel(provider.defaultModel);
    
    // Update headers with provider defaults and auth
    const authHeaders = apiKey ? getAuthHeader(providerId, apiKey) : {};
    setHeaders({
      ...provider.defaultHeaders,
      ...authHeaders,
    });
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    
    // Update auth headers when API key changes
    if (key) {
      const authHeaders = getAuthHeader(selectedProvider, key);
      setHeaders({
        ...headers,
        ...authHeaders,
      });
    } else {
      // Remove auth headers when key is cleared
      const newHeaders = { ...headers };
      delete newHeaders.Authorization;
      delete newHeaders['x-api-key'];
      setHeaders(newHeaders);
    }
  };

  const handleModelChange = (selectedModel: string) => {
    setModel(selectedModel);
    setEndpoint(getProviderEndpoint(selectedProvider, selectedModel));
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Typography level="h3" sx={{ mb: 3 }}>
        API Configuration
      </Typography>
      
      {/* Provider Selection */}
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Provider</FormLabel>
        <Select
          value={selectedProvider}
          onChange={(_, value) => value && handleProviderChange(value)}
        >
          {Object.values(API_PROVIDERS).map((provider) => (
            <Option key={provider.id} value={provider.id}>
              {provider.name}
            </Option>
          ))}
        </Select>
      </FormControl>

      {/* API Key */}
      {currentProvider.requiresAuth && (
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>API Key</FormLabel>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="Enter your API key"
          />
        </FormControl>
      )}

      {/* Model Selection */}
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Model</FormLabel>
        <Select
          value={model}
          onChange={(_, value) => value && handleModelChange(value)}
        >
          {currentProvider.models.map((modelName) => (
            <Option key={modelName} value={modelName}>
              {modelName}
            </Option>
          ))}
        </Select>
      </FormControl>

      {/* Endpoint */}
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Endpoint URL</FormLabel>
        <Input
          type="url"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="API endpoint URL"
          readOnly={selectedProvider !== 'custom'}
        />
        <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
          {selectedProvider === 'custom' 
            ? 'Enter your custom API endpoint' 
            : 'Endpoint is automatically set based on provider and model'
          }
        </Typography>
      </FormControl>

      {/* Provider Info */}
      <Box sx={{ 
        bgcolor: 'background.level1', 
        p: 2, 
        borderRadius: 'sm',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm">Streaming Support:</Typography>
          <Chip 
            color={currentProvider.supportsStreaming ? 'success' : 'danger'} 
            size="sm"
          >
            {currentProvider.supportsStreaming ? 'Yes' : 'No'}
          </Chip>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm">Authentication:</Typography>
          <Chip 
            color={currentProvider.requiresAuth ? 'warning' : 'neutral'} 
            size="sm"
          >
            {currentProvider.requiresAuth ? 'Required' : 'Optional'}
          </Chip>
        </Box>
      </Box>
    </Card>
  );
};
