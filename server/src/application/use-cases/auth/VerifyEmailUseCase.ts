import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { IVerificationTokenStore } from "../../../domain/repositories/IVerificationTokenStore";
import { AppError } from "../../../shared/errors/AppError";

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly verificationStore: IVerificationTokenStore
  ) {}

  async execute(token: string): Promise<{ email: string }> {
    if (!token) {
      throw new AppError("Verification token required", 400);
    }
    const email = await this.verificationStore.get(token);
    if (!email) {
      throw new AppError("Invalid or expired verification token", 400);
    }
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    await this.userRepo.setEmailVerified(user.id);
    await this.verificationStore.delete(token);
    return { email: user.email };
  }
}
