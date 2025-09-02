# 🧪 Jest `expect()` Function Cheat Sheet for TypeScript Testing

## 📋 **Basic Syntax**

```typescript
expect(actualValue).matcher(expectedValue);
```

## 🎯 **Core Matchers**

### **Equality Matchers**

```typescript
// Exact equality (checks reference for objects)
expect(2 + 2).toBe(4);
expect(true).toBe(true);
expect('hello').toBe('hello');

// Deep equality (checks content for objects/arrays)
expect({ name: 'John', age: 30 }).toEqual({ name: 'John', age: 30 });
expect([1, 2, 3]).toEqual([1, 2, 3]);

// Not equal
expect(2 + 2).not.toBe(5);
expect({ a: 1 }).not.toEqual({ a: 2 });
```

### **Truthiness Matchers**

```typescript
// Truthy/Falsy
expect(true).toBeTruthy();
expect('hello').toBeTruthy();  // Non-empty strings are truthy
expect(1).toBeTruthy();        // Non-zero numbers are truthy

expect(false).toBeFalsy();
expect('').toBeFalsy();        // Empty string is falsy
expect(0).toBeFalsy();         // Zero is falsy
expect(null).toBeFalsy();
expect(undefined).toBeFalsy();

// Specific null/undefined checks
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect('hello').toBeDefined();
```

### **Number Matchers**

```typescript
// Comparison
expect(2 + 2).toBeGreaterThan(3);
expect(2 + 2).toBeGreaterThanOrEqual(4);
expect(2 + 2).toBeLessThan(5);
expect(2 + 2).toBeLessThanOrEqual(4);

// Floating point numbers
expect(0.1 + 0.2).toBeCloseTo(0.3);  // Use for floating point precision
```

### **String Matchers**

```typescript
// Contains substring
expect('Hello World').toContain('World');
expect('Hello World').toContain('Hello');

// Regex matching
expect('Hello123').toMatch(/\d+/);          // Contains digits
expect('hello@email.com').toMatch(/\w+@\w+\.\w+/);  // Email pattern

// Case-insensitive checks (custom approach)
expect('HELLO WORLD'.toLowerCase()).toContain('world');
```

### **Array/Object Matchers**

```typescript
// Array contains item
expect(['apple', 'banana', 'orange']).toContain('banana');

// Array length
expect([1, 2, 3]).toHaveLength(3);

// Object properties
expect({ name: 'John', age: 30 }).toHaveProperty('name');
expect({ name: 'John', age: 30 }).toHaveProperty('name', 'John');

// Array containing object
expect([
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
]).toContainEqual({ id: 1, name: 'John' });
```

### **Type Matchers**

```typescript
// Check specific types
expect('hello').toEqual(expect.any(String));
expect(123).toEqual(expect.any(Number));
expect(true).toEqual(expect.any(Boolean));
expect(new Date()).toEqual(expect.any(Date));
expect([]).toEqual(expect.any(Array));
expect({}).toEqual(expect.any(Object));

// Check constructor type
expect(new Date()).toBeInstanceOf(Date);
expect([]).toBeInstanceOf(Array);
```

## 🔄 **Function Testing Matchers**

### **Function Calls (Mocks/Spies)**

```typescript
const mockFn = jest.fn();

// Call the function
mockFn('arg1', 'arg2');
mockFn('arg3');

// Check if called
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);

// Check call arguments
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('arg3');
expect(mockFn).toHaveBeenNthCalledWith(1, 'arg1', 'arg2');
```

### **Return Values**

```typescript
const mockFn = jest.fn();
mockFn.mockReturnValue('hello');

expect(mockFn()).toBe('hello');
expect(mockFn).toHaveReturnedWith('hello');
```

### **Thrown Errors**

```typescript
const throwError = () => {
  throw new Error('Something went wrong');
};

expect(throwError).toThrow();
expect(throwError).toThrow('Something went wrong');
expect(throwError).toThrow(/went wrong/);
```

## 🌐 **React Testing Library DOM Matchers**

**(Requires @testing-library/jest-dom)**

### **Element Presence**

```typescript
import { render, screen } from '@testing-library/react';

// Element exists in DOM
expect(screen.getByText('Hello')).toBeInTheDocument();
expect(screen.queryByText('Missing')).not.toBeInTheDocument();

// Element visibility
expect(screen.getByText('Visible Text')).toBeVisible();
```

### **Element Attributes**

```typescript
// Class names
expect(element).toHaveClass('btn');
expect(element).toHaveClass('btn', 'btn-primary');

// Attributes
expect(input).toHaveAttribute('placeholder', 'Enter text');
expect(input).toHaveAttribute('disabled');

// Values
expect(input).toHaveValue('hello');
expect(input).toHaveDisplayValue('hello');
```

### **Form Elements**

```typescript
// Input states
expect(checkbox).toBeChecked();
expect(input).toBeDisabled();
expect(input).toBeEnabled();
expect(select).toHaveValue('option1');

// Focus
expect(input).toHaveFocus();
```

## 🎯 **Common TDD Patterns**

### **Chatbot Response Testing**

```typescript
it('should respond to greeting', () => {
  const response = getBotResponse('hello');
  
  // Check response exists and has content
  expect(response).toBeDefined();
  expect(response.text).toBeDefined();
  expect(response.text.length).toBeGreaterThan(0);
  
  // Check specific content
  expect(response.text).toContain('Hello');
  expect(response.text.toLowerCase()).toContain('chatbot');
  
  // Check response timing
  expect(response.delay).toBeGreaterThan(0);
  expect(response.delay).toBeLessThan(3000);
});
```

### **Component Props Testing**

```typescript
it('should render with correct props', () => {
  const message = {
    id: '1',
    text: 'Hello World',
    sender: 'user' as const,
    timestamp: new Date()
  };
  
  render(<MessageComponent message={message} />);
  
  // Check rendered content
  expect(screen.getByText('Hello World')).toBeInTheDocument();
  expect(screen.getByText('user')).toBeInTheDocument();
  
  // Check CSS classes
  expect(screen.getByTestId('message')).toHaveClass('message', 'message--user');
});
```

### **User Interaction Testing**

```typescript
it('should handle user input', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  
  render(<ChatInput onSubmit={onSubmit} />);
  
  const input = screen.getByPlaceholderText('Type message...');
  const button = screen.getByRole('button', { name: /send/i });
  
  // Initial state
  expect(button).toBeDisabled();
  
  // Type message
  await user.type(input, 'Hello');
  
  // Button should be enabled
  expect(button).toBeEnabled();
  expect(input).toHaveValue('Hello');
  
  // Submit form
  await user.click(button);
  
  // Check function was called
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith('Hello');
});
```

## 🔄 **Async Testing**

### **Promises**

```typescript
// Resolving promises
await expect(fetchData()).resolves.toEqual({ data: 'success' });

// Rejecting promises
await expect(fetchDataThatFails()).rejects.toThrow('Network error');
```

### **Waiting for Elements**

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

## 🎨 **Custom Matchers**

### **Creating Custom Matchers**

```typescript
// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEmail(): R;
    }
  }
}

expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
      pass,
    };
  },
});

// Usage
expect('test@example.com').toBeValidEmail();
```

## 📝 **Best Practices**

### **Descriptive Test Messages**

```typescript
// ❌ Poor description
expect(result).toBe(true);

// ✅ Good description with context
expect(isValidMessage(message)).toBe(true); // Message validation should pass
```

### **Multiple Assertions**

```typescript
it('should create a properly formatted message', () => {
  const result = formatMessage('Hello', 'user');
  
  // Group related assertions
  expect(result).toEqual(expect.objectContaining({
    text: 'Hello',
    sender: 'user',
    timestamp: expect.any(Date),
    id: expect.any(String)
  }));
  
  // Additional specific checks
  expect(result.id).toMatch(/^\d+-[a-z0-9]+$/); // Timestamp + random string format
});
```

### **Error Testing**

```typescript
it('should handle invalid input gracefully', () => {
  // Test various invalid inputs
  expect(() => formatMessage('', 'user')).toThrow('Text cannot be empty');
  expect(() => formatMessage('Hello', '')).toThrow('Sender cannot be empty');
  expect(() => formatMessage('Hello', 'invalid')).toThrow('Sender must be user or bot');
});
```

## 🚀 **Quick Reference**

| **Pattern** | **Use Case** |
|-------------|--------------|
| `.toBe()` | Primitive values, exact equality |
| `.toEqual()` | Objects, arrays, deep equality |
| `.toContain()` | Arrays, strings contain item/substring |
| `.toHaveLength()` | Arrays, strings length check |
| `.toBeGreaterThan()` | Number comparisons |
| `.toMatch()` | String regex patterns |
| `.toThrow()` | Function throws error |
| `.toHaveBeenCalled()` | Mock function was called |
| `.toBeInTheDocument()` | DOM element exists (RTL) |
| `.toHaveClass()` | DOM element has CSS class (RTL) |

---

💡 **Pro Tip**: Always use the most specific matcher possible for clearer error messages and better test intent!
