import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb, MockDevice } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { emailService } from './email.service.js';
import { Gender, PersonType } from '@prisma/client';

export interface GeneratePairingCodeInput {
  userId: string;
  childName: string;
  gender: Gender;
  personType: PersonType;
  birthDate: string;
  phone: string;
  deviceId?: string;
}

export interface CreateDeviceInput {
  childName: string;
  birthDate?: string;
  gender?: 'Masculino' | 'Femenino' | 'Otro' | 'No informado';
  profileType?: 'Menor' | 'Adulto';
  phone?: string;
  deviceModel?: string;
}

export interface UpdateDeviceInput {
  childName?: string;
  birthDate?: string;
  gender?: 'Masculino' | 'Femenino' | 'Otro' | 'No informado';
  profileType?: 'Menor' | 'Adulto';
  phone?: string;
  deviceModel?: string;
}

function parseBirthDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length <= 2 && parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(Date.UTC(year, month, day));
    }
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function mapGender(gender?: string): Gender | null {
  if (!gender) return null;
  const g = gender.toUpperCase().replace(/\s+/g, '_');
  if (['MASCULINO', 'FEMENINO', 'OTRO', 'NO_INFORMADO'].includes(g)) {
    return g as Gender;
  }
  return null;
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
   * Crea un nuevo dispositivo protegido para el responsable y genera automáticamente
   * su código de vinculación de 6 dígitos almacenado en la base de datos.
   */
  public async createDevice(userId: string, input: CreateDeviceInput) {
    // 1. Validar límite máximo de 5 dispositivos
    const existingCount = env.USE_MOCK_DATA
      ? mockDb.devices.filter((d) => d.userId === userId && d.isActive).length
      : await prisma.device.count({ where: { userId, isActive: true } });

    if (existingCount >= 5) {
      throw new AppError(
        'Límite alcanzado: Un responsable solo puede vincular un máximo de 5 dispositivos.',
        400,
      );
    }

    const deviceUuid = `uuid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    const birthDateObj = parseBirthDate(input.birthDate);
    const genderEnum = mapGender(input.gender);
    const personTypeEnum = input.profileType === 'Adulto' ? PersonType.ADULTO : PersonType.MENOR;

    if (env.USE_MOCK_DATA) {
      const newMockDevice: MockDevice = {
        id: `dev-mock-${Date.now()}`,
        userId,
        deviceUuid,
        deviceName: input.childName,
        childName: input.childName,
        model: input.deviceModel || 'Android',
        osVersion: 'Android 14',
        appVersion: '1.0.0',
        isActive: true,
        lastSeenAt: new Date(),
        createdAt: new Date(),
        status: {
          effectiveStatus: 'INACTIVE',
          vpnActive: false,
          permissionsOk: false,
          batteryLevel: 100,
          isCharging: false,
          appVersion: '1.0.0',
          blocklistVersion: 4,
          lastHeartbeatAt: new Date(),
        },
        config: {
          protectionEnabled: true,
          blockGambling: true,
          blockCustomList: true,
          notifyOnBlock: true,
          notifyOnSecurity: true,
          heartbeatIntervalSec: 60,
        },
      };
      mockDb.devices.push(newMockDevice);
      mockDb.pairings.push({
        id: `pair-mock-${Date.now()}`,
        userId,
        deviceId: newMockDevice.id,
        pairingCode,
        isUsed: false,
        expiresAt,
        createdAt: new Date(),
      });

      return {
        device: {
          ...newMockDevice,
          birthDate: input.birthDate,
          gender: input.gender,
          profileType: input.profileType || 'Menor',
          phone: input.phone,
          deviceModel: input.deviceModel || 'Android',
          pairingCode,
        },
        pairingCode,
        expiresAt,
      };
    }

    const device = await prisma.device.create({
      data: {
        userId,
        deviceUuid,
        deviceName: input.childName,
        childName: input.childName,
        model: input.deviceModel || 'Android',
        birthDate: birthDateObj,
        gender: genderEnum,
        personType: personTypeEnum,
        phone: input.phone || null,
        isActive: true,
        status: {
          create: {
            effectiveStatus: 'INACTIVE',
            vpnActive: false,
            permissionsOk: false,
          },
        },
        config: {
          create: {
            protectionEnabled: true,
            blockGambling: true,
            blockCustomList: true,
          },
        },
        pairings: {
          create: {
            userId,
            pairingCode,
            childName: input.childName,
            birthDate: birthDateObj,
            gender: genderEnum,
            personType: personTypeEnum,
            phone: input.phone || null,
            isUsed: false,
            expiresAt,
          },
        },
      },
      include: {
        status: true,
        config: true,
        pairings: {
          where: { isUsed: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return {
      device: {
        ...device,
        pairingCode,
      },
      pairingCode,
      expiresAt,
    };
  }

  /**
   * Actualiza los datos de un dispositivo protegido ya registrado.
   */
  public async updateDevice(userId: string, deviceId: string, input: UpdateDeviceInput) {
    const birthDateObj =
      input.birthDate !== undefined ? parseBirthDate(input.birthDate) : undefined;
    const genderEnum = input.gender !== undefined ? mapGender(input.gender) : undefined;
    const personTypeEnum =
      input.profileType !== undefined
        ? input.profileType === 'Adulto'
          ? PersonType.ADULTO
          : PersonType.MENOR
        : undefined;

    if (env.USE_MOCK_DATA) {
      const dev = mockDb.devices.find((d) => d.id === deviceId && d.userId === userId);
      if (!dev) throw new AppError('Dispositivo no encontrado', 404);
      if (input.childName) {
        dev.childName = input.childName;
        dev.deviceName = input.childName;
      }
      if (input.deviceModel) dev.model = input.deviceModel;
      const pairing = mockDb.pairings.find((p) => p.deviceId === deviceId && !p.isUsed);
      return {
        ...dev,
        pairingCode: pairing?.pairingCode || null,
      };
    }

    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId },
      include: {
        pairings: {
          where: { isUsed: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!device) throw new AppError('Dispositivo no encontrado', 404);

    const dataToUpdate: any = {};
    if (input.childName !== undefined) {
      dataToUpdate.childName = input.childName;
      dataToUpdate.deviceName = input.childName;
    }
    if (birthDateObj !== undefined) dataToUpdate.birthDate = birthDateObj;
    if (genderEnum !== undefined) dataToUpdate.gender = genderEnum;
    if (personTypeEnum !== undefined) dataToUpdate.personType = personTypeEnum;
    if (input.phone !== undefined) dataToUpdate.phone = input.phone || null;
    if (input.deviceModel !== undefined) dataToUpdate.model = input.deviceModel || null;

    const updated = await prisma.device.update({
      where: { id: deviceId },
      data: dataToUpdate,
      include: {
        status: true,
        config: true,
        pairings: {
          where: { isUsed: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return {
      ...updated,
      pairingCode: updated.pairings[0]?.pairingCode || null,
    };
  }

  /**
   * Genera un código de pareamiento temporal de 6 dígitos para que el responsable vincule un dispositivo,con los datos del protegido.
   * Cada tutor tiene como máximo un código pendiente: generar uno nuevo lo reemplaza y actualiza los datos.
   */
  public async generatePairingCode(input: GeneratePairingCodeInput) {
    // Código nunca expira (100 años en el futuro)
    const expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    const MAX_DEVICES = 5;
    const minor = {
      childName: input.childName,
      gender: input.gender,
      personType: input.personType,
      birthDate: input.birthDate,
      phone: input.phone,
    };

    if (env.USE_MOCK_DATA) {
      const linked = mockDb.devices.filter((d) => d.userId === input.userId && d.isActive).length;
      if (linked >= MAX_DEVICES) {
        throw new AppError(`Alcanzaste el máximo de ${MAX_DEVICES} dispositivos vinculados`, 409);
      }
      let code = this.randomCode();
      while (mockDb.pairings.some((p) => p.pairingCode === code)) {
        code = this.randomCode();
      }
      let existingPending = mockDb.pairings.find(
        (p) =>
          p.userId === input.userId &&
          (!input.deviceId || p.deviceId === input.deviceId) &&
          !p.isUsed,
      );

      if (existingPending) {
        existingPending.pairingCode = code;
        existingPending.minor = minor;
        existingPending.expiresAt = expiresAt;
        return {
          pairingCode: code,
          expiresAt,
        };
      }

      mockDb.pairings.push({
        id: `pair-mock-${Date.now()}`,
        userId: input.userId,
        deviceId: input.deviceId || null,
        pairingCode: code,
        isUsed: false,
        minor,
        expiresAt,
        createdAt: new Date(),
      });

      return {
        pairingCode: code,
        expiresAt,
      };
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
      where: {
        userId: input.userId,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPending) {
      const updated = await prisma.devicePairing.update({
        where: { id: existingPending.id },
        data: {
          pairingCode: code,
          expiresAt,
          ...(input.deviceId && { deviceId: input.deviceId }),
          ...minorData,
        },
      });
      return { pairingCode: updated.pairingCode, expiresAt: updated.expiresAt };
    }

    const pairing = await prisma.devicePairing.create({
      data: {
        userId: input.userId,
        deviceId: input.deviceId || null,
        pairingCode: code,
        expiresAt,
        ...minorData,
      },
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

    // Todo en una transacción: el código se marca como usado de forma atómica,
    // así dos celulares que confirman a la vez no pueden usar el mismo código.
    // Si algo falla después, se revierte y el código vuelve a quedar disponible.
    const { pairing, device } = await prisma.$transaction(async (tx) => {
      const claimed = await tx.devicePairing.updateMany({
        where: { pairingCode: input.pairingCode, isUsed: false },
        data: { isUsed: true },
      });
      if (claimed.count === 0) {
        throw new AppError('Código de pareamiento inválido o ya utilizado', 400);
      }

      const pairing = await tx.devicePairing.findUniqueOrThrow({
        where: { pairingCode: input.pairingCode },
      });

      // Buscar si el dispositivo ya existía previamente registrado con ese UUID o ID precreado
      let device = await tx.device.findUnique({
        where: { deviceUuid: input.deviceUuid },
      });

      if (!device && pairing.deviceId) {
        device = await tx.device.findUnique({
          where: { id: pairing.deviceId },
        });
      }

      if (device) {
        // Reasignar dispositivo al usuario del código , con los datos del protegido cargados por el tutor y UUID real
        device = await tx.device.update({
          where: { id: device.id },
          data: {
            userId: pairing.userId,
            deviceUuid: input.deviceUuid,
            deviceName: input.deviceName,
            childName: pairing.childName || input.childName || device.childName,
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

        // Actualizar estado del dispositivo a STARTING / ACTIVE
        await prisma.deviceStatus.upsert({
          where: { deviceId: device.id },
          update: {
            effectiveStatus: 'STARTING',
            vpnActive: true,
            permissionsOk: true,
            lastHeartbeatAt: new Date(),
          },
          create: {
            deviceId: device.id,
            effectiveStatus: 'STARTING',
            vpnActive: true,
            permissionsOk: true,
          },
        });
      } else {
        // Crear nuevo dispositivo vinculado al responsable, copiando los datos del protegido
        device = await tx.device.create({
          data: {
            userId: pairing.userId,
            deviceUuid: input.deviceUuid,
            deviceName: input.deviceName,
            childName: input.childName || pairing.childName,
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

      await tx.devicePairing.update({
        where: { id: pairing.id },
        data: { deviceId: device.id },
      });

      return { pairing, device };
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
   * Obtiene la lista de dispositivos vinculados a un responsable con su estado efectivo actual
   * e incluye el código de vinculación activo recuperado de la base de datos.
   */
  public async getDevicesByUser(userId: string) {
    if (env.USE_MOCK_DATA) {
      return mockDb.devices
        .filter((d) => d.userId === userId && d.isActive)
        .map((d) => {
          const p = mockDb.pairings.find((pair) => pair.deviceId === d.id && !pair.isUsed);
          return {
            ...d,
            pairingCode: p?.pairingCode || null,
          };
        });
    }

    const devices = await prisma.device.findMany({
      where: { userId, isActive: true },
      include: {
        status: true,
        config: true,
        pairings: {
          where: { isUsed: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            blockedEvents: true,
            securityEvents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return devices.map((d) => ({
      ...d,
      pairingCode: d.pairings[0]?.pairingCode || null,
    }));
  }

  /**
   * Obtiene el detalle de un dispositivo perteneciente al responsable autenticado
   * con su código de vinculación activo recuperado de la base de datos.
   */
  public async getDeviceDetail(userId: string, deviceId: string) {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find((d) => d.id === deviceId && d.userId === userId);
      if (!device) {
        throw new AppError('Dispositivo no encontrado o no pertenece a este usuario', 404);
      }
      const p = mockDb.pairings.find((pair) => pair.deviceId === device.id && !pair.isUsed);
      return {
        ...device,
        pairingCode: p?.pairingCode || null,
        blockedEvents: mockDb.blockedEvents.filter((e) => e.deviceId === device.id),
        securityEvents: mockDb.securityEvents.filter((e) => e.deviceId === device.id),
      };
    }

    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId },
      include: {
        status: true,
        config: true,
        pairings: {
          where: { isUsed: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
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

    return {
      ...device,
      pairingCode: device.pairings[0]?.pairingCode || null,
    };
  }

  /**
   * Actualiza la configuración de protección de un dispositivo por parte del responsable.
   */
  public async updateProtectionConfig(input: UpdateProtectionConfigInput) {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find(
        (d) => d.id === input.deviceId && d.userId === input.userId,
      );
      if (!device) {
        throw new AppError('Dispositivo no encontrado o no pertenece a este usuario', 404);
      }

      device.config = {
        ...device.config,
        ...(input.protectionEnabled !== undefined && {
          protectionEnabled: input.protectionEnabled,
        }),
        ...(input.blockGambling !== undefined && { blockGambling: input.blockGambling }),
        ...(input.blockCustomList !== undefined && { blockCustomList: input.blockCustomList }),
        ...(input.notifyOnBlock !== undefined && { notifyOnBlock: input.notifyOnBlock }),
        ...(input.notifyOnSecurity !== undefined && { notifyOnSecurity: input.notifyOnSecurity }),
        ...(input.heartbeatIntervalSec !== undefined && {
          heartbeatIntervalSec: input.heartbeatIntervalSec,
        }),
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
        ...(input.protectionEnabled !== undefined && {
          protectionEnabled: input.protectionEnabled,
        }),
        ...(input.blockGambling !== undefined && { blockGambling: input.blockGambling }),
        ...(input.blockCustomList !== undefined && { blockCustomList: input.blockCustomList }),
        ...(input.notifyOnBlock !== undefined && { notifyOnBlock: input.notifyOnBlock }),
        ...(input.notifyOnSecurity !== undefined && { notifyOnSecurity: input.notifyOnSecurity }),
        ...(input.heartbeatIntervalSec !== undefined && {
          heartbeatIntervalSec: input.heartbeatIntervalSec,
        }),
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

  private activeAntiUninstallCodes = new Map<
    string,
    { code: string; expiresAt: Date; createdAt: Date; email: string }
  >();

  /**
   * Genera y envía por correo electrónico un código de 6 dígitos al responsable
   * para autorizar la desactivación de la protección antidesinstalación en un dispositivo protegido.
   * Si ya existía un código anterior para este dispositivo, queda automáticamente invalidado.
   */
  public async requestAntiUninstallCode(input: { deviceUuid: string }) {
    let responsableEmail = 'tutor@baprotege.gob.ar';
    let deviceName = 'Dispositivo Protegido';

    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find(
        (d) => d.deviceUuid === input.deviceUuid || d.id === input.deviceUuid,
      );
      if (device) {
        deviceName = device.deviceName || device.childName || deviceName;
        const user = mockDb.users.find((u) => u.id === device.userId);
        if (user?.email) {
          responsableEmail = user.email;
        }
      }
    } else {
      try {
        const device = await prisma.device.findFirst({
          where: {
            OR: [{ deviceUuid: input.deviceUuid }, { id: input.deviceUuid }],
          },
          include: { user: true },
        });
        if (device) {
          deviceName = device.deviceName || device.childName || deviceName;
          if (device.user?.email) {
            responsableEmail = device.user.email;
          }
        }
      } catch (err) {
        // Fallback a tutor por defecto
      }
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Invalidar cualquier código previo almacenando el nuevo
    this.activeAntiUninstallCodes.set(input.deviceUuid, {
      code,
      expiresAt,
      createdAt: new Date(),
      email: responsableEmail,
    });

    // Disparar correo al responsable que vinculó el dispositivo
    const emailSubject = 'Código de seguridad para desactivar antidesinstalación - BA Protege+';
    const emailBody = `Hola,\n\nSe ha solicitado desactivar la protección antidesinstalación en el dispositivo protegido "${deviceName}".\n\nTu código de verificación de 6 dígitos es:\n\n${code}\n\nSi no realizaste esta solicitud, no compartas este código con nadie.\n\nEquipo de BA Protege+\nLotería de la Ciudad de Buenos Aires (LOTBA S.E.)`;

    await emailService.sendEmail(responsableEmail, emailSubject, emailBody);

    // Ocultar email para privacidad (ej. t***r@baprotege.gob.ar)
    const [localPart, domain] = responsableEmail.split('@');
    const maskedLocal =
      localPart && localPart.length > 2
        ? `${localPart[0]}***${localPart[localPart.length - 1]}`
        : `${localPart ? localPart[0] : 't'}***`;
    const maskedEmail = `${maskedLocal}@${domain || 'baprotege.gob.ar'}`;

    return {
      message: 'Código de verificación enviado al correo del responsable',
      maskedEmail,
      expiresAt,
      code: env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  /**
   * Invalida el código de desactivación activo para un dispositivo (por ejemplo, si el usuario cierra el modal).
   */
  public async invalidateAntiUninstallCode(input: { deviceUuid: string }) {
    this.activeAntiUninstallCodes.delete(input.deviceUuid);
    return { success: true, message: 'Código invalidado con éxito' };
  }

  /**
   * Verifica el código de 6 dígitos ingresado por el usuario.
   * Si es correcto, el código se consume e invalida inmediatamente.
   */
  public async verifyAntiUninstallCode(input: { deviceUuid: string; code: string }) {
    const record = this.activeAntiUninstallCodes.get(input.deviceUuid);

    if (!record) {
      throw new AppError(
        'No hay un código activo para este dispositivo o ya fue invalidado. Solicitá uno nuevo.',
        400,
      );
    }

    if (new Date() > record.expiresAt) {
      this.activeAntiUninstallCodes.delete(input.deviceUuid);
      throw new AppError('El código de verificación ha expirado. Solicitá uno nuevo.', 400);
    }

    if (record.code !== input.code.trim()) {
      throw new AppError(
        'El código ingresado es incorrecto. Verificá el código enviado al correo del responsable.',
        400,
      );
    }

    // Código válido: consumirlo para que no pueda reutilizarse
    this.activeAntiUninstallCodes.delete(input.deviceUuid);

    return {
      success: true,
      message: 'Código de verificación aceptado',
    };
  }
}

export const deviceService = new DeviceService();
