import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { ITokenStore } from "../../../domain/repositories/ITokenStore";
import type { IJwtService } from "../../../domain/ports/IJwtService";
import { AppError } from "../../../shared/errors/AppError";

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenStore: ITokenStore,
    private readonly jwtService: IJwtService
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenOutput> {
    // 1️⃣ Validate token presence
    if (!refreshToken) {
      throw new AppError("Refresh token is required", 401);
    }

    // 2️⃣ Verify JWT refresh token
    let payload: { sub: string; email: string; role: string };

    try {
      payload = this.jwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }

    // 3️⃣ Check token in token store (Redis/DB)
    const storedToken = await this.tokenStore.getRefreshToken(payload.sub);

    if (!storedToken || storedToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    // 4️⃣ Ensure user still exists
    const user = await this.userRepo.findById(payload.sub);

    if (!user) {
      throw new AppError("User not found", 401);
    }

    // 5️⃣ Rotate refresh token (delete old one)
    await this.tokenStore.deleteRefreshToken(user.id);

    // 6️⃣ Generate new tokens
    const newPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = this.jwtService.generateAccessToken(newPayload);
    const newRefreshToken = this.jwtService.generateRefreshToken(newPayload);

    // 7️⃣ Store new refresh token with TTL
    const ttl = this.jwtService.getRefreshTokenTtlSeconds();
    await this.tokenStore.setRefreshToken(user.id, newRefreshToken, ttl);

    // 8️⃣ Return tokens and user data
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}