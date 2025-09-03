import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JsonEditor } from '../../components/editors/JsonEditor';

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return {
    __esModule: true,
    default: ({ value, onChange, placeholder }: any) => (
      <textarea
        data-testid="monaco-editor"
        value={value || placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
      />
    ),
  };
});

describe('JsonEditor', () => {
  test('renders with default props', () => {
    const mockOnChange = jest.fn();
    render(<JsonEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  test('displays provided value', () => {
    const mockOnChange = jest.fn();
    const testValue = '{"test": "value"}';
    
    render(<JsonEditor value={testValue} onChange={mockOnChange} />);
    
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveValue(testValue);
  });

  test('displays placeholder when value is empty', () => {
    const mockOnChange = jest.fn();
    const testPlaceholder = '{"placeholder": "value"}';
    
    render(<JsonEditor value="" onChange={mockOnChange} placeholder={testPlaceholder} />);
    
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveValue(testPlaceholder);
  });

  test('calls onChange when value changes', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    render(<JsonEditor value="" onChange={mockOnChange} />);
    
    const editor = screen.getByTestId('monaco-editor');
    await user.type(editor, '{{}}"new": "value"{{}}');
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  test('handles read-only mode', () => {
    const mockOnChange = jest.fn();
    
    render(<JsonEditor value="test" onChange={mockOnChange} readOnly={true} />);
    
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });
});
