// ⚙️ Step 3: Jest Configuration for TDD Environment
// Jest configuration for React TypeScript project
export default {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest', //preset: predefined set of configuration settings 
  // Use jsdom to simulate browser environment for React components
  testEnvironment: 'jsdom',
  // Run setup file after Jest environment is set up
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // Mock CSS imports so tests don't break on style imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Transform TypeScript and TSX files using ts-jest
  
  transform: { //  This key defines how Jest should process files that aren?�t plain JavaScript?�like TypeScript or JSX?�before testing them.
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json'  // Use Jest-specific TypeScript config
    }],
//     - **`'^.+\\.tsx?$'`**  
//   This is a **regular expression** that matches:
//   - Any file ending in `.ts` or `.tsx`
//   - The `x?` means the `x` is optional, so it matches both `.ts` and `.tsx`
  },
  // Define where Jest should look for test files
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}', // Tests in __tests__ folders
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',  // Files ending with .test or .spec
  ],
  // Collect coverage from these files
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',     // Include all TypeScript files
    '!src/**/*.d.ts',        // Exclude type definition files
    '!src/main.tsx',         // Exclude entry point
    '!src/vite-env.d.ts',    // Exclude Vite environment types
  ],
};
