import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { IPasswordHasher } from "../../../domain/ports/IPasswordHasher";
import type { IPasswordResetTokenStore } from "../../../domain/repositories/IPasswordResetTokenStore";
import { AppError } from "../../../shared/errors/AppError";

export interface ResetPasswordInput {
  email?: string;
  secretAnswer?: string;
  newPassword: string;
  token?: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly resetTokenStore: IPasswordResetTokenStore
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    let user;

    if (input.token) {
      const email = await this.resetTokenStore.get(input.token);
      if (!email) {
        throw new AppError("Invalid or expired password reset token", 400);
      }

      user = await this.userRepo.findByEmail(email);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      const passwordHash = await this.passwordHasher.hash(input.newPassword);
      await this.userRepo.updatePassword(user.id, passwordHash);
      await this.resetTokenStore.delete(input.token);
      return;
    }

    if (!input.email || !input.secretAnswer) {
      throw new AppError("Email, secret answer, and new password are required", 400);
    }

    user = await this.userRepo.findByEmail(input.email);
    if (!user?.secretAnswerHash) {
      throw new AppError("Invalid request", 400);
    }

    const normalizedAnswer = input.secretAnswer.trim().toLowerCase();
    const valid = await this.passwordHasher.compare(normalizedAnswer, user.secretAnswerHash);
    if (!valid) {
      throw new AppError("Invalid secret answer", 400);
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepo.updatePassword(user.id, passwordHash);
  }
}
