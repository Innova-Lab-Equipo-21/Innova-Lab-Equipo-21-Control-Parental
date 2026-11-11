import crypto from 'crypto';
import type { Gender, PersonType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb, MockDevice } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { emailService } from './email.service.js';

export interface GeneratePairingCodeInput {
  userId: string;
  childName: string;
   gender: Gender;
  personType: PersonType;
  birthDate: string;
  phone: string;
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
   * Genera el código de vinculación de 6 dígitos (sin vencimiento) con los datos del protegido.
   * Cada tutor tiene como máximo un código pendiente: generar uno nuevo lo reemplaza y actualiza los datos.
   */
  public async generatePairingCode(input: GeneratePairingCodeInput) {
    const MAX_DEVICES = 5;
    const minor = {
      childName: input.childName,
      gender: input.gender,
      personType: input.personType,
      birthDate: input.birthDate,
      phone: input.phone,
    };

    if (env.USE_MOCK_DATA) {
      // El mock conserva una fecha lejana porque su tipo exige expiresAt; la base real ya no lo usa.
      const expiresAt = new Date('2999-12-31T23:59:59Z');

      const linked = mockDb.devices.filter((d) => d.userId === input.userId && d.isActive).length;
      if (linked >= MAX_DEVICES) {
        throw new AppError(`Alcanzaste el máximo de ${MAX_DEVICES} dispositivos vinculados`, 409);
      }

      let code = this.randomCode();
      while (mockDb.pairings.some((p) => p.pairingCode === code)) {
        code = this.randomCode();
      }

      const existingPending = mockDb.pairings.find((p) => p.userId === input.userId && !p.isUsed);
      if (existingPending) {
        existingPending.pairingCode = code;
        existingPending.minor = minor;
        return { pairingCode: code };
      }

      mockDb.pairings.push({
        id: `pair-mock-${Date.now()}`,
        userId: input.userId,
        deviceId: null,
        pairingCode: code,
        isUsed: false,
        minor,
        expiresAt,
        createdAt: new Date(),
      });

      return { pairingCode: code };
    }

    const linked = await prisma.device.count({
      where: { userId: input.userId, isActive: true },
    });
    if (linked >= MAX_DEVICES) {
      throw new AppError(`Alcanzaste el máximo de ${MAX_DEVICES} dispositivos vinculados`, 409);
    }

    let code = this.randomCode();
    while (await prisma.devicePairing.findUnique({ where: { pairingCode: code } })) {
      code = this.randomCode();
    }

    // birthDate llega como 'AAAA-MM-DD'; la columna es DATE, así que se convierte a Date.
    const minorData = { ...minor, birthDate: new Date(input.birthDate) };

    const existingPending = await prisma.devicePairing.findFirst({
      where: { userId: input.userId, isUsed: false },
    });

    if (existingPending) {
      await prisma.devicePairing.update({
        where: { id: existingPending.id },
        data: { pairingCode: code, ...minorData },
      });
      return { pairingCode: code };
    }

    await prisma.devicePairing.create({
      data: { userId: input.userId, pairingCode: code, ...minorData },
    });

    return { pairingCode: code };
  }

  private randomCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
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
                device.childName = pairing.minor?.childName || input.childName || device.childName;
        device.gender = pairing.minor?.gender ?? device.gender;
        device.personType = pairing.minor?.personType ?? device.personType;
        device.birthDate = pairing.minor?.birthDate ?? device.birthDate;
        device.phone = pairing.minor?.phone ?? device.phone;
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
                    childName: pairing.minor?.childName || input.childName || 'Menor Protegido',
          gender: pairing.minor?.gender,
          personType: pairing.minor?.personType,
          birthDate: pairing.minor?.birthDate,
          phone: pairing.minor?.phone,
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

    // Buscar si el dispositivo ya existía previamente registrado con ese UUID
    let device = await prisma.device.findUnique({
      where: { deviceUuid: input.deviceUuid },
    });

        if (device) {
      // Reasignar dispositivo al usuario del código, con los datos del protegido cargados por el tutor
      device = await prisma.device.update({
        where: { id: device.id },
        data: {
          userId: pairing.userId,
          deviceName: input.deviceName,
          childName: pairing.childName ?? input.childName ?? device.childName,
          gender: pairing.gender ?? device.gender,
          personType: pairing.personType ?? device.personType,
          birthDate: pairing.birthDate ?? device.birthDate,
          phone: pairing.phone ?? device.phone,
          model: input.model || device.model,
          osVersion: input.osVersion || device.osVersion,
          appVersion: input.appVersion || device.appVersion,
          isActive: true,
          lastSeenAt: new Date(),
        },
      });
    } else {
      // Crear nuevo dispositivo vinculado al responsable, copiando los datos del protegido
      device = await prisma.device.create({
        data: {
          userId: pairing.userId,
          deviceUuid: input.deviceUuid,
          deviceName: input.deviceName,
          childName: pairing.childName ?? input.childName,
          gender: pairing.gender,
          personType: pairing.personType,
          birthDate: pairing.birthDate,
          phone: pairing.phone,
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
