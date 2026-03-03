import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { IVerificationTokenStore } from "../../../domain/repositories/IVerificationTokenStore";
import type { IEmailSender } from "../../../domain/ports/IEmailSender";
import { AppError } from "../../../shared/errors/AppError";
import { env } from "../../../config/env";
import { randomBytes } from "crypto";

export class ResendVerificationUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly verificationStore: IVerificationTokenStore,
    private readonly emailSender: IEmailSender
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // Do not reveal whether email exists
      return;
    }
    if (user.emailVerifiedAt) {
      throw new AppError("Email already verified", 400);
    }
    const token = randomBytes(32).toString("hex");
    await this.verificationStore.set(email, token, env.auth.verificationTokenTtlSeconds);
    const link = `${env.auth.baseUrl}/verify-email?token=${token}`;
    await this.emailSender.sendVerificationEmail(email, link);
  }
}
