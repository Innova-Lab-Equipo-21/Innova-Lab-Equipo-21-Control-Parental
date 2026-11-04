import nodemailer from 'nodemailer';
import { env } from '../config/environment.js';

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  public async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        text,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error enviando email:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();
