import type { User } from "../../domain/entities/User";
import type { IUserRepository, CreateUserData } from "../../domain/repositories/IUserRepository";
import { prisma } from "./prismaClient";

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByNationalId(nationalId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { nationalId } });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        firstName: data.firstName ?? null,
        surname: data.surname ?? null,
        nationalId: data.nationalId ?? null,
        phoneNumber: data.phoneNumber ?? null,
        secretQuestion: data.secretQuestion ?? null,
        secretAnswerHash: data.secretAnswerHash ?? null
      }
    });
    return this.toDomain(user);
  }

  async setEmailVerified(userId: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() }
    });
    return this.toDomain(user);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }

  private toDomain(raw: {
    id: string;
    email: string;
    passwordHash: string;
    role: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    firstName?: string | null;
    surname?: string | null;
    nationalId?: string | null;
    phoneNumber?: string | null;
    secretQuestion?: string | null;
    secretAnswerHash?: string | null;
  }): User {
    return {
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role as User["role"],
      emailVerifiedAt: raw.emailVerifiedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      firstName: raw.firstName,
      surname: raw.surname,
      nationalId: raw.nationalId,
      phoneNumber: raw.phoneNumber,
      secretQuestion: raw.secretQuestion,
      secretAnswerHash: raw.secretAnswerHash
    };
  }
}
