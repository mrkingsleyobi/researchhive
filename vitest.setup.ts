import { beforeAll, afterAll, afterEach } from 'vitest';

// Setup test environment
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.LOGTO_APP_ID = 'test-app';
});

// Cleanup after each test
afterEach(() => {
  // Clear any mocks
  vi.clearAllMocks();
});

// Global cleanup
afterAll(() => {
  // Clean up test database, etc.
});
