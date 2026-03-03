import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { SECRET_QUESTIONS } from "../../../shared/constants/secretQuestions";

export interface ForgotPasswordOutput {
  secretQuestion: string;
}

export class ForgotPasswordUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(email: string): Promise<ForgotPasswordOutput | null> {
    const user = await this.userRepo.findByEmail(email);
    if (!user?.secretQuestion) return null;

    const q = SECRET_QUESTIONS.find((s) => s.id === user.secretQuestion);
    return q ? { secretQuestion: q.question } : null;
  }
}
