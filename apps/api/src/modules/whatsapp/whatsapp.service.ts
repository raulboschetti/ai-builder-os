import { Injectable } from '@nestjs/common';
import { WhatsAppMessageRole } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { BookingsService } from '../bookings/bookings.service';

const HISTORY_LIMIT = 10;

const FALLBACK_SYSTEM_PROMPT = `Eres el asistente de WhatsApp de un negocio en Kroquix (todavía sin configurar del todo). Responde en español, en 2-3 frases como mucho — es WhatsApp, no un email. Sé amable y directo, y si no tienes información concreta del negocio, dilo con naturalidad en vez de inventarte datos.`;

const BOOKING_TOOLS: Anthropic.Tool[] = [
  {
    name: 'list_services',
    description: 'Lista los servicios que ofrece este negocio y su duración.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'check_availability',
    description:
      'Consulta los huecos libres para un servicio en una fecha concreta. Usa esto SIEMPRE antes de ofrecer un horario — nunca inventes disponibilidad.',
    input_schema: {
      type: 'object',
      properties: {
        service_name: { type: 'string', description: 'Nombre exacto del servicio' },
        date: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
      },
      required: ['service_name', 'date'],
    },
  },
  {
    name: 'book_appointment',
    description:
      'Reserva una cita en un hueco concreto. Solo llama a esto después de que el cliente confirme el servicio, la fecha y la hora exactos, y tengas su nombre.',
    input_schema: {
      type: 'object',
      properties: {
        service_name: { type: 'string' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
        time: { type: 'string', description: 'HH:mm' },
        customer_name: { type: 'string' },
      },
      required: ['service_name', 'date', 'time', 'customer_name'],
    },
  },
];

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly bookingsService: BookingsService,
  ) {}

  async handleIncomingMessage(
    phoneNumber: string,
    body: string,
    toNumber: string,
  ): Promise<string> {
    await this.prisma.whatsAppMessage.create({
      data: { phoneNumber, role: WhatsAppMessageRole.USER, content: body },
    });

    const recentMessages = await this.prisma.whatsAppMessage.findMany({
      where: { phoneNumber },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
    });

    const history: Anthropic.MessageParam[] = recentMessages
      .reverse()
      .map((m) => ({
        role: m.role === WhatsAppMessageRole.USER ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));

    const project = await this.prisma.project.findUnique({
      where: { whatsappNumber: toNumber },
    });

    let reply: string;

    if (project) {
      const services = await this.bookingsService.listActiveServicesForAgent(
        project.id,
      );
      const hasBookings = services.length > 0;

      const systemPrompt = this.buildProjectSystemPrompt(
        project.name,
        project.businessVertical,
        project.description,
        hasBookings,
      );

      if (hasBookings) {
        reply = await this.aiService.generateAgentReplyWithTools(
          systemPrompt,
          history,
          BOOKING_TOOLS,
          (toolName, input) =>
            this.executeBookingTool(project.id, phoneNumber, toolName, input),
        );
      } else {
        reply = await this.aiService.generateAgentReply(systemPrompt, history);
      }
    } else {
      reply = await this.aiService.generateAgentReply(
        FALLBACK_SYSTEM_PROMPT,
        history,
      );
    }

    await this.prisma.whatsAppMessage.create({
      data: { phoneNumber, role: WhatsAppMessageRole.ASSISTANT, content: reply },
    });

    return reply;
  }

  private async executeBookingTool(
    projectId: string,
    customerPhone: string,
    toolName: string,
    input: unknown,
  ): Promise<string> {
    try {
      if (toolName === 'list_services') {
        const services = await this.bookingsService.listActiveServicesForAgent(
          projectId,
        );
        if (services.length === 0) return 'No hay servicios configurados.';
        return services
          .map((s) => `${s.name} (${s.durationMinutes} min)`)
          .join(', ');
      }

      if (toolName === 'check_availability') {
        const { service_name, date } = input as {
          service_name: string;
          date: string;
        };
        const services = await this.bookingsService.listActiveServicesForAgent(
          projectId,
        );
        const service = services.find(
          (s) => s.name.toLowerCase() === service_name.toLowerCase(),
        );
        if (!service) return `No existe el servicio "${service_name}".`;

        const slots = await this.bookingsService.checkAvailability(
          projectId,
          date,
          service.durationMinutes,
        );
        return slots.length > 0
          ? `Huecos libres el ${date}: ${slots.join(', ')}`
          : `No hay huecos libres el ${date} para ${service_name}.`;
      }

      if (toolName === 'book_appointment') {
        const { service_name, date, time, customer_name } = input as {
          service_name: string;
          date: string;
          time: string;
          customer_name: string;
        };
        const services = await this.bookingsService.listActiveServicesForAgent(
          projectId,
        );
        const service = services.find(
          (s) => s.name.toLowerCase() === service_name.toLowerCase(),
        );
        if (!service) return `No existe el servicio "${service_name}".`;

        const appointment = await this.bookingsService.bookAppointmentForAgent(
          projectId,
          {
            serviceId: service.id,
            date,
            time,
            customerPhone,
            customerName: customer_name,
          },
        );
        return `Cita confirmada: ${service.name} el ${date} a las ${time} para ${appointment.customerName}.`;
      }

      return 'Herramienta no reconocida.';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return `No se ha podido completar: ${message}`;
    }
  }

  private buildProjectSystemPrompt(
    name: string,
    businessVertical: string | null,
    description: string | null,
    hasBookings: boolean,
  ): string {
    const today = new Date().toISOString().split('T')[0];

    return `Eres el asistente de WhatsApp de "${name}"${businessVertical ? ` (${businessVertical})` : ''} en Kroquix.

Contexto del negocio: ${description || 'sin descripción detallada todavía'}
Fecha de hoy: ${today}

Responde en español, en 2-3 frases como mucho — es WhatsApp, no un email. Sé amable y directo, y no inventes datos del negocio que no te he dado aquí.${
      hasBookings
        ? ' Este negocio SÍ acepta citas: usa las herramientas disponibles para consultar disponibilidad real y reservar — nunca inventes horarios ni confirmes una cita sin haber llamado a book_appointment.'
        : ' Este negocio todavía no tiene el sistema de citas activado, así que no puedes reservar nada — si te lo piden, dilo con naturalidad.'
    }`;
  }
}
