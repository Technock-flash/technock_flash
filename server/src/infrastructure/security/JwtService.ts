import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export class JwtService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwt.accessSecret, {
      // Cast to the JWT library's expected expiresIn type
      expiresIn: env.jwt.accessExpiresIn as any
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwt.refreshSecret, {
      // Cast to the JWT library's expected expiresIn type
      expiresIn: env.jwt.refreshExpiresIn as any
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.jwt.accessSecret) as TokenPayload;
    return decoded;
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
    return decoded;
  }

  getRefreshTokenTtlSeconds(): number {
    const match = env.jwt.refreshExpiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60; // default 7 days
    const [, num, unit] = match;
    const n = Number(num);
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return n * (multipliers[unit] ?? 86400);
  }
}
