import { render, screen } from '@testing-library/react';
import App from './App';

test('renders chatbot input field', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/type your message/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders send button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/send/i);
  expect(buttonElement).toBeInTheDocument();
});

test('renders initial bot message', () => {
  render(<App />);
  const botMessage = screen.getByText(/how can i help/i);
  expect(botMessage).toBeInTheDocument();
});
