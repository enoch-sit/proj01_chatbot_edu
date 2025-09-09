import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  FormControl, 
  FormLabel, 
  Select, 
  Option, 
  Input, 
  Box,
  Chip,
  Checkbox,
  IconButton
} from '@mui/joy';
import { useAppStore } from '../../stores/appStore';
import { API_PROVIDERS, getProviderEndpoint, getAuthHeader } from '../../utils/apiProviders';

export const ApiConfigPanel: React.FC = () => {
  const [useCustomModel, setUseCustomModel] = useState(true); // Default to true
  const [customModelName, setCustomModelName] = useState(''); // Will be set based on provider
  const [showApiKey, setShowApiKey] = useState(false); // State for showing/hiding API key
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

  // Initialize custom model name based on current provider on mount
  useEffect(() => {
    if (!customModelName && selectedProvider) {
      const defaultCustomModel = getDefaultCustomModel(selectedProvider);
      setCustomModelName(defaultCustomModel);
    }
  }, []); // Run only on mount

  // Get default custom model based on provider
  const getDefaultCustomModel = (providerId: string): string => {
    switch (providerId) {
      case 'grok':
        return 'grok-3-mini';
      case 'huggingface':
        return 'meta-llama/Llama-3.1-8B-Instruct:cerebras';
      case 'custom':
        return '';
      default:
        return '';
    }
  };

  // Ensure provider configuration is up to date on mount (only for non-custom providers)
  useEffect(() => {
    if (selectedProvider && selectedProvider !== 'custom' && currentProvider) {
      // Set custom model name based on provider if not already set
      if (!customModelName) {
        const defaultCustomModel = getDefaultCustomModel(selectedProvider);
        setCustomModelName(defaultCustomModel);
      }
      
      // Update endpoint to current provider configuration
      const currentEndpoint = getProviderEndpoint(selectedProvider);
      if (endpoint !== currentEndpoint) {
        setEndpoint(currentEndpoint);
      }
      
      // Update model to current provider default if not using custom
      if (!useCustomModel && model !== currentProvider.defaultModel) {
        setModel(currentProvider.defaultModel);
      }
    }
  }, [selectedProvider, currentProvider, model, useCustomModel, customModelName, setEndpoint, setModel]);

  const handleProviderChange = (providerId: string) => {
    setProvider(providerId);
    const provider = API_PROVIDERS[providerId];
    
    // Only set endpoint for non-custom providers
    if (providerId !== 'custom') {
      setEndpoint(getProviderEndpoint(providerId));
      
      // Set the custom model name based on the new provider
      const defaultCustomModel = getDefaultCustomModel(providerId);
      setCustomModelName(defaultCustomModel);
      setModel(defaultCustomModel);
      
      // Keep custom model state as default
      setUseCustomModel(true);
    } else {
      // For custom provider, clear the model field and endpoint to let user set manually
      setModel('');
      setCustomModelName('');
      setUseCustomModel(false);
      setEndpoint(''); // Clear the endpoint for fresh start
    }
    
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
    if (selectedProvider !== 'custom') {
      setEndpoint(getProviderEndpoint(selectedProvider));
    }
    setUseCustomModel(false); // Reset custom model when selecting from dropdown
  };

  const handleCustomModelToggle = () => {
    const newUseCustom = !useCustomModel;
    setUseCustomModel(newUseCustom);
    
    if (newUseCustom) {
      // When enabling custom model, clear the current model or set to custom name
      if (customModelName) {
        setModel(customModelName);
        if (selectedProvider !== 'custom') {
          setEndpoint(getProviderEndpoint(selectedProvider));
        }
      }
    } else {
      // When disabling custom model, revert to default model
      const defaultModel = currentProvider.defaultModel;
      setModel(defaultModel);
      if (selectedProvider !== 'custom') {
        setEndpoint(getProviderEndpoint(selectedProvider));
      }
    }
  };

  const handleCustomModelNameChange = (name: string) => {
    setCustomModelName(name);
    if (useCustomModel) {
      setModel(name);
      if (selectedProvider !== 'custom') {
        setEndpoint(getProviderEndpoint(selectedProvider));
      }
    }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Enter your API key"
              sx={{ flex: 1 }}
            />
            <IconButton
              variant="outlined"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? "😊" : "🫣"}
            </IconButton>
          </Box>
        </FormControl>
      )}

      {/* Model Selection - Hidden for Custom API */}
      {selectedProvider !== 'custom' && (
        <Box sx={{ mb: 2 }}>
          <FormLabel sx={{ mb: 1 }}>Model</FormLabel>
          
          {/* Custom Model Toggle */}
          <Box sx={{ mb: 2 }}>
            <Checkbox
              checked={useCustomModel}
              onChange={handleCustomModelToggle}
              label="Use custom model name"
              size="sm"
            />
          </Box>

          {useCustomModel ? (
            <FormControl>
              <Input
                value={customModelName}
                onChange={(e) => handleCustomModelNameChange(e.target.value)}
                placeholder="Enter custom model name (e.g., gpt-4-custom, claude-custom)"
              />
            </FormControl>
          ) : (
            <FormControl>
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
          )}
          
          {useCustomModel && (
            <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
              Enter any model name supported by your selected provider
            </Typography>
          )}
        </Box>
      )}

      {/* Custom API Model Input */}
      {selectedProvider === 'custom' && (
        <Box sx={{ mb: 2 }}>
          <FormLabel sx={{ mb: 1 }}>Model (Optional)</FormLabel>
          <FormControl>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Enter model name (optional - some APIs don't require this)"
            />
          </FormControl>
          <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
            Leave empty if your API doesn't require a model parameter, or enter the model name expected by your API
          </Typography>
        </Box>
      )}

      {/* Endpoint */}
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Endpoint URL</FormLabel>
        <Input
          type="url"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder={selectedProvider === 'custom' ? 'Enter your custom API endpoint (e.g., https://api.openai.com/v1/chat/completions)' : 'API endpoint URL'}
          readOnly={selectedProvider !== 'custom'}
        />
        <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
          {selectedProvider === 'custom' 
            ? 'Enter your custom API endpoint. This is the full URL where your API requests will be sent.' 
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm">Custom Models:</Typography>
          <Chip 
            color="primary" 
            size="sm"
          >
            Supported
          </Chip>
        </Box>
      </Box>
      
      {/* Custom Model Info */}
      {useCustomModel && (
        <Box sx={{ 
          bgcolor: 'primary.50', 
          p: 2, 
          borderRadius: 'sm',
          mt: 2
        }}>
          <Typography level="body-sm" sx={{ color: 'primary.700' }}>
            <strong>Custom Model Mode:</strong> You can enter any model name supported by your provider. 
            Make sure the model exists and is accessible with your API key.
          </Typography>
        </Box>
      )}

      {/* Custom API Help */}
      {selectedProvider === 'custom' && (
        <Box sx={{ 
          bgcolor: 'warning.50', 
          p: 2, 
          borderRadius: 'sm',
          mt: 2
        }}>
          <Typography level="body-sm" sx={{ color: 'warning.700' }}>
            <strong>Custom API Configuration:</strong>
            <br />• <strong>Manual Setup:</strong> You have full control over endpoint URL, headers, and request body
            <br />• <strong>Endpoint:</strong> Enter your complete API endpoint URL (e.g., https://api.example.com/v1/chat)
            <br />• <strong>Headers:</strong> Configure authentication and content type in Request Configuration
            <br />• <strong>Request Body:</strong> Customize the entire request structure to match your API
            <br />• <strong>Model:</strong> Optional - only include if your API requires a model parameter
            <br />• <strong>Testing:</strong> Use the chat history controls to test different request formats
          </Typography>
        </Box>
      )}
    </Card>
  );
};
