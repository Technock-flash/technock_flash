import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { IPasswordHasher } from "../../../domain/ports/IPasswordHasher";
import { AppError } from "../../../shared/errors/AppError";

export interface ResetPasswordInput {
  email: string;
  secretAnswer: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user?.secretAnswerHash) {
      throw new AppError("Invalid request", 400);
    }

    const normalizedAnswer = input.secretAnswer.trim().toLowerCase();
    const valid = await this.passwordHasher.compare(
      normalizedAnswer,
      user.secretAnswerHash
    );
    if (!valid) {
      throw new AppError("Invalid secret answer", 400);
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepo.updatePassword(user.id, passwordHash);
  }
}
