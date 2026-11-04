import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb, MockDevice } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { emailService } from './email.service.js';

export interface GeneratePairingCodeInput {
  userId: string;
}

export interface ConfirmPairingInput {
  pairingCode: string;
  deviceUuid: string;
  deviceName: string;
  childName?: string;
  model?: string;
  osVersion?: string;
  appVersion?: string;
}

export interface UpdateProtectionConfigInput {
  userId: string;
  deviceId: string;
  protectionEnabled?: boolean;
  blockGambling?: boolean;
  blockCustomList?: boolean;
  notifyOnBlock?: boolean;
  notifyOnSecurity?: boolean;
  heartbeatIntervalSec?: number;
}

export class DeviceService {
  /**
   * Genera un código de pareamiento temporal de 6 dígitos para que el responsable vincule un dispositivo.
   */
  public async generatePairingCode(input: GeneratePairingCodeInput) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Código nunca expira (100 años en el futuro)
    const expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);

    if (env.USE_MOCK_DATA) {
      let existingPending = mockDb.pairings.find(
        (p) => p.userId === input.userId && !p.isUsed
      );

      if (existingPending) {
        existingPending.pairingCode = code;
        existingPending.expiresAt = expiresAt;
        return {
          pairingCode: code,
          expiresAt,
        };
      }

      mockDb.pairings.push({
        id: `pair-mock-${Date.now()}`,
        userId: input.userId,
        deviceId: null,
        pairingCode: code,
        isUsed: false,
        expiresAt,
        createdAt: new Date(),
      });

      return {
        pairingCode: code,
        expiresAt,
      };
    }

    const existingPending = await prisma.devicePairing.findFirst({
      where: {
        userId: input.userId,
        isUsed: false,
      },
    });

    if (existingPending) {
      const updated = await prisma.devicePairing.update({
        where: { id: existingPending.id },
        data: {
          pairingCode: code,
          expiresAt,
        },
      });
      return {
        pairingCode: updated.pairingCode,
        expiresAt: updated.expiresAt,
      };
    }

    const pairing = await prisma.devicePairing.create({
      data: {
        userId: input.userId,
        pairingCode: code,
        expiresAt,
      },
    });

    return {
      pairingCode: pairing.pairingCode,
      expiresAt: pairing.expiresAt,
    };
  }

  /**
   * Confirma el pareamiento desde el dispositivo del menor utilizando el código ingresado.
   */
  public async confirmPairing(input: ConfirmPairingInput) {
    if (env.USE_MOCK_DATA) {
      const pairing = mockDb.pairings.find((p) => p.pairingCode === input.pairingCode);

      if (!pairing || pairing.isUsed) {
        throw new AppError('Código de pareamiento inválido o ya utilizado', 400);
      }

      let device = mockDb.devices.find((d) => d.deviceUuid === input.deviceUuid);

      if (device) {
        device.userId = pairing.userId;
        device.deviceName = input.deviceName;
        device.childName = input.childName || device.childName;
        device.model = input.model || device.model;
        device.osVersion = input.osVersion || device.osVersion;
        device.appVersion = input.appVersion || device.appVersion;
        device.isActive = true;
        device.lastSeenAt = new Date();
      } else {
        const newDevice: MockDevice = {
          id: `dev-mock-${Date.now()}`,
          userId: pairing.userId,
          deviceUuid: input.deviceUuid,
          deviceName: input.deviceName,
          childName: input.childName || 'Menor Protegido',
          model: input.model || 'Android Device',
          osVersion: input.osVersion || 'Android 14',
          appVersion: input.appVersion || '1.0.0',
          isActive: true,
          lastSeenAt: new Date(),
          createdAt: new Date(),
          status: {
            effectiveStatus: 'ACTIVE',
            vpnActive: true,
            permissionsOk: true,
            batteryLevel: 90,
            isCharging: false,
            blocklistVersion: 4,
            appVersion: input.appVersion || '1.0.0',
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
        mockDb.devices.push(newDevice);
        device = newDevice;
      }

      pairing.isUsed = true;
      pairing.deviceId = device.id;

      return {
        message: 'Dispositivo vinculado con éxito',
        deviceId: device.id,
        deviceUuid: device.deviceUuid,
      };
    }

    const pairing = await prisma.devicePairing.findUnique({
      where: { pairingCode: input.pairingCode },
    });

    if (!pairing || pairing.isUsed) {
      throw new AppError('Código de pareamiento inválido o ya utilizado', 400);
    }

    if (new Date() > pairing.expiresAt) {
      throw new AppError('El código de pareamiento ha expirado', 400);
    }

    // Buscar si el dispositivo ya existía previamente registrado con ese UUID
    let device = await prisma.device.findUnique({
      where: { deviceUuid: input.deviceUuid },
    });

    if (device) {
      // Reasignar dispositivo al usuario del código
      device = await prisma.device.update({
        where: { id: device.id },
        data: {
          userId: pairing.userId,
          deviceName: input.deviceName,
          childName: input.childName || device.childName,
          model: input.model || device.model,
          osVersion: input.osVersion || device.osVersion,
          appVersion: input.appVersion || device.appVersion,
          isActive: true,
          lastSeenAt: new Date(),
        },
      });
    } else {
      // Crear nuevo dispositivo vinculado al responsable
      device = await prisma.device.create({
        data: {
          userId: pairing.userId,
          deviceUuid: input.deviceUuid,
          deviceName: input.deviceName,
          childName: input.childName,
          model: input.model,
          osVersion: input.osVersion,
          appVersion: input.appVersion,
          config: {
            create: {
              protectionEnabled: true,
              blockGambling: true,
              blockCustomList: true,
            },
          },
          status: {
            create: {
              effectiveStatus: 'STARTING',
              vpnActive: false,
              permissionsOk: true,
            },
          },
        },
      });
    }

    // Marcar el código como utilizado
    await prisma.devicePairing.update({
      where: { id: pairing.id },
      data: {
        isUsed: true,
        deviceId: device.id,
      },
    });

    // Enviar mail al responsable por la vinculación
    const user = await prisma.user.findUnique({ where: { id: pairing.userId } });
    if (user?.email) {
      emailService
        .sendEmail(
          user.email,
          'Dispositivo vinculado',
          `El dispositivo ${device.deviceName} ha sido vinculado a tu cuenta.`,
        )
        .catch(() => {});
    }

    return {
      message: 'Dispositivo vinculado con éxito',
      deviceId: device.id,
      deviceUuid: device.deviceUuid,
    };
  }

  /**
   * Obtiene la lista de dispositivos vinculados a un responsable con su estado efectivo actual.
   */
  public async getDevicesByUser(userId: string) {
    if (env.USE_MOCK_DATA) {
      return mockDb.devices.filter((d) => d.userId === userId && d.isActive);
    }

    const devices = await prisma.device.findMany({
      where: { userId, isActive: true },
      include: {
        status: true,
        config: true,
        _count: {
          select: {
            blockedEvents: true,
            securityEvents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return devices;
  }

  /**
   * Obtiene el detalle de un dispositivo perteneciente al responsable autenticado.
   */
  public async getDeviceDetail(userId: string, deviceId: string) {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find((d) => d.id === deviceId && d.userId === userId);
      if (!device) {
        throw new AppError('Dispositivo no encontrado o no pertenece a este usuario', 404);
      }
      return {
        ...device,
        blockedEvents: mockDb.blockedEvents.filter((e) => e.deviceId === device.id),
        securityEvents: mockDb.securityEvents.filter((e) => e.deviceId === device.id),
      };
    }

    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId },
      include: {
        status: true,
        config: true,
        blockedEvents: {
          take: 20,
          orderBy: { blockedAt: 'desc' },
        },
        securityEvents: {
          take: 20,
          orderBy: { occurredAt: 'desc' },
        },
      },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado o no pertenece a este usuario', 404);
    }

    return device;
  }

  /**
   * Actualiza la configuración de protección de un dispositivo por parte del responsable.
   */
  public async updateProtectionConfig(input: UpdateProtectionConfigInput) {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find((d) => d.id === input.deviceId && d.userId === input.userId);
      if (!device) {
        throw new AppError('Dispositivo no encontrado o no pertenece a este usuario', 404);
      }

      device.config = {
        ...device.config,
        ...(input.protectionEnabled !== undefined && { protectionEnabled: input.protectionEnabled }),
        ...(input.blockGambling !== undefined && { blockGambling: input.blockGambling }),
        ...(input.blockCustomList !== undefined && { blockCustomList: input.blockCustomList }),
        ...(input.notifyOnBlock !== undefined && { notifyOnBlock: input.notifyOnBlock }),
        ...(input.notifyOnSecurity !== undefined && { notifyOnSecurity: input.notifyOnSecurity }),
        ...(input.heartbeatIntervalSec !== undefined && { heartbeatIntervalSec: input.heartbeatIntervalSec }),
      };

      return device.config;
    }

    const device = await prisma.device.findFirst({
      where: { id: input.deviceId, userId: input.userId },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado o no pertenece a este usuario', 404);
    }

    const updatedConfig = await prisma.protectionConfig.upsert({
      where: { deviceId: input.deviceId },
      update: {
        ...(input.protectionEnabled !== undefined && { protectionEnabled: input.protectionEnabled }),
        ...(input.blockGambling !== undefined && { blockGambling: input.blockGambling }),
        ...(input.blockCustomList !== undefined && { blockCustomList: input.blockCustomList }),
        ...(input.notifyOnBlock !== undefined && { notifyOnBlock: input.notifyOnBlock }),
        ...(input.notifyOnSecurity !== undefined && { notifyOnSecurity: input.notifyOnSecurity }),
        ...(input.heartbeatIntervalSec !== undefined && { heartbeatIntervalSec: input.heartbeatIntervalSec }),
      },
      create: {
        deviceId: input.deviceId,
        protectionEnabled: input.protectionEnabled ?? true,
        blockGambling: input.blockGambling ?? true,
        blockCustomList: input.blockCustomList ?? true,
        notifyOnBlock: input.notifyOnBlock ?? true,
        notifyOnSecurity: input.notifyOnSecurity ?? true,
        heartbeatIntervalSec: input.heartbeatIntervalSec ?? 60,
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'UPDATE_PROTECTION_CONFIG',
        details: { deviceId: input.deviceId, config: updatedConfig },
      },
    });

    return updatedConfig;
  }
}

export const deviceService = new DeviceService();
