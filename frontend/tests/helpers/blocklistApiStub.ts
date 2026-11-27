// ==============================================================================
// Proyecto: BA Protege+
// Componente: Pruebas Automatizadas — Stub de Contrato REST de Blocklist
// Archivo: tests/helpers/blocklistApiStub.ts
// Descripción: Simula fielmente los endpoints REST de /blocklist/* y /metrics/device/*/activity
//              para validar el cliente HTTP real de blocklist.api.ts sin fallbacks offline.
// ==============================================================================

import { apiClient, safeStorage } from '../../src/services/api/client.js';

export function installBlocklistApiStub() {
  const originalGet = apiClient.get.bind(apiClient);
  const originalPost = apiClient.post.bind(apiClient);
  const originalPut = apiClient.put.bind(apiClient);
  const originalDelete = apiClient.delete.bind(apiClient);

  const state = {
    id: 'list-custom-pg-1',
    name: 'Mi Lista Personalizada',
    type: 'CUSTOM',
    version: 1,
    domains: [] as any[],
    apps: [] as any[],
    usageByDevice: new Map<string, any[]>(),
    selfControlActive: false,
    selfControlEnabledAt: null as string | null,
    otpByUuid: new Map<string, { code: string; expiresAt: number }>(),
  };

  let seq = 1;

  function makeAxiosError(status: number, message: string) {
    const err: any = new Error(message);
    err.response = { status, data: { success: false, message } };
    return err;
  }

  (apiClient as any).get = async (url: string) => {
    if (url === '/self-control/status') {
      const enabledAt = state.selfControlEnabledAt;
      const canDisableAt = enabledAt
        ? new Date(new Date(enabledAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
        : null;
      const remainingMs = canDisableAt ? Math.max(0, new Date(canDisableAt).getTime() - Date.now()) : 0;
      const canDisable = !state.selfControlActive || remainingMs === 0;
      return {
        data: {
          success: true,
          data: {
            active: state.selfControlActive,
            status: !state.selfControlActive
              ? 'INACTIVE'
              : canDisable
                ? 'DEACTIVATION_READY'
                : 'ACTIVE_LOCKED',
            enabledAt,
            canDisableAt,
            canDisable,
            remainingMs,
            remainingHours: Math.floor(remainingMs / 3_600_000),
            remainingMinutes: Math.floor((remainingMs % 3_600_000) / 60_000),
          },
        },
      };
    }

    if (url === '/blocklist/custom') {
      return {
        data: {
          success: true,
          data: {
            id: state.id,
            name: state.name,
            type: state.type,
            version: state.version,
            domains: [...state.domains],
            apps: [...state.apps],
          },
        },
      };
    }

    const usageMatch = url.match(/^\/metrics\/device\/([^/]+)\/activity$/);
    if (usageMatch) {
      const devId = decodeURIComponent(usageMatch[1]);
      return {
        data: {
          success: true,
          data: {
            appUsage: state.usageByDevice.get(devId) || [],
          },
        },
      };
    }

    const deviceMatch = url.match(/^\/blocklist\/device\/([^/]+)$/);
    if (deviceMatch) {
      const devId = decodeURIComponent(deviceMatch[1]);
      const matchingDomains = state.domains.filter(
        (d) =>
          d.isActive !== false &&
          (d.applyToAll !== false ||
            d.sourceDeviceId === devId ||
            (Array.isArray(d.deviceIds) && d.deviceIds.includes(devId)))
      );
      const matchingApps = state.apps.filter(
        (a) =>
          a.isActive !== false &&
          (a.applyToAll !== false ||
            a.sourceDeviceId === devId ||
            (Array.isArray(a.deviceIds) && a.deviceIds.includes(devId)))
      );
      return {
        data: {
          success: true,
          data: {
            version: 1000 + state.version,
            lotbaVersion: 1,
            customVersion: state.version,
            lotbaDomains: ['apuestas-online-ilegal.bet'],
            domains: ['apuestas-online-ilegal.bet', ...matchingDomains.map((d) => d.domain)],
            customDomains: matchingDomains,
            customApps: matchingApps,
            totalCount: 1 + matchingDomains.length,
          },
        },
      };
    }

    return originalGet(url);
  };

  (apiClient as any).post = async (url: string, body: any) => {
    if (url === '/self-control/enable') {
      state.selfControlActive = true;
      state.selfControlEnabledAt = new Date().toISOString();
      const canDisableAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const remainingMs = 24 * 60 * 60 * 1000;
      return {
        data: {
          success: true,
          data: {
            active: true,
            status: 'ACTIVE_LOCKED',
            enabledAt: state.selfControlEnabledAt,
            canDisableAt,
            canDisable: false,
            remainingMs,
            remainingHours: 24,
            remainingMinutes: 0,
          },
        },
      };
    }

    if (url === '/self-control/disable') {
      state.selfControlActive = false;
      state.selfControlEnabledAt = null;
      return {
        data: {
          success: true,
          data: {
            active: false,
            status: 'INACTIVE',
            enabledAt: null,
            canDisableAt: null,
            canDisable: true,
            remainingMs: 0,
            remainingHours: 0,
            remainingMinutes: 0,
          },
        },
      };
    }

    if (url === '/devices/anti-uninstall/request-code') {
      const uuid = String(body?.deviceUuid || '');
      const code = String(Math.floor(100000 + Math.random() * 900000));
      state.otpByUuid.set(uuid, { code, expiresAt: Date.now() + 15 * 60 * 1000 });
      return {
        data: {
          success: true,
          data: {
            maskedEmail: 'm***a@test.com',
            expiresInMinutes: 15,
            code,
          },
        },
      };
    }

    if (url === '/devices/anti-uninstall/invalidate-code') {
      state.otpByUuid.delete(String(body?.deviceUuid || ''));
      return { data: { success: true } };
    }

    if (url === '/devices/anti-uninstall/verify-code') {
      const uuid = String(body?.deviceUuid || '');
      const entry = state.otpByUuid.get(uuid);
      if (!entry || Date.now() > entry.expiresAt) {
        throw makeAxiosError(400, 'No hay un código activo o fue invalidado.');
      }
      if (String(body?.code || '').trim() !== entry.code) {
        throw makeAxiosError(400, 'El código ingresado es incorrecto.');
      }
      state.otpByUuid.delete(uuid);
      return { data: { success: true, message: 'Código verificado correctamente.' } };
    }

    if (url === '/blocklist/custom/domains') {
      const domain = String(body.domain || '').toLowerCase().trim();
      if (state.domains.some((d) => d.domain === domain)) {
        throw makeAxiosError(409, 'El dominio ya se encuentra en la lista personalizada');
      }
      const created = {
        id: `dom-pg-${seq++}`,
        domain,
        category: body.category || 'Personalizado',
        isActive: true,
        applyToAll: body.applyToAll !== undefined ? Boolean(body.applyToAll) : true,
        deviceIds: Array.isArray(body.deviceIds) ? [...body.deviceIds] : [],
        createdBy: body.createdBy || 'RESPONSABLE',
        createdByName: body.createdByName || null,
        sourceDeviceId: body.sourceDeviceId || null,
        createdAt: new Date().toISOString(),
      };
      state.domains.unshift(created);
      state.version += 1;
      return { data: { success: true, data: created } };
    }

    if (url === '/blocklist/custom/apps') {
      const appName = String(body.appName || '').trim();
      const packageName =
        String(body.packageName || '').trim().toLowerCase() ||
        `com.${appName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.app`;
      if (
        state.apps.some(
          (a) =>
            a.packageName.toLowerCase() === packageName ||
            a.appName.trim().toLowerCase() === appName.toLowerCase()
        )
      ) {
        throw makeAxiosError(409, 'La aplicación ya se encuentra en tu lista de restricción');
      }
      const created = {
        id: `app-pg-${seq++}`,
        appName,
        packageName,
        category: body.category || 'Personalizado',
        isActive: true,
        applyToAll: body.applyToAll !== undefined ? Boolean(body.applyToAll) : true,
        deviceIds: Array.isArray(body.deviceIds) ? [...body.deviceIds] : [],
        dailyLimitMinutes:
          typeof body.dailyLimitMinutes === 'number' && body.dailyLimitMinutes > 0
            ? body.dailyLimitMinutes
            : null,
        deviceLimits: body.deviceLimits ?? null,
        createdBy: body.createdBy || 'RESPONSABLE',
        createdByName: body.createdByName || null,
        sourceDeviceId: body.sourceDeviceId || null,
        createdAt: new Date().toISOString(),
      };
      state.apps.unshift(created);
      state.version += 1;
      return { data: { success: true, data: created } };
    }

    const devDomainMatch = url.match(/^\/blocklist\/device\/([^/]+)\/domains$/);
    if (devDomainMatch) {
      const devUuid = decodeURIComponent(devDomainMatch[1]);
      const domain = String(body.domain || '').toLowerCase().trim();
      if (state.domains.some((d) => d.domain === domain)) {
        throw makeAxiosError(409, 'El dominio ya se encuentra en la lista personalizada');
      }
      const created = {
        id: `dom-pg-${seq++}`,
        domain,
        category: body.category || 'Personalizado',
        isActive: true,
        applyToAll: false,
        deviceIds: [devUuid],
        createdBy: 'ADULTO_PROTEGIDO',
        createdByName: 'Carlos',
        sourceDeviceId: devUuid,
        createdAt: new Date().toISOString(),
      };
      state.domains.unshift(created);
      state.version += 1;
      return { data: { success: true, data: created } };
    }

    const devAppMatch = url.match(/^\/blocklist\/device\/([^/]+)\/apps$/);
    if (devAppMatch) {
      const devUuid = decodeURIComponent(devAppMatch[1]);
      const appName = String(body.appName || '').trim();
      const packageName =
        String(body.packageName || '').trim().toLowerCase() ||
        `com.${appName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.app`;
      if (
        state.apps.some(
          (a) =>
            a.packageName.toLowerCase() === packageName ||
            a.appName.trim().toLowerCase() === appName.toLowerCase()
        )
      ) {
        throw makeAxiosError(409, 'La aplicación ya se encuentra en tu lista de restricción');
      }
      const created = {
        id: `app-pg-${seq++}`,
        appName,
        packageName,
        category: body.category || 'Personalizado',
        isActive: true,
        applyToAll: false,
        deviceIds: [devUuid],
        dailyLimitMinutes: null,
        deviceLimits: null,
        createdBy: 'ADULTO_PROTEGIDO',
        createdByName: 'Carlos',
        sourceDeviceId: devUuid,
        createdAt: new Date().toISOString(),
      };
      state.apps.unshift(created);
      state.version += 1;
      return { data: { success: true, data: created } };
    }

    return originalPost(url, body);
  };

  (apiClient as any).put = async (url: string, body: any) => {
    const domMatch = url.match(/^\/blocklist\/custom\/domains\/([^/]+)$/);
    if (domMatch) {
      const id = domMatch[1];
      const item = state.domains.find((d) => d.id === id);
      if (!item) throw makeAxiosError(404, 'Dominio no encontrado en su lista');
      if (body.domain !== undefined) item.domain = String(body.domain).toLowerCase().trim();
      if (body.category !== undefined) item.category = body.category;
      if (body.isActive !== undefined) item.isActive = body.isActive;
      if (body.applyToAll !== undefined) item.applyToAll = body.applyToAll;
      if (body.deviceIds !== undefined) item.deviceIds = [...body.deviceIds];
      state.version += 1;
      return { data: { success: true, data: { ...item } } };
    }

    const appMatch = url.match(/^\/blocklist\/custom\/apps\/([^/]+)$/);
    if (appMatch) {
      const id = appMatch[1];
      const item = state.apps.find((a) => a.id === id);
      if (!item) throw makeAxiosError(404, 'Aplicación no encontrada en su lista');
      if (body.appName !== undefined) item.appName = String(body.appName).trim();
      if (body.packageName !== undefined) item.packageName = String(body.packageName).trim().toLowerCase();
      if (body.category !== undefined) item.category = body.category;
      if (body.isActive !== undefined) item.isActive = body.isActive;
      if (body.applyToAll !== undefined) item.applyToAll = body.applyToAll;
      if (body.deviceIds !== undefined) item.deviceIds = [...body.deviceIds];
      if ('dailyLimitMinutes' in body) item.dailyLimitMinutes = body.dailyLimitMinutes ?? null;
      if ('deviceLimits' in body) item.deviceLimits = body.deviceLimits ?? null;
      state.version += 1;
      return { data: { success: true, data: { ...item } } };
    }

    return originalPut(url, body);
  };

  (apiClient as any).delete = async (url: string) => {
    const domMatch = url.match(/^\/blocklist\/custom\/domains\/([^/]+)$/);
    if (domMatch) {
      const id = domMatch[1];
      const idx = state.domains.findIndex((d) => d.id === id);
      if (idx === -1) throw makeAxiosError(404, 'Dominio no encontrado en su lista');
      state.domains.splice(idx, 1);
      state.version += 1;
      return { data: { success: true, message: 'Dominio eliminado correctamente' } };
    }

    const appMatch = url.match(/^\/blocklist\/custom\/apps\/([^/]+)$/);
    if (appMatch) {
      const id = appMatch[1];
      const idx = state.apps.findIndex((a) => a.id === id);
      if (idx === -1) throw makeAxiosError(404, 'Aplicación no encontrada en su lista');
      state.apps.splice(idx, 1);
      state.version += 1;
      return { data: { success: true, message: 'Aplicación eliminada correctamente' } };
    }

    return originalDelete(url);
  };

  return {
    state,
    reset: async () => {
      state.domains.length = 0;
      state.apps.length = 0;
      state.version = 1;
      state.usageByDevice.clear();
      state.selfControlActive = false;
      state.selfControlEnabledAt = null;
      state.otpByUuid.clear();
      await safeStorage.removeItem('@ba_protege_custom_blocklist');
    },
    restore: () => {
      (apiClient as any).get = originalGet;
      (apiClient as any).post = originalPost;
      (apiClient as any).put = originalPut;
      (apiClient as any).delete = originalDelete;
    },
  };
}
