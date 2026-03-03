import { randomBytes } from "crypto";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { IVendorRepository } from "../../../domain/repositories/IVendorRepository";
import type { ITokenStore } from "../../../domain/repositories/ITokenStore";
import type { IVerificationTokenStore } from "../../../domain/repositories/IVerificationTokenStore";
import type { IPasswordHasher } from "../../../domain/ports/IPasswordHasher";
import type { IJwtService } from "../../../domain/ports/IJwtService";
import type { IEmailSender } from "../../../domain/ports/IEmailSender";
import { SECRET_QUESTIONS } from "../../../shared/constants/secretQuestions";
import { AppError } from "../../../shared/errors/AppError";
import { env } from "../../../config/env";

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  surname: string;
  nationalId: string;
  phoneNumber: string;
  vendorName: string;
  vendorDescription?: string;
  preferredCategoryIds?: string[];
  secretQuestionId: string;
  secretAnswer: string;
}

export interface RegisterOutput {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string };
  emailVerificationRequired?: boolean;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly vendorRepo: IVendorRepository,
    private readonly tokenStore: ITokenStore,
    private readonly verificationStore: IVerificationTokenStore,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService,
    private readonly emailSender: IEmailSender
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const existingNationalId = await this.userRepo.findByNationalId(input.nationalId);
    if (existingNationalId) {
      throw new AppError("National ID already registered", 409);
    }

    const validQuestion = SECRET_QUESTIONS.some((q) => q.id === input.secretQuestionId);
    if (!validQuestion) {
      throw new AppError("Invalid secret question", 400);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const secretAnswerHash = await this.passwordHasher.hash(
      input.secretAnswer.trim().toLowerCase()
    );

    const user = await this.userRepo.create({
      email: input.email,
      passwordHash,
      role: "VENDOR",
      firstName: input.firstName,
      surname: input.surname,
      nationalId: input.nationalId,
      phoneNumber: input.phoneNumber,
      secretQuestion: input.secretQuestionId,
      secretAnswerHash
    });

    await this.vendorRepo.create({
      name: input.vendorName,
      description: input.vendorDescription,
      ownerId: user.id,
      preferredCategoryIds: input.preferredCategoryIds
    });

    const verificationToken = randomBytes(32).toString("hex");
    await this.verificationStore.set(
      input.email,
      verificationToken,
      env.auth.verificationTokenTtlSeconds
    );
    const verificationLink = `${env.auth.baseUrl}/verify-email?token=${verificationToken}`;
    await this.emailSender.sendVerificationEmail(input.email, verificationLink);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    const ttl = this.jwtService.getRefreshTokenTtlSeconds();
    await this.tokenStore.setRefreshToken(user.id, refreshToken, ttl);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
      emailVerificationRequired: env.auth.requireEmailVerification
    };
  }
}
