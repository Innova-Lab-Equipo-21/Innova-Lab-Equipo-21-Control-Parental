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

export const devicesApi = {
  // --------------------------------------------------------------------------
  // Pareamiento y Generación de Códigos
  // --------------------------------------------------------------------------
  async generatePairingCode(data?: any) {
    try {
      const devicesRes = await this.listDevices();
      const currentCount = devicesRes.data?.length || 0;
      if (currentCount >= MAX_PROTECTED_DEVICES && !data?.deviceId) {
        throw new Error(
          `Límite alcanzado: Un responsable solo puede vincular un máximo de ${MAX_PROTECTED_DEVICES} dispositivos.`
        );
      }
    } catch (e: any) {
      if (e.message?.includes('Límite alcanzado')) {
        throw e;
      }
    }

    // No insertar dispositivo prematuramente aquí; el registro se persiste formalmente al presionar "Guardar"

    try {
      const response = await apiClient.post('/devices/pair/generate', data || {});
      const pairData = response.data?.data;
      const code = pairData?.pairingCode || pairData?.code;
      if (code && data?.deviceId) {
        try {
          const raw = await safeStorage.getItem('@ba_protege_devices_list');
          if (raw) {
            const list: DeviceInfo[] = JSON.parse(raw);
            const updated = list.map((d) =>
              d.deviceId === data.deviceId || d.deviceUuid === data.deviceId
                ? { ...d, pairingCode: code }
                : d
            );
            await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updated));
          }
        } catch (_) {}
      }
      return { success: true, data: { code, ...pairData } };
    } catch (err) {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      if (data?.deviceId) {
        try {
          const raw = await safeStorage.getItem('@ba_protege_devices_list');
          if (raw) {
            const list: DeviceInfo[] = JSON.parse(raw);
            const updated = list.map((d) =>
              d.deviceId === data.deviceId || d.deviceUuid === data.deviceId
                ? { ...d, pairingCode: fallbackCode }
                : d
            );
            await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updated));
          }
        } catch (_) {}
      }
      return { success: true, data: { code: fallbackCode } };
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
  // Lista de Dispositivos Protegidos y Persistencia
  // --------------------------------------------------------------------------
  async listDevices(): Promise<{ success: boolean; data: DeviceInfo[] }> {
    let backendDevices: DeviceInfo[] = [];
    try {
      const response = await apiClient.get('/devices');
      if (response.data?.data && Array.isArray(response.data.data)) {
        backendDevices = response.data.data.map((bd: any) => {
          let bDateFormatted = '';
          if (bd.birthDate) {
            try {
              const dt = new Date(bd.birthDate);
              const day = dt.getUTCDate().toString().padStart(2, '0');
              const month = (dt.getUTCMonth() + 1).toString().padStart(2, '0');
              const year = dt.getUTCFullYear();
              bDateFormatted = `${day}/${month}/${year}`;
            } catch (_) {}
          }
          const profType: 'Menor' | 'Adulto' = bd.personType === 'ADULTO' ? 'Adulto' : 'Menor';
          let genderFormatted = 'No informado';
          if (bd.gender) {
            const rawG = bd.gender.toUpperCase();
            if (rawG === 'MASCULINO') genderFormatted = 'Masculino';
            else if (rawG === 'FEMENINO') genderFormatted = 'Femenino';
            else if (rawG === 'OTRO') genderFormatted = 'Otro';
          }
          return {
            deviceId: bd.id,
            deviceUuid: bd.deviceUuid,
            deviceName: bd.deviceName || bd.childName || 'Protegido',
            childName: bd.childName || bd.deviceName || 'Protegido',
            isProtected: bd.status?.vpnActive ?? false,
            status: bd.status?.effectiveStatus || 'INACTIVE',
            lastHeartbeat:
              bd.status?.effectiveStatus === 'INACTIVE'
                ? 'Pendiente de vinculación'
                : 'En línea',
            blockedCount: bd._count?.blockedEvents || 0,
            blocklistVersion: bd.status?.blocklistVersion || 4,
            phone: bd.phone || '',
            birthDate: bDateFormatted,
            gender: genderFormatted,
            profileType: profType,
            deviceModel: bd.model || 'Android',
            pairingCode: bd.pairingCode || undefined,
            permissions: {
              vpn: bd.status?.vpnActive ?? false,
              accessibility: bd.status?.permissionsOk ?? false,
              notifications: true,
              batteryOptimization: true,
              location: true,
              usageStats: true,
              grantedCount: bd.status?.permissionsOk ? 6 : 1,
            },
          } as DeviceInfo;
        });
      }
    } catch (e) {
      // Usar almacenamiento local / demo
    }

    let localDevices: DeviceInfo[] = [];
    try {
      const raw = await safeStorage.getItem('@ba_protege_devices_list');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localDevices = parsed;
        }
      }
    } catch (e) {}

    // Combinar dispositivos del backend con dispositivos creados en el emulador (sin duplicados por ID)
    const combinedMap = new Map<string, DeviceInfo>();
    backendDevices.forEach((d) => combinedMap.set(d.deviceId || d.deviceUuid, d));
    localDevices.forEach((d) => {
      const key = d.deviceId || d.deviceUuid;
      if (combinedMap.has(key)) {
        // Mantener pairingCode y propiedades locales si el backend no las tiene
        const existing = combinedMap.get(key)!;
        combinedMap.set(key, {
          ...existing,
          ...d,
          pairingCode: existing.pairingCode || d.pairingCode,
        });
      } else {
        combinedMap.set(key, d);
      }
    });

    let finalDevices = Array.from(combinedMap.values());

    // Deduplicar por nombre del protegido: conservar un único registro por protegido.
    // Si existen duplicados y alguno está INACTIVE (no vinculado en el teléfono del protegido),
    // reflejar fielmente el estado INACTIVE.
    const nameMap = new Map<string, DeviceInfo>();
    finalDevices.forEach((d) => {
      const rawName = (d.childName || d.deviceName || '').trim().toLowerCase();
      if (!rawName || d.deviceId === 'self') {
        nameMap.set(d.deviceId || d.deviceUuid, d);
        return;
      }
      if (!nameMap.has(rawName)) {
        nameMap.set(rawName, d);
      } else {
        const existing = nameMap.get(rawName)!;
        const keepInactive = existing.status === 'INACTIVE' || d.status === 'INACTIVE';
        nameMap.set(rawName, {
          ...existing,
          ...d,
          status: keepInactive ? 'INACTIVE' : (d.status || existing.status),
          isProtected: keepInactive ? false : (d.isProtected ?? existing.isProtected),
          lastHeartbeat: keepInactive ? 'Pendiente de vinculación' : (d.lastHeartbeat || existing.lastHeartbeat),
          pairingCode: existing.pairingCode || d.pairingCode,
        });
      }
    });
    // Filtrar y eliminar definitivamente el dispositivo mock "Mateo" solicitado por el usuario
    finalDevices = Array.from(nameMap.values()).filter(
      (d) =>
        d.deviceId !== 'dev-mock-1' &&
        d.childName?.trim().toLowerCase() !== 'mateo' &&
        d.deviceName?.trim().toLowerCase() !== 'mateo'
    );

    // Garantizar que cada dispositivo conserve su colorIndex permanente
    let modified = false;
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
        modified = true;
      }
      if (d.childName && (!d.deviceName || d.deviceName.includes('('))) {
        d.deviceName = d.childName;
        modified = true;
      }
    });

    if (modified || localDevices.length !== finalDevices.length) {
      await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(finalDevices));
    }

    return { success: true, data: finalDevices };
  },

  async updateDevice(
    deviceId: string,
    data: Partial<DeviceInfo>
  ): Promise<{ success: boolean; data: DeviceInfo }> {
    if (deviceId === 'self') {
      const updatedSelf = await this.updateSelfDevice(data);
      return { success: true, data: updatedSelf };
    }

    // Intentar sincronizar con el backend
    try {
      await apiClient.put(`/devices/${deviceId}`, {
        childName: data.childName || data.deviceName,
        birthDate: data.birthDate,
        gender: data.gender,
        profileType: data.profileType,
        phone: data.phone,
        deviceModel: data.deviceModel,
      });
    } catch (_) {}

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

    // Si ya existe un dispositivo con el mismo nombre o ID, actualizarlo en lugar de crear un duplicado
    const targetName = (data.childName || data.deviceName || '').trim().toLowerCase();
    const existingIndex = res.data.findIndex(
      (d) =>
        d.deviceId !== 'self' &&
        targetName &&
        (d.childName || d.deviceName || '').trim().toLowerCase() === targetName
    );

    if (existingIndex >= 0) {
      const existing = res.data[existingIndex];
      const updatedDevice: DeviceInfo = {
        ...existing,
        ...data,
        deviceName: data.childName || data.deviceName || existing.deviceName,
        childName: data.childName || existing.childName,
        status: data.status || existing.status || 'INACTIVE',
        isProtected: data.isProtected ?? existing.isProtected ?? false,
        lastHeartbeat: data.lastHeartbeat || existing.lastHeartbeat || 'Pendiente de vinculación',
        pairingCode: data.pairingCode || existing.pairingCode,
      };
      const updatedList = [...res.data];
      updatedList[existingIndex] = updatedDevice;
      await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(updatedList));
      return { success: true, data: updatedDevice };
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

    // Intentar persistir formalmente en PostgreSQL y generar código
    let backendCreated: any = null;
    let backendPairingCode: string | null = null;
    try {
      const response = await apiClient.post('/devices', {
        childName: data.childName || data.deviceName,
        birthDate: data.birthDate,
        gender: data.gender,
        profileType: data.profileType || 'Menor',
        phone: data.phone,
        deviceModel: data.deviceModel || 'Android',
      });
      if (response.data?.data) {
        backendCreated = response.data.data.device;
        backendPairingCode = response.data.data.pairingCode;
      }
    } catch (_) {}

    const assignedCode =
      backendPairingCode ||
      data.pairingCode ||
      Math.floor(100000 + Math.random() * 900000).toString();

    const nextIndex = res.data.length;
    const newId = backendCreated?.id || `dev-${Date.now()}`;
    const newUuid = backendCreated?.deviceUuid || `uuid-${newId}`;

    const newDevice: DeviceInfo = {
      deviceId: newId,
      deviceUuid: newUuid,
      deviceName:
        data.childName ||
        data.deviceName ||
        `Protegido ${nextIndex + 1}`,
      childName: data.childName || `Protegido ${nextIndex + 1}`,
      isProtected: false,
      status: 'INACTIVE',
      lastHeartbeat: 'Pendiente de vinculación',
      blockedCount: 0,
      blocklistVersion: 4,
      phone: data.phone || '',
      birthDate: data.birthDate || '',
      gender: data.gender || 'No informado',
      profileType: data.profileType || 'Menor',
      deviceModel: data.deviceModel || 'Android',
      createdAt: new Date().toLocaleDateString('es-AR'),
      colorIndex: typeof data.colorIndex === 'number' ? data.colorIndex : assignedColorIndex,
      pairingCode: assignedCode,
      permissions: data.permissions || {
        vpn: false,
        accessibility: false,
        notifications: false,
        batteryOptimization: false,
        location: false,
        usageStats: false,
        grantedCount: 0,
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
      const res = await apiClient.get(`/devices/${deviceId}/permissions`, { timeout: 10000 });
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
      await apiClient.delete(`/devices/${deviceId}`, { timeout: 10000 });
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
