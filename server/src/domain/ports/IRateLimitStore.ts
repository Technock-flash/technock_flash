export interface IRateLimitStore {
  get(key: string): Promise<{ count: number; resetAt: number } | null>;
  set(key: string, count: number, windowMs: number): Promise<void>;
  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}
