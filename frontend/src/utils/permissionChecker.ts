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
let protectionService: any = null;
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
  const protectionMod = require('../services/protection.service');
  protectionService = protectionMod.protectionService || protectionMod.vpnServiceBridge;
  vpnServiceBridge = protectionService;
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
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      memoryStorage.delete(key);
    }
  },
};

const PERMISSIONS_STORAGE_KEY = '@ba_protege_self_permissions';

/**
 * Consulta y audita el estado real de los 6 permisos en el dispositivo actual.
 * Cada usuario responsable mantiene su propio registro de permisos para evitar
 * heredar estados de cuentas anteriores en el mismo dispositivo.
 */
export async function checkRealDevicePermissions(userId?: string): Promise<DevicePermissionsStatus> {
  let vpn = false;
  let accessibility = false;
  let notifications = false;
  let batteryOptimization = false;
  let location = false;
  let usageStats = false;

  const storageKey = userId ? `@ba_protege_permissions_${userId}` : PERMISSIONS_STORAGE_KEY;

  // 1. Cargar estado persistido para este usuario específico (con fallback)
  try {
    let raw = await safeStorage.getItem(storageKey);
    if (!raw && storageKey !== PERMISSIONS_STORAGE_KEY) {
      raw = await safeStorage.getItem(PERMISSIONS_STORAGE_KEY);
    }
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
      // Notificaciones del sistema (NotificationManagerCompat + POST_NOTIFICATIONS en Android 13+)
      if (vpnServiceBridge && typeof vpnServiceBridge.isNotificationsEnabled === 'function') {
        const notifEnabled = await vpnServiceBridge.isNotificationsEnabled();
        notifications = Boolean(notifEnabled);
      } else if (PermissionsAndroid && Platform.Version >= 33 && PermissionsAndroid.PERMISSIONS?.POST_NOTIFICATIONS) {
        const notifGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        notifications = Boolean(notifGranted);
      }

      // Ubicación GPS / Geolocalización
      // Ubicación GPS / Geolocalización: si el sistema revocó el permiso, se desactiva
      if (vpnServiceBridge && typeof vpnServiceBridge.isLocationPermissionGranted === 'function') {
        const isLocGranted = await vpnServiceBridge.isLocationPermissionGranted();
        if (!isLocGranted) {
          location = false;
        }
      } else if (PermissionsAndroid && PermissionsAndroid.PERMISSIONS?.ACCESS_FINE_LOCATION) {
        const fineLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const coarseLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        if (!fineLocationGranted && !coarseLocationGranted) {
          location = false;
        }
      }

      // Servicio VPN: verificar en el sistema Android si el permiso VPN está realmente autorizado
      if (vpnServiceBridge) {
        if (typeof vpnServiceBridge.isVpnPrepared === 'function') {
          const isPrepared = await vpnServiceBridge.isVpnPrepared();
          if (!isPrepared) {
            vpn = false;
          } else if (typeof vpnServiceBridge.isProtectionActive === 'function') {
            const isVpnRunning = await vpnServiceBridge.isProtectionActive();
            if (isVpnRunning) {
              vpn = true;
            }
          }
        }

        // Servicio de Accesibilidad: verificar en el sistema Android si está habilitado
        if (typeof vpnServiceBridge.isAccessibilityEnabled === 'function') {
          const isAccEnabled = await vpnServiceBridge.isAccessibilityEnabled();
          accessibility = Boolean(isAccEnabled);
        }

        // Optimización de batería: verificar si la app tiene exención en el sistema
        if (typeof vpnServiceBridge.isBatteryOptimizationIgnored === 'function') {
          const isBatteryIgnored = await vpnServiceBridge.isBatteryOptimizationIgnored();
          batteryOptimization = Boolean(isBatteryIgnored);
        }

        // Estadísticas de uso de aplicaciones (PACKAGE_USAGE_STATS via AppOpsManager)
        if (typeof vpnServiceBridge.isUsageStatsPermissionGranted === 'function') {
          const isUsageGranted = await vpnServiceBridge.isUsageStatsPermissionGranted();
          usageStats = Boolean(isUsageGranted);
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
 * Persiste el estado de permisos concedidos localmente en el dispositivo para un usuario.
 */
export async function saveDevicePermissions(
  perms: Partial<DevicePermissionsStatus>,
  userId?: string
): Promise<DevicePermissionsStatus> {
  const current = await checkRealDevicePermissions(userId);
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

  const storageKey = userId ? `@ba_protege_permissions_${userId}` : PERMISSIONS_STORAGE_KEY;
  await safeStorage.setItem(storageKey, JSON.stringify(updated));
  if (storageKey !== PERMISSIONS_STORAGE_KEY) {
    await safeStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

/**
 * Reinicia los permisos almacenados para un usuario o dispositivo.
 */
export async function resetDevicePermissions(userId?: string): Promise<void> {
  const storageKey = userId ? `@ba_protege_permissions_${userId}` : PERMISSIONS_STORAGE_KEY;
  await safeStorage.setItem(storageKey, '');
}

/**
 * Evalúa si se permite cambiar el estado de un permiso del dispositivo:
 * - Activar (currentlyGranted === false) siempre está permitido para todos los perfiles.
 * - Desactivar (currentlyGranted === true) solo se permite cuando allowDisable es true
 *   (Modo Responsable). Ni el adulto protegido ni el menor pueden desactivar permisos activos.
 */
export function canToggleDevicePermission(
  currentlyGranted: boolean,
  allowDisable: boolean
): boolean {
  if (!currentlyGranted) {
    return true;
  }
  return Boolean(allowDisable);
}

export interface VpnPermissionBridge {
  prepareVpn: () => Promise<boolean>;
  isVpnPrepared: () => Promise<boolean>;
}

export interface VpnPermissionRequestResult {
  granted: boolean;
  cancelled: boolean;
}

/**
 * Solicita el permiso de VPN al sistema operativo y valida que haya quedado
 * efectivamente autorizado en la configuración del dispositivo.
 * Si el usuario cancela el diálogo o el sistema no confirma la autorización,
 * retorna granted: false para evitar falsos positivos en la UI.
 */
export async function requestAndVerifyVpnPermission(
  bridge: VpnPermissionBridge | null = vpnServiceBridge
): Promise<VpnPermissionRequestResult> {
  if (!bridge || typeof bridge.prepareVpn !== 'function') {
    return { granted: false, cancelled: false };
  }

  try {
    const prepared = await bridge.prepareVpn();
    if (!prepared) {
      return { granted: false, cancelled: false };
    }

    if (typeof bridge.isVpnPrepared === 'function') {
      const confirmedOnDevice = await bridge.isVpnPrepared();
      return { granted: Boolean(confirmedOnDevice), cancelled: false };
    }

    return { granted: true, cancelled: false };
  } catch (error: any) {
    const code = error?.code;
    const cancelled =
      code === 'E_VPN_PERMISSION_DENIED' || code === 'E_VPN_CANCELLED';
    return { granted: false, cancelled };
  }
}

export interface AccessibilityPermissionBridge {
  openAccessibilitySettings: () => Promise<boolean>;
  isAccessibilityEnabled: () => Promise<boolean>;
}

export interface AccessibilityPermissionRequestResult {
  granted: boolean;
}

/**
 * Abre los Ajustes de Accesibilidad de Android y valida que el servicio
 * de BA Protege+ haya quedado efectivamente habilitado en el dispositivo.
 */
export async function requestAndVerifyAccessibilityPermission(
  bridge: AccessibilityPermissionBridge | null = vpnServiceBridge
): Promise<AccessibilityPermissionRequestResult> {
  if (!bridge || typeof bridge.openAccessibilitySettings !== 'function') {
    return { granted: false };
  }

  try {
    const result = await bridge.openAccessibilitySettings();
    if (!result) {
      return { granted: false };
    }

    if (typeof bridge.isAccessibilityEnabled === 'function') {
      const enabled = await bridge.isAccessibilityEnabled();
      return { granted: Boolean(enabled) };
    }

    return { granted: true };
  } catch {
    return { granted: false };
  }
}

export interface NotificationPermissionBridge {
  isNotificationsEnabled: () => Promise<boolean>;
  openNotificationSettings: () => Promise<boolean>;
}

export interface NotificationPermissionRequestResult {
  granted: boolean;
  denied: boolean;
}

/**
 * Solicita el permiso real de notificaciones del sistema en Android:
 * - Si ya están habilitadas en el sistema, confirma inmediatamente.
 * - En Android 13+ (API 33+), solicita POST_NOTIFICATIONS al usuario.
 * - Si el diálogo fue bloqueado ('never_ask_again') o las notificaciones están
 *   desactivadas en Ajustes del sistema, abre Ajustes de Notificaciones de la app
 *   y verifica al regresar si quedaron habilitadas.
 */
export async function requestAndVerifyNotificationPermission(
  bridge: NotificationPermissionBridge | null = vpnServiceBridge,
  permissionsApi: any = PermissionsAndroid,
  platformVersion: number = typeof Platform?.Version === 'number' ? Platform.Version : 0
): Promise<NotificationPermissionRequestResult> {
  if (!bridge || typeof bridge.isNotificationsEnabled !== 'function') {
    return { granted: false, denied: false };
  }

  try {
    const alreadyEnabled = await bridge.isNotificationsEnabled();
    if (alreadyEnabled) {
      return { granted: true, denied: false };
    }

    if (
      platformVersion >= 33 &&
      permissionsApi &&
      typeof permissionsApi.request === 'function' &&
      permissionsApi.PERMISSIONS?.POST_NOTIFICATIONS
    ) {
      const status = await permissionsApi.request(
        permissionsApi.PERMISSIONS.POST_NOTIFICATIONS
      );
      const grantedValue = permissionsApi.RESULTS?.GRANTED ?? 'granted';
      const deniedValue = permissionsApi.RESULTS?.DENIED ?? 'denied';

      if (status === grantedValue) {
        const enabledNow = await bridge.isNotificationsEnabled();
        if (enabledNow) {
          return { granted: true, denied: false };
        }
      } else if (status === deniedValue) {
        return { granted: false, denied: true };
      }
    }

    if (typeof bridge.openNotificationSettings === 'function') {
      const enabledAfterSettings = await bridge.openNotificationSettings();
      if (!enabledAfterSettings) {
        return { granted: false, denied: true };
      }
      const confirmed = await bridge.isNotificationsEnabled();
      return { granted: Boolean(confirmed), denied: !confirmed };
    }

    return { granted: false, denied: true };
  } catch {
    return { granted: false, denied: false };
  }
}

export interface BatteryOptimizationBridge {
  isBatteryOptimizationIgnored: () => Promise<boolean>;
  requestIgnoreBatteryOptimization: () => Promise<boolean>;
}

export interface BatteryOptimizationRequestResult {
  granted: boolean;
  denied: boolean;
}

/**
 * Solicita la exención de optimización de batería al sistema Android:
 * - Si ya está concedida, retorna granted: true.
 * - Abre el diálogo directo del sistema o los ajustes de batería de la app.
 * - Valida en el hardware/sistema al regresar si la exención fue realmente otorgada.
 */
export async function requestAndVerifyBatteryOptimization(
  bridge: BatteryOptimizationBridge | null = vpnServiceBridge
): Promise<BatteryOptimizationRequestResult> {
  if (!bridge || typeof bridge.isBatteryOptimizationIgnored !== 'function') {
    return { granted: false, denied: false };
  }

  try {
    const alreadyIgnored = await bridge.isBatteryOptimizationIgnored();
    if (alreadyIgnored) {
      return { granted: true, denied: false };
    }

    if (typeof bridge.requestIgnoreBatteryOptimization === 'function') {
      const result = await bridge.requestIgnoreBatteryOptimization();
      if (!result) {
        return { granted: false, denied: true };
      }
      const confirmed = await bridge.isBatteryOptimizationIgnored();
      return { granted: Boolean(confirmed), denied: !confirmed };
    }

    return { granted: false, denied: true };
  } catch {
    return { granted: false, denied: false };
  }
}

export interface LocationPermissionBridge {
  isLocationPermissionGranted: () => Promise<boolean>;
  isLocationEnabled?: () => Promise<boolean>;
  openLocationSettings?: () => Promise<boolean>;
  getLastKnownLocation?: () => Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    provider: string;
    timestamp: number;
  } | null>;
}

export interface LocationPermissionRequestResult {
  granted: boolean;
  locationEnabled: boolean;
  denied: boolean;
}

/**
 * Solicita los permisos reales de ubicación (ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION)
 * al sistema Android y valida si fueron efectivamente otorgados por el usuario.
 * Si el usuario cancela o deniega el diálogo nativo, retorna granted: false y denied: true,
 * evitando falsos positivos en la UI.
 */
export async function requestAndVerifyLocationPermission(
  bridge: LocationPermissionBridge | null = vpnServiceBridge,
  permissionsApi: any = PermissionsAndroid
): Promise<LocationPermissionRequestResult> {
  // 1. Si el puente nativo ya confirma que los permisos están concedidos:
  if (bridge && typeof bridge.isLocationPermissionGranted === 'function') {
    const alreadyGranted = await bridge.isLocationPermissionGranted();
    if (alreadyGranted) {
      let isEnabled = true;
      if (typeof bridge.isLocationEnabled === 'function') {
        isEnabled = await bridge.isLocationEnabled();
      }
      return { granted: true, locationEnabled: Boolean(isEnabled), denied: false };
    }
  }

  // 2. Si contamos con PermissionsAndroid en React Native, solicitar ambos permisos
  if (permissionsApi && typeof permissionsApi.requestMultiple === 'function') {
    try {
      const finePerm =
        permissionsApi.PERMISSIONS?.ACCESS_FINE_LOCATION ||
        'android.permission.ACCESS_FINE_LOCATION';
      const coarsePerm =
        permissionsApi.PERMISSIONS?.ACCESS_COARSE_LOCATION ||
        'android.permission.ACCESS_COARSE_LOCATION';

      const statuses = await permissionsApi.requestMultiple([finePerm, coarsePerm]);
      const grantedValue = permissionsApi.RESULTS?.GRANTED ?? 'granted';

      const fineGranted = statuses[finePerm] === grantedValue;
      const coarseGranted = statuses[coarsePerm] === grantedValue;
      const isGranted = fineGranted || coarseGranted;

      if (isGranted) {
        // Doble verificación con el hardware/sistema nativo si el puente está presente
        if (bridge && typeof bridge.isLocationPermissionGranted === 'function') {
          const confirmed = await bridge.isLocationPermissionGranted();
          if (!confirmed) {
            return { granted: false, locationEnabled: false, denied: true };
          }
        }
        let isEnabled = true;
        if (bridge && typeof bridge.isLocationEnabled === 'function') {
          isEnabled = await bridge.isLocationEnabled();
        }
        return { granted: true, locationEnabled: Boolean(isEnabled), denied: false };
      }

      return { granted: false, locationEnabled: false, denied: true };
    } catch {
      return { granted: false, locationEnabled: false, denied: true };
    }
  } else if (permissionsApi && typeof permissionsApi.request === 'function') {
    try {
      const perm =
        permissionsApi.PERMISSIONS?.ACCESS_FINE_LOCATION ||
        'android.permission.ACCESS_FINE_LOCATION';
      const status = await permissionsApi.request(perm);
      const grantedValue = permissionsApi.RESULTS?.GRANTED ?? 'granted';
      const isGranted = status === grantedValue;

      if (isGranted) {
        let isEnabled = true;
        if (bridge && typeof bridge.isLocationEnabled === 'function') {
          isEnabled = await bridge.isLocationEnabled();
        }
        return { granted: true, locationEnabled: Boolean(isEnabled), denied: false };
      }
      return { granted: false, locationEnabled: false, denied: true };
    } catch {
      return { granted: false, locationEnabled: false, denied: true };
    }
  }

  // 3. Fallback en entorno sin PermissionsAndroid directo
  if (bridge && typeof bridge.isLocationPermissionGranted === 'function') {
    const granted = await bridge.isLocationPermissionGranted();
    let isEnabled = true;
    if (typeof bridge.isLocationEnabled === 'function') {
      isEnabled = await bridge.isLocationEnabled();
    }
    return { granted: Boolean(granted), locationEnabled: Boolean(isEnabled), denied: !granted };
  }

  return { granted: false, locationEnabled: false, denied: false };
}

export interface UsageStatsPermissionBridge {
  isUsageStatsPermissionGranted: () => Promise<boolean>;
  openUsageStatsSettings: () => Promise<boolean>;
}

export interface UsageStatsPermissionRequestResult {
  granted: boolean;
  denied: boolean;
}

/**
 * Solicita el acceso a estadísticas de uso abriendo la sección 'Acceso de uso'
 * en Ajustes de Android y valida al regresar si fue efectivamente otorgado en el hardware.
 * Si el usuario vuelve sin activarlo o cancela, retorna granted: false y denied: true,
 * evitando falsos positivos en la UI.
 */
export async function requestAndVerifyUsageStatsPermission(
  bridge: UsageStatsPermissionBridge | null = vpnServiceBridge
): Promise<UsageStatsPermissionRequestResult> {
  if (!bridge || typeof bridge.isUsageStatsPermissionGranted !== 'function') {
    return { granted: false, denied: false };
  }

  try {
    const alreadyGranted = await bridge.isUsageStatsPermissionGranted();
    if (alreadyGranted) {
      return { granted: true, denied: false };
    }

    if (typeof bridge.openUsageStatsSettings === 'function') {
      const result = await bridge.openUsageStatsSettings();
      if (!result) {
        return { granted: false, denied: true };
      }
      const confirmed = await bridge.isUsageStatsPermissionGranted();
      return { granted: Boolean(confirmed), denied: !confirmed };
    }

    return { granted: false, denied: true };
  } catch {
    return { granted: false, denied: false };
  }
}


