export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface IJwtService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
  getRefreshTokenTtlSeconds(): number;
}
