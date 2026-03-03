import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { ITokenStore } from "../../../domain/repositories/ITokenStore";
import type { IPasswordHasher } from "../../../domain/ports/IPasswordHasher";
import type { IJwtService } from "../../../domain/ports/IJwtService";
import { AppError } from "../../../shared/errors/AppError";
import { env } from "../../../config/env";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string };
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenStore: ITokenStore,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const valid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    if (env.auth.requireEmailVerification && !user.emailVerifiedAt) {
      throw new AppError("Email not verified. Check your inbox or resend verification.", 403);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    const ttl = this.jwtService.getRefreshTokenTtlSeconds();
    await this.tokenStore.setRefreshToken(user.id, refreshToken, ttl);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    };
  }
}
