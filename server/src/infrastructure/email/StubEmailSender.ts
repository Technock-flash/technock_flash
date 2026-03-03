import type { IEmailSender } from "../../domain/ports/IEmailSender";
import { env } from "../../config/env";

/**
 * Stub implementation: logs verification link to console.
 * Replace with a real provider (SendGrid, SES, etc.) in production.
 */
export class StubEmailSender implements IEmailSender {
  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    if (env.nodeEnv === "development") {
      // eslint-disable-next-line no-console
      console.log(`[Email] Verification for ${email}: ${verificationLink}`);
    }
  }
}
