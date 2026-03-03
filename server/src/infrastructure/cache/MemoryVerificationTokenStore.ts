import type { IVerificationTokenStore } from "../../domain/repositories/IVerificationTokenStore";

const store = new Map<string, { email: string; expiry: number }>();
const PREFIX = "verification:";

export class MemoryVerificationTokenStore implements IVerificationTokenStore {
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
