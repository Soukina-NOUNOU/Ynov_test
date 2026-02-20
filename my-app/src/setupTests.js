// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress console.error during tests to reduce noise in CI/CD logs
// Tests that need to verify console.error calls should spy on it explicitly
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Only suppress specific API error messages that are expected in integration tests
    if (args[0]?.includes('Error loading users from API:') || 
        args[0]?.includes('Error saving user to API:')) {
      return; // Suppress these expected error logs
    }
    originalError.call(console, ...args); // Keep other error logs
  };
});

afterAll(() => {
  console.error = originalError;
});
