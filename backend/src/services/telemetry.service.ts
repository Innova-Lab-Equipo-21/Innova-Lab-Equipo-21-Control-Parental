import { ProtectionStatus, SecurityEventType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb, MockBlockedEvent, MockSecurityEvent } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { HeartbeatPayload } from '../types/index.js';
import { notificationService } from './notification.service.js';
import {
  activityStorageService,
  formatDateKey,
  PasatiempoGameType,
  PasatiempoStatus,
  UpsertAppUsageItemInput,
} from './activity-storage.service.js';

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
      device.status = {
        effectiveStatus,
        vpnActive: payload.vpnActive,
        permissionsOk: payload.permissionsOk,
        batteryLevel: payload.batteryLevel ?? device.status.batteryLevel,
        isCharging: payload.isCharging ?? device.status.isCharging,
        blocklistVersion: payload.blocklistVersion,
        appVersion: payload.appVersion || device.appVersion,
        lastHeartbeatAt: now,
      };
      device.lastSeenAt = now;

      return {
        status: 'OK',
        effectiveStatus: device.status.effectiveStatus,
        serverTime: now,
        requiresListSync: false,
      };
    }

    const device = await prisma.device.findUnique({
      where: { deviceUuid: payload.deviceUuid },
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

    // Actualizar o crear registro de estado
    const status = await prisma.deviceStatus.upsert({
      where: { deviceId: device.id },
      update: {
        effectiveStatus,
        vpnActive: payload.vpnActive,
        permissionsOk: payload.permissionsOk,
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
        batteryLevel: payload.batteryLevel,
        isCharging: payload.isCharging,
        blocklistVersion: payload.blocklistVersion,
        appVersion: payload.appVersion || device.appVersion,
        lastHeartbeatAt: now,
      },
    });

    // Actualizar fecha de última conexión en el dispositivo
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: now },
    });

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
      return newEvent;
    }

    const device = await prisma.device.findUnique({
      where: { deviceUuid: input.deviceUuid },
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

    return event;
  }

  /**
   * Registra un evento de seguridad o intento de evasión (Anti-bypass).
   */
  public async recordSecurityEvent(input: RecordSecurityEventInput) {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find((d) => d.deviceUuid === input.deviceUuid);
      const newEvent: MockSecurityEvent = {
        id: `sec-${Date.now()}`,
        deviceId: device ? device.id : input.deviceUuid,
        eventType: input.eventType,
        description: input.description || 'Alerta de seguridad',
        metadata: input.metadata,
        occurredAt: new Date(),
      };
      mockDb.securityEvents.push(newEvent);

       if (device?.status && (input.eventType === 'VPN_DISABLED' || input.eventType === 'PERMISSION_REVOKED')) {
         device.status.effectiveStatus = input.eventType === 'VPN_DISABLED' ? 'INACTIVE' : 'PERMISSION_REQUIRED';
         device.status.vpnActive = false;
       }

       if (device?.config?.notifyOnSecurity) {
         const description = input.description || 'Alerta de seguridad';
         notificationService.sendSecurityAlert(device.userId, device.deviceName, input.eventType, description).catch(() => {});
       }

       return newEvent;
    }

    const device = await prisma.device.findUnique({
      where: { deviceUuid: input.deviceUuid },
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

     // Si el evento indica pérdida de protección, actualizar estado a BYPASS_DETECTED o INACTIVE
     if (input.eventType === 'VPN_DISABLED' || input.eventType === 'PERMISSION_REVOKED') {
       await prisma.deviceStatus.updateMany({
         where: { deviceId: device.id },
         data: {
           effectiveStatus: input.eventType === 'VPN_DISABLED' ? ProtectionStatus.INACTIVE : ProtectionStatus.PERMISSION_REQUIRED,
           vpnActive: false,
         },
       });
     }

     // Enviar notificación al responsable si notifyOnSecurity está habilitado
     const deviceWithConfig = await prisma.device.findUnique({
       where: { id: device.id },
       include: { config: true, user: true },
     });

     if (deviceWithConfig?.config?.notifyOnSecurity) {
       const description = input.description || 'Alerta de seguridad';
       notificationService.sendSecurityAlert(device.userId, device.deviceName, input.eventType, description).catch(() => {});
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
}

export const telemetryService = new TelemetryService();
