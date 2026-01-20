/**
 * Jest Setup File
 * Configure testing environment and global mocks
 */

import '@testing-library/jest-dom';

// Mock window.require for Electron
(global as any).window = {
  ...global.window,
  require: jest.fn().mockReturnValue(undefined),
};

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)),
}));
