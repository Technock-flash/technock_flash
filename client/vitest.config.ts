import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Enables describe, it, expect without imports
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: false, // Disables CSS parsing for faster tests
  },
});