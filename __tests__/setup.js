// Jest setup file for global test configuration

// Suppress console output during tests unless explicitly testing it
const originalConsole = { ...console };

beforeEach(() => {
  // Only suppress if not explicitly testing console output
  if (!expect.getState().currentTestName?.includes('console') && 
      !expect.getState().currentTestName?.includes('output')) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
});

afterEach(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(15000);

// Clean up any test artifacts
afterAll(async () => {
  // Any global cleanup can go here
});