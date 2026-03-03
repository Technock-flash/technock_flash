import type { ITokenStore } from "../../domain/repositories/ITokenStore";

const store = new Map<string, { token: string; expiry: number }>();

export class MemoryTokenStore implements ITokenStore {
  async setRefreshToken(userId: string, token: string, ttlSeconds: number): Promise<void> {
    const expiry = Date.now() + ttlSeconds * 1000;
    store.set(`refresh:${userId}`, { token, expiry });
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const entry = store.get(`refresh:${userId}`);
    if (!entry || Date.now() > entry.expiry) {
      if (entry) store.delete(`refresh:${userId}`);
      return null;
    }
    return entry.token;
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    store.delete(`refresh:${userId}`);
  }
}
