import type { Request, Response } from "express";
import type { LoginUseCase } from "../../../application/use-cases/auth/LoginUseCase";
import type { RegisterUseCase } from "../../../application/use-cases/auth/RegisterUseCase";
import type { RefreshTokenUseCase } from "../../../application/use-cases/auth/RefreshTokenUseCase";
import type { LogoutUseCase } from "../../../application/use-cases/auth/LogoutUseCase";
import type { VerifyEmailUseCase } from "../../../application/use-cases/auth/VerifyEmailUseCase";
import type { ResendVerificationUseCase } from "../../../application/use-cases/auth/ResendVerificationUseCase";
import type { ForgotPasswordUseCase } from "../../../application/use-cases/auth/ForgotPasswordUseCase";
import type { ResetPasswordUseCase } from "../../../application/use-cases/auth/ResetPasswordUseCase";
import { SECRET_QUESTIONS } from "../../../shared/constants/secretQuestions";
import { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenFromCookie } from "../cookieUtils";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  surname: z.string().min(1),
  nationalId: z.string().min(1),
  phoneNumber: z.string().min(1),
  vendorName: z.string().min(1),
  vendorDescription: z.string().optional(),
  preferredCategoryIds: z.array(z.string()).optional(),
  secretQuestionId: z.string().min(1),
  secretAnswer: z.string().min(1)
});

export const resendVerificationSchema = z.object({
  email: z.string().email()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  secretAnswer: z.string().min(1),
  newPassword: z.string().min(8)
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1)
});

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUseCase.execute(req.body);
    setRefreshTokenCookie(res, result.refreshToken);
    res.json({ accessToken: result.accessToken, user: result.user });
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.registerUseCase.execute(req.body);
    setRefreshTokenCookie(res, result.refreshToken);
    res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
      emailVerificationRequired: result.emailVerificationRequired
    });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const token = getRefreshTokenFromCookie(req) ?? req.body?.refreshToken;
    if (!token) {
      // Use 403 Forbidden. A 401 on the refresh endpoint can cause client-side
      // interceptor loops if not handled carefully. 403 clearly indicates
      // that authentication was attempted (with a cookie) but failed.
      res.status(403).json({
        status: 'error', 
        message: "Session expired or refresh token is missing."
      });
      return;
    }

    const result = await this.refreshTokenUseCase.execute(token);
    setRefreshTokenCookie(res, result.refreshToken);
    res.json({ accessToken: result.accessToken, user: result.user });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const token = getRefreshTokenFromCookie(req);
    if (token) {
      await this.logoutUseCase.execute(token);
    }
    clearRefreshTokenCookie(res);
    res.json({ message: "Logged out" });
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    // Token is now guaranteed by the validate middleware
    const token = (req.query.token || req.body.token) as string;
    const { email } = await this.verifyEmailUseCase.execute(token);
    res.json({ message: "Email verified", email });
  };

  resendVerification = async (req: Request, res: Response): Promise<void> => {
    await this.resendVerificationUseCase.execute(req.body.email);
    res.json({ message: "If the email is registered and unverified, a new link was sent." });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await this.forgotPasswordUseCase.execute(req.body.email);
    // If result is null, the use case should ideally throw an AppError(404), 
    // but for now we'll handle it consistently.
    res.json(result || { message: "If that email exists, a reset link has been sent." });
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    await this.resetPasswordUseCase.execute(req.body);
    res.json({ message: "Password reset successfully" });
  };

  secretQuestions = (_req: Request, res: Response): void => {
    res.json(SECRET_QUESTIONS);
  };
}
