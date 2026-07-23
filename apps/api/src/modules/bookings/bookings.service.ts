import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';

const SLOT_GRANULARITY_MINUTES = 30;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Gestión (dueño del proyecto) ----------

  async listServices(
    organizationId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.assertProjectInScope(organizationId, workspaceId, projectId);

    return this.prisma.service.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createService(
    organizationId: string,
    workspaceId: string,
    projectId: string,
    data: { name: string; durationMinutes: number },
  ) {
    await this.assertProjectInScope(organizationId, workspaceId, projectId);

    return this.prisma.service.create({
      data: {
        projectId,
        name: data.name,
        durationMinutes: data.durationMinutes,
      },
    });
  }

  async deleteService(
    organizationId: string,
    workspaceId: string,
    projectId: string,
    serviceId: string,
  ) {
    await this.assertProjectInScope(organizationId, workspaceId, projectId);

    const result = await this.prisma.service.deleteMany({
      where: { id: serviceId, projectId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Servicio no encontrado');
    }
  }

  async getBusinessHours(
    organizationId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.assertProjectInScope(organizationId, workspaceId, projectId);

    return this.prisma.businessHours.findMany({
      where: { projectId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  /** Reemplaza el horario completo — se manda siempre la semana entera. */
  async setBusinessHours(
    organizationId: string,
    workspaceId: string,
    projectId: string,
    days: { dayOfWeek: number; startTime: string; endTime: string }[],
  ) {
    await this.assertProjectInScope(organizationId, workspaceId, projectId);

    await this.prisma.$transaction([
      this.prisma.businessHours.deleteMany({ where: { projectId } }),
      this.prisma.businessHours.createMany({
        data: days.map((d) => ({ projectId, ...d })),
      }),
    ]);

    return this.prisma.businessHours.findMany({
      where: { projectId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async listAppointments(
    organizationId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.assertProjectInScope(organizationId, workspaceId, projectId);

    return this.prisma.appointment.findMany({
      where: { projectId, status: AppointmentStatus.CONFIRMED },
      include: { service: true },
      orderBy: { startAt: 'asc' },
    });
  }

  async cancelAppointment(
    organizationId: string,
    workspaceId: string,
    projectId: string,
    appointmentId: string,
  ) {
    await this.assertProjectInScope(organizationId, workspaceId, projectId);

    const result = await this.prisma.appointment.updateMany({
      where: { id: appointmentId, projectId },
      data: { status: AppointmentStatus.CANCELLED },
    });

    if (result.count === 0) {
      throw new NotFoundException('Cita no encontrada');
    }
  }

  // ---------- Usadas por el agente de IA (sin scoping org/workspace — el
  // projectId ya viene resuelto de forma segura desde el número de
  // WhatsApp que recibió el mensaje, no de algo que el cliente controle) ----------

  /** Servicios activos de un proyecto, para que la IA sepa qué puede ofrecer. */
  async listActiveServicesForAgent(projectId: string) {
    return this.prisma.service.findMany({
      where: { projectId, active: true },
    });
  }

  /**
   * Huecos libres para una fecha y duración concretas. Nunca se fía de lo
   * que "cree" la IA — siempre se recalcula aquí contra las citas reales.
   */
  async checkAvailability(
    projectId: string,
    date: string, // "YYYY-MM-DD"
    durationMinutes: number,
  ): Promise<string[]> {
    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

    const hours = await this.prisma.businessHours.findUnique({
      where: { projectId_dayOfWeek: { projectId, dayOfWeek } },
    });

    if (!hours) {
      return []; // cerrado ese día
    }

    const dayStart = this.toMinutes(hours.startTime);
    const dayEnd = this.toMinutes(hours.endTime);

    const existing = await this.prisma.appointment.findMany({
      where: {
        projectId,
        status: AppointmentStatus.CONFIRMED,
        startAt: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`),
        },
      },
    });

    const busyRanges = existing.map((a) => {
      const start = this.dateToMinutesOfDay(a.startAt);
      return { start, end: start + a.durationMinutes };
    });

    const freeSlots: string[] = [];
    for (
      let slot = dayStart;
      slot + durationMinutes <= dayEnd;
      slot += SLOT_GRANULARITY_MINUTES
    ) {
      const overlaps = busyRanges.some(
        (b) => slot < b.end && slot + durationMinutes > b.start,
      );
      if (!overlaps) {
        freeSlots.push(this.toTimeString(slot));
      }
    }

    return freeSlots;
  }

  /**
   * Crea la cita solo si el hueco sigue libre en el momento exacto de
   * confirmar (vuelve a comprobar disponibilidad aquí dentro, no se fía
   * de una comprobación anterior — evita dobles reservas por carrera).
   */
  async bookAppointmentForAgent(
    projectId: string,
    data: {
      serviceId: string;
      date: string;
      time: string;
      customerPhone: string;
      customerName?: string;
    },
  ) {
    const service = await this.prisma.service.findFirst({
      where: { id: data.serviceId, projectId, active: true },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    const freeSlots = await this.checkAvailability(
      projectId,
      data.date,
      service.durationMinutes,
    );

    if (!freeSlots.includes(data.time)) {
      throw new ConflictException('Ese hueco ya no está disponible');
    }

    return this.prisma.appointment.create({
      data: {
        projectId,
        serviceId: service.id,
        customerPhone: data.customerPhone,
        customerName: data.customerName,
        startAt: new Date(`${data.date}T${data.time}:00`),
        durationMinutes: service.durationMinutes,
      },
      include: { service: true },
    });
  }

  // ---------- Utilidades ----------

  private async assertProjectInScope(
    organizationId: string,
    workspaceId: string,
    projectId: string,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        workspaceId,
        workspace: { organizationId, deletedAt: null },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private toTimeString(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private dateToMinutesOfDay(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }
}
