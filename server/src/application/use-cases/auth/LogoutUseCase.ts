import type { ITokenStore } from "../../../domain/repositories/ITokenStore";
import type { IJwtService } from "../../../domain/ports/IJwtService";
import { AppError } from "../../../shared/errors/AppError";

/**
 * Invalidates the refresh token in Redis (server-side revocation).
 * Call this on logout so the token cannot be reused.
 */
export class LogoutUseCase {
  constructor(
    private readonly tokenStore: ITokenStore,
    private readonly jwtService: IJwtService
  ) {}

  async execute(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new AppError("Refresh token required", 400);
    }
    try {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      await this.tokenStore.deleteRefreshToken(payload.sub);
    } catch {
      // Token invalid or expired — still clear cookie; no need to throw
    }
  }
}
