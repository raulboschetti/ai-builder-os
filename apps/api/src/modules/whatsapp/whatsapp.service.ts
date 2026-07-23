import { Injectable } from '@nestjs/common';
import { WhatsAppMessageRole } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';

const HISTORY_LIMIT = 10;

/**
 * Se usa solo si el número al que ha escrito el cliente no está asignado
 * a ningún proyecto todavía — evita que el webhook falle en vez de dar
 * una respuesta razonable durante las pruebas.
 */
const FALLBACK_SYSTEM_PROMPT = `Eres el asistente de WhatsApp de un negocio en Kroquix (todavía sin configurar del todo). Responde en español, en 2-3 frases como mucho — es WhatsApp, no un email. Sé amable y directo, y si no tienes información concreta del negocio, dilo con naturalidad en vez de inventarte datos.`;

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async handleIncomingMessage(
    phoneNumber: string,
    body: string,
    toNumber: string,
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

    const project = await this.prisma.project.findUnique({
      where: { whatsappNumber: toNumber },
    });

    const systemPrompt = project
      ? this.buildProjectSystemPrompt(
          project.name,
          project.businessVertical,
          project.description,
        )
      : FALLBACK_SYSTEM_PROMPT;

    const reply = await this.aiService.generateAgentReply(
      systemPrompt,
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

  private buildProjectSystemPrompt(
    name: string,
    businessVertical: string | null,
    description: string | null,
  ): string {
    return `Eres el asistente de WhatsApp de "${name}"${businessVertical ? ` (${businessVertical})` : ''} en Kroquix.

Contexto del negocio: ${description || 'sin descripción detallada todavía'}

Ayuda a los clientes de este negocio con sus dudas y a entender cómo pedir cita o usar el servicio (de momento no puedes reservar de verdad, esto es un prototipo). Responde en español, en 2-3 frases como mucho — es WhatsApp, no un email. Sé amable y directo, y no inventes datos del negocio que no te he dado aquí.`;
  }
}
