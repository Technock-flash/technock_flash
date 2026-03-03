export type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  firstName?: string | null;
  surname?: string | null;
  nationalId?: string | null;
  phoneNumber?: string | null;
  secretQuestion?: string | null;
  secretAnswerHash?: string | null;
}
