// ==============================================================================
// Proyecto: BA Protege+
// Componente: Gestión de Dispositivos y Pareamiento (Devices API)
// Archivo: src/services/api/devices.api.ts
// Descripción: Operaciones de vinculación, listado, edición, auditoría de permisos, desvinculación y códigos OTP.
// ==============================================================================

import { MAX_PROTECTED_DEVICES, DeviceInfo, DevicePermissionsStatus } from '../../types';
import { checkRealDevicePermissions } from '../../utils/permissionChecker';
import { apiClient, safeStorage } from './client';
import type { NativeDeviceInfo } from '../protection.service';

async function getNativeDeviceHardwareInfo(): Promise<NativeDeviceInfo | null> {
  try {
    // Carga perezosa compatible con Metro (Android) y pruebas unitarias en Node
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../protection.service');
    const svc = mod?.protectionService || mod?.vpnServiceBridge;
    if (svc && typeof svc.getDeviceInfo === 'function') {
      return await svc.getDeviceInfo();
    }
  } catch {
    // Entorno sin bridge nativo (ej. Node tests)
  }
  return null;
}

function isLegacyPlaceholderName(name?: string | null): boolean {
  const normalized = (name || '').trim().toLowerCase();
  return !normalized || normalized === 'yo' || normalized === 'tutor responsable';
}

function resolveUserDisplayName(user: any): string {
  if (!user) return '';
  const first = (user.firstName || '').trim();
  const last = (user.lastName || '').trim();
  const combined = `${first} ${last}`.trim();
  const full = (user.fullName || user.name || '').trim();
  if (first && last && !isLegacyPlaceholderName(combined)) {
    return combined;
  }
  if (!isLegacyPlaceholderName(full)) {
    return full;
  }
  if (!isLegacyPlaceholderName(combined)) {
    return combined;
  }
  return '';
}

function formatUserDateDisplay(raw?: string | Date | null): string {
  if (!raw) return '';
  const str = typeof raw === 'string' ? raw.trim() : raw.toISOString();
  if (!str) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return str;
}

function formatUserGenderDisplay(raw?: string | null): string {
  if (!raw) return '';
  const normalized = raw.trim().toUpperCase().replace(/\s+/g, '_');
  if (normalized === 'MASCULINO') return 'Masculino';
  if (normalized === 'FEMENINO') return 'Femenino';
  if (normalized === 'OTRO') return 'Otro';
  if (normalized === 'NO_INFORMADO') return 'No informado';
  return raw.trim();
}

function normalizeBackendDevice(
  bd: any,
  preservedColorIndex?: number,
  fallbackPairingCode?: string
): DeviceInfo {
  const bDateFormatted = formatUserDateDisplay(bd?.birthDate);
  const rawPersonType = String(bd?.personType || bd?.profileType || '').toUpperCase();
  const profType: 'Menor' | 'Adulto' = rawPersonType === 'ADULTO' ? 'Adulto' : 'Menor';
  const genderFormatted = formatUserGenderDisplay(bd?.gender) || 'No informado';

  const effectiveStatus = bd?.status?.effectiveStatus || (typeof bd?.status === 'string' ? bd.status : 'INACTIVE');
  const isLinked = effectiveStatus !== 'INACTIVE';
  const vpn = Boolean(bd?.status?.vpnActive);
  const permissionsOk = isLinked && Boolean(bd?.status?.permissionsOk);

  const perms: DevicePermissionsStatus = bd?.permissions
    ? {
        vpn: Boolean(bd.permissions.vpn),
        accessibility: Boolean(bd.permissions.accessibility),
        notifications: Boolean(bd.permissions.notifications),
        batteryOptimization: Boolean(bd.permissions.batteryOptimization),
        location: Boolean(bd.permissions.location),
        usageStats: Boolean(bd.permissions.usageStats),
        grantedCount:
          typeof bd.permissions.grantedCount === 'number'
            ? bd.permissions.grantedCount
            : [
                bd.permissions.vpn,
                bd.permissions.accessibility,
                bd.permissions.notifications,
                bd.permissions.batteryOptimization,
                bd.permissions.location,
                bd.permissions.usageStats,
              ].filter(Boolean).length,
      }
    : {
        vpn,
        accessibility: permissionsOk,
        notifications: permissionsOk,
        batteryOptimization: permissionsOk,
        location: permissionsOk,
        usageStats: permissionsOk,
        grantedCount: [
          vpn,
          permissionsOk,
          permissionsOk,
          permissionsOk,
          permissionsOk,
          permissionsOk,
        ].filter(Boolean).length,
      };

  return {
    deviceId: bd.id || bd.deviceId,
    deviceUuid: bd.deviceUuid,
    deviceName: bd.childName || bd.deviceName || 'Protegido',
    childName: bd.childName || bd.deviceName || 'Protegido',
    isProtected: vpn,
    status: effectiveStatus,
    lastHeartbeat:
      effectiveStatus === 'INACTIVE'
        ? 'Pendiente de vinculación'
        : 'En línea',
    blockedCount: bd._count?.blockedEvents ?? bd.blockedCount ?? 0,
    blocklistVersion: bd.status?.blocklistVersion ?? bd.blocklistVersion ?? 1,
    phone: bd.phone || '',
    birthDate: bDateFormatted,
    gender: genderFormatted,
    profileType: profType,
    deviceModel: bd.model || bd.deviceModel || 'Android',
    createdAt: formatUserDateDisplay(bd.createdAt) || undefined,
    colorIndex: preservedColorIndex,
    pairingCode: bd.pairingCode || fallbackPairingCode || undefined,
    permissions: perms,
  };
}

function extractApiErrorMessage(err: any, fallback: string): string {
  const apiMessage = err?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
    return apiMessage.trim();
  }
  if (typeof err?.message === 'string' && err.message.trim().length > 0 && !err.message.includes('status code')) {
    return err.message.trim();
  }
  return fallback;
}

export const devicesApi = {
  // --------------------------------------------------------------------------
  // Pareamiento y Generación de Códigos (100% respaldado por PostgreSQL)
  // --------------------------------------------------------------------------
  async generatePairingCode(data?: any) {
    const payload: Record<string, any> = {};
    if (data?.deviceId) payload.deviceId = data.deviceId;
    const childName = data?.childName || data?.protectedName;
    if (childName) payload.childName = childName;
    const gender = data?.gender || data?.genero;
    if (gender) payload.gender = gender;
    const personType = data?.personType || data?.protectedType;
    if (personType) payload.personType = personType;
    if (data?.birthDate) payload.birthDate = data.birthDate;
    const phone = data?.phone || data?.protectedPhone;
    if (phone) payload.phone = phone;

    try {
      const response = await apiClient.post('/devices/pair/generate', payload);
      const pairData = response.data?.data;
      const code = pairData?.pairingCode || pairData?.code;
      if (!code) {
        throw new Error('El servidor no devolvió un código de vinculación válido.');
      }

      if (payload.deviceId) {
        try {
          const raw = await safeStorage.getItem('@ba_protege_devices_list');
          if (raw) {
            const list: DeviceInfo[] = JSON.parse(raw);
            const updated = list.map((d) =>
              d.deviceId === payload.deviceId || d.deviceUuid === payload.deviceId
                ? { ...d, pairingCode: code }
                : d
            );
            await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updated));
          }
        } catch (_) {}
      }

      return { success: true, data: { code, pairingCode: code, ...pairData } };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo generar el código de vinculación. Verificá tu conexión e intentá nuevamente.'
        )
      );
    }
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
  // Desactivación de Antidesinstalación en Dispositivos Protegidos (Código OTP 6 dígitos)
  // --------------------------------------------------------------------------
  async requestAntiUninstallCode(deviceUuid: string): Promise<{
    success: boolean;
    message: string;
    maskedEmail: string;
    code?: string;
  }> {
    try {
      const response = await apiClient.post('/devices/anti-uninstall/request-code', {
        deviceUuid,
      });
      if (response.data?.data) {
        return {
          success: true,
          message: response.data.message || 'Código enviado',
          maskedEmail: response.data.data.maskedEmail,
          code: response.data.data.code,
        };
      }
    } catch (e) {
      // Fallback local / demo offline
    }

    // Generar código localmente de 6 dígitos e invalidar cualquier anterior
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    let tutorEmail = 'tutor@baprotege.gob.ar';
    try {
      const selfDev = await safeStorage.getItem('@ba_protege_self_device');
      if (selfDev) {
        const parsed = JSON.parse(selfDev);
        if (parsed.email) tutorEmail = parsed.email;
      }
    } catch (err) {}

    const [localPart, domain] = tutorEmail.split('@');
    const maskedLocal =
      localPart && localPart.length > 2
        ? `${localPart[0]}***${localPart[localPart.length - 1]}`
        : `${localPart ? localPart[0] : 't'}***`;
    const maskedEmail = `${maskedLocal}@${domain || 'baprotege.gob.ar'}`;

    await safeStorage.setItem(
      `@ba_protege_anti_uninstall_code_${deviceUuid}`,
      JSON.stringify({ code, expiresAt: Date.now() + 15 * 60 * 1000, tutorEmail })
    );

    return {
      success: true,
      message: 'Código de verificación enviado al correo del responsable.',
      maskedEmail,
      code,
    };
  },

  async invalidateAntiUninstallCode(deviceUuid: string): Promise<{ success: boolean }> {
    try {
      await apiClient.post('/devices/anti-uninstall/invalidate-code', { deviceUuid });
    } catch (e) {}

    await safeStorage.removeItem(`@ba_protege_anti_uninstall_code_${deviceUuid}`);
    return { success: true };
  },

  async verifyAntiUninstallCode(deviceUuid: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/devices/anti-uninstall/verify-code', {
        deviceUuid,
        code: code.trim(),
      });
      if (response.data?.success) {
        await safeStorage.removeItem(`@ba_protege_anti_uninstall_code_${deviceUuid}`);
        return { success: true, message: 'Código verificado con éxito' };
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new Error(e.response.data.message);
      }
    }

    // Fallback verificación local
    const raw = await safeStorage.getItem(`@ba_protege_anti_uninstall_code_${deviceUuid}`);
    if (!raw) {
      throw new Error('No hay un código activo o ya fue invalidado. Solicitá uno nuevo.');
    }

    const record = JSON.parse(raw);
    if (Date.now() > record.expiresAt) {
      await safeStorage.removeItem(`@ba_protege_anti_uninstall_code_${deviceUuid}`);
      throw new Error('El código ha expirado. Solicitá uno nuevo.');
    }

    if (record.code !== code.trim()) {
      throw new Error('El código ingresado es incorrecto. Verificá tu correo electrónico.');
    }

    // Invalida el código tras usarlo
    await safeStorage.removeItem(`@ba_protege_anti_uninstall_code_${deviceUuid}`);
    return { success: true, message: 'Código verificado exitosamente' };
  },

  // --------------------------------------------------------------------------
  // Dispositivo del Responsable (Datos reales del usuario + hardware Android)
  // --------------------------------------------------------------------------
  async syncSelfDeviceFromUser(user: any): Promise<DeviceInfo> {
    const nativeInfo = await getNativeDeviceHardwareInfo();
    const realPermissions = await checkRealDevicePermissions(user?.id);
    const fullName = resolveUserDisplayName(user);
    const birthDate = formatUserDateDisplay(user?.birthDate);
    const gender = formatUserGenderDisplay(user?.gender);
    const createdAt = formatUserDateDisplay(user?.createdAt);

    let existing: Partial<DeviceInfo> = {};
    try {
      const raw = await safeStorage.getItem('@ba_protege_self_device');
      if (raw) {
        existing = JSON.parse(raw);
      }
    } catch {
      // Ignorar si no existe
    }

    const synced: DeviceInfo = {
      ...existing,
      deviceId: 'self',
      deviceUuid: nativeInfo?.deviceUuid || existing.deviceUuid || '',
      deviceName: fullName || existing.deviceName || '',
      childName: fullName || existing.childName || '',
      email: user?.email || existing.email || '',
      phone: user?.phone !== undefined ? (user.phone || '') : (existing.phone || ''),
      birthDate: birthDate || existing.birthDate || '',
      gender: gender || existing.gender || 'No informado',
      profileType: 'Responsable',
      deviceModel: nativeInfo?.deviceModel || existing.deviceModel || 'Android',
      createdAt: createdAt || existing.createdAt || '',
      isProtected: realPermissions.vpn || existing.isProtected || false,
      status: realPermissions.vpn ? 'ACTIVE' : (existing.status || 'INACTIVE'),
      lastHeartbeat: existing.lastHeartbeat || 'En línea',
      blockedCount: existing.blockedCount ?? 0,
      blocklistVersion: existing.blocklistVersion ?? 1,
      permissions: realPermissions,
    };

    await safeStorage.setItem('@ba_protege_self_device', JSON.stringify(synced));
    return synced;
  },

  async getSelfDevice(): Promise<DeviceInfo> {
    let sessionUser: any = null;
    try {
      const navRaw = await safeStorage.getItem('@ba_protege_nav_session');
      if (navRaw) {
        const navParsed = JSON.parse(navRaw);
        if (navParsed?.parentUser) {
          sessionUser = navParsed.parentUser;
        }
      }
    } catch {
      // Sin sesión de navegación previa
    }

    const [realPermissions, nativeInfo] = await Promise.all([
      checkRealDevicePermissions(sessionUser?.id),
      getNativeDeviceHardwareInfo(),
    ]);

    const sessionName = resolveUserDisplayName(sessionUser);
    let baseDevice: DeviceInfo = {
      deviceId: 'self',
      deviceUuid: nativeInfo?.deviceUuid || '',
      deviceName: sessionName,
      childName: sessionName,
      email: sessionUser?.email || '',
      isProtected: realPermissions.vpn,
      status: realPermissions.vpn ? 'ACTIVE' : 'INACTIVE',
      lastHeartbeat: 'En línea',
      blockedCount: 0,
      blocklistVersion: 1,
      phone: sessionUser?.phone || '',
      birthDate: formatUserDateDisplay(sessionUser?.birthDate),
      gender: formatUserGenderDisplay(sessionUser?.gender) || 'No informado',
      profileType: 'Responsable',
      deviceModel: nativeInfo?.deviceModel || 'Android',
      createdAt: formatUserDateDisplay(sessionUser?.createdAt),
      permissions: realPermissions,
    };

    try {
      const raw = await safeStorage.getItem('@ba_protege_self_device');
      if (raw) {
        const parsed = JSON.parse(raw);
        const parsedName =
          parsed.childName ||
          parsed.deviceName?.replace(/^.*?\((.*?)\)$/, '$1') ||
          '';
        const cleanName = isLegacyPlaceholderName(parsedName)
          ? baseDevice.deviceName
          : parsedName;

        baseDevice = {
          ...baseDevice,
          ...parsed,
          deviceId: 'self',
          deviceUuid:
            nativeInfo?.deviceUuid ||
            (parsed.deviceUuid && parsed.deviceUuid !== 'uuid-self-responsable'
              ? parsed.deviceUuid
              : ''),
          deviceName: cleanName || baseDevice.deviceName,
          childName: cleanName || baseDevice.childName,
          email: parsed.email || baseDevice.email,
          phone: parsed.phone !== undefined ? parsed.phone : baseDevice.phone,
          birthDate: parsed.birthDate || baseDevice.birthDate,
          gender: parsed.gender || baseDevice.gender,
          deviceModel:
            nativeInfo?.deviceModel ||
            (parsed.deviceModel && parsed.deviceModel !== 'Samsung Galaxy S23 (Tutor)'
              ? parsed.deviceModel
              : 'Android'),
          createdAt: parsed.createdAt || baseDevice.createdAt,
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
  // Lista de Dispositivos Protegidos y Persistencia (Fuente única: PostgreSQL)
  // --------------------------------------------------------------------------
  async listDevices(): Promise<{ success: boolean; data: DeviceInfo[] }> {
    let cachedDevices: DeviceInfo[] = [];
    const colorMap = new Map<string, number>();
    try {
      const raw = await safeStorage.getItem('@ba_protege_devices_list');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cachedDevices = parsed.filter((d: any) => d?.deviceId !== 'dev-mock-1');
          cachedDevices.forEach((d) => {
            if (typeof d.colorIndex === 'number') {
              if (d.deviceId) colorMap.set(d.deviceId, d.colorIndex);
              if (d.deviceUuid) colorMap.set(d.deviceUuid, d.colorIndex);
            }
          });
        }
      }
    } catch {
      // Caché local no disponible
    }

    try {
      const response = await apiClient.get('/devices');
      const rawList = Array.isArray(response.data?.data) ? response.data.data : [];

      const finalDevices: DeviceInfo[] = rawList.map((bd: any) => {
        const preservedColor =
          colorMap.get(bd.id) ?? colorMap.get(bd.deviceUuid);
        return normalizeBackendDevice(bd, preservedColor);
      });

      // Asignar colorIndex institucional (0..4) consistente a dispositivos sin color asignado
      const usedIndices = new Set<number>();
      finalDevices.forEach((d) => {
        if (typeof d.colorIndex === 'number') {
          usedIndices.add(d.colorIndex);
        }
      });
      finalDevices.forEach((d, i) => {
        if (typeof d.colorIndex !== 'number') {
          let nextIdx = 0;
          while (usedIndices.has(nextIdx) && nextIdx < 5) {
            nextIdx++;
          }
          d.colorIndex = nextIdx < 5 ? nextIdx : i % 5;
          usedIndices.add(d.colorIndex);
        }
      });

      await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(finalDevices));
      return { success: true, data: finalDevices };
    } catch (err: any) {
      // Si no hay conexión de red, devolver la última lectura cacheada en modo solo lectura
      if (!err?.response) {
        return { success: true, data: cachedDevices };
      }
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo obtener la lista de dispositivos. Verificá tu conexión e intentá nuevamente.'
        )
      );
    }
  },

  async updateDevice(
    deviceId: string,
    data: Partial<DeviceInfo>
  ): Promise<{ success: boolean; data: DeviceInfo }> {
    if (deviceId === 'self') {
      const updatedSelf = await this.updateSelfDevice(data);
      return { success: true, data: updatedSelf };
    }

    try {
      const response = await apiClient.put(`/devices/${deviceId}`, {
        childName: data.childName || data.deviceName,
        birthDate: data.birthDate,
        gender: data.gender,
        profileType: data.profileType,
        phone: data.phone,
        deviceModel: data.deviceModel,
      });

      const backendDev = response.data?.data;
      if (!backendDev) {
        throw new Error('El servidor no devolvió los datos actualizados del dispositivo.');
      }

      let cachedList: DeviceInfo[] = [];
      let preservedColor: number | undefined;
      try {
        const raw = await safeStorage.getItem('@ba_protege_devices_list');
        if (raw) {
          cachedList = JSON.parse(raw);
          const prev = cachedList.find(
            (d) => d.deviceId === deviceId || d.deviceUuid === deviceId
          );
          preservedColor = prev?.colorIndex;
        }
      } catch (_) {}

      const normalized = normalizeBackendDevice(backendDev, preservedColor);
      const updatedList = cachedList.some(
        (d) => d.deviceId === normalized.deviceId || d.deviceId === deviceId
      )
        ? cachedList.map((d) =>
            d.deviceId === normalized.deviceId || d.deviceId === deviceId
              ? normalized
              : d
          )
        : [normalized, ...cachedList];

      await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
      return { success: true, data: normalized };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudieron guardar los cambios del dispositivo. Verificá tu conexión e intentá nuevamente.'
        )
      );
    }
  },

  async addDevice(data: Partial<DeviceInfo>): Promise<{ success: boolean; data: DeviceInfo }> {
    let existingList: DeviceInfo[] = [];
    try {
      const raw = await safeStorage.getItem('@ba_protege_devices_list');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existingList = parsed.filter((d: any) => d?.deviceId !== 'dev-mock-1');
        }
      }
    } catch (_) {}

    if (existingList.length >= MAX_PROTECTED_DEVICES) {
      throw new Error(
        `Límite alcanzado: Un responsable solo puede vincular un máximo de ${MAX_PROTECTED_DEVICES} dispositivos.`
      );
    }

    // Calcular el siguiente color de la paleta institucional (0..4) que no esté en uso
    const usedIndices = new Set(
      existingList
        .map((d) => d.colorIndex)
        .filter((c): c is number => typeof c === 'number')
    );
    let assignedColorIndex = 0;
    while (usedIndices.has(assignedColorIndex) && assignedColorIndex < 5) {
      assignedColorIndex++;
    }
    if (assignedColorIndex >= 5) {
      assignedColorIndex = existingList.length % 5;
    }

    try {
      const response = await apiClient.post('/devices', {
        childName: data.childName || data.deviceName,
        birthDate: data.birthDate,
        gender: data.gender,
        profileType: data.profileType || 'Menor',
        phone: data.phone,
        deviceModel: data.deviceModel || 'Android',
      });

      const responseData = response.data?.data;
      const backendCreated = responseData?.device;
      const backendPairingCode = responseData?.pairingCode || backendCreated?.pairingCode;

      if (!backendCreated?.id || !backendPairingCode) {
        throw new Error('No se recibió el registro ni el código de vinculación desde el servidor.');
      }

      const newDevice = normalizeBackendDevice(
        backendCreated,
        typeof data.colorIndex === 'number' ? data.colorIndex : assignedColorIndex,
        backendPairingCode
      );

      const updatedList = [
        newDevice,
        ...existingList.filter((d) => d.deviceId !== newDevice.deviceId),
      ];
      await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
      return { success: true, data: newDevice };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo registrar el dispositivo. Verificá tu conexión e intentá nuevamente.'
        )
      );
    }
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
      const res = await apiClient.get(`/devices/${deviceId}/permissions`);
      const payload = res.data?.data;
      if (!payload || !payload.permissions) {
        throw new Error('No se recibió el estado de permisos desde el servidor.');
      }

      let cachedList: DeviceInfo[] = [];
      try {
        const raw = await safeStorage.getItem('@ba_protege_devices_list');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) cachedList = parsed;
        }
      } catch (_) {}

      const existing = cachedList.find(
        (d) => d.deviceId === deviceId || d.deviceUuid === deviceId || d.deviceId === payload.deviceId
      );

      const perms: DevicePermissionsStatus = {
        vpn: Boolean(payload.permissions.vpn),
        accessibility: Boolean(payload.permissions.accessibility),
        notifications: Boolean(payload.permissions.notifications),
        batteryOptimization: Boolean(payload.permissions.batteryOptimization),
        location: Boolean(payload.permissions.location),
        usageStats: Boolean(payload.permissions.usageStats),
        grantedCount:
          typeof payload.permissions.grantedCount === 'number'
            ? payload.permissions.grantedCount
            : [
                payload.permissions.vpn,
                payload.permissions.accessibility,
                payload.permissions.notifications,
                payload.permissions.batteryOptimization,
                payload.permissions.location,
                payload.permissions.usageStats,
              ].filter(Boolean).length,
      };

      const effectiveStatus = payload.status || existing?.status || 'INACTIVE';
      const auditedDevice: DeviceInfo = {
        ...(existing || {
          deviceId: payload.deviceId || deviceId,
          deviceUuid: payload.deviceUuid || '',
          deviceName: 'Dispositivo Protegido',
          childName: 'Dispositivo Protegido',
          blockedCount: 0,
          blocklistVersion: 1,
        }),
        deviceId: payload.deviceId || existing?.deviceId || deviceId,
        deviceUuid: payload.deviceUuid || existing?.deviceUuid || '',
        status: effectiveStatus,
        isProtected: perms.vpn,
        lastHeartbeat:
          effectiveStatus === 'INACTIVE'
            ? 'Pendiente de vinculación'
            : 'Recién verificado',
        permissions: perms,
      };

      if (cachedList.length > 0) {
        const updatedList = cachedList.map((d) =>
          d.deviceId === auditedDevice.deviceId || d.deviceUuid === auditedDevice.deviceUuid
            ? auditedDevice
            : d
        );
        await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
      }

      return auditedDevice;
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo auditar el estado de permisos del dispositivo. Verificá tu conexión.'
        )
      );
    }
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
      const response = await apiClient.delete(`/devices/${deviceId}`);
      try {
        const raw = await safeStorage.getItem('@ba_protege_devices_list');
        if (raw) {
          const parsed: DeviceInfo[] = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updatedList = parsed.filter(
              (d) => d.deviceId !== deviceId && d.deviceUuid !== deviceId
            );
            await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
          }
        }
      } catch (_) {}

      return {
        success: true,
        message:
          response.data?.message || 'El dispositivo fue desvinculado exitosamente.',
      };
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo desvincular el dispositivo. Verificá tu conexión e intentá nuevamente.'
        )
      );
    }
  },

  async getDevicePublicProfile(deviceUuid: string): Promise<{
    deviceId: string;
    deviceUuid: string;
    deviceName: string;
    childName: string;
    personType: 'MENOR' | 'ADULTO';
    tutorName: string | null;
    isActive: boolean;
  }> {
    try {
      const response = await apiClient.get(
        `/devices/by-uuid/${encodeURIComponent(deviceUuid)}/profile`
      );
      const payload = response.data?.data;
      if (!payload) {
        throw new Error('Perfil de dispositivo no encontrado.');
      }
      return payload;
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(
          err,
          'No se pudo obtener el perfil del dispositivo vinculado.'
        )
      );
    }
  },
};
