import type { IPasswordResetTokenStore } from "../../domain/repositories/IPasswordResetTokenStore";
import { redis } from "./redisClient";

const PREFIX = "password-reset:";

export class RedisPasswordResetTokenStore implements IPasswordResetTokenStore {
  async set(email: string, token: string, ttlSeconds: number): Promise<void> {
    await redis.setex(`${PREFIX}${token}`, ttlSeconds, email);
  }

  async get(token: string): Promise<string | null> {
    return redis.get(`${PREFIX}${token}`);
  }

  async delete(token: string): Promise<void> {
    await redis.del(`${PREFIX}${token}`);
  }
}
