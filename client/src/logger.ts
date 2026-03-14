// This is a mock logger to satisfy test imports.
// A real implementation would use a library like Winston or Pino.
export const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.log,
};