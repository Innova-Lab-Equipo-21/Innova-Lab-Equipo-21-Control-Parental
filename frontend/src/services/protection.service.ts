// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Bridge Service)
// Archivo: src/services/protection.service.ts
// Descripción: Servicio TypeScript que interactúa con el módulo nativo Android
//              (ProtectionModule) para orquestar la protección completa del dispositivo:
//              VPN, Accesibilidad, Notificaciones, Batería, Ubicación GPS,
//              Estadísticas de uso, escáner QR nativo e información real del hardware.
// ==============================================================================

import { NativeModules, Platform } from 'react-native';
import { NativeBlocklistInfo } from '../types';
import { apiService } from './api.service';

const { ProtectionModule } = NativeModules;

export interface NativeDeviceInfo {
  deviceUuid: string;
  manufacturer: string;
  model: string;
  deviceModel: string;
  osVersion: string;
  sdkInt: number;
  appVersion: string;
  batteryLevel: number;
  isCharging: boolean;
}

export interface NativeQrScanResult {
  code?: string;
  rawValue?: string;
  cancelled?: boolean;
}

export class ProtectionService {
  /**
   * Obtiene información real del hardware, sistema operativo, versión de app y batería.
   */
  public async getDeviceInfo(): Promise<NativeDeviceInfo | null> {
    if (Platform.OS !== 'android' || !ProtectionModule || typeof ProtectionModule.getDeviceInfo !== 'function') {
      return null;
    }
    try {
      const info = await ProtectionModule.getDeviceInfo();
      return info || null;
    } catch {
      return null;
    }
  }

  /**
   * Abre el lector nativo de código QR (CameraX + ML Kit) en Android
   * y retorna el código de vinculación de 6 dígitos detectado o estado de cancelación.
   */
  public async openQrScanner(): Promise<NativeQrScanResult> {
    if (Platform.OS !== 'android' || !ProtectionModule || typeof ProtectionModule.openQrScanner !== 'function') {
      throw new Error('El lector de código QR nativo solo está disponible en dispositivos Android.');
    }
    const result = await ProtectionModule.openQrScanner();
    return result || { cancelled: true };
  }

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
   * Actualiza las aplicaciones bloqueadas en la memoria y caché persistente de Android.
   */
  public async updateBlockedApps(apps: Array<{ appName: string; packageName?: string }>): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return true;
    }
    if (typeof ProtectionModule.updateBlockedApps !== 'function') {
      return false;
    }
    return Boolean(await ProtectionModule.updateBlockedApps(apps));
  }

  /**
   * Mapa de aplicaciones populares a sus dominios web oficiales equivalentes.
   */
  public static readonly APP_TO_WEB_DOMAINS: Record<string, string[]> = {
    youtube: ['youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com', 'kids.youtube.com'],
    whatsapp: ['whatsapp.com', 'web.whatsapp.com'],
    tiktok: ['tiktok.com', 'm.tiktok.com'],
    instagram: ['instagram.com'],
    facebook: ['facebook.com', 'm.facebook.com', 'fb.com', 'messenger.com'],
    twitter: ['twitter.com', 'x.com', 'mobile.twitter.com'],
    x: ['x.com', 'twitter.com'],
    twitch: ['twitch.tv', 'm.twitch.tv'],
    netflix: ['netflix.com'],
    spotify: ['spotify.com', 'open.spotify.com'],
    reddit: ['reddit.com', 'm.reddit.com'],
    discord: ['discord.com', 'discord.gg'],
    telegram: ['telegram.org', 'web.telegram.org', 't.me'],
    roblox: ['roblox.com'],
    pinterest: ['pinterest.com'],
    snapchat: ['snapchat.com'],
    bet365: ['bet365.bet.ar', 'bet365.com'],
    betsson: ['betsson.bet.ar', 'betsson.com'],
    '1xbet': ['1xbet.com'],
    codere: ['codere.bet.ar', 'codere.com'],
    jugadon: ['jugadon.bet.ar'],
    bplay: ['bplay.bet.ar'],
    casinobuenosaires: ['casinobuenosairesonline.bet.ar'],
  };

  /**
   * Metadatos de aplicaciones conocidas para mapeo y derivación recíproca desde dominios web.
   */
  public static readonly KNOWN_APPS_METADATA: Record<string, { appName: string; packageName: string }> = {
    youtube: { appName: 'YouTube', packageName: 'com.google.android.youtube' },
    whatsapp: { appName: 'WhatsApp', packageName: 'com.whatsapp' },
    tiktok: { appName: 'TikTok', packageName: 'com.zhiliaoapp.musically' },
    instagram: { appName: 'Instagram', packageName: 'com.instagram.android' },
    facebook: { appName: 'Facebook', packageName: 'com.facebook.katana' },
    twitter: { appName: 'X (Twitter)', packageName: 'com.twitter.android' },
    x: { appName: 'X (Twitter)', packageName: 'com.twitter.android' },
    twitch: { appName: 'Twitch', packageName: 'tv.twitch.android.app' },
    netflix: { appName: 'Netflix', packageName: 'com.netflix.mediaclient' },
    spotify: { appName: 'Spotify', packageName: 'com.spotify.music' },
    reddit: { appName: 'Reddit', packageName: 'com.reddit.frontpage' },
    discord: { appName: 'Discord', packageName: 'com.discord' },
    telegram: { appName: 'Telegram', packageName: 'org.telegram.messenger' },
    roblox: { appName: 'Roblox', packageName: 'com.roblox.client' },
    pinterest: { appName: 'Pinterest', packageName: 'com.pinterest' },
    snapchat: { appName: 'Snapchat', packageName: 'com.snapchat.android' },
    bet365: { appName: 'Bet365', packageName: 'com.bet365Wrapper.Bet365_Application' },
    betsson: { appName: 'Betsson', packageName: 'com.betsson.android' },
    '1xbet': { appName: '1xBet', packageName: 'org.xbet' },
    codere: { appName: 'Codere', packageName: 'ar.codere.club' },
    jugadon: { appName: 'Jugadon', packageName: 'ar.bet.jugadon' },
    bplay: { appName: 'bplay', packageName: 'com.bplayliga.app' },
    casinobuenosaires: { appName: 'Casino Buenos Aires', packageName: 'ar.bet.casinobuenosaires' },
  };

  /**
   * Resuelve aplicaciones móviles correspondientes a una lista de dominios web bloqueados (bidireccionalidad).
   * Al bloquear un sitio web (ej. facebook.com o youtube.com), su aplicación también se bloquea automáticamente.
   */
  public getAppsForWebDomains(domains: string[]): Array<{
    appName: string;
    packageName: string;
    dailyLimitMinutes?: number;
    webDomains: string[];
  }> {
    const apps: Array<{
      appName: string;
      packageName: string;
      dailyLimitMinutes?: number;
      webDomains: string[];
    }> = [];

    const matchedKeys = new Set<string>();

    for (const rawDomain of domains) {
      const clean = (rawDomain || '')
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];
      if (!clean) continue;

      for (const [key, doms] of Object.entries(ProtectionService.APP_TO_WEB_DOMAINS)) {
        const matchesDomain = doms.some(
          (d) => clean === d || clean.endsWith(`.${d}`) || d.endsWith(`.${clean}`)
        );
        const matchesKey = key.length >= 4 && clean.includes(key);

        if ((matchesDomain || matchesKey) && !matchedKeys.has(key)) {
          matchedKeys.add(key);
          const meta = ProtectionService.KNOWN_APPS_METADATA[key] || {
            appName: key.charAt(0).toUpperCase() + key.slice(1),
            packageName: `com.${key}.android`,
          };
          apps.push({
            appName: meta.appName,
            packageName: meta.packageName,
            dailyLimitMinutes: undefined, // Bloqueo total
            webDomains: doms,
          });
        }
      }
    }

    return apps;
  }

  /**
   * Resuelve la lista de dominios web correspondientes a una aplicación dada su nombre y paquete.
   */
  public getWebDomainsForApp(appName: string, packageName?: string): string[] {
    const domains: string[] = [];
    const cleanName = (appName || '').toLowerCase().trim();
    const cleanPkg = (packageName || '').toLowerCase().trim();

    for (const [key, doms] of Object.entries(ProtectionService.APP_TO_WEB_DOMAINS)) {
      if (cleanName.includes(key) || cleanPkg.includes(key)) {
        domains.push(...doms);
      }
    }

    if (cleanName.includes('.') && !cleanName.includes(' ')) {
      domains.push(cleanName);
    }

    return Array.from(new Set(domains));
  }

  /**
   * Sincroniza dominios y aplicaciones bloqueadas con los serviços nativos de Android,
   * diferenciando claramente dominios personalizados de la lista oficial de LOTBA.
   */
  public async syncProtectionRules(
    domains: string[],
    apps: Array<{
      appName: string;
      packageName?: string;
      dailyLimitMinutes?: number;
      webDomains?: string[];
    }>,
    lotbaDomains: string[] = []
  ): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return true;
    }
    if (typeof ProtectionModule.syncProtectionRules !== 'function') {
      await this.updateBlocklist(1, domains);
      await this.updateBlockedApps(apps);
      return true;
    }
    return Boolean(await ProtectionModule.syncProtectionRules(domains, apps, lotbaDomains));
  }

  private flushBlockEventsPromise: Promise<number> | null = null;
  private flushSecurityEventsPromise: Promise<number> | null = null;

  /**
   * Obtiene eventos de bloqueo capturados nativamente por el servicio de accesibilidad.
   */
  public async getRecentBlockEvents(): Promise<
    Array<{ type: string; target: string; timestamp: number; isLotba?: boolean }>
  > {
    if (Platform.OS !== 'android' || !ProtectionModule || typeof ProtectionModule.getRecentBlockEvents !== 'function') {
      return [];
    }
    return ProtectionModule.getRecentBlockEvents();
  }

  /**
   * Obtiene eventos recientes de seguridad (ej. intentos de desinstalación)
   * capturados nativamente por el servicio de accesibilidad.
   */
  public async getRecentSecurityEvents(): Promise<
    Array<{ eventType: string; description: string; timestamp: number }>
  > {
    if (
      Platform.OS !== 'android' ||
      !ProtectionModule ||
      typeof ProtectionModule.getRecentSecurityEvents !== 'function'
    ) {
      return [];
    }
    return ProtectionModule.getRecentSecurityEvents();
  }

  /**
   * Drena los eventos de bloqueo almacenados nativamente en Android (SharedPreferences)
   * y los reporta al backend REST (PostgreSQL) para reflejarlos en Actividad e Inicio.
   */
  public async flushNativeBlockEventsToTelemetry(
    activeDeviceId: string = 'self',
    lotbaDomains: string[] = []
  ): Promise<number> {
    if (!activeDeviceId || activeDeviceId === 'self' || activeDeviceId === 'local') {
      return 0;
    }

    if (this.flushBlockEventsPromise) {
      return this.flushBlockEventsPromise;
    }

    const task = (async () => {
      try {
        const recentEvents = await this.getRecentBlockEvents();
        if (!Array.isArray(recentEvents) || recentEvents.length === 0) {
          return 0;
        }

        const normalizedLotba = lotbaDomains.map((d) => d.toLowerCase().trim());
        let flushed = 0;

        for (const ev of recentEvents) {
          const target = (ev?.target || '').trim();
          if (!target) continue;
          const cleanTarget = target.toLowerCase();
          const isApp = ev.type === 'APP';
          const isLotba =
            typeof ev.isLotba === 'boolean'
              ? ev.isLotba
              : !isApp &&
                normalizedLotba.some(
                  (d) => cleanTarget === d || cleanTarget.endsWith(`.${d}`)
                );

          try {
            await apiService.reportBlockedEvent({
              deviceUuid: activeDeviceId,
              deviceId: activeDeviceId,
              attemptedDomain: target,
              sourceListType: isLotba ? 'LOTBA' : 'CUSTOM',
              itemType: isApp ? 'app' : 'site',
              blockedAt: new Date(ev.timestamp || Date.now()).toISOString(),
            });
            flushed += 1;
          } catch (_) {
            // Continuar con los eventos restantes
          }
        }

        return flushed;
      } catch {
        return 0;
      } finally {
        this.flushBlockEventsPromise = null;
      }
    })();

    this.flushBlockEventsPromise = task;
    return task;
  }

  /**
   * Drena eventos de seguridad nativos (ej. UNINSTALL_ATTEMPT) y los envía a PostgreSQL.
   */
  public async flushNativeSecurityEventsToTelemetry(
    deviceUuid: string
  ): Promise<number> {
    if (!deviceUuid || deviceUuid === 'self' || deviceUuid === 'local') {
      return 0;
    }

    if (this.flushSecurityEventsPromise) {
      return this.flushSecurityEventsPromise;
    }

    const task = (async () => {
      try {
        const recentEvents = await this.getRecentSecurityEvents();
        if (!Array.isArray(recentEvents) || recentEvents.length === 0) {
          return 0;
        }

        let flushed = 0;
        for (const ev of recentEvents) {
          const eventType = (ev?.eventType || '').trim().toUpperCase();
          if (!eventType) continue;
          try {
            await apiService.reportSecurityEvent({
              deviceUuid,
              eventType,
              description: ev.description || 'Alerta de seguridad detectada en el dispositivo',
              metadata: ev.timestamp ? { nativeTimestamp: ev.timestamp } : undefined,
            });
            flushed += 1;
          } catch (_) {
            // Continuar con los eventos restantes
          }
        }
        return flushed;
      } catch {
        return 0;
      } finally {
        this.flushSecurityEventsPromise = null;
      }
    })();

    this.flushSecurityEventsPromise = task;
    return task;
  }

  /**
   * Recopila el estado real del dispositivo Android (VPN, 6 permisos, batería, versión de
   * blocklist y versión de app) y envía un heartbeat al backend PostgreSQL.
   */
  public async sendRealDeviceHeartbeat(deviceUuid: string): Promise<boolean> {
    if (!deviceUuid || deviceUuid === 'self' || deviceUuid === 'local') {
      return false;
    }

    try {
      const [
        vpnActive,
        accessibility,
        notifications,
        batteryOptimization,
        location,
        usageStats,
        deviceInfo,
        blocklistInfo,
      ] = await Promise.all([
        this.isProtectionActive().catch(() => false),
        this.isAccessibilityEnabled().catch(() => false),
        this.isNotificationsEnabled().catch(() => false),
        this.isBatteryOptimizationIgnored().catch(() => false),
        this.isLocationPermissionGranted().catch(() => false),
        this.isUsageStatsPermissionGranted().catch(() => false),
        this.getDeviceInfo().catch(() => null),
        this.getBlocklistInfo().catch(() => ({ version: 1, totalDomains: 0 })),
      ]);

      const permissionsOk = Boolean(
        vpnActive && accessibility && notifications && batteryOptimization && usageStats
      );
      const batteryLevel =
        typeof deviceInfo?.batteryLevel === 'number' &&
        deviceInfo.batteryLevel >= 0 &&
        deviceInfo.batteryLevel <= 100
          ? deviceInfo.batteryLevel
          : undefined;

      await apiService.sendHeartbeat({
        deviceUuid,
        vpnActive: Boolean(vpnActive),
        permissionsOk,
        batteryLevel,
        isCharging: typeof deviceInfo?.isCharging === 'boolean' ? deviceInfo.isCharging : undefined,
        blocklistVersion: blocklistInfo?.version || 1,
        appVersion: deviceInfo?.appVersion || undefined,
        permissions: {
          vpn: Boolean(vpnActive),
          accessibility: Boolean(accessibility),
          notifications: Boolean(notifications),
          batteryOptimization: Boolean(batteryOptimization),
          location: Boolean(location),
          usageStats: Boolean(usageStats),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Establece el modo de usuario activo en Android ("PARENT", "ADULT" o "CHILD")
   * para personalizar la pantalla de bloqueo y las sugerencias fuera de pantalla.
   */
  public async setUserMode(userMode: 'PARENT' | 'ADULT' | 'CHILD'): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule || typeof ProtectionModule.setUserMode !== 'function') {
      return true;
    }
    try {
      return Boolean(await ProtectionModule.setUserMode(userMode));
    } catch {
      return false;
    }
  }

  /**
   * Sincroniza integralmente las reglas de dominios bloqueados (LOTBA + personalizados)
   * y aplicaciones restringidas con Android nativo.
   * - En modo CHILD/ADULT (dispositivo protegido): descarga desde GET /blocklist/device/:deviceUuid.
   * - En modo PARENT (dispositivo del responsable): descarga desde GET /blocklist/custom + /blocklist/official.
   */
  public async syncProtectionRulesWithNative(
    activeDeviceId: string = 'self',
    userMode?: 'PARENT' | 'ADULT' | 'CHILD'
  ): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return true;
    }

    try {
      if (userMode) {
        await this.setUserMode(userMode);
      }

      const isProtectedDeviceMode =
        (userMode === 'CHILD' || userMode === 'ADULT') &&
        Boolean(activeDeviceId) &&
        activeDeviceId !== 'self' &&
        activeDeviceId !== 'local';

      let lotbaDomains: string[] = [];
      let activeCustomDomains: string[] = [];
      let activeCustomApps: Array<{
        appName: string;
        packageName: string;
        dailyLimitMinutes?: number;
        webDomains: string[];
      }> = [];

      if (isProtectedDeviceMode) {
        // Dispositivo protegido: descarga directa y filtrada desde PostgreSQL por deviceUuid
        const deviceRes = await apiService.getDeviceBlocklist(activeDeviceId);
        const payload = deviceRes?.data;

        lotbaDomains = Array.isArray(payload?.lotbaDomains)
          ? payload.lotbaDomains.map((d: string) => d.toLowerCase().trim())
          : [];

        if (lotbaDomains.length === 0) {
          try {
            const lotbaRes = await apiService.getOfficialLotbaList();
            lotbaDomains = (lotbaRes?.data?.domains || []).map((d: any) =>
              (typeof d === 'string' ? d : d.domain).toLowerCase().trim()
            );
          } catch (_) {}
        }

        activeCustomDomains = (payload?.customDomains || [])
          .filter((d: any) => d.isActive !== false)
          .map((d: any) => d.domain.toLowerCase().trim());

        activeCustomApps = (payload?.customApps || [])
          .filter((a: any) => a.isActive !== false)
          .map((a: any) => {
            const limit =
              typeof a.dailyLimitMinutes === 'number' && a.dailyLimitMinutes > 0
                ? a.dailyLimitMinutes
                : undefined;
            const webDomains = this.getWebDomainsForApp(a.appName, a.packageName);
            return {
              appName: a.appName || '',
              packageName: a.packageName || '',
              dailyLimitMinutes: limit,
              webDomains,
            };
          });
      } else {
        // Modo Responsable ('self'): descarga lista personalizada del tutor + LOTBA oficial
        const customRes = await apiService.getCustomBlocklist();
        const customList = customRes?.data || { domains: [], apps: [] };

        try {
          const lotbaRes = await apiService.getOfficialLotbaList();
          lotbaDomains = (lotbaRes?.data?.domains || []).map((d: any) =>
            (typeof d === 'string' ? d : d.domain).toLowerCase().trim()
          );
        } catch (_) {}

        activeCustomDomains = (customList.domains || [])
          .filter(
            (d: any) =>
              d.isActive !== false &&
              (d.applyToAll === true ||
                (Array.isArray(d.deviceIds) && d.deviceIds.includes(activeDeviceId)))
          )
          .map((d: any) => d.domain.toLowerCase().trim());

        activeCustomApps = (customList.apps || [])
          .filter(
            (a: any) =>
              a.isActive !== false &&
              (a.applyToAll === true ||
                (Array.isArray(a.deviceIds) && a.deviceIds.includes(activeDeviceId)))
          )
          .map((a: any) => {
            const limit =
              a.deviceLimits?.[activeDeviceId] !== undefined
                ? a.deviceLimits[activeDeviceId]
                : a.dailyLimitMinutes;
            const webDomains = this.getWebDomainsForApp(a.appName, a.packageName);
            return {
              appName: a.appName || '',
              packageName: a.packageName || '',
              dailyLimitMinutes: typeof limit === 'number' && limit > 0 ? limit : undefined,
              webDomains,
            };
          });
      }

      // 1. Incluir en los dominios personalizados los sitios web de apps con Bloqueo Total
      const appDomainsForTotalBlock = activeCustomApps
        .filter((a) => a.dailyLimitMinutes === undefined || a.dailyLimitMinutes <= 0)
        .flatMap((a) => a.webDomains || []);

      const customDomainsOnly = Array.from(
        new Set([...activeCustomDomains, ...appDomainsForTotalBlock])
      );

      // 2. Incluir en las aplicaciones bloqueadas las aplicaciones correspondientes a sitios web bloqueados (reciprocidad)
      const appsFromBlockedSites = this.getAppsForWebDomains(activeCustomDomains);
      const allBlockedApps = [...activeCustomApps];

      for (const derivedApp of appsFromBlockedSites) {
        const existingIdx = allBlockedApps.findIndex(
          (app) =>
            (app.packageName &&
              derivedApp.packageName &&
              app.packageName.toLowerCase() === derivedApp.packageName.toLowerCase()) ||
            app.appName.toLowerCase() === derivedApp.appName.toLowerCase()
        );
        if (existingIdx >= 0) {
          allBlockedApps[existingIdx] = {
            ...allBlockedApps[existingIdx],
            dailyLimitMinutes: undefined,
            webDomains: Array.from(
              new Set([...(allBlockedApps[existingIdx].webDomains || []), ...derivedApp.webDomains])
            ),
          };
        } else {
          allBlockedApps.push({
            ...derivedApp,
            dailyLimitMinutes: derivedApp.dailyLimitMinutes,
          });
        }
      }

      // 3. Enviar a Android Native diferenciando lista personalizada y lista oficial LOTBA
      await this.syncProtectionRules(customDomainsOnly, allBlockedApps, lotbaDomains);

      // 4. Consultar eventos de bloqueos y seguridad capturados nativamente y reportarlos a telemetría
      if (isProtectedDeviceMode) {
        await this.flushNativeBlockEventsToTelemetry(activeDeviceId, lotbaDomains);
        await this.flushNativeSecurityEventsToTelemetry(activeDeviceId);
      }

      return true;
    } catch (err) {
      console.warn('[ProtectionService] Error sincronizando reglas con Android nativo:', err);
      return false;
    }
  }

  /**
   * Consulta en Android el consumo real del día (en minutos) para las apps de la lista de bloqueos.
   */
  public async getBlockedAppsUsageToday(
    apps: Array<{
      appName: string;
      packageName?: string;
      dailyLimitMinutes?: number;
    }>
  ): Promise<
    Array<{
      appName: string;
      packageName: string;
      usedMinutes: number;
      dailyLimitMinutes: number | null;
      remainingMinutes: number;
      isBlocked: boolean;
    }>
  > {
    if (
      Platform.OS !== 'android' ||
      !ProtectionModule ||
      typeof ProtectionModule.getBlockedAppsUsageToday !== 'function'
    ) {
      return [];
    }
    try {
      const payload = apps.map((a) => ({
        appName: a.appName,
        packageName: a.packageName || '',
        dailyLimitMinutes:
          typeof a.dailyLimitMinutes === 'number' ? a.dailyLimitMinutes : null,
        webDomains: this.getWebDomainsForApp(a.appName, a.packageName),
      }));
      const res = await ProtectionModule.getBlockedAppsUsageToday(payload);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  /**
   * Obtiene la versión actual y cantidad de dominios en la lista local.
   */
  public async getBlocklistInfo(): Promise<NativeBlocklistInfo> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return { version: 0, totalDomains: 0 };
    }
    return ProtectionModule.getBlocklistInfo();
  }
}

export const protectionService = new ProtectionService();

// Alias para compatibilidad con código existente
export const vpnServiceBridge = protectionService;
export type VpnServiceBridge = ProtectionService;

