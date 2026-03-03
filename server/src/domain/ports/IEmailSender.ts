export interface IEmailSender {
  sendVerificationEmail(email: string, verificationLink: string): Promise<void>;
}
