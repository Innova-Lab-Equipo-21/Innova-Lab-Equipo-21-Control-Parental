// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Servicio de Dispositivos y Vinculación
// Archivo: src/services/device.service.ts
// Descripción: Lógica de negocio para creación, pareamiento, permisos, desvinculación y códigos OTP antidesinstalación.
// ==============================================================================

import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb, MockDevice } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { emailService } from './email.service.js';
import { getDeviceLinkedEmail, getAntiUninstallOtpEmail } from '../templates/emails/index.js';
import { Gender, PersonType } from '@prisma/client';

export interface GeneratePairingCodeInput {
  userId: string;
  childName?: string;
  gender?: Gender | string;
  personType?: PersonType | string;
  birthDate?: string;
  phone?: string;
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
    let pairingCode = this.randomCode();
    if (!env.USE_MOCK_DATA) {
      while (await prisma.devicePairing.findUnique({ where: { pairingCode } })) {
        pairingCode = this.randomCode();
      }
    }
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
    const normalizedGender = mapGender(input.gender as string | undefined) || undefined;
    const normalizedPersonType =
      input.personType && String(input.personType).toUpperCase() === 'ADULTO'
        ? PersonType.ADULTO
        : input.personType && String(input.personType).toUpperCase() === 'MENOR'
          ? PersonType.MENOR
          : undefined;
    const minor = {
      childName: input.childName,
      gender: normalizedGender,
      personType: normalizedPersonType,
      birthDate: input.birthDate,
      phone: input.phone,
    };

    if (env.USE_MOCK_DATA) {
      const linked = mockDb.devices.filter((d) => d.userId === input.userId && d.isActive).length;
      if (!input.deviceId && linked >= MAX_DEVICES) {
        throw new AppError(`Alcanzaste el máximo de ${MAX_DEVICES} dispositivos vinculados`, 409);
      }
      let code = this.randomCode();
      while (mockDb.pairings.some((p) => p.pairingCode === code)) {
        code = this.randomCode();
      }
      const existingPending = mockDb.pairings.find(
        (p) =>
          p.userId === input.userId &&
          (input.deviceId ? p.deviceId === input.deviceId : true) &&
          !p.isUsed,
      );

      if (existingPending) {
        existingPending.pairingCode = code;
        existingPending.minor = {
          childName: minor.childName ?? existingPending.minor?.childName ?? '',
          gender: String(minor.gender ?? existingPending.minor?.gender ?? 'NO_INFORMADO'),
          personType: String(minor.personType ?? existingPending.minor?.personType ?? 'MENOR'),
          birthDate: minor.birthDate ?? existingPending.minor?.birthDate ?? '',
          phone: minor.phone ?? existingPending.minor?.phone ?? '',
        };
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
        minor: {
          childName: minor.childName ?? '',
          gender: String(minor.gender ?? 'NO_INFORMADO'),
          personType: String(minor.personType ?? 'MENOR'),
          birthDate: minor.birthDate ?? '',
          phone: minor.phone ?? '',
        },
        expiresAt,
        createdAt: new Date(),
      });

      return {
        pairingCode: code,
        expiresAt,
      };
    }

    let targetDevice: {
      id: string;
      childName: string | null;
      gender: Gender | null;
      personType: PersonType | null;
      birthDate: Date | null;
      phone: string | null;
    } | null = null;

    if (input.deviceId) {
      targetDevice = await prisma.device.findFirst({
        where: {
          userId: input.userId,
          isActive: true,
          OR: [{ id: input.deviceId }, { deviceUuid: input.deviceId }],
        },
        select: {
          id: true,
          childName: true,
          gender: true,
          personType: true,
          birthDate: true,
          phone: true,
        },
      });
      if (!targetDevice) {
        throw new AppError('Dispositivo no encontrado para regenerar código', 404);
      }
    } else {
      const linked = await prisma.device.count({
        where: { userId: input.userId, isActive: true },
      });
      if (linked >= MAX_DEVICES) {
        throw new AppError(`Alcanzaste el máximo de ${MAX_DEVICES} dispositivos vinculados`, 409);
      }
    }

    let code = this.randomCode();
    while (await prisma.devicePairing.findUnique({ where: { pairingCode: code } })) {
      code = this.randomCode();
    }

    const parsedBirthDate = input.birthDate
      ? parseBirthDate(input.birthDate)
      : targetDevice?.birthDate ?? null;

    const minorData = {
      childName: input.childName ?? targetDevice?.childName ?? null,
      gender: normalizedGender ?? targetDevice?.gender ?? null,
      personType: normalizedPersonType ?? targetDevice?.personType ?? null,
      birthDate: parsedBirthDate,
      phone: input.phone ?? targetDevice?.phone ?? null,
    };

    const existingPending = await prisma.devicePairing.findFirst({
      where: {
        userId: input.userId,
        isUsed: false,
        ...(targetDevice ? { deviceId: targetDevice.id } : { deviceId: null }),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPending) {
      const updated = await prisma.devicePairing.update({
        where: { id: existingPending.id },
        data: {
          pairingCode: code,
          expiresAt,
          ...(targetDevice && { deviceId: targetDevice.id }),
          ...minorData,
        },
      });
      return { pairingCode: updated.pairingCode, expiresAt: updated.expiresAt };
    }

    const pairing = await prisma.devicePairing.create({
      data: {
        userId: input.userId,
        deviceId: targetDevice?.id || null,
        pairingCode: code,
        expiresAt,
        ...minorData,
      },
    });

    return { pairingCode: pairing.pairingCode, expiresAt: pairing.expiresAt };
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
        if (pairing && pairing.isUsed && pairing.deviceId) {
          const linkedDev = mockDb.devices.find((d) => d.id === pairing.deviceId);
          if (
            linkedDev &&
            (linkedDev.deviceUuid === input.deviceUuid || linkedDev.id === pairing.deviceId)
          ) {
            const mockUser = mockDb.users.find((u) => u.id === pairing.userId);
            return {
              message: 'Dispositivo vinculado con éxito',
              deviceId: linkedDev.id,
              deviceUuid: linkedDev.deviceUuid,
              deviceName: linkedDev.deviceName,
              childName: linkedDev.childName || linkedDev.deviceName,
              phone: linkedDev.phone || null,
              personType: linkedDev.personType || 'MENOR',
              tutorName: mockUser?.fullName || null,
            };
          }
        }
        throw new AppError('Código de pareamiento inválido o ya utilizado', 400);
      }

      let device =
        (pairing.deviceId
          ? mockDb.devices.find((d) => d.id === pairing.deviceId)
          : undefined) ||
        mockDb.devices.find((d) => d.deviceUuid === input.deviceUuid);

      if (device) {
        device.userId = pairing.userId;
        device.deviceUuid = input.deviceUuid;
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

      const mockUser = mockDb.users.find((u) => u.id === pairing.userId);

      // Enviar email de dispositivo vinculado al responsable
      if (mockUser?.email) {
        const tpl = getDeviceLinkedEmail({
          displayName: mockUser.fullName,
          protectedName: device.childName || device.deviceName,
          link: 'baprotege://activity',
        });
        await emailService.sendEmail(mockUser.email, tpl.subject, tpl.text, tpl.html).catch(() => {});
      }

      return {
        message: 'Dispositivo vinculado con éxito',
        deviceId: device.id,
        deviceUuid: device.deviceUuid,
        deviceName: device.deviceName,
        childName: device.childName || device.deviceName,
        phone: device.phone || null,
        personType: device.personType || 'MENOR',
        tutorName: mockUser?.fullName || null,
      };
    }

    // Todo en una transacción: el código se marca como usado de forma atómica,
    // así dos celulares que confirman a la vez no pueden usar el mismo código.
    // Si algo falla después, se revierte y el código vuelve a quedar disponible.
    const { pairing, device, alreadyPaired } = await prisma.$transaction(async (tx) => {
      const claimed = await tx.devicePairing.updateMany({
        where: { pairingCode: input.pairingCode, isUsed: false },
        data: { isUsed: true },
      });
      if (claimed.count === 0) {
        // IDEMPOTENCIA: Verificar si este código ya fue utilizado con éxito
        // para vincular este mismo dispositivo físico (por reintento de red, doble-clic o timeout)
        const existingPairing = await tx.devicePairing.findUnique({
          where: { pairingCode: input.pairingCode },
        });

        if (existingPairing && existingPairing.isUsed && existingPairing.deviceId) {
          const linkedDevice = await tx.device.findUnique({
            where: { id: existingPairing.deviceId },
          });

          if (
            linkedDevice &&
            (linkedDevice.deviceUuid === input.deviceUuid ||
              existingPairing.deviceId === linkedDevice.id)
          ) {
            return {
              pairing: existingPairing,
              device: linkedDevice,
              alreadyPaired: true,
            };
          }
        }

        throw new AppError('Código de pareamiento inválido o ya utilizado', 400);
      }

      const pairing = await tx.devicePairing.findUniqueOrThrow({
        where: { pairingCode: input.pairingCode },
      });

      // Buscar si el código pertenece a un dispositivo precreado y/o si el UUID físico ya existía
      const precreatedDevice = pairing.deviceId
        ? await tx.device.findUnique({ where: { id: pairing.deviceId } })
        : null;

      const existingByUuid = await tx.device.findUnique({
        where: { deviceUuid: input.deviceUuid },
      });

      // Si el teléfono físico ya estaba registrado bajo otro registro anterior (ej. desvinculado)
      // y ahora se vincula a un dispositivo precreado nuevo, liberar el UUID anterior sin perder historial.
      if (precreatedDevice && existingByUuid && existingByUuid.id !== precreatedDevice.id) {
        await tx.device.update({
          where: { id: existingByUuid.id },
          data: {
            isActive: false,
            deviceUuid: `retired-${existingByUuid.id}-${Date.now()}`,
          },
        });
      }

      let device = precreatedDevice || existingByUuid;

      if (device) {
        // Reasignar dispositivo al usuario del código, con los datos del protegido cargados por el tutor y UUID real
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

        // Marcar dispositivo como vinculado (ACTIVE); vpnActive y permissionsOk reflejan estado real hasta heartbeat
        await tx.deviceStatus.upsert({
          where: { deviceId: device.id },
          update: {
            effectiveStatus: 'ACTIVE',
            lastHeartbeatAt: new Date(),
          },
          create: {
            deviceId: device.id,
            effectiveStatus: 'ACTIVE',
            vpnActive: false,
            permissionsOk: false,
          },
        });
      } else {
        // Crear nuevo dispositivo vinculado al responsable, copiando los datos del protegido
        device = await tx.device.create({
          data: {
            userId: pairing.userId,
            deviceUuid: input.deviceUuid,
            deviceName: input.deviceName,
            childName: pairing.childName || input.childName,
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
                effectiveStatus: 'ACTIVE',
                vpnActive: false,
                permissionsOk: false,
              },
            },
          },
        });
      }

      await tx.devicePairing.update({
        where: { id: pairing.id },
        data: { deviceId: device.id },
      });

      return { pairing, device, alreadyPaired: false };
    });

    // Enviar mail al responsable por la vinculación usando el template en segundo plano (sin bloquear la respuesta HTTP)
    if (!alreadyPaired) {
      prisma.user
        .findUnique({ where: { id: pairing.userId } })
        .then((user) => {
          if (user?.email) {
            const tpl = getDeviceLinkedEmail({
              displayName: user.fullName,
              protectedName: device.childName || device.deviceName,
              link: 'baprotege://activity',
            });
            emailService.sendEmail(user.email, tpl.subject, tpl.text, tpl.html).catch(() => {});
          }
        })
        .catch(() => {});
    }

    const tutor = await prisma.user.findUnique({
      where: { id: pairing.userId },
      select: { fullName: true },
    });

    return {
      message: 'Dispositivo vinculado con éxito',
      deviceId: device.id,
      deviceUuid: device.deviceUuid,
      deviceName: device.deviceName,
      childName: device.childName || device.deviceName,
      phone: device.phone || null,
      personType: device.personType || pairing.personType || 'MENOR',
      tutorName: tutor?.fullName || null,
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
            permissions: this.resolveDevicePermissions(d.status),
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
      permissions: this.resolveDevicePermissions(d.status),
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
        permissions: this.resolveDevicePermissions(device.status),
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
      permissions: this.resolveDevicePermissions(device.status),
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

  /**
   * Desvincula (desactiva) un dispositivo protegido de la cuenta del responsable.
   * DELETE /api/devices/:id
   */
  public async deleteDevice(userId: string, deviceId: string) {
    if (env.USE_MOCK_DATA) {
      const idx = mockDb.devices.findIndex(
        (d) => d.userId === userId && (d.id === deviceId || d.deviceUuid === deviceId),
      );
      if (idx === -1) {
        throw new AppError('Dispositivo no encontrado', 404);
      }
      mockDb.devices[idx].isActive = false;
      return { success: true, message: 'El dispositivo fue desvinculado exitosamente.' };
    }

    const existing = await prisma.device.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ id: deviceId }, { deviceUuid: deviceId }],
      },
    });

    if (!existing) {
      throw new AppError('Dispositivo no encontrado o ya fue desvinculado', 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.device.update({
        where: { id: existing.id },
        data: { isActive: false },
      });

      await tx.devicePairing.updateMany({
        where: { deviceId: existing.id, isUsed: false },
        data: { isUsed: true },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'UNBIND_DEVICE',
          details: {
            deviceId: existing.id,
            deviceUuid: existing.deviceUuid,
            childName: existing.childName,
          },
        },
      });
    });

    return {
      success: true,
      message: 'El dispositivo fue desvinculado exitosamente.',
    };
  }

  /**
   * Resuelve el estado granular real de los 6 permisos de un dispositivo a partir
   * de `device_status.permissions_detail` (o fallback heredado si aún no envió detalle).
   */
  private resolveDevicePermissions(status?: {
    effectiveStatus?: string | null;
    vpnActive?: boolean | null;
    permissionsOk?: boolean | null;
    permissionsDetail?: unknown;
  } | null) {
    const vpn = Boolean(status?.vpnActive);
    const detail =
      status?.permissionsDetail &&
      typeof status.permissionsDetail === 'object' &&
      !Array.isArray(status.permissionsDetail)
        ? (status.permissionsDetail as Record<string, unknown>)
        : null;

    const isLinked = status?.effectiveStatus !== 'INACTIVE';
    const permissionsOk = Boolean(status?.permissionsOk);

    const perms = detail
      ? {
          vpn: typeof detail.vpn === 'boolean' ? detail.vpn : vpn,
          accessibility: Boolean(detail.accessibility),
          notifications: Boolean(detail.notifications),
          batteryOptimization: Boolean(detail.batteryOptimization),
          location: Boolean(detail.location),
          usageStats: Boolean(detail.usageStats),
        }
      : {
          vpn,
          accessibility: isLinked && permissionsOk,
          notifications: isLinked && permissionsOk,
          batteryOptimization: isLinked && permissionsOk,
          location: isLinked && permissionsOk,
          usageStats: isLinked && permissionsOk,
        };

    const grantedCount = Object.values(perms).filter(Boolean).length;
    return {
      ...perms,
      grantedCount,
    };
  }

  /**
   * Obtiene el estado real de permisos y último heartbeat de un dispositivo protegido.
   * GET /api/devices/:id/permissions
   */
  public async getDevicePermissions(userId: string, deviceId: string) {
    if (env.USE_MOCK_DATA) {
      const dev = mockDb.devices.find(
        (d) => d.userId === userId && (d.id === deviceId || d.deviceUuid === deviceId),
      );
      if (!dev) throw new AppError('Dispositivo no encontrado', 404);
      return {
        deviceId: dev.id,
        deviceUuid: dev.deviceUuid,
        status: dev.status?.effectiveStatus || 'UNKNOWN',
        lastHeartbeatAt: dev.status?.lastHeartbeatAt || dev.lastSeenAt,
        permissions: this.resolveDevicePermissions(dev.status),
      };
    }

    const device = await prisma.device.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ id: deviceId }, { deviceUuid: deviceId }],
      },
      include: { status: true },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    return {
      deviceId: device.id,
      deviceUuid: device.deviceUuid,
      status: device.status?.effectiveStatus || 'INACTIVE',
      lastHeartbeatAt: device.status?.lastHeartbeatAt || device.lastSeenAt,
      batteryLevel: device.status?.batteryLevel ?? null,
      isCharging: device.status?.isCharging ?? null,
      permissions: this.resolveDevicePermissions(device.status),
    };
  }

  /**
   * Obtiene información pública de perfil para que un dispositivo protegido refresque
   * el nombre real de su responsable y tipo de perfil desde la base de datos.
   * GET /api/devices/by-uuid/:deviceUuid/profile
   */
  public async getDevicePublicProfileByUuid(deviceUuid: string) {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find(
        (d) => d.deviceUuid === deviceUuid || d.id === deviceUuid,
      );
      if (!device) throw new AppError('Dispositivo no encontrado', 404);
      const user = mockDb.users.find((u) => u.id === device.userId);
      return {
        deviceId: device.id,
        deviceUuid: device.deviceUuid,
        deviceName: device.deviceName,
        childName: device.childName || device.deviceName,
        phone: device.phone || null,
        personType: device.personType || 'MENOR',
        tutorName: user?.fullName || null,
        isActive: device.isActive,
      };
    }

    const device = await prisma.device.findFirst({
      where: {
        OR: [{ deviceUuid }, { id: deviceUuid }],
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    return {
      deviceId: device.id,
      deviceUuid: device.deviceUuid,
      deviceName: device.deviceName,
      childName: device.childName || device.deviceName,
      phone: device.phone || null,
      personType: device.personType || 'MENOR',
      tutorName: device.user?.fullName || null,
      isActive: device.isActive,
    };
  }

  private activeAntiUninstallCodes = new Map<
    string,
    { code: string; expiresAt: Date; createdAt: Date; email: string }
  >();

  private async resolveAntiUninstallKey(deviceUuidOrId: string): Promise<string> {
    if (env.USE_MOCK_DATA) {
      const dev = mockDb.devices.find(
        (d) => d.deviceUuid === deviceUuidOrId || d.id === deviceUuidOrId,
      );
      return dev?.deviceUuid || deviceUuidOrId;
    }

    const dev = await prisma.device.findFirst({
      where: {
        OR: [{ deviceUuid: deviceUuidOrId }, { id: deviceUuidOrId }],
      },
      select: { deviceUuid: true },
    });
    return dev?.deviceUuid || deviceUuidOrId;
  }

  /**
   * Genera y envía por correo electrónico un código de 6 dígitos al responsable
   * para autorizar la desactivación de la protección antidesinstalación en un dispositivo protegido.
   * Si ya existía un código anterior para este dispositivo, queda automáticamente invalidado.
   * Los códigos se persisten en PostgreSQL (`anti_uninstall_codes`).
   */
  public async requestAntiUninstallCode(input: { deviceUuid: string }) {
    let responsableEmail: string | null = null;
    let deviceName = 'Dispositivo Protegido';
    let tutorName = 'Responsable';
    let canonicalKey = input.deviceUuid;

    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find(
        (d) => d.deviceUuid === input.deviceUuid || d.id === input.deviceUuid,
      );
      if (device) {
        canonicalKey = device.deviceUuid;
        deviceName = device.deviceName || device.childName || deviceName;
        const user = mockDb.users.find((u) => u.id === device.userId);
        if (user?.email) {
          responsableEmail = user.email;
        }
        if (user?.fullName) {
          tutorName = user.fullName;
        }
      }
    } else {
      const device = await prisma.device.findFirst({
        where: {
          isActive: true,
          OR: [{ deviceUuid: input.deviceUuid }, { id: input.deviceUuid }],
        },
        include: { user: true },
      });
      if (!device || !device.user?.email) {
        throw new AppError(
          'No se encontró un responsable vinculado con correo válido para este dispositivo.',
          404,
        );
      }
      canonicalKey = device.deviceUuid;
      deviceName = device.childName || device.deviceName || deviceName;
      responsableEmail = device.user.email;
      if (device.user.fullName) {
        tutorName = device.user.fullName;
      }
    }

    if (!responsableEmail) {
      throw new AppError(
        'No se encontró un correo electrónico del responsable para enviar el código.',
        404,
      );
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutos

    // Invalidar cualquier código previo persistiendo el nuevo
    if (env.USE_MOCK_DATA) {
      this.activeAntiUninstallCodes.set(canonicalKey, {
        code,
        expiresAt,
        createdAt: now,
        email: responsableEmail,
      });
    } else {
      await prisma.antiUninstallCode.upsert({
        where: { deviceUuid: canonicalKey },
        update: {
          code,
          email: responsableEmail,
          expiresAt,
          createdAt: now,
        },
        create: {
          deviceUuid: canonicalKey,
          code,
          email: responsableEmail,
          expiresAt,
          createdAt: now,
        },
      });
    }

    // Disparar correo al responsable que vinculó el dispositivo
    const tpl = getAntiUninstallOtpEmail({
      displayName: tutorName,
      protectedName: deviceName,
      code,
    });
    const mailResult = await emailService.sendEmail(
      responsableEmail,
      tpl.subject,
      tpl.text,
      tpl.html,
    );
    if (!mailResult.success && !env.USE_MOCK_DATA) {
      await prisma.antiUninstallCode
        .deleteMany({ where: { deviceUuid: canonicalKey } })
        .catch(() => {});
      throw new AppError(
        'No se pudo enviar el código al correo del responsable. Intentá nuevamente en unos minutos.',
        502,
      );
    }

    // Ocultar email para privacidad (ej. t***r@dominio.com)
    const [localPart, domain] = responsableEmail.split('@');
    const maskedLocal =
      localPart && localPart.length > 2
        ? `${localPart[0]}***${localPart[localPart.length - 1]}`
        : `${localPart ? localPart[0] : 't'}***`;
    const maskedEmail = `${maskedLocal}@${domain || ''}`;

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
    const canonicalKey = await this.resolveAntiUninstallKey(input.deviceUuid);

    if (env.USE_MOCK_DATA) {
      this.activeAntiUninstallCodes.delete(canonicalKey);
      this.activeAntiUninstallCodes.delete(input.deviceUuid);
    } else {
      await prisma.antiUninstallCode.deleteMany({
        where: {
          deviceUuid: { in: Array.from(new Set([canonicalKey, input.deviceUuid])) },
        },
      });
    }
    return { success: true, message: 'Código invalidado con éxito' };
  }

  /**
   * Verifica el código de 6 dígitos ingresado por el usuario.
   * Si es correcto, el código se consume e invalida inmediatamente en PostgreSQL.
   */
  public async verifyAntiUninstallCode(input: { deviceUuid: string; code: string }) {
    const canonicalKey = await this.resolveAntiUninstallKey(input.deviceUuid);

    const record = env.USE_MOCK_DATA
      ? this.activeAntiUninstallCodes.get(canonicalKey) ||
        this.activeAntiUninstallCodes.get(input.deviceUuid)
      : await prisma.antiUninstallCode.findFirst({
          where: {
            deviceUuid: { in: Array.from(new Set([canonicalKey, input.deviceUuid])) },
          },
        });

    if (!record) {
      throw new AppError(
        'No hay un código activo para este dispositivo o ya fue invalidado. Solicitá uno nuevo.',
        400,
      );
    }

    if (new Date() > record.expiresAt) {
      if (env.USE_MOCK_DATA) {
        this.activeAntiUninstallCodes.delete(canonicalKey);
      } else {
        await prisma.antiUninstallCode
          .deleteMany({ where: { deviceUuid: canonicalKey } })
          .catch(() => {});
      }
      throw new AppError('El código de verificación ha expirado. Solicitá uno nuevo.', 400);
    }

    if (record.code !== input.code.trim()) {
      throw new AppError(
        'El código ingresado es incorrecto. Verificá el código enviado al correo del responsable.',
        400,
      );
    }

    // Código válido: consumirlo para que no pueda reutilizarse
    if (env.USE_MOCK_DATA) {
      this.activeAntiUninstallCodes.delete(canonicalKey);
      this.activeAntiUninstallCodes.delete(input.deviceUuid);
    } else {
      await prisma.antiUninstallCode.deleteMany({
        where: {
          deviceUuid: { in: Array.from(new Set([canonicalKey, input.deviceUuid])) },
        },
      });
    }

    return {
      success: true,
      message: 'Código de verificación aceptado',
    };
  }
}

export const deviceService = new DeviceService();

