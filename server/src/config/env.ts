import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const clientUrl = getEnv("CLIENT_URL", "http://localhost:5173");

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number(getEnv("PORT", "4000")),
  clientUrl,
  corsAllowedOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : [clientUrl],
  databaseUrl: getEnv("DATABASE_URL"),
  redisUrl: getEnv("REDIS_URL", "redis://localhost:6379"),
  useInMemoryCache: process.env.USE_IN_MEMORY_CACHE !== "false",
  jwt: {
    accessSecret: getEnv("JWT_ACCESS_SECRET"),
    refreshSecret: getEnv("JWT_REFRESH_SECRET"),
    accessExpiresIn: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
    refreshExpiresIn: getEnv("JWT_REFRESH_EXPIRES_IN", "7d")
  },
  cookie: {
    refreshTokenName: getEnv("COOKIE_REFRESH_TOKEN_NAME", "refreshToken"),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.COOKIE_SAME_SITE ?? "lax") as "strict" | "lax" | "none",
    maxAgeDays: Number(process.env.COOKIE_REFRESH_MAX_AGE_DAYS ?? "7")
  },
  auth: {
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
    verificationTokenTtlSeconds: 24 * 60 * 60,
    baseUrl: getEnv("BASE_URL", "http://localhost:5173")
  }
};

