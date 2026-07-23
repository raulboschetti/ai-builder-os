import { Body, Controller, ForbiddenException, Headers, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import twilio from 'twilio';

import { WhatsAppService } from './whatsapp.service';

/**
 * Este endpoint lo llama Twilio directamente, no un usuario logueado de
 * Kroquix — por eso no lleva JwtAuthGuard. En su lugar, valida la firma
 * que Twilio añade a cada petición (twilio.validateRequest), así nadie
 * puede hacerse pasar por Twilio mandando peticiones falsas a esta URL
 * pública. El límite de peticiones es una segunda capa de defensa, por
 * si esa validación fallara de alguna forma inesperada.
 */
@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiExcludeEndpoint()
  async webhook(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: Record<string, string>,
    @Headers('x-twilio-signature') signature: string,
  ) {
    const authToken = this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol;
    const fullUrl = `${protocol}://${req.get('host')}${req.originalUrl}`;

    const isValid = twilio.validateRequest(authToken, signature, fullUrl, body);

    if (!isValid) {
      throw new ForbiddenException('Firma de Twilio no válida');
    }

    const from = body.From ?? '';
    const to = body.To ?? '';
    const messageBody = body.Body ?? '';

    const reply = await this.whatsAppService.handleIncomingMessage(
      from,
      messageBody,
      to,
    );

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(reply);

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
}
