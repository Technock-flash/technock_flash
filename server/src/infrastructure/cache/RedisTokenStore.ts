import type { ITokenStore } from "../../domain/repositories/ITokenStore";
import { redis } from "./redisClient";

const PREFIX = "refresh:";

export class RedisTokenStore implements ITokenStore {
  async setRefreshToken(userId: string, token: string, ttlSeconds: number): Promise<void> {
    await redis.setex(`${PREFIX}${userId}`, ttlSeconds, token);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return redis.get(`${PREFIX}${userId}`);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    await redis.del(`${PREFIX}${userId}`);
  }
}
