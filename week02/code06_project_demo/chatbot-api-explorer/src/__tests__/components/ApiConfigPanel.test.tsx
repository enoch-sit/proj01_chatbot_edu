import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { ApiConfigPanel } from '../../components/config/ApiConfigPanel';

// Mock the app store
const mockSetProvider = jest.fn();
const mockSetApiKey = jest.fn();
const mockSetEndpoint = jest.fn();
const mockSetModel = jest.fn();
const mockSetHeaders = jest.fn();

jest.mock('../../stores/appStore', () => ({
  useAppStore: () => ({
    selectedProvider: 'openai',
    apiKey: '',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    headers: { 'Content-Type': 'application/json' },
    setProvider: mockSetProvider,
    setApiKey: mockSetApiKey,
    setEndpoint: mockSetEndpoint,
    setModel: mockSetModel,
    setHeaders: mockSetHeaders,
  }),
}));

// Mock crypto-js
jest.mock('crypto-js', () => ({
  __esModule: true,
  default: {
    AES: {
      encrypt: jest.fn().mockReturnValue({ toString: () => 'encrypted-value' }),
      decrypt: jest.fn().mockReturnValue({ toString: () => 'decrypted-value' }),
    },
    enc: {
      Utf8: 'utf8',
    },
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <CssVarsProvider>
      <CssBaseline />
      {component}
    </CssVarsProvider>
  );
};

describe('ApiConfigPanel Custom Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders custom model checkbox', () => {
    renderWithProviders(<ApiConfigPanel />);
    
    expect(screen.getByLabelText('Use custom model name')).toBeInTheDocument();
  });

  test('shows custom model input when checkbox is checked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApiConfigPanel />);
    
    const customModelCheckbox = screen.getByLabelText('Use custom model name');
    await user.click(customModelCheckbox);
    
    expect(screen.getByPlaceholderText(/Enter custom model name/)).toBeInTheDocument();
    expect(screen.getByText(/Enter any model name supported by your selected provider/)).toBeInTheDocument();
  });

  test('shows dropdown when custom model is not selected', () => {
    renderWithProviders(<ApiConfigPanel />);
    
    // Should show the select dropdown for predefined models (find the model dropdown specifically)
    const comboboxes = screen.getAllByRole('combobox');
    const modelCombobox = comboboxes.find(cb => cb.textContent?.includes('gpt-3.5-turbo'));
    expect(modelCombobox).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Enter custom model name/)).not.toBeInTheDocument();
  });

  test('calls setModel when custom model name is entered', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApiConfigPanel />);
    
    // Enable custom model
    const customModelCheckbox = screen.getByLabelText('Use custom model name');
    await user.click(customModelCheckbox);
    
    // Enter custom model name
    const customModelInput = screen.getByPlaceholderText(/Enter custom model name/);
    await user.type(customModelInput, 'my-custom-model');
    
    await waitFor(() => {
      expect(mockSetModel).toHaveBeenCalledWith('my-custom-model');
    });
  });

  test('shows custom model info when custom model is enabled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApiConfigPanel />);
    
    const customModelCheckbox = screen.getByLabelText('Use custom model name');
    await user.click(customModelCheckbox);
    
    expect(screen.getByText(/Custom Model Mode:/)).toBeInTheDocument();
    expect(screen.getByText(/You can enter any model name supported by your provider/)).toBeInTheDocument();
  });

  test('shows "Custom Models: Supported" in provider info', () => {
    renderWithProviders(<ApiConfigPanel />);
    
    expect(screen.getByText('Custom Models:')).toBeInTheDocument();
    expect(screen.getByText('Supported')).toBeInTheDocument();
  });
});
