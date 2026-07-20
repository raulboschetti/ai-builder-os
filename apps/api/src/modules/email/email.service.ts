import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Si no hay RESEND_API_KEY configurada, no falla — simplemente imprime
   * el email por consola. Así el flujo de invitaciones se puede probar
   * en local sin tener que dar de alta ningún proveedor de correo todavía.
   */
  async send(params: { to: string; subject: string; html: string }) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from = this.configService.get<string>(
      'EMAIL_FROM',
      'Kroquix <onboarding@resend.dev>',
    );

    if (!apiKey) {
      const urls = [...params.html.matchAll(/href="([^"]+)"/g)].map(
        (match) => match[1],
      );

      this.logger.warn(
        `[SIN RESEND_API_KEY] Email no enviado de verdad. Para: ${params.to} — Asunto: ${params.subject}`,
      );
      if (urls.length > 0) {
        this.logger.warn(`Enlace: ${urls.join(', ')}`);
      } else {
        this.logger.warn(params.html.replace(/<[^>]+>/g, ' ').trim());
      }
      return { simulated: true };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Resend devolvió ${response.status}: ${body}`);
      throw new Error('No se ha podido enviar el email');
    }

    return { simulated: false };
  }
}
