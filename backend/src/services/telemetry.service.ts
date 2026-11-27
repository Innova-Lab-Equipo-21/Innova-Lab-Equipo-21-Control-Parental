// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Servicio de Telemetría y Seguridad
// Archivo: src/services/telemetry.service.ts
// Descripción: Procesa heartbeats reales, eventos bloqueados, alertas de seguridad,
//              sesiones de pasatiempos y snapshots de uso de aplicaciones en PostgreSQL.
// ==============================================================================

import { ProtectionStatus, SecurityEventType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb, MockBlockedEvent, MockSecurityEvent } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { HeartbeatPayload } from '../types/index.js';
import { notificationService } from './notification.service.js';
import { emailService } from './email.service.js';
import {
  activityStorageService,
  formatDateKey,
  PasatiempoGameType,
  PasatiempoStatus,
  UpsertAppUsageItemInput,
} from './activity-storage.service.js';
import {
  getBlockedSiteAlertEmail,
  getCustomBlockedSiteAlertEmail,
  getBlockedAppAlertEmail,
  getPermissionDisabledAlertEmail,
  getSelfProtectionSiteReminderEmail,
  getSelfProtectionAppLimitEmail,
  getAdultProtectedSiteReminderEmail,
  getAdultProtectedAppLimitEmail,
  getUninstallAttemptAlertEmail,
} from '../templates/emails/index.js';

export interface RecordPasatiempoInput {
  deviceUuid: string;
  dateKey?: string;
  gameType: PasatiempoGameType;
  status: PasatiempoStatus;
  correctCount: number;
  wrongCount?: number;
  totalItems: number;
  attempts?: number;
  details?: Record<string, unknown> | null;
  completedAt?: string | null;
}

export interface RecordAppUsageInput {
  deviceUuid: string;
  dateKey?: string;
  apps: UpsertAppUsageItemInput[];
}

export interface RecordBlockedEventInput {
  deviceUuid: string;
  attemptedDomain: string;
  sourceListType?: string;
  itemType?: string;
}

export interface RecordSecurityEventInput {
  deviceUuid: string;
  eventType: SecurityEventType;
  description?: string;
  metadata?: Record<string, unknown>;
}

export class TelemetryService {
  /**
   * Procesa el latido periódico de telemetría (Heartbeat) enviado por el dispositivo protegido.
   * Calcula y actualiza el estado efectivo real de la protección.
   */
  public async processHeartbeat(payload: HeartbeatPayload) {
    const normalizedPermissionsDetail = payload.permissions
      ? {
          vpn: Boolean(payload.permissions.vpn ?? payload.vpnActive),
          accessibility: Boolean(payload.permissions.accessibility),
          notifications: Boolean(payload.permissions.notifications),
          batteryOptimization: Boolean(payload.permissions.batteryOptimization),
          location: Boolean(payload.permissions.location),
          usageStats: Boolean(payload.permissions.usageStats),
        }
      : undefined;

    if (env.USE_MOCK_DATA) {
      let device = mockDb.devices.find((d) => d.deviceUuid === payload.deviceUuid);

      if (!device) {
        // En modo mock, registrar dispositivo automáticamente si no existía
        device = {
          id: `dev-mock-${Date.now()}`,
          userId: mockDb.users[0].id,
          deviceUuid: payload.deviceUuid,
          deviceName: 'Dispositivo Android Protegido',
          childName: 'Menor',
          model: 'Android',
          osVersion: 'Android 14',
          appVersion: payload.appVersion || '1.0.0',
          isActive: true,
          lastSeenAt: new Date(),
          createdAt: new Date(),
          status: {
            effectiveStatus: payload.vpnActive ? 'ACTIVE' : 'INACTIVE',
            vpnActive: payload.vpnActive,
            permissionsOk: payload.permissionsOk,
            permissionsDetail: normalizedPermissionsDetail ?? null,
            batteryLevel: payload.batteryLevel || 100,
            isCharging: payload.isCharging || false,
            blocklistVersion: payload.blocklistVersion,
            appVersion: payload.appVersion || '1.0.0',
            lastHeartbeatAt: new Date(),
          },
          config: {
            protectionEnabled: true,
            blockGambling: true,
            blockCustomList: true,
            notifyOnBlock: true,
            notifyOnSecurity: true,
            heartbeatIntervalSec: 30,
          },
        };
        mockDb.devices.push(device);
      }

      let effectiveStatus: 'ACTIVE' | 'INACTIVE' | 'PERMISSION_REQUIRED' = 'ACTIVE';
      if (!payload.permissionsOk) {
        effectiveStatus = 'PERMISSION_REQUIRED';
      } else if (!payload.vpnActive) {
        effectiveStatus = 'INACTIVE';
      }

      const now = new Date();
      const previousDetail = device.status?.permissionsDetail as Record<string, boolean> | null;
      device.status = {
        effectiveStatus,
        vpnActive: payload.vpnActive,
        permissionsOk: payload.permissionsOk,
        permissionsDetail: normalizedPermissionsDetail ?? device.status.permissionsDetail ?? null,
        batteryLevel: payload.batteryLevel ?? device.status.batteryLevel,
        isCharging: payload.isCharging ?? device.status.isCharging,
        blocklistVersion: payload.blocklistVersion,
        appVersion: payload.appVersion || device.appVersion,
        lastHeartbeatAt: now,
      };
      device.lastSeenAt = now;

      // Detectar cambios en permisos en modo mock
      if (device.config?.notifyOnSecurity && previousDetail && normalizedPermissionsDetail) {
        this.checkAndNotifyPermissionChanges(device as any, payload, { permissionsDetail: previousDetail }).catch(() => {});
      }

      return {
        status: 'OK',
        effectiveStatus: device.status.effectiveStatus,
        serverTime: now,
        requiresListSync: false,
      };
    }

    const device = await prisma.device.findFirst({
      where: {
        OR: [{ deviceUuid: payload.deviceUuid }, { id: payload.deviceUuid }],
      },
      include: {
        config: true,
        status: true,
      },
    });

    if (!device) {
      throw new AppError('Dispositivo no registrado en el sistema', 404);
    }

    // Calcular estado efectivo de protección basado en condiciones reales
    let effectiveStatus: ProtectionStatus = ProtectionStatus.ACTIVE;

    if (!payload.permissionsOk) {
      effectiveStatus = ProtectionStatus.PERMISSION_REQUIRED;
    } else if (!payload.vpnActive) {
      effectiveStatus = ProtectionStatus.INACTIVE;
    } else if (device.config && !device.config.protectionEnabled) {
      effectiveStatus = ProtectionStatus.INACTIVE;
    }

    const now = new Date();

    // Obtener estado anterior para detectar cambios en permisos
    const previousStatus = await prisma.deviceStatus.findUnique({
      where: { deviceId: device.id },
    });

    // Actualizar o crear registro de estado (incluyendo detalle granular de los 6 permisos)
    const status = await prisma.deviceStatus.upsert({
      where: { deviceId: device.id },
      update: {
        effectiveStatus,
        vpnActive: payload.vpnActive,
        permissionsOk: payload.permissionsOk,
        ...(normalizedPermissionsDetail !== undefined
          ? { permissionsDetail: normalizedPermissionsDetail }
          : {}),
        batteryLevel: payload.batteryLevel,
        isCharging: payload.isCharging,
        blocklistVersion: payload.blocklistVersion,
        appVersion: payload.appVersion || device.appVersion,
        lastHeartbeatAt: now,
      },
      create: {
        deviceId: device.id,
        effectiveStatus,
        vpnActive: payload.vpnActive,
        permissionsOk: payload.permissionsOk,
        ...(normalizedPermissionsDetail !== undefined
          ? { permissionsDetail: normalizedPermissionsDetail }
          : {}),
        batteryLevel: payload.batteryLevel,
        isCharging: payload.isCharging,
        blocklistVersion: payload.blocklistVersion,
        appVersion: payload.appVersion || device.appVersion,
        lastHeartbeatAt: now,
      },
    });

    // Actualizar fecha de última conexión y versión de app en el dispositivo
    await prisma.device.update({
      where: { id: device.id },
      data: {
        lastSeenAt: now,
        ...(payload.appVersion ? { appVersion: payload.appVersion } : {}),
      },
    });

    // Detectar cambios en permisos y notificar si alguno se desactivó
    if (device.config?.notifyOnSecurity) {
      this.checkAndNotifyPermissionChanges(device, payload, previousStatus).catch(() => {});
    }

    return {
      status: 'OK',
      effectiveStatus: status.effectiveStatus,
      serverTime: now,
      requiresListSync: false,
    };
  }

  /**
   * Registra un evento de intento de acceso a un dominio bloqueado.
   */
  public async recordBlockedEvent(input: RecordBlockedEventInput) {
    const rawSource = (input.sourceListType || 'LOTBA').toUpperCase();
    const resolvedItemType =
      input.itemType?.toUpperCase() === 'APP' || rawSource.endsWith('_APP')
        ? 'APP'
        : 'SITE';

    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find((d) => d.deviceUuid === input.deviceUuid);
      const newEvent: MockBlockedEvent = {
        id: `evt-block-${Date.now()}`,
        deviceId: device ? device.id : input.deviceUuid,
        attemptedDomain: input.attemptedDomain,
        sourceListType: input.sourceListType || 'LOTBA',
        itemType: resolvedItemType,
        blockedAt: new Date(),
      };
      mockDb.blockedEvents.push(newEvent);

      // Enviar notificaciones en modo mock
      if (device?.config?.notifyOnBlock && device.userId) {
        (device as any).user = mockDb.users.find((u) => u.id === device.userId);
        this.sendBlockedEventNotifications(device, input.attemptedDomain, rawSource, resolvedItemType).catch(() => {});
      }
      return newEvent;
    }

    const device = await prisma.device.findFirst({
      where: {
        OR: [{ deviceUuid: input.deviceUuid }, { id: input.deviceUuid }],
      },
      include: { user: true, config: true },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    const event = await prisma.blockedEvent.create({
      data: {
        deviceId: device.id,
        attemptedDomain: input.attemptedDomain,
        sourceListType: input.sourceListType || 'LOTBA',
        itemType: resolvedItemType,
      },
    });

    // Enviar notificaciones si está habilitado
    if (device.config?.notifyOnBlock && device.userId) {
      this.sendBlockedEventNotifications(device, input.attemptedDomain, rawSource, resolvedItemType).catch(() => {});
    }

    return event;
  }

  /**
   * Envía notificaciones (push + email) para eventos de bloqueo
   */
  private async sendBlockedEventNotifications(
    device: { id: string; userId: string; childName?: string | null; deviceName: string; personType?: string | null; user?: { email: string; fullName: string } | null; config?: { notifyOnBlock: boolean } | null },
    attemptedDomain: string,
    sourceListType: string,
    itemType: 'SITE' | 'APP'
  ) {
    const userId = device.userId;
    const protectedName = device.childName || device.deviceName;
    const responsableName = device.user?.fullName || 'Responsable';
    const activityLink = 'baprotege://activity';
    const sitesAndAppsLink = 'baprotege://sites-and-apps';
    const limitsLink = 'baprotege://limits';

    const isAdultDevice = device.personType === 'ADULTO';
    const isSelfProtection = isAdultDevice && (sourceListType === 'CUSTOM' || sourceListType === 'CUSTOM_APP');
    const isAdultProtected = isAdultDevice && (sourceListType === 'ADULTO_PROTEGIDO' || sourceListType === 'ADULTO_PROTEGIDO_APP');

    // Push notification
    if (itemType === 'APP') {
      if (isSelfProtection) {
        await notificationService.sendSelfProtectionTimeLimitAlert(userId, attemptedDomain);
      } else if (isAdultProtected) {
        await notificationService.sendSelfCareTimeLimitAlert(userId, attemptedDomain);
      } else {
        await notificationService.sendBlockedAppAttemptAlert(userId, protectedName, attemptedDomain);
      }
    } else if (sourceListType === 'LOTBA' || sourceListType === 'OFFICIAL_LOTBA') {
      await notificationService.sendLotbaBlockedSiteAlert(userId, protectedName);
    } else if (isSelfProtection) {
      await notificationService.sendSelfProtectionBlockedSiteAlert(userId);
    } else if (isAdultProtected) {
      await notificationService.sendSelfCareBlockedSiteAlert(userId, attemptedDomain);
    } else {
      await notificationService.sendCustomBlockedSiteAlert(userId, protectedName);
    }

    // Email
    if (device.user?.email) {
      if (itemType === 'APP') {
        if (isSelfProtection) {
          const emailData = getSelfProtectionAppLimitEmail({
            displayName: responsableName,
            appName: attemptedDomain,
            link: limitsLink,
          });
          await emailService.sendEmail(device.user.email, emailData.subject, emailData.text, emailData.html);
        } else if (isAdultProtected) {
          const emailData = getAdultProtectedAppLimitEmail({
            displayName: responsableName,
            appName: attemptedDomain,
            link: activityLink,
          });
          await emailService.sendEmail(device.user.email, emailData.subject, emailData.text, emailData.html);
        } else {
          const emailData = getBlockedAppAlertEmail({
            displayName: responsableName,
            protectedName,
            appName: attemptedDomain,
            link: activityLink,
          });
          await emailService.sendEmail(device.user.email, emailData.subject, emailData.text, emailData.html);
        }
      } else if (sourceListType === 'LOTBA' || sourceListType === 'OFFICIAL_LOTBA') {
        const emailData = getBlockedSiteAlertEmail({
          displayName: responsableName,
          protectedName,
          link: activityLink,
        });
        await emailService.sendEmail(device.user.email, emailData.subject, emailData.text, emailData.html);
      } else if (isSelfProtection) {
        const emailData = getSelfProtectionSiteReminderEmail({
          displayName: responsableName,
          siteName: attemptedDomain,
          link: sitesAndAppsLink,
        });
        await emailService.sendEmail(device.user.email, emailData.subject, emailData.text, emailData.html);
      } else if (isAdultProtected) {
        const emailData = getAdultProtectedSiteReminderEmail({
          displayName: responsableName,
          siteName: attemptedDomain,
          link: sitesAndAppsLink,
        });
        await emailService.sendEmail(device.user.email, emailData.subject, emailData.text, emailData.html);
      } else {
        const emailData = getCustomBlockedSiteAlertEmail({
          displayName: responsableName,
          protectedName,
          link: activityLink,
        });
        await emailService.sendEmail(device.user.email, emailData.subject, emailData.text, emailData.html);
      }
    }
  }

  /**
   * Registra un evento de seguridad o intento de evasión (Anti-bypass).
   */
  public async recordSecurityEvent(input: RecordSecurityEventInput) {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find(
        (d) => d.deviceUuid === input.deviceUuid || d.id === input.deviceUuid,
      );
      const newEvent: MockSecurityEvent = {
        id: `sec-${Date.now()}`,
        deviceId: device ? device.id : input.deviceUuid,
        eventType: input.eventType,
        description: input.description || 'Alerta de seguridad',
        metadata: input.metadata,
        occurredAt: new Date(),
      };
      mockDb.securityEvents.push(newEvent);

      if (device?.status) {
        if (input.eventType === 'VPN_DISABLED') {
          device.status.effectiveStatus = 'INACTIVE';
          device.status.vpnActive = false;
        } else if (input.eventType === 'PERMISSION_REVOKED') {
          device.status.effectiveStatus = 'PERMISSION_REQUIRED';
          device.status.permissionsOk = false;
        }
      }

      if (device?.config?.notifyOnSecurity) {
        const protectedName = device.childName || device.deviceName;
        const responsable = mockDb.users.find((u) => u.id === device.userId);
        const displayName = responsable?.fullName || 'Responsable';
        const activityLink = 'baprotege://activity';
        if (input.eventType === 'UNINSTALL_ATTEMPT') {
          notificationService.sendUninstallAttemptAlert(device.userId, protectedName).catch(() => {});
          if (responsable?.email) {
            const emailData = getUninstallAttemptAlertEmail({ displayName, protectedName, link: activityLink });
            await emailService.sendEmail(responsable.email, emailData.subject, emailData.text, emailData.html).catch(() => {});
          }
        }
      }

      return newEvent;
    }

    const device = await prisma.device.findFirst({
      where: {
        OR: [{ deviceUuid: input.deviceUuid }, { id: input.deviceUuid }],
      },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    const event = await prisma.securityEvent.create({
      data: {
        deviceId: device.id,
        eventType: input.eventType,
        description: input.description,
        metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined,
      },
    });

    // Si el evento indica pérdida de protección, actualizar el estado efectivo real
    if (input.eventType === 'VPN_DISABLED') {
      await prisma.deviceStatus.updateMany({
        where: { deviceId: device.id },
        data: {
          effectiveStatus: ProtectionStatus.INACTIVE,
          vpnActive: false,
        },
      });
    } else if (input.eventType === 'PERMISSION_REVOKED') {
      await prisma.deviceStatus.updateMany({
        where: { deviceId: device.id },
        data: {
          effectiveStatus: ProtectionStatus.PERMISSION_REQUIRED,
          permissionsOk: false,
        },
      });
    }

     // Enviar notificación al responsable si notifyOnSecurity está habilitado
     const deviceWithConfig = await prisma.device.findUnique({
       where: { id: device.id },
       include: { config: true, user: true },
     });

     if (deviceWithConfig?.config?.notifyOnSecurity) {
        const protectedName = deviceWithConfig.childName || deviceWithConfig.deviceName;
        const displayName = deviceWithConfig.user?.fullName || 'Responsable';
        const activityLink = 'baprotege://activity';
         if (input.eventType === 'UNINSTALL_ATTEMPT') {
          notificationService.sendUninstallAttemptAlert(device.userId, protectedName).catch(() => {});
          if (deviceWithConfig.user?.email) {
            const emailData = getUninstallAttemptAlertEmail({ displayName, protectedName, link: activityLink });
            await emailService.sendEmail(deviceWithConfig.user.email, emailData.subject, emailData.text, emailData.html).catch(() => {});
          }
        }
      }

      return event;
  }

  /**
   * Resuelve el ID interno de un dispositivo a partir de su UUID (o el propio UUID en modo mock).
   */
  private async resolveDeviceId(deviceUuid: string): Promise<{ deviceId: string; personType: 'MENOR' | 'ADULTO' }> {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find(
        (d) => d.deviceUuid === deviceUuid || d.id === deviceUuid,
      );
      const personType =
        device?.personType?.toUpperCase() === 'ADULTO' ? 'ADULTO' : 'MENOR';
      return {
        deviceId: device ? device.id : deviceUuid,
        personType,
      };
    }

    const device = await prisma.device.findFirst({
      where: {
        OR: [{ deviceUuid }, { id: deviceUuid }],
      },
      select: { id: true, personType: true },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    return {
      deviceId: device.id,
      personType: device.personType === 'ADULTO' ? 'ADULTO' : 'MENOR',
    };
  }

  /**
   * Registra progreso o finalización diaria de un pasatiempo (Quiz, Sopa de letras o Memoria).
   */
  public async recordPasatiempoProgress(input: RecordPasatiempoInput) {
    const { deviceId, personType } = await this.resolveDeviceId(input.deviceUuid);
    const dateKey = input.dateKey || formatDateKey();
    const totalItems = Math.max(0, Math.round(input.totalItems));
    const correctCount = Math.max(0, Math.round(input.correctCount));
    const wrongCount =
      input.wrongCount !== undefined
        ? Math.max(0, Math.round(input.wrongCount))
        : Math.max(0, totalItems - correctCount);

    const session = await activityStorageService.upsertPasatiempoSession({
      deviceId,
      dateKey,
      gameType: input.gameType,
      status: input.status,
      correctCount,
      wrongCount,
      totalItems,
      attempts: Math.max(0, Math.round(input.attempts ?? 0)),
      details: input.details ?? null,
      completedAt: input.completedAt ?? null,
    });

    const history = await activityStorageService.listPasatiempoSessions([deviceId], 30);
    const streakDays = activityStorageService.computeStreakDays(history, personType, dateKey);
    const weeklyQuizAccuracyPct = activityStorageService.computeWeeklyQuizAccuracyPct(
      history,
      dateKey,
    );

    return {
      session,
      streakDays,
      weeklyQuizAccuracyPct,
    };
  }

  /**
   * Devuelve las sesiones de pasatiempos del dispositivo (hoy + historial reciente, racha y semanal).
   */
  public async getDevicePasatiempos(deviceUuid: string, dateKey: string = formatDateKey()) {
    const { deviceId, personType } = await this.resolveDeviceId(deviceUuid);
    const history = await activityStorageService.listPasatiempoSessions([deviceId], 30);
    const todaySessions = history.filter((s) => s.dateKey === dateKey);
    const streakDays = activityStorageService.computeStreakDays(history, personType, dateKey);
    const weeklyQuizAccuracyPct = activityStorageService.computeWeeklyQuizAccuracyPct(
      history,
      dateKey,
    );

    return {
      deviceId,
      dateKey,
      profileType: personType,
      today: todaySessions,
      history,
      streakDays,
      weeklyQuizAccuracyPct,
    };
  }

  /**
   * Registra el consumo diario (en minutos) de las apps bloqueadas en el dispositivo.
   */
  public async recordAppUsageSnapshot(input: RecordAppUsageInput) {
    const { deviceId } = await this.resolveDeviceId(input.deviceUuid);
    const dateKey = input.dateKey || formatDateKey();
    const snapshots = await activityStorageService.upsertAppUsageSnapshots(
      deviceId,
      dateKey,
      input.apps,
    );

    return {
      deviceId,
      dateKey,
      apps: snapshots,
    };
  }

  /**
   * Detecta si algún permiso se desactivó comparando con el estado anterior
   * y envía notificación al responsable.
   */
  private async checkAndNotifyPermissionChanges(
    device: { id: string; userId: string; childName?: string | null; deviceName: string; user?: { email: string; fullName: string } | null; config?: { notifyOnSecurity: boolean } | null },
    payload: HeartbeatPayload,
    previousStatus: { permissionsDetail?: unknown } | null
  ) {
    if (!payload.permissions || !previousStatus?.permissionsDetail) {
      return;
    }

    const prevDetail = previousStatus.permissionsDetail as Record<string, boolean> | null;
    if (!prevDetail) {
      return;
    }

    const newDetail = {
      vpn: Boolean(payload.permissions.vpn ?? payload.vpnActive),
      accessibility: Boolean(payload.permissions.accessibility),
      notifications: Boolean(payload.permissions.notifications),
      batteryOptimization: Boolean(payload.permissions.batteryOptimization),
      location: Boolean(payload.permissions.location),
      usageStats: Boolean(payload.permissions.usageStats),
    };

    // Encontrar permisos que estaban activos y ahora están desactivados
    const revokedPermissions: string[] = [];
    for (const [key, value] of Object.entries(newDetail)) {
      const prevValue = prevDetail[key];
      if (prevValue === true && value === false) {
        const permissionNames: Record<string, string> = {
          vpn: 'VPN',
          accessibility: 'Accesibilidad',
          notifications: 'Notificaciones',
          batteryOptimization: 'Optimización de batería',
          location: 'Ubicación',
          usageStats: 'Estadísticas de uso',
        };
        revokedPermissions.push(permissionNames[key] || key);
      }
    }

    if (revokedPermissions.length === 0) {
      return;
    }

    const protectedName = device.childName || device.deviceName;
    const responsableName = device.user?.fullName || 'Responsable';
    const settingsLink = 'https://baprotegemas.netlify.app/settings';

    // Push notification
    await notificationService.sendPermissionDisabledAlert(device.userId, protectedName);

    // Email
    if (device.user?.email) {
      const emailData = getPermissionDisabledAlertEmail({
        displayName: responsableName,
        protectedName,
        permissionName: revokedPermissions.join(', '),
        link: settingsLink,
      });
      await emailService.sendEmail(device.user.email, emailData.subject, emailData.text, emailData.html);
    }
  }
}

export const telemetryService = new TelemetryService();
