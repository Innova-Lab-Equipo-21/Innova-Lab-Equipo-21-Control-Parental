import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { normalizeDomain } from '../utils/domain.js';
import crypto from 'crypto';

export interface AddCustomDomainInput {
  userId: string;
  domain: string;
  category?: string;
}

export interface RemoveCustomDomainInput {
  userId: string;
  domainId: string;
}

export interface UpdateCustomDomainInput {
  userId: string;
  domainId: string;
  domain?: string;
  category?: string;
  isActive?: boolean;
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
          description: 'Dominios de apuestas y juegos de azar no autorizados por la Ciudad de Buenos Aires',
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
   * Obtiene todas las reglas de bloqueo consolidadas aplicables a un dispositivo (LOTBA + Personalizadas del Responsable).
   */
  public async getEffectiveBlocklistForDevice(deviceUuid: string) {
        if (env.USE_MOCK_DATA) {
      const device = mockDb.devices.find((d) => d.deviceUuid === deviceUuid);
      const lotbaList = await this.getOfficialLotbaList();
      const domains: string[] = lotbaList.domains.map((d) => d.domain);

      let customVersion = 1;
      if (device && device.config.blockCustomList && device.userId) {
        const custom = mockDb.blocklists.find((b) => b.userId === device.userId && b.type === 'CUSTOM');
        if (custom) {
          customVersion = custom.version;
          // Igual que en la base real: los dominios desactivados por el tutor no se aplican
          domains.push(
            ...(custom.domains as any[]).filter((d) => d.isActive !== false).map((d) => d.domain),
          );
        }
      }

      const uniqueDomains = Array.from(new Set(domains));
      return {
        // Misma fórmula que la base real, para que el dispositivo detecte cambios en la lista personal
        version: lotbaList.version * 1000 + customVersion,
        lotbaVersion: lotbaList.version,
        customVersion,
        domains: uniqueDomains,
        totalCount: uniqueDomains.length,
      };
    }

    const device = await prisma.device.findUnique({
      where: { deviceUuid },
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
    const domainsToBlock: string[] = [];

    if (device.config?.blockGambling) {
      domainsToBlock.push(...lotbaList.domains.map((d) => d.domain));
    }

    // 2. Obtener dominios personalizados del responsable
    let customVersion = 1;
    if (device.config?.blockCustomList && device.userId) {
      const customList = await prisma.blocklist.findFirst({
        where: { userId: device.userId, type: 'CUSTOM' },
        include: {
          domains: {
            where: { isActive: true },
            select: { domain: true },
          },
        },
      });

      if (customList) {
        customVersion = customList.version;
        domainsToBlock.push(...customList.domains.map((d) => d.domain));
      }
    }

    // Eliminar duplicados
    const uniqueDomains = Array.from(new Set(domainsToBlock));

    // Versión combinada calculada
    const combinedVersion = lotbaList.version * 1000 + customVersion;

    return {
      version: combinedVersion,
      lotbaVersion: lotbaList.version,
      customVersion,
      domains: uniqueDomains,
      totalCount: uniqueDomains.length,
    };
  }

  /**
   * Obtiene la lista personalizada de un responsable.
   */
  public async getUserCustomList(userId: string) {
    if (env.USE_MOCK_DATA) {
      let custom = mockDb.blocklists.find((b) => b.userId === userId && b.type === 'CUSTOM');
      if (!custom) {
        custom = {
          id: `list-custom-${Date.now()}`,
          userId,
          name: 'Mi Lista Personalizada',
          description: 'Dominios adicionales definidos por el responsable',
          type: 'CUSTOM',
          version: 1,
          domains: [],
        };
        mockDb.blocklists.push(custom);
      }
      return custom;
    }

    let customList = await prisma.blocklist.findFirst({
      where: { userId, type: 'CUSTOM' },
      include: {
        domains: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customList) {
      customList = await prisma.blocklist.create({
        data: {
          userId,
          name: 'Mi Lista Personalizada',
          description: 'Dominios adicionales definidos por el responsable',
          type: 'CUSTOM',
          version: 1,
        },
        include: {
          domains: true,
        },
      });
    }

    return customList;
  }
  /**
   * Agrega un nuevo dominio a la lista personalizada del responsable e incrementa la versión.
   */
  public async addCustomDomain(input: AddCustomDomainInput) {
    const list = await this.getUserCustomList(input.userId);
    const cleanDomain = normalizeDomain(input.domain);

    // Validar formato básico de dominio
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
      throw new AppError('Formato de dominio no válido (ejemplo: sitio.com)', 400);
    }

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
        createdAt: new Date(),
      };
      (list.domains as any[]).push(newDom);
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

    // Crear dominio e incrementar versión de la lista
    const newDomain = await prisma.blocklistDomain.create({
      data: {
        blocklistId: list.id,
        domain: cleanDomain,
        category: input.category || 'CUSTOM',
      },
    });

    await prisma.blocklist.update({
      where: { id: list.id },
      data: { version: { increment: 1 } },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'ADD_CUSTOM_DOMAIN',
        details: { domain: cleanDomain },
      },
    });

    return newDomain;
  }

  /**
   * Actualiza un dominio de la lista personalizada del responsable (dominio, categoría o estado activo).
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

    if (env.USE_MOCK_DATA) {
      const dom = (list.domains as any[]).find((d) => d.id === input.domainId);
      if (!dom) {
        throw new AppError('Dominio no encontrado en su lista', 404);
      }

      if (cleanDomain && cleanDomain !== dom.domain) {
        const exists = (list.domains as any[]).some((d) => d.id !== input.domainId && d.domain === cleanDomain);
        if (exists) {
          throw new AppError('El dominio ya se encuentra en la lista personalizada', 409);
        }
        dom.domain = cleanDomain;
      }
      if (input.category !== undefined) dom.category = input.category;
      if (input.isActive !== undefined) dom.isActive = input.isActive;
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
      },
    });

    await prisma.blocklist.update({
      where: { id: list.id },
      data: { version: { increment: 1 } },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'UPDATE_CUSTOM_DOMAIN',
        details: { domainId: domainRecord.id, changes: { domain: cleanDomain, category: input.category, isActive: input.isActive } },
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

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'REMOVE_CUSTOM_DOMAIN',
        details: { domain: domain.domain },
      },
    });

    return { message: 'Dominio eliminado correctamente' };
  }
}

export const blocklistService = new BlocklistService();
