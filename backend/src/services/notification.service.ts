// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/services/notification.service.ts
// Descripción: Envío de notificaciones push a los responsables mediante Firebase Cloud Messaging (FCM).
// ==============================================================================

import { messaging } from '../config/firebase.js';
import { env } from '../config/environment.js';
import { mockDb } from '../config/mock-database.js';
import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';

export interface SendNotificationInput {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class NotificationService {
  /**
   * Envía una notificación push a un token FCM específico.
   */
  public async sendToToken(input: SendNotificationInput) {
    try {
      const message = {
        token: input.token,
        notification: {
          title: input.title,
          body: input.body,
        },
        data: input.data || {},
      };

      const response = await messaging.send(message);
      return { success: true, messageId: response };
    } catch (error: any) {
      console.error('Error enviando notificación FCM:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía una notificación a todos los tokens FCM de un usuario responsable.
   */
  public async sendToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
    let tokens: string[] = [];

    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.id === userId);
      if (user && (user as any).fcmToken) {
        tokens = [(user as any).fcmToken];
      }
    } else {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true } as any,
      });
      if (user && (user as any).fcmToken) {
        tokens = [(user as any).fcmToken];
      }
    }

    if (tokens.length === 0) {
      return { success: false, error: 'No hay tokens FCM registrados para este usuario' };
    }

    const results = await Promise.all(
      tokens.map((token) => this.sendToToken({ token, title, body, data })),
    );

    return { success: true, results };
  }

  /**
   * Envía una alerta de seguridad a un responsable cuando un dispositivo reporta un evento crítico.
   */
  public async sendSecurityAlert(userId: string, deviceName: string, eventType: string, description: string) {
    const title = `⚠️ Alerta de seguridad - ${deviceName}`;
    const body = description || `Se detectó un evento de seguridad: ${eventType}`;
    return this.sendToUser(userId, title, body, {
      type: 'security_alert',
      eventType,
      deviceName,
    });
  }

  /**
   * Registra o actualiza el token FCM de un usuario responsable.
   */
  public async registerToken(userId: string, fcmToken: string) {
    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.id === userId);
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }
      (user as any).fcmToken = fcmToken;
      return { success: true };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken } as any,
    });

    return { success: true };
  }
}

export const notificationService = new NotificationService();
