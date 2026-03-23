import nodemailer from "nodemailer";
import type { IEmailSender, OrderConfirmationDetails } from "../../domain/ports/IEmailSender";
import { env } from "../../config/env";

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export class SmtpEmailSender implements IEmailSender {
  private readonly transporter;
  private readonly fromAddress: string;

  constructor() {
    if (!env.email.host || !env.email.user || !env.email.pass) {
      throw new Error("Missing SMTP email configuration in environment variables");
    }

    this.fromAddress = env.email.from;
    this.transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.secure,
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });
  }

  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject: "Verify your ZimMarket account",
      text: `Welcome to ZimMarket!\n\nPlease verify your email by clicking the following link:\n${verificationLink}\n\nIf you did not sign up, please ignore this message.`,
      html: `<p>Welcome to ZimMarket!</p><p>Please verify your email by clicking the link below:</p><p><a href="${verificationLink}">Verify my email</a></p><p>If you did not sign up, please ignore this message.</p>`,
    });
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject: "Reset your ZimMarket password",
      text: `You requested a password reset. Use the following link to set a new password:\n${resetLink}\n\nThis link expires in ${env.auth.passwordResetTokenTtlSeconds / 60} minutes. If you did not request this, ignore this message.`,
      html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Reset my password</a></p><p>This link expires in ${env.auth.passwordResetTokenTtlSeconds / 60} minutes.</p><p>If you did not request this, ignore this message.</p>`,
    });
  }

  async sendOrderConfirmationEmail(email: string, order: OrderConfirmationDetails): Promise<void> {
    const itemsHtml = order.items
      ? order.items
          .map(
            (item) =>
              `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>${dollars(item.unitPriceCents)}</td><td>${dollars(item.lineTotalCents)}</td></tr>`
          )
          .join("")
      : "";
    const itemTable = order.items
      ? `<table border="1" cellpadding="8" cellspacing="0"><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr>${itemsHtml}</table>`
      : "";

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject: `Your ZimMarket order ${order.orderNumber} is now ${order.status}`,
      text: `Order ${order.orderNumber} is ${order.status}. Total: ${dollars(order.totalCents)}.`,
      html: `<h2>Order ${order.orderNumber}</h2><p>Status: <strong>${order.status}</strong></p><p>Total: <strong>${dollars(order.totalCents)}</strong></p>${itemTable}<p>Thank you for shopping at ZimMarket!</p>`,
    });
  }
}
