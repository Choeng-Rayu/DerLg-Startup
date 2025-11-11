/**
 * Jest Setup File
 * Configures test environment and global test utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'derlg_test';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.API_URL = 'http://localhost:3000';
process.env.FRONTEND_URL = 'http://localhost:3001';

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);

// Mock timers if needed
// jest.useFakeTimers();

export {};

