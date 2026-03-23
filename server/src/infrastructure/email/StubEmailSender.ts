import type { IEmailSender, OrderConfirmationDetails } from "../../domain/ports/IEmailSender";

/**
 * Stub implementation: logs verification link to console.
 * Replace with a real provider (SendGrid, SES, etc.) in production.
 */
export class StubEmailSender implements IEmailSender {
  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[StubEmailSender] Verification email to ${email}: ${verificationLink}`);
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[StubEmailSender] Password reset email to ${email}: ${resetLink}`);
  }

  async sendOrderConfirmationEmail(email: string, order: OrderConfirmationDetails): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(
      `[StubEmailSender] Order confirmation to ${email}: order ${order.orderNumber} status ${order.status} total ${order.totalCents}`
    );
  }
}
