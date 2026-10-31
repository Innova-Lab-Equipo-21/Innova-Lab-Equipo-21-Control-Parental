// ==============================================================================
// Proyecto: BA Protege+
// Componente: Gestión de Dispositivos y Pareamiento (Devices API)
// Archivo: src/services/api/devices.api.ts
// ==============================================================================

import { MAX_PROTECTED_DEVICES, DeviceInfo, DevicePermissionsStatus } from '../../types';
import { checkRealDevicePermissions } from '../../utils/permissionChecker';
import { apiClient, safeStorage } from './client';

export const devicesApi = {
  // --------------------------------------------------------------------------
  // Pareamiento y Generación de Códigos
  // --------------------------------------------------------------------------
  async generatePairingCode(data?: any) {
    try {
      const devicesRes = await this.listDevices();
      const currentCount = devicesRes.data?.length || 0;
      if (currentCount >= MAX_PROTECTED_DEVICES) {
        throw new Error(
          `Límite alcanzado: Un responsable solo puede vincular un máximo de ${MAX_PROTECTED_DEVICES} dispositivos.`
        );
      }
    } catch (e: any) {
      if (e.message?.includes('Límite alcanzado')) {
        throw e;
      }
    }

    const response = await apiClient.post('/devices/pair/generate', data || {});
    return response.data;
  },

  async confirmPairing(data: {
    pairingCode: string;
    deviceUuid: string;
    deviceName: string;
    childName?: string;
    model?: string;
    osVersion?: string;
    appVersion?: string;
  }) {
    const response = await apiClient.post('/devices/pair/confirm', data);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // Dispositivo del Responsable
  // --------------------------------------------------------------------------
  async getSelfDevice(): Promise<DeviceInfo> {
    const realPermissions = await checkRealDevicePermissions();
    let baseDevice: DeviceInfo = {
      deviceId: 'self',
      deviceUuid: 'uuid-self-responsable',
      deviceName: 'Tutor Responsable',
      childName: 'Tutor Responsable',
      isProtected: true,
      status: 'ACTIVE',
      lastHeartbeat: 'En línea',
      blockedCount: 0,
      blocklistVersion: 4,
      phone: '+54 9 11 5544-3322',
      birthDate: '10/03/1985',
      gender: 'Masculino',
      profileType: 'Responsable',
      deviceModel: 'Samsung Galaxy S23 (Tutor)',
      createdAt: '01/01/2024',
      permissions: realPermissions,
    };

    try {
      const raw = await safeStorage.getItem('@ba_protege_self_device');
      if (raw) {
        const parsed = JSON.parse(raw);
        baseDevice = {
          ...baseDevice,
          ...parsed,
          deviceName: parsed.childName || parsed.deviceName?.replace(/^.*?\((.*?)\)$/, '$1') || baseDevice.deviceName,
          permissions: realPermissions,
        };
      }
    } catch (e) {}

    return baseDevice;
  },

  async updateSelfDevice(data: Partial<DeviceInfo>): Promise<DeviceInfo> {
    const current = await this.getSelfDevice();
    const updated: DeviceInfo = {
      ...current,
      ...data,
      deviceId: 'self',
    };
    await safeStorage.setItem('@ba_protege_self_device', JSON.stringify(updated));
    return updated;
  },

  // --------------------------------------------------------------------------
  // Lista de Dispositivos Protegidos y Persistencia
  // --------------------------------------------------------------------------
  async listDevices(): Promise<{ success: boolean; data: DeviceInfo[] }> {
    try {
      const response = await apiClient.get('/devices');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data;
      }
    } catch (e) {
      // Usar almacenamiento local / demo
    }

    try {
      const raw = await safeStorage.getItem('@ba_protege_devices_list');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Garantizar que cada dispositivo conserve su colorIndex permanente
          let modified = false;
          const usedIndices = new Set<number>();
          parsed.forEach((d: DeviceInfo) => {
            if (typeof d.colorIndex === 'number') {
              usedIndices.add(d.colorIndex);
            }
          });
          parsed.forEach((d: DeviceInfo, i: number) => {
            if (typeof d.colorIndex !== 'number') {
              let nextIdx = 0;
              while (usedIndices.has(nextIdx) && nextIdx < 5) {
                nextIdx++;
              }
              d.colorIndex = nextIdx < 5 ? nextIdx : i % 5;
              usedIndices.add(d.colorIndex);
              modified = true;
            }
            // Asegurar que el título sea únicamente "Nombre" y no "Dispositivo (Nombre)"
            if (d.childName && (!d.deviceName || d.deviceName.includes('('))) {
              d.deviceName = d.childName;
              modified = true;
            }
          });
          if (modified) {
            await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(parsed));
          }
          return { success: true, data: parsed };
        }
      }
    } catch (e) {}

    const defaultDevices: DeviceInfo[] = [
      {
        deviceId: 'dev-1',
        deviceUuid: 'uuid-samsung-mateo-a54',
        deviceName: 'Mateo',
        childName: 'Mateo',
        isProtected: true,
        status: 'ACTIVE',
        lastHeartbeat: 'Hace 1m',
        blockedCount: 12,
        blocklistVersion: 4,
        phone: '11 4567-8901',
        birthDate: '14/05/2012',
        gender: 'Masculino',
        profileType: 'Menor',
        deviceModel: 'Samsung Galaxy A54 5G',
        createdAt: '10/01/2024',
        colorIndex: 0,
        permissions: {
          vpn: true,
          accessibility: true,
          notifications: true,
          batteryOptimization: true,
          location: true,
          usageStats: true,
          grantedCount: 6,
        },
      },
      {
        deviceId: 'dev-2',
        deviceUuid: 'uuid-xiaomi-sofia-note12',
        deviceName: 'Sofía',
        childName: 'Sofía',
        isProtected: true,
        status: 'ACTIVE',
        lastHeartbeat: 'Hace 3m',
        blockedCount: 4,
        blocklistVersion: 4,
        phone: '11 2345-6789',
        birthDate: '15/05/2012',
        gender: 'Femenino',
        profileType: 'Menor',
        deviceModel: 'Xiaomi Redmi Note 12',
        createdAt: '15/02/2024',
        colorIndex: 1,
        permissions: {
          vpn: true,
          accessibility: false,
          notifications: true,
          batteryOptimization: true,
          location: true,
          usageStats: false,
          grantedCount: 4,
        },
      },
    ];

    await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(defaultDevices));
    return {
      success: true,
      data: defaultDevices,
    };
  },

  async updateDevice(
    deviceId: string,
    data: Partial<DeviceInfo>
  ): Promise<{ success: boolean; data: DeviceInfo }> {
    if (deviceId === 'self') {
      const updatedSelf = await this.updateSelfDevice(data);
      return { success: true, data: updatedSelf };
    }

    const res = await this.listDevices();
    let updatedDevice: DeviceInfo | null = null;
    const updatedList = res.data.map((d) => {
      if (d.deviceId === deviceId || d.deviceUuid === deviceId) {
        updatedDevice = {
          ...d,
          ...data,
          deviceName:
            data.childName ||
            data.deviceName ||
            d.childName ||
            d.deviceName,
        };
        return updatedDevice;
      }
      return d;
    });

    if (updatedDevice) {
      await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
      return { success: true, data: updatedDevice };
    }
    throw new Error('Dispositivo no encontrado');
  },

  async addDevice(data: Partial<DeviceInfo>): Promise<{ success: boolean; data: DeviceInfo }> {
    const res = await this.listDevices();
    if (res.data.length >= MAX_PROTECTED_DEVICES) {
      throw new Error(
        `Límite alcanzado: Un responsable solo puede vincular un máximo de ${MAX_PROTECTED_DEVICES} dispositivos.`
      );
    }

    // Calcular el siguiente color de la paleta institucional (0..4) que no esté en uso
    const usedIndices = new Set(
      res.data
        .map((d) => d.colorIndex)
        .filter((c): c is number => typeof c === 'number')
    );
    let assignedColorIndex = 0;
    while (usedIndices.has(assignedColorIndex) && assignedColorIndex < 5) {
      assignedColorIndex++;
    }
    if (assignedColorIndex >= 5) {
      assignedColorIndex = res.data.length % 5;
    }

    const nextIndex = res.data.length;
    const newId = `dev-${Date.now()}`;
    const newDevice: DeviceInfo = {
      deviceId: newId,
      deviceUuid: `uuid-${newId}`,
      deviceName:
        data.childName ||
        data.deviceName ||
        `Protegido ${nextIndex + 1}`,
      childName: data.childName || `Protegido ${nextIndex + 1}`,
      isProtected: true,
      status: 'ACTIVE',
      lastHeartbeat: 'Recién vinculado',
      blockedCount: 0,
      blocklistVersion: 4,
      phone: data.phone || '',
      birthDate: data.birthDate || '',
      gender: data.gender || 'No informado',
      profileType: data.profileType || 'Menor',
      deviceModel: data.deviceModel || 'Android',
      createdAt: new Date().toLocaleDateString('es-AR'),
      colorIndex: typeof data.colorIndex === 'number' ? data.colorIndex : assignedColorIndex,
      permissions: {
        vpn: true,
        accessibility: true,
        notifications: true,
        batteryOptimization: true,
        location: true,
        usageStats: true,
        grantedCount: 6,
      },
    };

    const updatedList = [...res.data, newDevice];
    await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
    return { success: true, data: newDevice };
  },

  async getDeviceDetail(deviceId: string) {
    const response = await apiClient.get(`/devices/${deviceId}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // Auditoría y Monitoreo de Permisos de Dispositivos (Responsable y Protegidos)
  // --------------------------------------------------------------------------
  async auditDevicePermissions(deviceId: string): Promise<DeviceInfo> {
    if (deviceId === 'self') {
      const realPerms = await checkRealDevicePermissions();
      const updated = await this.updateSelfDevice({
        permissions: realPerms,
        lastHeartbeat: 'Recién verificado',
      });
      return updated;
    }

    try {
      const res = await apiClient.get(`/devices/${deviceId}/permissions`, { timeout: 1500 });
      if (res.data?.data) {
        return res.data.data;
      }
    } catch (e) {
      // Modo offline / simulación local
    }

    const res = await this.listDevices();
    let auditedDev: DeviceInfo | null = null;
    const updatedList = res.data.map((d) => {
      if (d.deviceId === deviceId || d.deviceUuid === deviceId) {
        auditedDev = {
          ...d,
          lastHeartbeat: 'Recién verificado',
        };
        return auditedDev;
      }
      return d;
    });

    if (auditedDev) {
      await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
      return auditedDev;
    }
    throw new Error('Dispositivo no encontrado');
  },

  async updateDevicePermissions(
    deviceId: string,
    permissions: Partial<DevicePermissionsStatus>
  ): Promise<DeviceInfo> {
    if (deviceId === 'self') {
      const current = await this.getSelfDevice();
      const nextPerms = { ...current.permissions, ...permissions } as DevicePermissionsStatus;
      nextPerms.grantedCount = [
        nextPerms.vpn,
        nextPerms.accessibility,
        nextPerms.notifications,
        nextPerms.batteryOptimization,
        nextPerms.location,
        nextPerms.usageStats,
      ].filter(Boolean).length;
      return await this.updateSelfDevice({ permissions: nextPerms, lastHeartbeat: 'Recién verificado' });
    }

    const res = await this.listDevices();
    let updatedDev: DeviceInfo | null = null;
    const updatedList = res.data.map((d) => {
      if (d.deviceId === deviceId || d.deviceUuid === deviceId) {
        const nextPerms = { ...(d.permissions || {}), ...permissions } as DevicePermissionsStatus;
        nextPerms.grantedCount = [
          nextPerms.vpn,
          nextPerms.accessibility,
          nextPerms.notifications,
          nextPerms.batteryOptimization,
          nextPerms.location,
          nextPerms.usageStats,
        ].filter(Boolean).length;
        updatedDev = {
          ...d,
          permissions: nextPerms,
          lastHeartbeat: 'Recién verificado',
        };
        return updatedDev;
      }
      return d;
    });

    if (updatedDev) {
      await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
      return updatedDev;
    }
    throw new Error('Dispositivo no encontrado');
  },

  async unbindDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.delete(`/devices/${deviceId}`, { timeout: 1000 });
    } catch (e) {
      // offline / mock
    }

    try {
      const res = await this.listDevices();
      const updatedList = res.data.filter(
        (d) => d.deviceId !== deviceId && d.deviceUuid !== deviceId
      );
      await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
    } catch (e) {}

    return {
      success: true,
      message: 'El dispositivo fue desvinculado exitosamente.',
    };
  },
};
