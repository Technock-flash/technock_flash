export interface IPasswordResetTokenStore {
  set(email: string, token: string, ttlSeconds: number): Promise<void>;
  get(token: string): Promise<string | null>;
  delete(token: string): Promise<void>;
}
