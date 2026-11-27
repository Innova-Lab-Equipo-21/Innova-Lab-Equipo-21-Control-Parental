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
import { getResponsableTemplate, getProtegidoMayorTemplate } from '../templates/push/index.js';

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

  // ========================================================================
  // Métodos basados en plantillas de notificaciones push
  // ========================================================================

  /**
   * Envía notificación: Sitio no autorizado LOTBA bloqueado
   */
  public async sendLotbaBlockedSiteAlert(
    userId: string,
    protectedName: string
  ) {
    const template = getResponsableTemplate('lotba_blocked_site', { protectedName });
    return this.sendToUser(userId, template.title, template.body, template.data);
  }

  /**
   * Envía notificación: Sitio de lista personalizada bloqueado
   */
  public async sendCustomBlockedSiteAlert(
    userId: string,
    protectedName: string
  ) {
    const template = getResponsableTemplate('custom_blocked_site', { protectedName });
    return this.sendToUser(userId, template.title, template.body, template.data);
  }

  /**
   * Envía notificación: Intento de usar app bloqueada
   */
  public async sendBlockedAppAttemptAlert(
    userId: string,
    protectedName: string,
    appName: string
  ) {
    const template = getResponsableTemplate('blocked_app_attempt', { protectedName, appName });
    return this.sendToUser(userId, template.title, template.body, template.data);
  }

  /**
   * Envía notificación: Permiso desactivado
   */
  public async sendPermissionDisabledAlert(
    userId: string,
    protectedName: string
  ) {
    const template = getResponsableTemplate('permission_disabled', { protectedName });
    return this.sendToUser(userId, template.title, template.body, template.data);
  }

  /**
   * Envía notificación: Intento de desinstalar la app
   */
  public async sendUninstallAttemptAlert(
    userId: string,
    protectedName: string
  ) {
    const template = getResponsableTemplate('uninstall_attempt', { protectedName });
    return this.sendToUser(userId, template.title, template.body, template.data);
  }

  /**
   * Envía notificación: Autoprotección - sitio bloqueado
   */
  public async sendSelfProtectionBlockedSiteAlert(
    userId: string
  ) {
    const template = getResponsableTemplate('self_protection_blocked_site', {});
    return this.sendToUser(userId, template.title, template.body, template.data);
  }

  /**
   * Envía notificación: Autoprotección - límite de tiempo casi superado
   */
  public async sendSelfProtectionTimeLimitAlert(
    userId: string,
    appName: string
  ) {
    const template = getResponsableTemplate('self_protection_time_limit', { appName });
    return this.sendToUser(userId, template.title, template.body, template.data);
  }

  /**
   * Envía notificación: Protegido mayor - sitio bloqueado por autocuidado
   */
  public async sendSelfCareBlockedSiteAlert(
    userId: string,
    siteName: string
  ) {
    const template = getProtegidoMayorTemplate('self_care_blocked_site', { siteName });
    return this.sendToUser(userId, template.title, template.body, template.data);
  }

  /**
   * Envía notificación: Protegido mayor - límite de tiempo casi superado
   */
  public async sendSelfCareTimeLimitAlert(
    userId: string,
    appName: string
  ) {
    const template = getProtegidoMayorTemplate('self_care_time_limit', { appName });
    return this.sendToUser(userId, template.title, template.body, template.data);
  }
}

export const notificationService = new NotificationService();
