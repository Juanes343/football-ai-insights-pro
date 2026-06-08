import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

class EmailService {
  private transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: { user: config.email.user, pass: config.email.pass },
  });

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({ from: config.email.from, to, subject, html });
      logger.debug(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      logger.error('Email send error:', err);
    }
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const url = `${config.app.url}/api/auth/verify-email/${token}`;
    await this.send(to, 'Verify your Football AI Insights Pro account', `
      <h2>Welcome, ${name}!</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${url}" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `);
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const url = `${config.app.frontendUrl}/auth/reset-password?token=${token}`;
    await this.send(to, 'Reset your Football AI Insights Pro password', `
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, click below to reset your password:</p>
      <a href="${url}" style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    `);
  }

  async sendMatchNotification(to: string, subject: string, matchInfo: string) {
    await this.send(to, subject, `
      <h2>Football AI Insights Pro</h2>
      <p>${matchInfo}</p>
    `);
  }
}

export const emailService = new EmailService();
