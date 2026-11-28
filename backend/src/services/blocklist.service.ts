// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Servicio de Listas de Bloqueo (Sitios y Apps)
// Archivo: src/services/blocklist.service.ts
// Descripción: Gestión en PostgreSQL de la lista oficial LOTBA, dominios y aplicaciones
//              personalizadas con alcance por dispositivo, límites diarios y reglas de Adulto Protegido.
// ==============================================================================

import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { normalizeDomain } from '../utils/domain.js';

export type BlockOrigin = 'RESPONSABLE' | 'ADULTO_PROTEGIDO';

export interface AddCustomDomainInput {
  userId: string;
  domain: string;
  category?: string;
  applyToAll?: boolean;
  deviceIds?: string[];
  createdBy?: BlockOrigin;
  createdByName?: string;
  sourceDeviceId?: string;
}

export interface UpdateCustomDomainInput {
  userId: string;
  domainId: string;
  domain?: string;
  category?: string;
  isActive?: boolean;
  applyToAll?: boolean;
  deviceIds?: string[];
}

export interface RemoveCustomDomainInput {
  userId: string;
  domainId: string;
}

export interface AddCustomAppInput {
  userId: string;
  appName: string;
  packageName?: string;
  category?: string;
  applyToAll?: boolean;
  deviceIds?: string[];
  dailyLimitMinutes?: number | null;
  deviceLimits?: Record<string, number | null | undefined>;
  createdBy?: BlockOrigin;
  createdByName?: string;
  sourceDeviceId?: string;
}

export interface UpdateCustomAppInput {
  userId: string;
  appId: string;
  appName?: string;
  packageName?: string;
  category?: string;
  isActive?: boolean;
  applyToAll?: boolean;
  deviceIds?: string[];
  dailyLimitMinutes?: number | null;
  deviceLimits?: Record<string, number | null | undefined>;
}

export interface RemoveCustomAppInput {
  userId: string;
  appId: string;
}

function normalizeDeviceIds(deviceIds?: string[]): string[] {
  if (!Array.isArray(deviceIds)) return [];
  return Array.from(
    new Set(deviceIds.map((id) => String(id || '').trim()).filter((id) => id.length > 0)),
  );
}

function normalizeDeviceLimits(
  limits?: Record<string, number | null | undefined> | null,
): Record<string, number> | null {
  if (!limits || typeof limits !== 'object') return null;
  const cleaned: Record<string, number> = {};
  for (const [key, val] of Object.entries(limits)) {
    const cleanKey = key.trim();
    if (!cleanKey) continue;
    if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
      cleaned[cleanKey] = Math.round(val);
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

function normalizeDailyLimit(limit?: number | null): number | null {
  if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
    return Math.round(limit);
  }
  return null;
}

function normalizePackageName(appName: string, packageName?: string): string {
  const trimmed = (packageName || '').trim().toLowerCase();
  if (trimmed.length > 0) return trimmed;
  const slug = appName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  return `com.${slug || 'custom'}.app`;
}

function ruleAppliesToDevice(
  rule: {
    isActive?: boolean;
    applyToAll?: boolean;
    deviceIds?: string[];
    sourceDeviceId?: string | null;
  },
  device: { id: string; deviceUuid: string },
): boolean {
  if (rule.isActive === false) return false;
  if (rule.applyToAll !== false) return true;
  if (
    rule.sourceDeviceId &&
    (rule.sourceDeviceId === device.id || rule.sourceDeviceId === device.deviceUuid)
  ) {
    return true;
  }
  const ids = Array.isArray(rule.deviceIds) ? rule.deviceIds : [];
  return ids.includes(device.id) || ids.includes(device.deviceUuid);
}

function resolveLimitForDevice(
  app: {
    dailyLimitMinutes?: number | null;
    deviceLimits?: unknown;
  },
  device: { id: string; deviceUuid: string },
): number | undefined {
  const limitsObj =
    app.deviceLimits && typeof app.deviceLimits === 'object'
      ? (app.deviceLimits as Record<string, unknown>)
      : null;
  if (limitsObj) {
    const byId = limitsObj[device.id];
    if (typeof byId === 'number' && Number.isFinite(byId) && byId > 0) {
      return Math.round(byId);
    }
    const byUuid = limitsObj[device.deviceUuid];
    if (typeof byUuid === 'number' && Number.isFinite(byUuid) && byUuid > 0) {
      return Math.round(byUuid);
    }
  }
  if (
    typeof app.dailyLimitMinutes === 'number' &&
    Number.isFinite(app.dailyLimitMinutes) &&
    app.dailyLimitMinutes > 0
  ) {
    return Math.round(app.dailyLimitMinutes);
  }
  return undefined;
}

export class BlocklistService {
  /**
   * Obtiene o inicializa la lista oficial de LOTBA (Lotería de la Ciudad de Buenos Aires).
   */
  public async getOfficialLotbaList() {
    if (env.USE_MOCK_DATA) {
      const official = mockDb.blocklists.find((b) => b.type === 'OFFICIAL_LOTBA');
      return official || mockDb.blocklists[0];
    }

    let officialList = await prisma.blocklist.findFirst({
      where: { type: 'OFFICIAL_LOTBA' },
      include: {
        domains: {
          where: { isActive: true },
          select: { id: true, domain: true, category: true },
        },
      },
    });

    // Sembrar lista oficial básica si es la primera ejecución
    if (!officialList) {
      officialList = await prisma.blocklist.create({
        data: {
          name: 'Lista Oficial LOTBA - Sitios No Autorizados',
          description:
            'Dominios de apuestas y juegos de azar no autorizados por la Ciudad de Buenos Aires',
          type: 'OFFICIAL_LOTBA',
          version: 1,
          domains: {
            create: [
              { domain: 'apuestas-online-ilegal.bet', category: 'GAMBLING' },
              { domain: 'casino-sin-licencia.com', category: 'GAMBLING' },
              { domain: 'juegos-azar-clandestino.net', category: 'GAMBLING' },
              { domain: 'slot-virtual-no-autorizado.xyz', category: 'GAMBLING' },
            ],
          },
        },
        include: {
          domains: {
            where: { isActive: true },
            select: { id: true, domain: true, category: true },
          },
        },
      });
    }

    return officialList;
  }

  /**
   * Obtiene todas las reglas de bloqueo consolidadas aplicables a un dispositivo
   * (LOTBA + Dominios Personalizados + Aplicaciones Personalizadas con límites diarios).
   */
  public async getEffectiveBlocklistForDevice(deviceUuid: string) {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find(
        (d) => d.deviceUuid === deviceUuid || d.id === deviceUuid,
      );
      if (!device) {
        throw new AppError('Dispositivo no encontrado', 404);
      }

      const lotbaList = await this.getOfficialLotbaList();
      const lotbaDomains: string[] =
        device.config?.blockGambling !== false ? lotbaList.domains.map((d) => d.domain) : [];

      let customVersion = 1;
      let applicableDomains: any[] = [];
      let applicableApps: any[] = [];

      if (device.config?.blockCustomList !== false && device.userId) {
        const custom = mockDb.blocklists.find(
          (b) => b.userId === device.userId && b.type === 'CUSTOM',
        );
        if (custom) {
          customVersion = custom.version;
          applicableDomains = (custom.domains || []).filter((d) =>
            ruleAppliesToDevice(d, device),
          );
          applicableApps = (custom.apps || [])
            .filter((a) => ruleAppliesToDevice(a, device))
            .map((a) => ({
              ...a,
              dailyLimitMinutes: resolveLimitForDevice(a, device),
            }));
        }
      }

      const uniqueDomains = Array.from(
        new Set([...lotbaDomains, ...applicableDomains.map((d) => d.domain)]),
      );

      return {
        version: lotbaList.version * 1000 + customVersion,
        lotbaVersion: lotbaList.version,
        customVersion,
        lotbaDomains,
        domains: uniqueDomains,
        customDomains: applicableDomains,
        customApps: applicableApps,
        totalCount: uniqueDomains.length,
      };
    }

    const device = await prisma.device.findFirst({
      where: {
        OR: [{ deviceUuid }, { id: deviceUuid }],
      },
      include: {
        user: true,
        config: true,
      },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    // 1. Obtener lista oficial LOTBA
    const lotbaList = await this.getOfficialLotbaList();
    const lotbaDomains: string[] =
      device.config?.blockGambling !== false ? lotbaList.domains.map((d) => d.domain) : [];

    // 2. Obtener reglas personalizadas del responsable filtradas para este dispositivo
    let customVersion = 1;
    let applicableDomains: Array<{
      id: string;
      domain: string;
      category: string | null;
      isActive: boolean;
      applyToAll: boolean;
      deviceIds: string[];
      createdBy: string | null;
      createdByName: string | null;
      sourceDeviceId: string | null;
      createdAt: Date;
    }> = [];
    let applicableApps: Array<{
      id: string;
      appName: string;
      packageName: string;
      category: string | null;
      isActive: boolean;
      applyToAll: boolean;
      deviceIds: string[];
      dailyLimitMinutes: number | undefined;
      deviceLimits: Record<string, number> | undefined;
      createdBy: string | null;
      createdByName: string | null;
      sourceDeviceId: string | null;
      createdAt: Date;
    }> = [];

    if (device.config?.blockCustomList !== false && device.userId) {
      const customList = await prisma.blocklist.findFirst({
        where: { userId: device.userId, type: 'CUSTOM' },
        include: {
          domains: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          },
          apps: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (customList) {
        customVersion = customList.version;
        applicableDomains = customList.domains.filter((d) => ruleAppliesToDevice(d, device));
        applicableApps = customList.apps
          .filter((a) => ruleAppliesToDevice(a, device))
          .map((a) => ({
            id: a.id,
            appName: a.appName,
            packageName: a.packageName,
            category: a.category,
            isActive: a.isActive,
            applyToAll: a.applyToAll,
            deviceIds: a.deviceIds,
            dailyLimitMinutes: resolveLimitForDevice(a, device),
            deviceLimits:
              a.deviceLimits && typeof a.deviceLimits === 'object'
                ? (a.deviceLimits as Record<string, number>)
                : undefined,
            createdBy: a.createdBy,
            createdByName: a.createdByName,
            sourceDeviceId: a.sourceDeviceId,
            createdAt: a.createdAt,
          }));
      }
    }

    const uniqueDomains = Array.from(
      new Set([...lotbaDomains, ...applicableDomains.map((d) => d.domain)]),
    );
    const combinedVersion = lotbaList.version * 1000 + customVersion;

    return {
      version: combinedVersion,
      lotbaVersion: lotbaList.version,
      customVersion,
      lotbaDomains,
      domains: uniqueDomains,
      customDomains: applicableDomains,
      customApps: applicableApps,
      totalCount: uniqueDomains.length,
    };
  }

  /**
   * Obtiene la lista personalizada completa (sitios + apps) de un responsable.
   */
  public async getUserCustomList(userId: string) {
    if (env.USE_MOCK_DATA) {
      let custom = mockDb.blocklists.find((b) => b.userId === userId && b.type === 'CUSTOM');
      if (!custom) {
        custom = {
          id: `list-custom-${Date.now()}`,
          userId,
          name: 'Mi Lista Personalizada',
          description: 'Dominios y aplicaciones adicionales definidos por el responsable',
          type: 'CUSTOM',
          version: 1,
          domains: [],
          apps: [],
        };
        mockDb.blocklists.push(custom);
      }
      if (!custom.apps) custom.apps = [];
      return custom;
    }

    let customList;
    const lists = await prisma.blocklist.findMany({
      where: { userId, type: 'CUSTOM' },
      orderBy: { createdAt: 'asc' },
      include: {
        domains: { orderBy: { createdAt: 'desc' } },
        apps: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (lists.length === 0) {
      customList = await prisma.blocklist.create({
        data: {
          userId,
          name: 'Mi Lista Personalizada',
          description: 'Dominios y aplicaciones adicionales definidos por el responsable',
          type: 'CUSTOM',
          version: 1,
        },
        include: {
          domains: true,
          apps: true,
        },
      });
      return customList;
    }

    const canonical = lists[0];
    // Consolidar duplicados: mover dominios/apps de las listas extra a la canónica y borrarlas.
    for (const dup of lists.slice(1)) {
      await prisma.blocklistDomain.updateMany({
        where: { blocklistId: dup.id },
        data: { blocklistId: canonical.id },
      });
      await prisma.blocklistApp.updateMany({
        where: { blocklistId: dup.id },
        data: { blocklistId: canonical.id },
      });
      await prisma.blocklist.delete({ where: { id: dup.id } });
    }

    customList = await prisma.blocklist.findUnique({
      where: { id: canonical.id },
      include: {
        domains: { orderBy: { createdAt: 'desc' } },
        apps: { orderBy: { createdAt: 'desc' } },
      },
    });

    return customList!;
  }

  /**
   * Agrega un nuevo dominio a la lista personalizada del responsable e incrementa la versión.
   */
  public async addCustomDomain(input: AddCustomDomainInput) {
    const list = await this.getUserCustomList(input.userId);
    const cleanDomain = normalizeDomain(input.domain);

    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
      throw new AppError('Formato de dominio no válido (ejemplo: sitio.com)', 400);
    }

    const applyToAll = input.applyToAll !== undefined ? Boolean(input.applyToAll) : true;
    const deviceIds = normalizeDeviceIds(input.deviceIds);
    const createdBy: BlockOrigin =
      input.createdBy === 'ADULTO_PROTEGIDO' ? 'ADULTO_PROTEGIDO' : 'RESPONSABLE';

    if (env.USE_MOCK_DATA) {
      const exists = (list.domains as any[]).some((d) => d.domain === cleanDomain);
      if (exists) {
        throw new AppError('El dominio ya se encuentra en la lista personalizada', 409);
      }
      const newDom = {
        id: `dom-${crypto.randomUUID()}`,
        blocklistId: list.id,
        domain: cleanDomain,
        category: input.category || 'CUSTOM',
        isActive: true,
        applyToAll,
        deviceIds,
        createdBy,
        createdByName: input.createdByName || null,
        sourceDeviceId: input.sourceDeviceId || null,
        createdAt: new Date(),
      };
      (list.domains as any[]).unshift(newDom);
      list.version += 1;
      return newDom;
    }

    const existingDomain = await prisma.blocklistDomain.findUnique({
      where: {
        blocklistId_domain: {
          blocklistId: list.id,
          domain: cleanDomain,
        },
      },
    });

    if (existingDomain) {
      throw new AppError('El dominio ya se encuentra en la lista personalizada', 409);
    }

    const newDomain = await prisma.blocklistDomain.create({
      data: {
        blocklistId: list.id,
        domain: cleanDomain,
        category: input.category || 'CUSTOM',
        applyToAll,
        deviceIds,
        createdBy,
        createdByName: input.createdByName || null,
        sourceDeviceId: input.sourceDeviceId || null,
      },
    });

    await prisma.blocklist.update({
      where: { id: list.id },
      data: { version: { increment: 1 } },
    });

    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'ADD_CUSTOM_DOMAIN',
        details: {
          domain: cleanDomain,
          applyToAll,
          deviceIds,
          createdBy,
          sourceDeviceId: input.sourceDeviceId || null,
        },
      },
    });

    return newDomain;
  }

  /**
   * Actualiza un dominio de la lista personalizada del responsable.
   */
  public async updateCustomDomain(input: UpdateCustomDomainInput) {
    const list = await this.getUserCustomList(input.userId);

    let cleanDomain: string | undefined;
    if (input.domain !== undefined) {
      cleanDomain = normalizeDomain(input.domain);
      if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
        throw new AppError('Formato de dominio no válido (ejemplo: sitio.com)', 400);
      }
    }

    const normalizedDeviceIds =
      input.deviceIds !== undefined ? normalizeDeviceIds(input.deviceIds) : undefined;

    if (env.USE_MOCK_DATA) {
      const dom = (list.domains as any[]).find((d) => d.id === input.domainId);
      if (!dom) {
        throw new AppError('Dominio no encontrado en su lista', 404);
      }

      if (cleanDomain && cleanDomain !== dom.domain) {
        const exists = (list.domains as any[]).some(
          (d) => d.id !== input.domainId && d.domain === cleanDomain,
        );
        if (exists) {
          throw new AppError('El dominio ya se encuentra en la lista personalizada', 409);
        }
        dom.domain = cleanDomain;
      }
      if (input.category !== undefined) dom.category = input.category;
      if (input.isActive !== undefined) dom.isActive = input.isActive;
      if (input.applyToAll !== undefined) dom.applyToAll = input.applyToAll;
      if (normalizedDeviceIds !== undefined) dom.deviceIds = normalizedDeviceIds;
      list.version += 1;
      return dom;
    }

    const domainRecord = await prisma.blocklistDomain.findFirst({
      where: { id: input.domainId, blocklistId: list.id },
    });

    if (!domainRecord) {
      throw new AppError('Dominio no encontrado en su lista', 404);
    }

    if (cleanDomain && cleanDomain !== domainRecord.domain) {
      const duplicate = await prisma.blocklistDomain.findUnique({
        where: {
          blocklistId_domain: {
            blocklistId: list.id,
            domain: cleanDomain,
          },
        },
      });
      if (duplicate && duplicate.id !== domainRecord.id) {
        throw new AppError('El dominio ya se encuentra en la lista personalizada', 409);
      }
    }

    const updated = await prisma.blocklistDomain.update({
      where: { id: domainRecord.id },
      data: {
        ...(cleanDomain ? { domain: cleanDomain } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.applyToAll !== undefined ? { applyToAll: input.applyToAll } : {}),
        ...(normalizedDeviceIds !== undefined ? { deviceIds: normalizedDeviceIds } : {}),
      },
    });

    await prisma.blocklist.update({
      where: { id: list.id },
      data: { version: { increment: 1 } },
    });

    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'UPDATE_CUSTOM_DOMAIN',
        details: {
          domainId: domainRecord.id,
          changes: {
            domain: cleanDomain,
            category: input.category,
            isActive: input.isActive,
            applyToAll: input.applyToAll,
            deviceIds: normalizedDeviceIds,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Elimina un dominio de la lista personalizada del responsable.
   */
  public async removeCustomDomain(input: RemoveCustomDomainInput) {
    const list = await this.getUserCustomList(input.userId);

    if (env.USE_MOCK_DATA) {
      const idx = list.domains.findIndex((d) => d.id === input.domainId);
      if (idx === -1) {
        throw new AppError('Dominio no encontrado en su lista', 404);
      }
      list.domains.splice(idx, 1);
      list.version += 1;
      return { message: 'Dominio eliminado correctamente' };
    }

    const domain = await prisma.blocklistDomain.findFirst({
      where: { id: input.domainId, blocklistId: list.id },
    });

    if (!domain) {
      throw new AppError('Dominio no encontrado en su lista', 404);
    }

    await prisma.blocklistDomain.delete({
      where: { id: domain.id },
    });

    await prisma.blocklist.update({
      where: { id: list.id },
      data: { version: { increment: 1 } },
    });

    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'REMOVE_CUSTOM_DOMAIN',
        details: { domain: domain.domain },
      },
    });

    return { message: 'Dominio eliminado correctamente' };
  }

  /**
   * Agrega una aplicación bloqueada / con límite diario a la lista personalizada del responsable.
   */
  public async addCustomApp(input: AddCustomAppInput) {
    const list = await this.getUserCustomList(input.userId);
    const cleanName = input.appName.trim();
    if (!cleanName) {
      throw new AppError('El nombre de la aplicación es requerido', 400);
    }

    const cleanPkg = normalizePackageName(cleanName, input.packageName);
    const applyToAll = input.applyToAll !== undefined ? Boolean(input.applyToAll) : true;
    const deviceIds = normalizeDeviceIds(input.deviceIds);
    const dailyLimitMinutes = normalizeDailyLimit(input.dailyLimitMinutes);
    const deviceLimits = normalizeDeviceLimits(input.deviceLimits);
    const createdBy: BlockOrigin =
      input.createdBy === 'ADULTO_PROTEGIDO' ? 'ADULTO_PROTEGIDO' : 'RESPONSABLE';

    if (env.USE_MOCK_DATA) {
      const apps = (list as any).apps || ((list as any).apps = []);
      const exists = apps.some(
        (a: any) =>
          a.packageName.toLowerCase() === cleanPkg ||
          a.appName.trim().toLowerCase() === cleanName.toLowerCase(),
      );
      if (exists) {
        throw new AppError('La aplicación ya se encuentra en tu lista de restricción', 409);
      }

      const newApp = {
        id: `app-${crypto.randomUUID()}`,
        blocklistId: list.id,
        appName: cleanName,
        packageName: cleanPkg,
        category: input.category || 'Personalizado',
        isActive: true,
        applyToAll,
        deviceIds,
        dailyLimitMinutes,
        deviceLimits,
        createdBy,
        createdByName: input.createdByName || null,
        sourceDeviceId: input.sourceDeviceId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      apps.unshift(newApp);
      list.version += 1;
      return newApp;
    }

    const existingApps = await prisma.blocklistApp.findMany({
      where: { blocklistId: list.id },
      select: { id: true, appName: true, packageName: true },
    });

    const isDuplicate = existingApps.some(
      (a) =>
        a.packageName.toLowerCase() === cleanPkg ||
        a.appName.trim().toLowerCase() === cleanName.toLowerCase(),
    );
    if (isDuplicate) {
      throw new AppError('La aplicación ya se encuentra en tu lista de restricción', 409);
    }

    const newApp = await prisma.blocklistApp.create({
      data: {
        blocklistId: list.id,
        appName: cleanName,
        packageName: cleanPkg,
        category: input.category || 'Personalizado',
        applyToAll,
        deviceIds,
        dailyLimitMinutes,
        deviceLimits: deviceLimits ?? Prisma.DbNull,
        createdBy,
        createdByName: input.createdByName || null,
        sourceDeviceId: input.sourceDeviceId || null,
      },
    });

    await prisma.blocklist.update({
      where: { id: list.id },
      data: { version: { increment: 1 } },
    });

    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'ADD_CUSTOM_APP',
        details: {
          appName: cleanName,
          packageName: cleanPkg,
          applyToAll,
          deviceIds,
          dailyLimitMinutes,
          createdBy,
          sourceDeviceId: input.sourceDeviceId || null,
        },
      },
    });

    return newApp;
  }

  /**
   * Actualiza una aplicación bloqueada en la lista personalizada del responsable.
   */
  public async updateCustomApp(input: UpdateCustomAppInput) {
    const list = await this.getUserCustomList(input.userId);
    const cleanName = input.appName !== undefined ? input.appName.trim() : undefined;
    if (cleanName !== undefined && !cleanName) {
      throw new AppError('El nombre de la aplicación no puede estar vacío', 400);
    }

    const normalizedDeviceIds =
      input.deviceIds !== undefined ? normalizeDeviceIds(input.deviceIds) : undefined;
    const hasDailyLimit = Object.prototype.hasOwnProperty.call(input, 'dailyLimitMinutes');
    const normalizedDailyLimit = hasDailyLimit
      ? normalizeDailyLimit(input.dailyLimitMinutes)
      : undefined;
    const hasDeviceLimits = Object.prototype.hasOwnProperty.call(input, 'deviceLimits');
    const normalizedDeviceLimits = hasDeviceLimits
      ? normalizeDeviceLimits(input.deviceLimits)
      : undefined;

    if (env.USE_MOCK_DATA) {
      const apps = (list as any).apps || [];
      const app = apps.find((a: any) => a.id === input.appId);
      if (!app) {
        throw new AppError('Aplicación no encontrada en su lista', 404);
      }

      const nextPkg =
        input.packageName !== undefined
          ? normalizePackageName(cleanName || app.appName, input.packageName)
          : app.packageName;
      const nextName = cleanName ?? app.appName;

      const duplicate = apps.some(
        (a: any) =>
          a.id !== input.appId &&
          (a.packageName.toLowerCase() === nextPkg ||
            a.appName.trim().toLowerCase() === nextName.toLowerCase()),
      );
      if (duplicate) {
        throw new AppError('La aplicación ya se encuentra en tu lista de restricción', 409);
      }

      if (cleanName !== undefined) app.appName = cleanName;
      if (input.packageName !== undefined) app.packageName = nextPkg;
      if (input.category !== undefined) app.category = input.category;
      if (input.isActive !== undefined) app.isActive = input.isActive;
      if (input.applyToAll !== undefined) app.applyToAll = input.applyToAll;
      if (normalizedDeviceIds !== undefined) app.deviceIds = normalizedDeviceIds;
      if (hasDailyLimit) app.dailyLimitMinutes = normalizedDailyLimit;
      if (hasDeviceLimits) app.deviceLimits = normalizedDeviceLimits;
      app.updatedAt = new Date();
      list.version += 1;
      return app;
    }

    const appRecord = await prisma.blocklistApp.findFirst({
      where: { id: input.appId, blocklistId: list.id },
    });

    if (!appRecord) {
      throw new AppError('Aplicación no encontrada en su lista', 404);
    }

    const nextName = cleanName ?? appRecord.appName;
    const nextPkg =
      input.packageName !== undefined
        ? normalizePackageName(nextName, input.packageName)
        : appRecord.packageName;

    if (nextName !== appRecord.appName || nextPkg !== appRecord.packageName) {
      const existingApps = await prisma.blocklistApp.findMany({
        where: { blocklistId: list.id, NOT: { id: appRecord.id } },
        select: { id: true, appName: true, packageName: true },
      });
      const isDuplicate = existingApps.some(
        (a) =>
          a.packageName.toLowerCase() === nextPkg ||
          a.appName.trim().toLowerCase() === nextName.toLowerCase(),
      );
      if (isDuplicate) {
        throw new AppError('La aplicación ya se encuentra en tu lista de restricción', 409);
      }
    }

    const updated = await prisma.blocklistApp.update({
      where: { id: appRecord.id },
      data: {
        ...(cleanName !== undefined ? { appName: cleanName } : {}),
        ...(input.packageName !== undefined ? { packageName: nextPkg } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.applyToAll !== undefined ? { applyToAll: input.applyToAll } : {}),
        ...(normalizedDeviceIds !== undefined ? { deviceIds: normalizedDeviceIds } : {}),
        ...(hasDailyLimit ? { dailyLimitMinutes: normalizedDailyLimit } : {}),
        ...(hasDeviceLimits
          ? { deviceLimits: normalizedDeviceLimits ?? Prisma.DbNull }
          : {}),
      },
    });

    await prisma.blocklist.update({
      where: { id: list.id },
      data: { version: { increment: 1 } },
    });

    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'UPDATE_CUSTOM_APP',
        details: {
          appId: appRecord.id,
          changes: {
            appName: cleanName,
            category: input.category,
            isActive: input.isActive,
            applyToAll: input.applyToAll,
            deviceIds: normalizedDeviceIds,
            dailyLimitMinutes: hasDailyLimit ? normalizedDailyLimit : undefined,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Elimina una aplicación de la lista personalizada del responsable.
   */
  public async removeCustomApp(input: RemoveCustomAppInput) {
    const list = await this.getUserCustomList(input.userId);

    if (env.USE_MOCK_DATA) {
      const apps = (list as any).apps || [];
      const idx = apps.findIndex((a: any) => a.id === input.appId);
      if (idx === -1) {
        throw new AppError('Aplicación no encontrada en su lista', 404);
      }
      apps.splice(idx, 1);
      list.version += 1;
      return { message: 'Aplicación eliminada correctamente' };
    }

    const appRecord = await prisma.blocklistApp.findFirst({
      where: { id: input.appId, blocklistId: list.id },
    });

    if (!appRecord) {
      throw new AppError('Aplicación no encontrada en su lista', 404);
    }

    await prisma.blocklistApp.delete({
      where: { id: appRecord.id },
    });

    await prisma.blocklist.update({
      where: { id: list.id },
      data: { version: { increment: 1 } },
    });

    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'REMOVE_CUSTOM_APP',
        details: { appName: appRecord.appName, packageName: appRecord.packageName },
      },
    });

    return { message: 'Aplicación eliminada correctamente' };
  }

  /**
   * Permite a un dispositivo en perfil Adulto Protegido agregar un dominio bloqueado
   * directamente a la lista personalizada de su responsable (solo inserción; no puede desbloquear).
   */
  public async addDeviceCustomDomain(
    deviceUuid: string,
    input: { domain: string; category?: string },
  ) {
    const device = await this.resolveAuthorizedAdultDevice(deviceUuid);

    return this.addCustomDomain({
      userId: device.userId,
      domain: input.domain,
      category: input.category || 'Personalizado',
      applyToAll: false,
      deviceIds: [device.id],
      createdBy: 'ADULTO_PROTEGIDO',
      createdByName: device.childName || device.deviceName,
      sourceDeviceId: device.id,
    });
  }

  /**
   * Permite a un dispositivo en perfil Adulto Protegido agregar una aplicación bloqueada
   * directamente a la lista personalizada de su responsable (solo inserción; no puede desbloquear).
   */
  public async addDeviceCustomApp(
    deviceUuid: string,
    input: { appName: string; packageName?: string; category?: string },
  ) {
    const device = await this.resolveAuthorizedAdultDevice(deviceUuid);

    return this.addCustomApp({
      userId: device.userId,
      appName: input.appName,
      packageName: input.packageName,
      category: input.category || 'Personalizado',
      applyToAll: false,
      deviceIds: [device.id],
      dailyLimitMinutes: null,
      createdBy: 'ADULTO_PROTEGIDO',
      createdByName: device.childName || device.deviceName,
      sourceDeviceId: device.id,
    });
  }

  private async resolveAuthorizedAdultDevice(deviceUuid: string): Promise<{
    id: string;
    userId: string;
    deviceName: string;
    childName: string | null;
    personType: string | null;
  }> {
    if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find(
        (d) => d.isActive && (d.deviceUuid === deviceUuid || d.id === deviceUuid),
      );
      if (!device) {
        throw new AppError('Dispositivo no encontrado o inactivo', 404);
      }
      if (String(device.personType || '').toUpperCase() !== 'ADULTO') {
        throw new AppError(
          'Solo los perfiles de Adulto Protegido pueden agregar bloqueos desde su dispositivo',
          403,
        );
      }
      return {
        id: device.id,
        userId: device.userId,
        deviceName: device.deviceName,
        childName: device.childName || null,
        personType: device.personType || null,
      };
    }

    const device = await prisma.device.findFirst({
      where: {
        isActive: true,
        OR: [{ deviceUuid }, { id: deviceUuid }],
      },
      select: {
        id: true,
        userId: true,
        deviceName: true,
        childName: true,
        personType: true,
      },
    });

    if (!device) {
      throw new AppError('Dispositivo no encontrado o inactivo', 404);
    }

    if (device.personType !== 'ADULTO') {
      throw new AppError(
        'Solo los perfiles de Adulto Protegido pueden agregar bloqueos desde su dispositivo',
        403,
      );
    }

    return device;
  }
}

export const blocklistService = new BlocklistService();
