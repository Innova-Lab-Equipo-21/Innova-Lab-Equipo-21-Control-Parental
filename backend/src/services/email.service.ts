// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Servicio de Correo Electrónico (Brevo HTTPS / SMTP)
// Archivo: src/services/email.service.ts
// Descripción: Envío de correos transaccionales vía API HTTPS de Brevo (puerto 443,
//              compatible con Railway) con fallback a Nodemailer/SMTP con timeouts cortos.
// ==============================================================================

import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/environment.js';

export interface EmailServiceConfig {
  brevoApiKey: string;
  brevoSenderEmail: string;
  brevoSenderName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
}

export interface EmailSendResult {
  success: boolean;
  provider?: 'brevo' | 'smtp';
  error?: string;
}

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const HTTP_TIMEOUT_MS = 10_000;
const SMTP_CONNECTION_TIMEOUT_MS = 10_000;
const SMTP_GREETING_TIMEOUT_MS = 10_000;
const SMTP_SOCKET_TIMEOUT_MS = 15_000;

function parseFromHeader(raw: string): { name?: string; email: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const angleMatch = trimmed.match(/^(?:"?([^"<]+?)"?\s*)?<([^>\s]+@[^>\s]+)>$/);
  if (angleMatch) {
    return {
      name: angleMatch[1]?.trim() || undefined,
      email: angleMatch[2].trim(),
    };
  }

  if (trimmed.includes('@')) {
    return { email: trimmed };
  }

  return null;
}

export class EmailService {
  private readonly config: EmailServiceConfig;
  private transporter: Transporter | null = null;

  constructor(customConfig?: Partial<EmailServiceConfig>) {
    this.config = {
      brevoApiKey: customConfig?.brevoApiKey ?? env.BREVO_API_KEY,
      brevoSenderEmail: customConfig?.brevoSenderEmail ?? env.BREVO_SENDER_EMAIL,
      brevoSenderName: customConfig?.brevoSenderName ?? env.BREVO_SENDER_NAME,
      smtpHost: customConfig?.smtpHost ?? env.SMTP_HOST,
      smtpPort: customConfig?.smtpPort ?? env.SMTP_PORT,
      smtpUser: customConfig?.smtpUser ?? env.SMTP_USER,
      smtpPass: customConfig?.smtpPass ?? env.SMTP_PASS,
      smtpFrom: customConfig?.smtpFrom ?? env.SMTP_FROM,
    };
  }

  public resolveSender(): { name: string; email: string } {
    const defaultName = this.config.brevoSenderName?.trim() || 'BA Protege+';

    if (this.config.brevoSenderEmail?.trim()) {
      return {
        name: defaultName,
        email: this.config.brevoSenderEmail.trim(),
      };
    }

    const parsedFrom = parseFromHeader(this.config.smtpFrom || '');
    if (parsedFrom) {
      return {
        name: parsedFrom.name || defaultName,
        email: parsedFrom.email,
      };
    }

    if (this.config.smtpUser?.trim()) {
      return {
        name: defaultName,
        email: this.config.smtpUser.trim(),
      };
    }

    return {
      name: defaultName,
      email: 'no-reply@baprotege.com',
    };
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpPort === 465,
        connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
        greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
        socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPass,
        },
      });
    }
    return this.transporter;
  }

  private async sendViaBrevo(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<EmailSendResult> {
    const sender = this.resolveSender();
    const payload: Record<string, unknown> = {
      sender: {
        name: sender.name,
        email: sender.email,
      },
      to: [{ email: to }],
      subject,
      textContent: text,
    };

    if (html) {
      payload.htmlContent = html;
    }

    try {
      const response = await fetch(BREVO_ENDPOINT, {
        method: 'POST',
        headers: {
          'api-key': this.config.brevoApiKey.trim(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const bodyText = await response.text();
          if (bodyText) {
            errorDetail = `${errorDetail}: ${bodyText.slice(0, 300)}`;
          }
        } catch {
          // Ignorar error de lectura del body
        }
        console.error('Error enviando email via Brevo:', errorDetail);
        return { success: false, provider: 'brevo', error: errorDetail };
      }

      return { success: true, provider: 'brevo' };
    } catch (error: any) {
      const message = error?.message || 'Error de red enviando email via Brevo';
      console.error('Error enviando email via Brevo:', message);
      return { success: false, provider: 'brevo', error: message };
    }
  }

  public async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<EmailSendResult> {
    if (this.config.brevoApiKey?.trim()) {
      return this.sendViaBrevo(to, subject, text, html);
    }

    const sender = this.resolveSender();
    const fromAddress = this.config.smtpFrom?.trim() || `"${sender.name}" <${sender.email}>`;

    try {
      await this.getTransporter().sendMail({
        from: fromAddress,
        to,
        subject,
        text,
        ...(html ? { html } : {}),
      });
      return { success: true, provider: 'smtp' };
    } catch (error: any) {
      const message = error?.message || 'Error enviando email via SMTP';
      console.error('Error enviando email via SMTP:', message);
      return { success: false, provider: 'smtp', error: message };
    }
  }
}

export const emailService = new EmailService();
