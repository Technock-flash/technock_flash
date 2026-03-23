import type { IPasswordResetTokenStore } from "../../domain/repositories/IPasswordResetTokenStore";

const store = new Map<string, { email: string; expiry: number }>();
const PREFIX = "password-reset:";

export class MemoryPasswordResetTokenStore implements IPasswordResetTokenStore {
  async set(email: string, token: string, ttlSeconds: number): Promise<void> {
    const expiry = Date.now() + ttlSeconds * 1000;
    store.set(`${PREFIX}${token}`, { email, expiry });
  }

  async get(token: string): Promise<string | null> {
    const entry = store.get(`${PREFIX}${token}`);
    if (!entry || Date.now() > entry.expiry) {
      if (entry) store.delete(`${PREFIX}${token}`);
      return null;
    }
    return entry.email;
  }

  async delete(token: string): Promise<void> {
    store.delete(`${PREFIX}${token}`);
  }
}
