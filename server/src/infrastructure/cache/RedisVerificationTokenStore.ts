import type { IVerificationTokenStore } from "../../domain/repositories/IVerificationTokenStore";
import { redis } from "./redisClient";

const PREFIX = "verification:";

export class RedisVerificationTokenStore implements IVerificationTokenStore {
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
