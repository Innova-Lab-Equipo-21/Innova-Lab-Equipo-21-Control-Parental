// ==============================================================================
// Proyecto: BA Protege+
// Componente: Listas de Bloqueo, Sitios y Aplicaciones (Blocklist API)
// Archivo: src/services/api/blocklist.api.ts
// ==============================================================================

import {
  CustomBlocklist,
  CustomBlockedDomain,
  CustomBlockedApp,
  AppUsageItem,
} from '../../types';
import { apiClient, safeStorage } from './client';

export const blocklistApi = {
  // --------------------------------------------------------------------------
  // Listas Oficiales LOTBA y por Dispositivo
  // --------------------------------------------------------------------------
  async getOfficialLotbaList() {
    const response = await apiClient.get('/blocklist/official');
    return response.data;
  },

  async getDeviceBlocklist(deviceUuid: string) {
    const response = await apiClient.get(`/blocklist/device/${deviceUuid}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // Lista Personalizada de Sitios y Aplicaciones del Tutor
  // --------------------------------------------------------------------------
  async getCustomBlocklist(): Promise<{ success: boolean; data: CustomBlocklist }> {
    try {
      const response = await apiClient.get('/blocklist/custom', { timeout: 300 });
      if (response.data?.data) {
        await safeStorage.setItem(
          '@ba_protege_custom_blocklist',
          JSON.stringify(response.data.data)
        );
      }
      return response.data;
    } catch (e) {
      // Fallback a almacenamiento local / caché para demo offline
      const cached = await safeStorage.getItem('@ba_protege_custom_blocklist');
      if (cached) {
        return { success: true, data: JSON.parse(cached) };
      }
      const initialList: CustomBlocklist = {
        id: 'custom-local-list',
        name: 'Lista Personalizada del Tutor',
        type: 'CUSTOM',
        version: 1,
        domains: [
          {
            id: 'demo-site-1',
            domain: 'casino-clandestino.net',
            category: 'Apuestas',
            isActive: true,
            applyToAll: true,
            deviceIds: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-site-2',
            domain: 'red-social-peligrosa.org',
            category: 'Redes Sociales',
            isActive: true,
            applyToAll: true,
            deviceIds: [],
            createdAt: new Date().toISOString(),
          },
        ],
        apps: [
          {
            id: 'demo-app-1',
            appName: 'Bet365 Mobile',
            packageName: 'com.bet365.mobile',
            category: 'Apuestas',
            isActive: true,
            applyToAll: true,
            deviceIds: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-app-2',
            appName: 'TikTok',
            packageName: 'com.zhiliaoapp.musically',
            category: 'Redes sociales',
            isActive: true,
            applyToAll: false,
            deviceIds: ['self'],
            createdAt: new Date().toISOString(),
          },
        ],
      };
      await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(initialList));
      return { success: true, data: initialList };
    }
  },

  // --------------------------------------------------------------------------
  // Sitios Web Bloqueados (CRUD)
  // --------------------------------------------------------------------------
  async addCustomBlockedSite(
    domain: string,
    category: string = 'Personalizado',
    applyToAll: boolean = true,
    deviceIds: string[] = []
  ): Promise<{ success: boolean; data: CustomBlockedDomain }> {
    const cleanDomain = domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
      throw new Error('Formato de dominio no válido (ejemplo: sitio.com)');
    }

    try {
      const response = await apiClient.post(
        '/blocklist/custom/domains',
        {
          domain: cleanDomain,
          category,
          applyToAll,
          deviceIds,
        },
        { timeout: 300 }
      );
      return response.data;
    } catch (e: any) {
      // Fallback offline
      const currentListRes = await this.getCustomBlocklist();
      const list = currentListRes.data;
      if (list.domains.some((d) => d.domain === cleanDomain)) {
        throw new Error('El dominio ya se encuentra en tu lista de sitios bloqueados');
      }
      const newDomain: CustomBlockedDomain = {
        id: `dom-${Date.now()}`,
        domain: cleanDomain,
        category,
        isActive: true,
        applyToAll,
        deviceIds,
        createdAt: new Date().toISOString(),
      };
      list.domains.unshift(newDomain);
      list.version += 1;
      await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
      return { success: true, data: newDomain };
    }
  },

  async updateCustomBlockedSite(
    domainId: string,
    data: { domain?: string; category?: string; isActive?: boolean; applyToAll?: boolean; deviceIds?: string[] }
  ): Promise<{ success: boolean; data: CustomBlockedDomain }> {
    let cleanDomain: string | undefined;
    if (data.domain) {
      cleanDomain = data.domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
      if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
        throw new Error('Formato de dominio no válido (ejemplo: sitio.com)');
      }
    }

    try {
      const response = await apiClient.put(
        `/blocklist/custom/domains/${domainId}`,
        {
          ...(cleanDomain ? { domain: cleanDomain } : {}),
          ...(data.category !== undefined ? { category: data.category } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.applyToAll !== undefined ? { applyToAll: data.applyToAll } : {}),
          ...(data.deviceIds !== undefined ? { deviceIds: data.deviceIds } : {}),
        },
        { timeout: 300 }
      );
      return response.data;
    } catch (e: any) {
      // Fallback offline
      const currentListRes = await this.getCustomBlocklist();
      const list = currentListRes.data;
      const item = list.domains.find((d) => d.id === domainId);
      if (!item) throw new Error('Dominio no encontrado');
      if (cleanDomain) item.domain = cleanDomain;
      if (data.category !== undefined) item.category = data.category;
      if (data.isActive !== undefined) item.isActive = data.isActive;
      if (data.applyToAll !== undefined) item.applyToAll = data.applyToAll;
      if (data.deviceIds !== undefined) item.deviceIds = data.deviceIds;
      list.version += 1;
      await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
      return { success: true, data: item };
    }
  },

  async deleteCustomBlockedSite(domainId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/blocklist/custom/domains/${domainId}`, { timeout: 300 });
      return response.data;
    } catch (e: any) {
      // Fallback offline
      const currentListRes = await this.getCustomBlocklist();
      const list = currentListRes.data;
      const idx = list.domains.findIndex((d) => d.id === domainId);
      if (idx !== -1) {
        list.domains.splice(idx, 1);
        list.version += 1;
        await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
      }
      return { success: true, message: 'Sitio eliminado correctamente' };
    }
  },

  // --------------------------------------------------------------------------
  // Aplicaciones Bloqueadas y Tiempo de Uso (CRUD)
  // --------------------------------------------------------------------------
  async addCustomBlockedApp(
    appName: string,
    packageName: string,
    category: string = 'Personalizado',
    applyToAll: boolean = true,
    deviceIds: string[] = [],
    dailyLimitMinutes?: number,
    deviceLimits?: Record<string, number | undefined>
  ): Promise<{ success: boolean; data: CustomBlockedApp }> {
    const listRes = await this.getCustomBlocklist();
    const list = listRes.data;
    if (!list.apps) list.apps = [];

    const newApp: CustomBlockedApp = {
      id: `app-${Date.now()}`,
      appName,
      packageName,
      category,
      isActive: true,
      applyToAll,
      deviceIds,
      dailyLimitMinutes,
      deviceLimits,
      createdAt: new Date().toISOString(),
    };

    list.apps.unshift(newApp);
    list.version += 1;
    await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
    return { success: true, data: newApp };
  },

  async updateCustomBlockedApp(
    appId: string,
    data: {
      appName?: string;
      category?: string;
      isActive?: boolean;
      applyToAll?: boolean;
      deviceIds?: string[];
      dailyLimitMinutes?: number;
      deviceLimits?: Record<string, number | undefined>;
    }
  ): Promise<{ success: boolean; data: CustomBlockedApp }> {
    const listRes = await this.getCustomBlocklist();
    const list = listRes.data;
    if (!list.apps) list.apps = [];

    const item = list.apps.find((a) => a.id === appId);
    if (!item) throw new Error('Aplicación no encontrada');

    if (data.appName) item.appName = data.appName;
    if (data.category !== undefined) item.category = data.category;
    if (data.isActive !== undefined) item.isActive = data.isActive;
    if (data.applyToAll !== undefined) item.applyToAll = data.applyToAll;
    if (data.deviceIds !== undefined) item.deviceIds = data.deviceIds;
    if (data.dailyLimitMinutes !== undefined) item.dailyLimitMinutes = data.dailyLimitMinutes;
    if (data.deviceLimits !== undefined) item.deviceLimits = data.deviceLimits;

    list.version += 1;
    await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
    return { success: true, data: item };
  },

  async deleteCustomBlockedApp(appId: string): Promise<{ success: boolean; message: string }> {
    const listRes = await this.getCustomBlocklist();
    const list = listRes.data;
    if (!list.apps) list.apps = [];

    const idx = list.apps.findIndex((a) => a.id === appId);
    if (idx !== -1) {
      list.apps.splice(idx, 1);
      list.version += 1;
      await safeStorage.setItem('@ba_protege_custom_blocklist', JSON.stringify(list));
    }
    return { success: true, message: 'Aplicación eliminada correctamente' };
  },

  async getAppUsageStats(_deviceId: string): Promise<AppUsageItem[]> {
    return [
      { id: 'u1', appName: 'Instagram', packageName: 'com.instagram.android', category: 'Redes sociales', timeInMinutes: 85 },
      { id: 'u2', appName: 'TikTok', packageName: 'com.zhiliaoapp.musically', category: 'Redes sociales', timeInMinutes: 62 },
      { id: 'u3', appName: 'Free Fire', packageName: 'com.dts.freefireth', category: 'Juegos', timeInMinutes: 45 },
      { id: 'u4', appName: 'YouTube', packageName: 'com.google.android.youtube', category: 'Entretenimiento', timeInMinutes: 38 },
      { id: 'u5', appName: 'Bet365 Mobile', packageName: 'com.bet365.mobile', category: 'Apuestas', timeInMinutes: 15 },
    ];
  },
};
