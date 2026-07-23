import { Injectable } from '@nestjs/common';
import { WhatsAppMessageRole } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';

const HISTORY_LIMIT = 10;

/**
 * Prototipo de agente — todavía no está atado a un proyecto/cliente
 * concreto (eso requiere mapear cada número de WhatsApp de negocio a
 * un Project, que es el siguiente paso natural una vez que este
 * primer flujo end-to-end funcione). Por ahora, un único agente de
 * demostración para probar que la tubería completa (Twilio → IA →
 * Twilio) funciona de verdad.
 */
const DEMO_SYSTEM_PROMPT = `Eres el asistente de WhatsApp de una clínica dental de demostración en Kroquix. Ayudas a los pacientes a entender cómo pedir cita (de momento no puedes reservar de verdad, esto es un prototipo). Responde en español, en 2-3 frases como mucho — es WhatsApp, no un email. Sé amable y directo.`;

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async handleIncomingMessage(
    phoneNumber: string,
    body: string,
  ): Promise<string> {
    await this.prisma.whatsAppMessage.create({
      data: {
        phoneNumber,
        role: WhatsAppMessageRole.USER,
        content: body,
      },
    });

    const recentMessages = await this.prisma.whatsAppMessage.findMany({
      where: { phoneNumber },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
    });

    const history = recentMessages
      .reverse()
      .map((m) => ({
        role: m.role === WhatsAppMessageRole.USER ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));

    const reply = await this.aiService.generateAgentReply(
      DEMO_SYSTEM_PROMPT,
      history,
    );

    await this.prisma.whatsAppMessage.create({
      data: {
        phoneNumber,
        role: WhatsAppMessageRole.ASSISTANT,
        content: reply,
      },
    });

    return reply;
  }
}
