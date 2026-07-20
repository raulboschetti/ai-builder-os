import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { NotificationMapper } from './mappers/notification.mapper';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Uso interno de otros servicios (invitations, users) — no hay endpoint público para crear notificaciones a mano. */
  async create(userId: string, type: NotificationType, message: string) {
    return this.prisma.notification.create({
      data: { userId, type, message },
    });
  }

  async listForUser(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NotificationMapper.toResponseList(notifications);
  }

  async markRead(userId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
