export interface OrderConfirmationDetails {
  orderNumber: string;
  status: string;
  totalCents: number;
  items?: Array<{ productName: string; quantity: number; unitPriceCents: number; lineTotalCents: number }>;
}

export interface IEmailSender {
  sendVerificationEmail(email: string, verificationLink: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
  sendOrderConfirmationEmail(email: string, order: OrderConfirmationDetails): Promise<void>;
}
