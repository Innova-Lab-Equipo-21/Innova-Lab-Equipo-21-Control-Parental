// ==============================================================================
// Proyecto: BA Protege+
// Componente: Listas de Bloqueo, Sitios y Aplicaciones (Blocklist API)
// Archivo: src/services/api/blocklist.api.ts
// Descripción: Consumo 100% real en PostgreSQL de la lista oficial LOTBA,
//              CRUD sincronizado de sitios/apps personalizadas y reglas de Adulto Protegido.
// ==============================================================================

import {
  CustomBlocklist,
  CustomBlockedDomain,
  CustomBlockedApp,
  AppUsageItem,
  BlockOriginMeta,
} from '../../types';
import { apiClient, safeStorage } from './client';

export interface DeviceEffectiveBlocklistData {
  version: number;
  lotbaVersion: number;
  customVersion: number;
  lotbaDomains: string[];
  domains: string[];
  customDomains: CustomBlockedDomain[];
  customApps: CustomBlockedApp[];
  totalCount: number;
}

function extractApiErrorMessage(err: any, fallback: string): string {
  const serverMsg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors[0]?.message : null);
  if (typeof serverMsg === 'string' && serverMsg.trim().length > 0) {
    return serverMsg.trim();
  }
  if (err?.message && !/timeout|network error|status code/i.test(err.message)) {
    return err.message;
  }
  return fallback;
}

function normalizeDomainInput(domain: string): string {
  return domain
    .toLowerCase()
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '');
}

function mapServerDomain(raw: any): CustomBlockedDomain {
  return {
    id: String(raw.id),
    domain: String(raw.domain || '').toLowerCase().trim(),
    category: raw.category || 'Personalizado',
    isActive: raw.isActive !== false,
    applyToAll: raw.applyToAll !== false,
    deviceIds: Array.isArray(raw.deviceIds) ? raw.deviceIds : [],
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    ...(raw.createdBy ? { createdBy: raw.createdBy } : {}),
    ...(raw.createdByName ? { createdByName: raw.createdByName } : {}),
    ...(raw.sourceDeviceId ? { sourceDeviceId: raw.sourceDeviceId } : {}),
  };
}

function mapServerApp(raw: any): CustomBlockedApp {
  return {
    id: String(raw.id),
    appName: String(raw.appName || ''),
    packageName: String(raw.packageName || ''),
    category: raw.category || 'Personalizado',
    isActive: raw.isActive !== false,
    applyToAll: raw.applyToAll !== false,
    deviceIds: Array.isArray(raw.deviceIds) ? raw.deviceIds : [],
    dailyLimitMinutes:
      typeof raw.dailyLimitMinutes === 'number' && raw.dailyLimitMinutes > 0
        ? raw.dailyLimitMinutes
        : undefined,
    deviceLimits:
      raw.deviceLimits && typeof raw.deviceLimits === 'object' ? raw.deviceLimits : undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    ...(raw.createdBy ? { createdBy: raw.createdBy } : {}),
    ...(raw.createdByName ? { createdByName: raw.createdByName } : {}),
    ...(raw.sourceDeviceId ? { sourceDeviceId: raw.sourceDeviceId } : {}),
  };
}

async function syncCachedList(updater: (list: CustomBlocklist) => CustomBlocklist): Promise<void> {
  try {
    const raw = await safeStorage.getItem('@ba_protege_custom_blocklist');
    if (!raw) return;
    const parsed: CustomBlocklist = JSON.parse(raw);
    const updated = updater({
      ...parsed,
      domains: Array.isArray(parsed.domains) ? [...parsed.domains] : [],
      apps: Array.isArray(parsed.apps) ? [...parsed.apps] : [],
    });
    await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(updated));
  } catch {
    // El caché local es solo auxiliar de lectura; la fuente única es PostgreSQL
  }
}

export const blocklistApi = {
  // --------------------------------------------------------------------------
  // Listas Oficiales LOTBA y Reglas Efectivas por Dispositivo Protegido
  // --------------------------------------------------------------------------
  async getOfficialLotbaList() {
    try {
      const response = await apiClient.get('/blocklist/official');
      return response.data;
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(err, 'No se pudo obtener la lista oficial de LOTBA.')
      );
    }
  },

  async getDeviceBlocklist(
    deviceUuid: string
  ): Promise<{ success: boolean; data: DeviceEffectiveBlocklistData }> {
    try {
      const response = await apiClient.get(
        `/blocklist/device/${encodeURIComponent(deviceUuid)}`
      );
      const raw = response.data?.data;
      if (!raw) {
        throw new Error('No se recibieron reglas de bloqueo para este dispositivo.');
      }

      const data: DeviceEffectiveBlocklistData = {
        version: Number(raw.version) || 1,
        lotbaVersion: Number(raw.lotbaVersion) || 1,
        customVersion: Number(raw.customVersion) || 1,
        lotbaDomains: Array.isArray(raw.lotbaDomains) ? raw.lotbaDomains : [],
        domains: Array.isArray(raw.domains) ? raw.domains : [],
        customDomains: Array.isArray(raw.customDomains)
          ? raw.customDomains.map(mapServerDomain)
          : [],
        customApps: Array.isArray(raw.customApps) ? raw.customApps.map(mapServerApp) : [],
        totalCount: Number(raw.totalCount) || (Array.isArray(raw.domains) ? raw.domains.length : 0),
      };

      return { success: true, data };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudieron sincronizar las reglas de bloqueo del dispositivo.'
        )
      );
    }
  },

  // --------------------------------------------------------------------------
  // Inserción desde Modo Protegido Adulto (Solo inserción; no permite desbloquear)
  // --------------------------------------------------------------------------
  async addDeviceBlockedSite(
    deviceUuid: string,
    domain: string,
    category: string = 'Personalizado'
  ): Promise<{ success: boolean; data: CustomBlockedDomain }> {
    const cleanDomain = normalizeDomainInput(domain);
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
      throw new Error('Formato de dominio no válido (ejemplo: sitio.com)');
    }

    try {
      const response = await apiClient.post(
        `/blocklist/device/${encodeURIComponent(deviceUuid)}/domains`,
        { domain: cleanDomain, category }
      );
      return {
        success: true,
        data: mapServerDomain(response.data?.data),
      };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo bloquear el sitio en el servidor. Verificá tu conexión.'
        )
      );
    }
  },

  async addDeviceBlockedApp(
    deviceUuid: string,
    appName: string,
    packageName?: string,
    category: string = 'Personalizado'
  ): Promise<{ success: boolean; data: CustomBlockedApp }> {
    const trimmedName = appName.trim();
    if (!trimmedName) {
      throw new Error('El nombre de la aplicación es requerido');
    }

    try {
      const response = await apiClient.post(
        `/blocklist/device/${encodeURIComponent(deviceUuid)}/apps`,
        {
          appName: trimmedName,
          ...(packageName ? { packageName: packageName.trim() } : {}),
          category,
        }
      );
      return {
        success: true,
        data: mapServerApp(response.data?.data),
      };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo bloquear la aplicación en el servidor. Verificá tu conexión.'
        )
      );
    }
  },

  // --------------------------------------------------------------------------
  // Lista Personalizada de Sitios y Aplicaciones del Responsable (PostgreSQL)
  // --------------------------------------------------------------------------
  async getCustomBlocklist(): Promise<{ success: boolean; data: CustomBlocklist }> {
    try {
      const response = await apiClient.get('/blocklist/custom');
      const raw = response.data?.data;
      if (!raw) {
        throw new Error('Respuesta inválida al consultar la lista personalizada.');
      }

      const normalized: CustomBlocklist = {
        id: String(raw.id),
        name: raw.name || 'Mi Lista Personalizada',
        type: raw.type || 'CUSTOM',
        version: Number(raw.version) || 1,
        domains: Array.isArray(raw.domains) ? raw.domains.map(mapServerDomain) : [],
        apps: Array.isArray(raw.apps) ? raw.apps.map(mapServerApp) : [],
      };

      await safeStorage
        .setItem('@ba_protege_custom_blocklist', JSON.stringify(normalized))
        .catch(() => {});

      return { success: true, data: normalized };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo cargar tu lista personalizada desde el servidor. Verificá tu conexión.'
        )
      );
    }
  },

  // --------------------------------------------------------------------------
  // Sitios Web Bloqueados (CRUD en PostgreSQL)
  // --------------------------------------------------------------------------
  async addCustomBlockedSite(
    domain: string,
    category: string = 'Personalizado',
    applyToAll: boolean = true,
    deviceIds: string[] = [],
    originMeta?: BlockOriginMeta
  ): Promise<{ success: boolean; data: CustomBlockedDomain }> {
    const cleanDomain = normalizeDomainInput(domain);
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
      throw new Error('Formato de dominio no válido (ejemplo: sitio.com)');
    }

    try {
      const response = await apiClient.post('/blocklist/custom/domains', {
        domain: cleanDomain,
        category,
        applyToAll,
        deviceIds,
        ...(originMeta?.createdBy ? { createdBy: originMeta.createdBy } : {}),
        ...(originMeta?.createdByName ? { createdByName: originMeta.createdByName } : {}),
        ...(originMeta?.sourceDeviceId ? { sourceDeviceId: originMeta.sourceDeviceId } : {}),
      });

      const created = mapServerDomain(response.data?.data);
      await syncCachedList((list) => {
        list.domains = [created, ...list.domains.filter((d) => d.id !== created.id)];
        list.version += 1;
        return list;
      });
      return { success: true, data: created };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo agregar el sitio web a la lista de bloqueo. Verificá tu conexión.'
        )
      );
    }
  },

  async updateCustomBlockedSite(
    domainId: string,
    data: {
      domain?: string;
      category?: string;
      isActive?: boolean;
      applyToAll?: boolean;
      deviceIds?: string[];
    }
  ): Promise<{ success: boolean; data: CustomBlockedDomain }> {
    let cleanDomain: string | undefined;
    if (data.domain !== undefined) {
      cleanDomain = normalizeDomainInput(data.domain);
      if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
        throw new Error('Formato de dominio no válido (ejemplo: sitio.com)');
      }
    }

    try {
      const response = await apiClient.put(`/blocklist/custom/domains/${domainId}`, {
        ...(cleanDomain !== undefined ? { domain: cleanDomain } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.applyToAll !== undefined ? { applyToAll: data.applyToAll } : {}),
        ...(data.deviceIds !== undefined ? { deviceIds: data.deviceIds } : {}),
      });

      const updated = mapServerDomain(response.data?.data);
      await syncCachedList((list) => {
        list.domains = list.domains.map((d) => (d.id === updated.id ? updated : d));
        list.version += 1;
        return list;
      });
      return { success: true, data: updated };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo actualizar el sitio bloqueado. Verificá tu conexión.'
        )
      );
    }
  },

  async deleteCustomBlockedSite(domainId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/blocklist/custom/domains/${domainId}`);
      await syncCachedList((list) => {
        list.domains = list.domains.filter((d) => d.id !== domainId);
        list.version += 1;
        return list;
      });
      return {
        success: true,
        message: response.data?.message || 'Dominio eliminado correctamente',
      };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo eliminar el sitio bloqueado. Verificá tu conexión.'
        )
      );
    }
  },

  // --------------------------------------------------------------------------
  // Aplicaciones Bloqueadas y Límites Diarios (CRUD en PostgreSQL)
  // --------------------------------------------------------------------------
  async addCustomBlockedApp(
    appName: string,
    packageName: string,
    category: string = 'Personalizado',
    applyToAll: boolean = true,
    deviceIds: string[] = [],
    dailyLimitMinutes?: number,
    deviceLimits?: Record<string, number | undefined>,
    originMeta?: BlockOriginMeta
  ): Promise<{ success: boolean; data: CustomBlockedApp }> {
    const trimmedName = appName.trim();
    if (!trimmedName) {
      throw new Error('El nombre de la aplicación es requerido');
    }

    try {
      const response = await apiClient.post('/blocklist/custom/apps', {
        appName: trimmedName,
        packageName: packageName?.trim() || undefined,
        category,
        applyToAll,
        deviceIds,
        dailyLimitMinutes: typeof dailyLimitMinutes === 'number' ? dailyLimitMinutes : null,
        ...(deviceLimits !== undefined ? { deviceLimits } : {}),
        ...(originMeta?.createdBy ? { createdBy: originMeta.createdBy } : {}),
        ...(originMeta?.createdByName ? { createdByName: originMeta.createdByName } : {}),
        ...(originMeta?.sourceDeviceId ? { sourceDeviceId: originMeta.sourceDeviceId } : {}),
      });

      const created = mapServerApp(response.data?.data);
      await syncCachedList((list) => {
        list.apps = [created, ...(list.apps || []).filter((a) => a.id !== created.id)];
        list.version += 1;
        return list;
      });
      return { success: true, data: created };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo bloquear la aplicación en el servidor. Verificá tu conexión.'
        )
      );
    }
  },

  async updateCustomBlockedApp(
    appId: string,
    data: {
      appName?: string;
      packageName?: string;
      category?: string;
      isActive?: boolean;
      applyToAll?: boolean;
      deviceIds?: string[];
      dailyLimitMinutes?: number | null;
      deviceLimits?: Record<string, number | undefined> | null;
    }
  ): Promise<{ success: boolean; data: CustomBlockedApp }> {
    try {
      const payload: Record<string, unknown> = {
        ...(data.appName !== undefined ? { appName: data.appName.trim() } : {}),
        ...(data.packageName !== undefined ? { packageName: data.packageName.trim() } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.applyToAll !== undefined ? { applyToAll: data.applyToAll } : {}),
        ...(data.deviceIds !== undefined ? { deviceIds: data.deviceIds } : {}),
      };
      if ('dailyLimitMinutes' in data) {
        payload.dailyLimitMinutes =
          typeof data.dailyLimitMinutes === 'number' && data.dailyLimitMinutes > 0
            ? data.dailyLimitMinutes
            : null;
      }
      if ('deviceLimits' in data) {
        payload.deviceLimits = data.deviceLimits ?? null;
      }

      const response = await apiClient.put(`/blocklist/custom/apps/${appId}`, payload);
      const updated = mapServerApp(response.data?.data);
      await syncCachedList((list) => {
        list.apps = (list.apps || []).map((a) => (a.id === updated.id ? updated : a));
        list.version += 1;
        return list;
      });
      return { success: true, data: updated };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo actualizar la aplicación bloqueada. Verificá tu conexión.'
        )
      );
    }
  },

  async deleteCustomBlockedApp(appId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/blocklist/custom/apps/${appId}`);
      await syncCachedList((list) => {
        list.apps = (list.apps || []).filter((a) => a.id !== appId);
        list.version += 1;
        return list;
      });
      return {
        success: true,
        message: response.data?.message || 'Aplicación eliminada correctamente',
      };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo eliminar la aplicación bloqueada. Verificá tu conexión.'
        )
      );
    }
  },

  // --------------------------------------------------------------------------
  // Estadísticas Reales de Uso de Aplicaciones (PostgreSQL)
  // --------------------------------------------------------------------------
  async getAppUsageStats(deviceId: string): Promise<AppUsageItem[]> {
    try {
      const response = await apiClient.get(
        `/metrics/device/${encodeURIComponent(deviceId)}/activity`
      );
      const snapshots = response.data?.data?.appUsage;
      if (!Array.isArray(snapshots)) return [];
      return snapshots.map((item: any, idx: number) => ({
        id: String(item.id || `${item.packageName || 'app'}-${idx}`),
        appName: String(item.appName || item.packageName || ''),
        packageName: String(item.packageName || ''),
        category: item.category || 'Aplicación',
        timeInMinutes: Number(item.usedMinutes) || 0,
        lastUsed: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
      }));
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo obtener el tiempo de uso de aplicaciones desde el servidor.'
        )
      );
    }
  },
};
