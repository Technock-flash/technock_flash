import { randomBytes } from "crypto";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { IPasswordResetTokenStore } from "../../../domain/repositories/IPasswordResetTokenStore";
import type { IEmailSender } from "../../../domain/ports/IEmailSender";
import { SECRET_QUESTIONS } from "../../../shared/constants/secretQuestions";
import { AppError } from "../../../shared/errors/AppError";
import { env } from "../../../config/env";

export interface ForgotPasswordOutput {
  secretQuestion: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly resetTokenStore: IPasswordResetTokenStore,
    private readonly emailSender: IEmailSender
  ) {}

  async execute(email: string): Promise<ForgotPasswordOutput | null> {
    const user = await this.userRepo.findByEmail(email);
    if (!user?.secretQuestion) {
      // Do not reveal which emails exist
      return null;
    }

    const q = SECRET_QUESTIONS.find((s) => s.id === user.secretQuestion);
    if (!q) {
      throw new AppError("Invalid secret question configuration", 500);
    }

    const resetToken = randomBytes(32).toString("hex");
    await this.resetTokenStore.set(email, resetToken, env.auth.passwordResetTokenTtlSeconds);
    const resetLink = `${env.auth.baseUrl}/reset-password?token=${resetToken}`;

    await this.emailSender.sendPasswordResetEmail(email, resetLink);

    return { secretQuestion: q.question };
  }
}
