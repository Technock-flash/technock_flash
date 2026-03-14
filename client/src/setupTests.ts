import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global Mock: Logger
// This prevents you from needing `vi.mock('../../../shared/utils/logger')` in every test file
vi.mock('../../../shared/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// You can also mock browser APIs here (e.g., window.matchMedia, IntersectionObserver)

// Mock Prisma Client since it's a server-side dependency and not available in the client project.
vi.mock('@prisma/client', () => ({
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      constructor(message: string, { code }: { code: string; clientVersion: string }) {
        super(message);
        this.code = code;
      }
    },
  },
}));