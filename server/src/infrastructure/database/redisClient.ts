import Redis from "ioredis";
import { env } from "../../config/env";

// Ensure REDIS_URL is set in your environment variables
// e.g. redis://localhost:6379
const redisUrl = env.redisUrl || process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl);

redis.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redis.on("connect", () => {
  console.log("Redis Client Connected");
});