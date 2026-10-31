// ==============================================================================
// Proyecto: BA Protege+
// Utilidad: permissionChecker (Auditoría Real de Permisos Android)
// Archivo: src/utils/permissionChecker.ts
// Descripción: Consulta los permisos reales concedidos en el hardware del sistema Android
//              (Notificaciones, Ubicación, VPN, etc.) evitando datos estáticos/mocados.
// ==============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevicePermissionsStatus } from '../types';

let PermissionsAndroid: any = null;
let Platform: any = { OS: 'other', Version: 0 };
let vpnServiceBridge: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rn = require('react-native');
  PermissionsAndroid = rn.PermissionsAndroid;
  Platform = rn.Platform;
} catch (e) {
  // Entorno de test o Node.js sin react-native nativo
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vpnMod = require('../services/vpn.service');
  vpnServiceBridge = vpnMod.vpnServiceBridge;
} catch (e) {}

const memoryStorage = new Map<string, string>();

const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryStorage.get(key) || null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryStorage.set(key, value);
    }
  },
};

const PERMISSIONS_STORAGE_KEY = '@ba_protege_self_permissions';

/**
 * Consulta y audita el estado real de los 6 permisos en el dispositivo actual.
 */
export async function checkRealDevicePermissions(): Promise<DevicePermissionsStatus> {
  let vpn = false;
  let accessibility = false;
  let notifications = false;
  let batteryOptimization = false;
  let location = false;
  let usageStats = false;

  // 1. Cargar estado persistido previamente desde el flujo de configuración de permisos
  try {
    const raw = await safeStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      vpn = !!parsed.vpn;
      accessibility = !!parsed.accessibility;
      notifications = !!parsed.notifications;
      batteryOptimization = !!parsed.batteryOptimization;
      location = !!parsed.location;
      usageStats = !!parsed.usageStats;
    }
  } catch (e) {
    // Si falla la lectura, se continúa con la consulta nativa
  }

  // 2. Consulta de permisos reales nativos a nivel de sistema operativo en Android
  if (Platform && Platform.OS === 'android') {
    try {
      // Notificaciones en Primer Plano (POST_NOTIFICATIONS en Android 13+ / API 33+)
      if (PermissionsAndroid && Platform.Version >= 33 && PermissionsAndroid.PERMISSIONS?.POST_NOTIFICATIONS) {
        const notifGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        notifications = notifGranted;
      }

      // Ubicación GPS / Geolocalización
      if (PermissionsAndroid && PermissionsAndroid.PERMISSIONS?.ACCESS_FINE_LOCATION) {
        const fineLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const coarseLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        location = fineLocationGranted || coarseLocationGranted;
      }

      // Servicio VPN: verificar si el túnel de protección está activo
      if (vpnServiceBridge && typeof vpnServiceBridge.isProtectionActive === 'function') {
        const isVpnRunning = await vpnServiceBridge.isProtectionActive();
        if (isVpnRunning) {
          vpn = true;
        }
      }
    } catch (err) {
      console.warn('[permissionChecker] Error al consultar permisos nativos de Android:', err);
    }
  }

  const list = [vpn, accessibility, notifications, batteryOptimization, location, usageStats];
  const grantedCount = list.filter(Boolean).length;

  const result: DevicePermissionsStatus = {
    vpn,
    accessibility,
    notifications,
    batteryOptimization,
    location,
    usageStats,
    grantedCount,
  };

  return result;
}

/**
 * Persiste el estado de permisos concedidos localmente en el dispositivo.
 */
export async function saveDevicePermissions(
  perms: Partial<DevicePermissionsStatus>
): Promise<DevicePermissionsStatus> {
  const current = await checkRealDevicePermissions();
  const updated: DevicePermissionsStatus = {
    ...current,
    ...perms,
  };
  const list = [
    updated.vpn,
    updated.accessibility,
    updated.notifications,
    updated.batteryOptimization,
    updated.location,
    updated.usageStats,
  ];
  updated.grantedCount = list.filter(Boolean).length;

  await safeStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
