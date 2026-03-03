import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { ITokenStore } from "../../../domain/repositories/ITokenStore";
import type { IJwtService } from "../../../domain/ports/IJwtService";
import { AppError } from "../../../shared/errors/AppError";

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string };
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenStore: ITokenStore,
    private readonly jwtService: IJwtService
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenOutput> {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    const stored = await this.tokenStore.getRefreshToken(payload.sub);
    if (!stored || stored !== refreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) {
      throw new AppError("User not found", 401);
    }

    await this.tokenStore.deleteRefreshToken(user.id);

    const newPayload = { sub: user.id, email: user.email, role: user.role };
    const newAccessToken = this.jwtService.generateAccessToken(newPayload);
    const newRefreshToken = this.jwtService.generateRefreshToken(newPayload);

    const ttl = this.jwtService.getRefreshTokenTtlSeconds();
    await this.tokenStore.setRefreshToken(user.id, newRefreshToken, ttl);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    };
  }
}
