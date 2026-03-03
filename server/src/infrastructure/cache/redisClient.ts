import Redis from "ioredis";
import { env } from "../../config/env";

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(env.redisUrl, {
    maxRetriesPerRequest: 3
  });

if (env.nodeEnv !== "production") globalForRedis.redis = redis;
