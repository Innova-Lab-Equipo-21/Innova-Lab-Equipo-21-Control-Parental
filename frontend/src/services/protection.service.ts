// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Bridge Service)
// Archivo: src/services/protection.service.ts
// Descripción: Servicio TypeScript que interactúa con el módulo nativo Android
//              (ProtectionModule) para orquestar la protección completa del dispositivo:
//              Filtrado VPN, Accesibilidad, Notificaciones, Batería, Ubicación GPS
//              y Estadísticas de uso de aplicaciones.
// ==============================================================================

import { NativeModules, Platform } from 'react-native';
import { NativeBlocklistInfo } from '../types';

const { ProtectionModule } = NativeModules;

export class ProtectionService {
  /**
   * Solicita al sistema Android autorización para crear la conexión VPN local
   * y verifica que el permiso haya quedado activo en la configuración del dispositivo.
   */
  public async prepareVpn(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('ProtectionModule no disponible en esta plataforma.');
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.prepareVpn !== 'function') {
      return false;
    }
    const prepared = await ProtectionModule.prepareVpn();
    if (!prepared) {
      return false;
    }
    return this.isVpnPrepared();
  }

  /**
   * Consulta en el sistema Android si el permiso de VPN está autorizado
   * en la configuración del dispositivo (VpnService.prepare(context) == null).
   */
  public async isVpnPrepared(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.isVpnPrepared !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.isVpnPrepared());
  }

  /**
   * Abre los Ajustes de VPN del sistema Android.
   */
  public async openVpnSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.openVpnSettings !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.openVpnSettings());
  }

  /**
   * Abre los Ajustes de Accesibilidad de Android (si aún no está habilitado)
   * y verifica al regresar si el servicio BA Protege+ quedó activado.
   */
  public async openAccessibilitySettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.openAccessibilitySettings !== 'function') {
      return false;
    }
    const openedResult = await ProtectionModule.openAccessibilitySettings();
    if (!openedResult) {
      return false;
    }
    return this.isAccessibilityEnabled();
  }

  /**
   * Consulta en el sistema Android si el servicio de accesibilidad de BA Protege+
   * está realmente habilitado en la configuración del dispositivo.
   */
  public async isAccessibilityEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.isAccessibilityEnabled !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.isAccessibilityEnabled());
  }

  /**
   * Consulta si la protección antidesinstalación se encuentra activa en el dispositivo.
   */
  public async isAntiUninstallEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.isAntiUninstallEnabled !== 'function') {
      return true;
    }
    try {
      return Boolean(await ProtectionModule.isAntiUninstallEnabled());
    } catch {
      return true;
    }
  }

  /**
   * Activa o desactiva la protección antidesinstalación.
   */
  public async setAntiUninstallEnabled(enabled: boolean): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.setAntiUninstallEnabled !== 'function') {
      return false;
    }
    try {
      return Boolean(await ProtectionModule.setAntiUninstallEnabled(enabled));
    } catch {
      return false;
    }
  }

  /**
   * Consulta en el sistema Android si las notificaciones del sistema están
   * realmente habilitadas para BA Protege+ (canales activos y POST_NOTIFICATIONS en API 33+).
   */
  public async isNotificationsEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.isNotificationsEnabled !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.isNotificationsEnabled());
  }

  /**
   * Abre la configuración de notificaciones de la app en Android y verifica
   * al regresar si las notificaciones quedaron habilitadas.
   */
  public async openNotificationSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.openNotificationSettings !== 'function') {
      return false;
    }
    const openedResult = await ProtectionModule.openNotificationSettings();
    if (!openedResult) {
      return false;
    }
    return this.isNotificationsEnabled();
  }

  /**
   * Consulta en el sistema Android si la app cuenta con exención de
   * optimización de batería (isIgnoringBatteryOptimizations).
   */
  public async isBatteryOptimizationIgnored(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.isBatteryOptimizationIgnored !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.isBatteryOptimizationIgnored());
  }

  /**
   * Solicita la exención de optimización de batería al sistema Android
   * y verifica al regresar si la exención fue concedida.
   */
  public async requestIgnoreBatteryOptimization(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.requestIgnoreBatteryOptimization !== 'function') {
      return false;
    }
    const result = await ProtectionModule.requestIgnoreBatteryOptimization();
    if (!result) {
      return false;
    }
    return this.isBatteryOptimizationIgnored();
  }

  /**
   * Abre los Ajustes de Batería de Android para que el usuario pueda administrar
   * o revertir la exención de optimización de batería.
   */
  public async openBatterySettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.openBatterySettings !== 'function') {
      return false;
    }
    const result = await ProtectionModule.openBatterySettings();
    if (!result) {
      return false;
    }
    return this.isBatteryOptimizationIgnored();
  }

  /**
   * Consulta en el sistema Android si los permisos de ubicación
   * (ACCESS_FINE_LOCATION o ACCESS_COARSE_LOCATION) están otorgados.
   */
  public async isLocationPermissionGranted(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.isLocationPermissionGranted !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.isLocationPermissionGranted());
  }

  /**
   * Consulta si el servicio/hardware de ubicación (GPS o red) está habilitado.
   */
  public async isLocationEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.isLocationEnabled !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.isLocationEnabled());
  }

  /**
   * Abre los Ajustes de Ubicación de Android y verifica al regresar.
   */
  public async openLocationSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.openLocationSettings !== 'function') {
      return false;
    }
    const result = await ProtectionModule.openLocationSettings();
    if (!result) {
      return false;
    }
    return this.isLocationPermissionGranted();
  }

  /**
   * Abre la pantalla de Información de la aplicación en Ajustes de Android
   * para revocar permisos de ubicación/GPS u otras preferencias del sistema.
   */
  public async openAppSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.openAppSettings !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.openAppSettings());
  }

  /**
   * Obtiene la última ubicación nativa conocida (GPS o Red).
   */
  public async getLastKnownLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    provider: string;
    timestamp: number;
  } | null> {
    if (Platform.OS !== 'android' || !ProtectionModule || typeof ProtectionModule.getLastKnownLocation !== 'function') {
      return null;
    }
    try {
      return await ProtectionModule.getLastKnownLocation();
    } catch {
      return null;
    }
  }

  /**
   * Consulta en el sistema Android si la app cuenta con autorización
   * para acceder a las estadísticas de uso de aplicaciones (PACKAGE_USAGE_STATS).
   */
  public async isUsageStatsPermissionGranted(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.isUsageStatsPermissionGranted !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.isUsageStatsPermissionGranted());
  }

  /**
   * Abre los Ajustes de Acceso de Uso de Android y verifica al regresar si fue concedido.
   */
  public async openUsageStatsSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (!ProtectionModule || typeof ProtectionModule.openUsageStatsSettings !== 'function') {
      return false;
    }
    const result = await ProtectionModule.openUsageStatsSettings();
    if (!result) {
      return false;
    }
    return this.isUsageStatsPermissionGranted();
  }

  /**
   * Inicia el servicio VPN local de bloqueo de dominios.
   */
  public async startProtection(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      console.warn('Modo simulado: Protección iniciada en plataforma no Android.');
      return true;
    }
    return ProtectionModule.startProtection();
  }

  /**
   * Detiene el servicio VPN local.
   */
  public async stopProtection(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      console.warn('Modo simulado: Protección detenida en plataforma no Android.');
      return true;
    }
    return ProtectionModule.stopProtection();
  }

  /**
   * Consulta el estado de ejecución real del motor VPN nativo.
   */
  public async isProtectionActive(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return false;
    }
    return ProtectionModule.isProtectionActive();
  }

  /**
   * Actualiza los dominios bloqueados en la memoria y caché persistente de Android.
   */
  public async updateBlocklist(version: number, domains: string[]): Promise<NativeBlocklistInfo> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return { version, totalDomains: domains.length };
    }
    return ProtectionModule.updateBlocklist(version, domains);
  }

  /**
   * Obtiene la versión actual y cantidad de dominios en la lista local.
   */
  public async getBlocklistInfo(): Promise<NativeBlocklistInfo> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return { version: 1, totalDomains: 4 };
    }
    return ProtectionModule.getBlocklistInfo();
  }
}

export const protectionService = new ProtectionService();

// Alias para compatibilidad con código existente
export const vpnServiceBridge = protectionService;
export type VpnServiceBridge = ProtectionService;
