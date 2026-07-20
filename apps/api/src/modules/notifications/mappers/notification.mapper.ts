import { Notification } from '@prisma/client';

export class NotificationMapper {
  static toResponse(notification: Notification) {
    return {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  }

  static toResponseList(notifications: Notification[]) {
    return notifications.map((n) => this.toResponse(n));
  }
}
