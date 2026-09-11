import { ProtectionStatus, SecurityEventType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb, MockBlockedEvent, MockSecurityEvent } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { HeartbeatPayload } from '../types/index.js';

export interface RecordBlockedEventInput {
  deviceUuid: string;
  attemptedDomain: string;
  sourceListType?: string;
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
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find((d) => d.deviceUuid === input.deviceUuid);
      const newEvent: MockBlockedEvent = {
        id: `evt-block-${Date.now()}`,
        deviceId: device ? device.id : input.deviceUuid,
        attemptedDomain: input.attemptedDomain,
        sourceListType: input.sourceListType || 'LOTBA',
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

      if (device && (input.eventType === 'VPN_DISABLED' || input.eventType === 'PERMISSION_REVOKED')) {
        device.status.effectiveStatus = input.eventType === 'VPN_DISABLED' ? 'INACTIVE' : 'PERMISSION_REQUIRED';
        device.status.vpnActive = false;
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

    return event;
  }
}

export const telemetryService = new TelemetryService();
