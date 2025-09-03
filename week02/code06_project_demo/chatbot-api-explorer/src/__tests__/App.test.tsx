import { render, screen } from '@testing-library/react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import App from '../App';

// Mock the child components
jest.mock('../components/config/ApiConfigPanel', () => ({
  ApiConfigPanel: () => <div data-testid="api-config-panel">API Config Panel</div>,
}));

jest.mock('../components/config/RequestConfigPanel', () => ({
  RequestConfigPanel: () => <div data-testid="request-config-panel">Request Config Panel</div>,
}));

jest.mock('../components/chat/ChatInterface', () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat Interface</div>,
}));

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: () => <div data-testid="monaco-editor">Monaco Editor</div>,
}));

// Mock crypto-js
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn().mockReturnValue({ toString: () => 'encrypted-value' }),
    decrypt: jest.fn().mockReturnValue({ toString: () => 'decrypted-value' }),
  },
  enc: {
    Utf8: 'utf8',
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

describe('App', () => {
  test('renders main heading', () => {
    renderWithProviders(<App />);
    
    const heading = screen.getByText('AI Chat Bot API Explorer');
    expect(heading).toBeInTheDocument();
  });

  test('renders subtitle', () => {
    renderWithProviders(<App />);
    
    const subtitle = screen.getByText('Investigate and test various LLM/Multimodal APIs with full customization');
    expect(subtitle).toBeInTheDocument();
  });

  test('renders technology info', () => {
    renderWithProviders(<App />);
    
    const techInfo = screen.getByText('Built with Vite + React + TypeScript');
    expect(techInfo).toBeInTheDocument();
  });

  test('renders API config panel', () => {
    renderWithProviders(<App />);
    
    const apiConfigPanel = screen.getByTestId('api-config-panel');
    expect(apiConfigPanel).toBeInTheDocument();
  });

  test('renders request config panel', () => {
    renderWithProviders(<App />);
    
    const requestConfigPanel = screen.getByTestId('request-config-panel');
    expect(requestConfigPanel).toBeInTheDocument();
  });

  test('renders chat interface', () => {
    renderWithProviders(<App />);
    
    const chatInterface = screen.getByTestId('chat-interface');
    expect(chatInterface).toBeInTheDocument();
  });

  test('renders footer text', () => {
    renderWithProviders(<App />);
    
    const footerText = screen.getByText('AI Chat Bot API Explorer - A comprehensive tool for testing LLM APIs');
    expect(footerText).toBeInTheDocument();
  });
});
