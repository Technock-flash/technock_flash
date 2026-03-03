import type { User } from "../entities/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByNationalId(nationalId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  setEmailVerified(userId: string): Promise<User>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: User["role"];
  firstName?: string;
  surname?: string;
  nationalId?: string;
  phoneNumber?: string;
  secretQuestion?: string;
  secretAnswerHash?: string;
}
