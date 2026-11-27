// ==============================================================================
// Proyecto: BA Protege+
// Hook: useProtectedDeviceData
// Archivo: src/components/dashboard/protected/hooks/useProtectedDeviceData.ts
// Descripción: Encapsula la carga de listas bloqueadas, dispositivos vinculados,
//              permisos reales del sistema, consumo diario de apps bloqueadas y
//              eventos bloqueados filtrados para el dispositivo protegido.
// ==============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  CustomBlockedApp,
  CustomBlockedDomain,
  DeviceInfo,
  DevicePermissionsStatus,
} from '../../../../types';
import { isItemVisibleForAdultoDevice } from '../../../../utils/adultoSitios';
import { checkRealDevicePermissions } from '../../../../utils/permissionChecker';
import {
  AppUsageRawSnapshot,
  BlockedAppsUsageSummary,
  buildBlockedAppsUsageSummary,
} from '../../../../utils/appUsageMetrics';
import {
  BlockedAttemptRecord,
  FormattedBlockedAttempt,
  computeActivityMetrics,
  formatAttemptDateTime,
  normalizeAttemptSource,
} from '../../../../utils/activityMetrics';
import { getLocalDateKey } from '../../../../utils/pasatiemposMetrics';
import { getNavigationState } from '../../../../utils/navigationSession';
import { protectionService } from '../../../../services/protection.service';
import { apiService } from '../../../../services/api.service';
import { safeStorage } from '../../../../services/api/client';
import { SecurityEventOverviewItem } from '../../../../services/api/telemetry.api';
import { AttemptEvent } from '../../actividad/types';

const PAIRED_PROFILE_STORAGE_KEY = '@ba_protege_paired_profile';
const DEFAULT_TUTOR_FALLBACK = 'tu responsable';

function isPlaceholderTutorName(name?: string | null): boolean {
  const normalized = (name || '').trim().toLowerCase();
  return (
    !normalized ||
    normalized === 'yo' ||
    normalized === 'tutor responsable' ||
    normalized === 'responsable'
  );
}

export interface UseProtectedDeviceDataParams {
  deviceUuid: string;
  mode: 'CHILD' | 'ADULT';
  onForegroundResume?: () => void;
}

export interface UseProtectedDeviceDataResult {
  customSites: CustomBlockedDomain[];
  customApps: CustomBlockedApp[];
  pairedDevices: DeviceInfo[];
  grantedPermsCount: number;
  refreshPermissions: () => Promise<void>;
  loadCustomBlockedList: () => Promise<void>;
  loadActivityUsageAndBlocks: () => Promise<void>;

  resolvedTutorName: string;
  resolvedChildName?: string;
  resolvedChildPhone?: string;
  resolvedAdultDeviceId: string;
  resolvedAdultName?: string;
  resolvedAdultPhone?: string;
  adultVisibleSites: CustomBlockedDomain[];
  adultVisibleApps: CustomBlockedApp[];
  customBlockedItems: string[];

  appsUsageSummary: BlockedAppsUsageSummary;
  deviceBlockedAttempts: FormattedBlockedAttempt[];
  deviceBypassEvents: AttemptEvent[];
}

const SECURITY_EVENT_META: Record<string, { title: string; badge: string }> = {
  PERMISSION_REVOKED: { title: 'Permiso deshabilitado', badge: 'PERMISOS' },
  UNINSTALL_ATTEMPT: { title: 'Intento de desinstalación', badge: 'DESINSTALACIÓN' },
  VPN_DISABLED: { title: 'Protección VPN desactivada', badge: 'VPN' },
  APP_FORCE_STOP: { title: 'Intento de detener la app', badge: 'DETENCIÓN' },
  DNS_TAMPERING: { title: 'Cambio en configuración DNS', badge: 'DNS' },
  DEVICE_REBOOT: { title: 'Dispositivo reiniciado', badge: 'REINICIO' },
  NETWORK_CHANGE: { title: 'Cambio de red detectado', badge: 'RED' },
};

export function useProtectedDeviceData({
  deviceUuid,
  mode,
  onForegroundResume,
}: UseProtectedDeviceDataParams): UseProtectedDeviceDataResult {
  const storageDeviceKey = deviceUuid || 'local';

  const [customSites, setCustomSites] = useState<CustomBlockedDomain[]>([]);
  const [customApps, setCustomApps] = useState<CustomBlockedApp[]>([]);
  const [pairedDevices, setPairedDevices] = useState<DeviceInfo[]>([]);
  const [publicProfile, setPublicProfile] = useState<{
    deviceId: string;
    deviceUuid: string;
    deviceName: string;
    childName: string;
    phone?: string | null;
    personType: 'MENOR' | 'ADULTO';
    tutorName: string | null;
  } | null>(null);
  const [resolvedTutorName, setResolvedTutorName] = useState<string>(DEFAULT_TUTOR_FALLBACK);
  const [grantedPermsCount, setGrantedPermsCount] = useState<number>(6);
  const [appUsageSnapshots, setAppUsageSnapshots] = useState<AppUsageRawSnapshot[]>([]);
  const [persistedBlockedEvents, setPersistedBlockedEvents] = useState<BlockedAttemptRecord[]>(
    []
  );
  const [persistedSecurityEvents, setPersistedSecurityEvents] = useState<
    SecurityEventOverviewItem[]
  >([]);
  const prevPermsRef = useRef<DevicePermissionsStatus | null>(null);

  const hasRealUuid =
    Boolean(deviceUuid) && deviceUuid !== 'local' && deviceUuid !== 'self';

  const refreshPermissions = useCallback(async () => {
    try {
      const real = await checkRealDevicePermissions(deviceUuid);
      setGrantedPermsCount(real.grantedCount);

      // Detectar revocación real de VPN o permisos y reportar alerta de seguridad al backend
      const prev = prevPermsRef.current;
      prevPermsRef.current = real;

      if (hasRealUuid && prev) {
        const securityReports: Array<{ eventType: string; description: string }> = [];
        if (prev.vpn && !real.vpn) {
          securityReports.push({
            eventType: 'VPN_DISABLED',
            description: 'Se desactivó el filtro VPN de protección en el dispositivo',
          });
        }
        const revokedLabels: string[] = [];
        if (prev.accessibility && !real.accessibility) revokedLabels.push('Accesibilidad');
        if (prev.notifications && !real.notifications) revokedLabels.push('Notificaciones');
        if (prev.batteryOptimization && !real.batteryOptimization)
          revokedLabels.push('Optimización de batería');
        if (prev.location && !real.location) revokedLabels.push('Ubicación');
        if (prev.usageStats && !real.usageStats) revokedLabels.push('Estadísticas de uso');

        if (revokedLabels.length > 0) {
          securityReports.push({
            eventType: 'PERMISSION_REVOKED',
            description: `Permiso deshabilitado: ${revokedLabels.join(', ')}`,
          });
        }

        if (securityReports.length > 0) {
          await Promise.all(
            securityReports.map((rep) =>
              apiService
                .reportSecurityEvent({
                  deviceUuid,
                  eventType: rep.eventType,
                  description: rep.description,
                })
                .catch(() => {})
            )
          );
          await protectionService.sendRealDeviceHeartbeat(deviceUuid).catch(() => false);
        }
      }
    } catch {
      // Mantener conteo actual si falla la lectura
    }
  }, [deviceUuid, hasRealUuid]);

  const loadCustomBlockedList = useCallback(async () => {
    try {
      const hasRealUuid =
        Boolean(deviceUuid) && deviceUuid !== 'local' && deviceUuid !== 'self';

      if (hasRealUuid) {
        const [deviceBlocklistRes, profileRes, navState] = await Promise.all([
          apiService.getDeviceBlocklist(deviceUuid).catch(() => null),
          apiService.getDevicePublicProfile(deviceUuid).catch(() => null),
          getNavigationState().catch(() => null),
        ]);

        if (deviceBlocklistRes?.data) {
          setCustomSites(deviceBlocklistRes.data.customDomains || []);
          setCustomApps(deviceBlocklistRes.data.customApps || []);
        }

        if (profileRes) {
          setPublicProfile(profileRes);
          safeStorage
            .setItem(
              PAIRED_PROFILE_STORAGE_KEY,
              JSON.stringify({
                deviceId: profileRes.deviceId,
                deviceUuid: profileRes.deviceUuid,
                childName: profileRes.childName || profileRes.deviceName || '',
                phone: profileRes.phone || '',
                tutorName: profileRes.tutorName || '',
                personType: profileRes.personType,
              })
            )
            .catch(() => {});
        }

        const navUser = navState?.parentUser;
        const navCombined = `${navUser?.firstName || ''} ${navUser?.lastName || ''}`.trim();
        const candidateTutor = [
          profileRes?.tutorName,
          navUser?.fullName,
          navCombined,
        ].find((candidate) => !isPlaceholderTutorName(candidate));
        if (candidateTutor) {
          setResolvedTutorName(candidateTutor.trim());
        }

        await protectionService.syncProtectionRulesWithNative(deviceUuid, mode);
        return;
      }

      const [res, devRes, selfDev, navState] = await Promise.all([
        apiService.getCustomBlocklist(),
        apiService.listDevices().catch(() => null),
        apiService.getSelfDevice().catch(() => null),
        getNavigationState().catch(() => null),
      ]);
      setCustomSites(res.data?.domains || []);
      setCustomApps(res.data?.apps || []);
      if (devRes?.data && Array.isArray(devRes.data)) {
        setPairedDevices(devRes.data);
      }

      const navUser = navState?.parentUser;
      const navCombined = `${navUser?.firstName || ''} ${navUser?.lastName || ''}`.trim();
      const candidateTutor = [
        navUser?.fullName,
        navCombined,
        selfDev?.childName,
        selfDev?.deviceName,
      ].find((candidate) => !isPlaceholderTutorName(candidate));
      if (candidateTutor) {
        setResolvedTutorName(candidateTutor.trim());
      }

      await protectionService.syncProtectionRulesWithNative(deviceUuid || 'self', mode);
    } catch {
      // Mantener estado actual ante error de red
    }
  }, [deviceUuid, mode]);

  const loadActivityUsageAndBlocks = useCallback(async () => {
    const todayKey = getLocalDateKey();
    try {
      // 0. Drenar eventos nativos de bloqueo y seguridad + enviar heartbeat real
      if (hasRealUuid) {
        await Promise.all([
          protectionService.flushNativeBlockEventsToTelemetry(deviceUuid).catch(() => 0),
          protectionService.flushNativeSecurityEventsToTelemetry(deviceUuid).catch(() => 0),
        ]);
      }

      const remoteMetrics = hasRealUuid
        ? await apiService.getDeviceActivityMetrics(deviceUuid, todayKey).catch(() => null)
        : null;

      // 0.5. Refrescar perfil real (tutor, nombre y teléfono) desde /metrics/device/:uuid/activity
      if (remoteMetrics) {
        if (!isPlaceholderTutorName(remoteMetrics.tutorName)) {
          setResolvedTutorName(remoteMetrics.tutorName!.trim());
        }
        if (remoteMetrics.childName || remoteMetrics.phone || remoteMetrics.tutorName) {
          setPublicProfile((prev) => ({
            deviceId: remoteMetrics.deviceId || prev?.deviceId || deviceUuid,
            deviceUuid,
            deviceName: remoteMetrics.childName || prev?.deviceName || '',
            childName: remoteMetrics.childName || prev?.childName || '',
            phone:
              remoteMetrics.phone !== undefined ? remoteMetrics.phone : prev?.phone ?? null,
            personType: remoteMetrics.profileType || prev?.personType || (mode === 'ADULT' ? 'ADULTO' : 'MENOR'),
            tutorName: remoteMetrics.tutorName || prev?.tutorName || null,
          }));
        }
      }

      // 1. Alertas de seguridad reales desde PostgreSQL (fuente de verdad)
      if (remoteMetrics && Array.isArray(remoteMetrics.securityEvents)) {
        setPersistedSecurityEvents(remoteMetrics.securityEvents);
      } else if (!hasRealUuid) {
        const localSecurity = await apiService.getSecurityEvents().catch(() => []);
        setPersistedSecurityEvents(Array.isArray(localSecurity) ? localSecurity : []);
      }

      // 2. Eventos bloqueados reales desde PostgreSQL (fuente de verdad)
      if (remoteMetrics && Array.isArray(remoteMetrics.blockedEvents)) {
        setPersistedBlockedEvents(
          remoteMetrics.blockedEvents.map((ev) => ({
            id: ev.id,
            deviceId: ev.deviceId,
            deviceName: ev.deviceName,
            attemptedDomain: ev.attemptedDomain,
            sourceListType: normalizeAttemptSource(ev.sourceListType),
            itemType: ev.itemType,
            blockedAt: ev.blockedAt,
            count: 1,
          }))
        );
      } else if (!hasRealUuid) {
        const localBlocked = await apiService.getBlockedEvents().catch(() => []);
        setPersistedBlockedEvents(Array.isArray(localBlocked) ? localBlocked : []);
      }

      // 3. Leer consumo real nativo de las apps bloqueadas y sincronizar con PostgreSQL
      const activeApps = customApps.filter((a) => a.isActive !== false);
      let snapshots: AppUsageRawSnapshot[] = [];
      if (activeApps.length > 0) {
        try {
          const nativeUsage = await protectionService.getBlockedAppsUsageToday(activeApps);
          if (nativeUsage.length > 0) {
            snapshots = nativeUsage.map((item) => ({
              deviceId: publicProfile?.deviceId || storageDeviceKey,
              packageName: item.packageName,
              appName: item.appName,
              usedMinutes: item.usedMinutes,
              dailyLimitMinutes: item.dailyLimitMinutes ?? null,
              isBlocked: item.isBlocked,
            }));
            if (hasRealUuid) {
              apiService
                .syncAppUsageSnapshot(deviceUuid, snapshots, todayKey)
                .catch(() => {});
            }
          }
        } catch {
          // Respaldo si el módulo nativo no está disponible
        }
      }

      if (snapshots.length === 0) {
        if (
          Array.isArray(remoteMetrics?.appUsage) &&
          remoteMetrics.appUsage.length > 0
        ) {
          snapshots = remoteMetrics.appUsage;
        } else {
          const cached = await apiService
            .getLocalAppUsageSnapshot(storageDeviceKey, todayKey)
            .catch(() => []);
          snapshots = cached;
        }
      }

      setAppUsageSnapshots(snapshots);
    } catch {
      // Mantener datos en memoria
    }
  }, [deviceUuid, hasRealUuid, publicProfile?.deviceId, storageDeviceKey, customApps]);

  // Hidratación inmediata del perfil real guardado durante el pareamiento (@ba_protege_paired_profile)
  useEffect(() => {
    let active = true;
    safeStorage
      .getItem(PAIRED_PROFILE_STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;
        if (hasRealUuid && parsed.deviceUuid && parsed.deviceUuid !== deviceUuid) return;

        setPublicProfile((prev) =>
          prev || {
            deviceId: parsed.deviceId || deviceUuid,
            deviceUuid: parsed.deviceUuid || deviceUuid,
            deviceName: parsed.childName || parsed.deviceName || '',
            childName: parsed.childName || parsed.deviceName || '',
            phone: parsed.phone || null,
            personType:
              String(parsed.personType || '').toUpperCase() === 'ADULTO'
                ? 'ADULTO'
                : 'MENOR',
            tutorName: parsed.tutorName || null,
          }
        );

        if (!isPlaceholderTutorName(parsed.tutorName)) {
          setResolvedTutorName(String(parsed.tutorName).trim());
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [deviceUuid, hasRealUuid]);

  // Carga inicial de VPN, blocklist, permisos y heartbeat real
  useEffect(() => {
    protectionService.isProtectionActive().catch(() => {
      console.warn('Servicio VPN en modo emulador');
    });
    loadCustomBlockedList();
    refreshPermissions();
    if (hasRealUuid) {
      protectionService.sendRealDeviceHeartbeat(deviceUuid).catch(() => false);
    }
  }, [loadCustomBlockedList, refreshPermissions, hasRealUuid, deviceUuid]);

  // Heartbeat periódico real cada 60 segundos mientras la pantalla protegida está activa
  useEffect(() => {
    if (!hasRealUuid) return;
    const intervalId = setInterval(() => {
      protectionService.sendRealDeviceHeartbeat(deviceUuid).catch(() => false);
    }, 60_000);
    return () => clearInterval(intervalId);
  }, [hasRealUuid, deviceUuid]);

  // Actualizar métricas de uso de apps y bloqueos cuando cambian las apps bloqueadas
  useEffect(() => {
    loadActivityUsageAndBlocks();
  }, [loadActivityUsageAndBlocks]);

  // Monitorear cuando la app regresa a primer plano desde Ajustes del sistema
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshPermissions();
        loadActivityUsageAndBlocks();
        if (hasRealUuid) {
          protectionService.sendRealDeviceHeartbeat(deviceUuid).catch(() => false);
        }
        onForegroundResume?.();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [refreshPermissions, loadActivityUsageAndBlocks, hasRealUuid, deviceUuid, onForegroundResume]);

  // Identificación del dispositivo protegido vinculado (Menor o Adulto)
  const matchedChildDevice = useMemo(
    () =>
      pairedDevices.find(
        (d) =>
          (d.deviceUuid === deviceUuid || d.deviceId === deviceUuid) &&
          d.profileType === 'Menor'
      ) || pairedDevices.find((d) => d.profileType === 'Menor'),
    [pairedDevices, deviceUuid]
  );

  const matchedAdultDevice = useMemo(
    () =>
      pairedDevices.find(
        (d) => d.deviceUuid === deviceUuid || d.deviceId === deviceUuid
      ) || pairedDevices.find((d) => d.profileType === 'Adulto'),
    [pairedDevices, deviceUuid]
  );

  const resolvedChildName =
    (mode === 'CHILD' ? publicProfile?.childName : undefined) ||
    matchedChildDevice?.childName ||
    matchedChildDevice?.deviceName ||
    undefined;
  const resolvedChildPhone =
    (mode === 'CHILD' ? publicProfile?.phone || undefined : undefined) ||
    matchedChildDevice?.phone ||
    undefined;

  const resolvedAdultDeviceId =
    publicProfile?.deviceId || matchedAdultDevice?.deviceId || deviceUuid;
  const resolvedAdultName =
    (mode === 'ADULT' ? publicProfile?.childName : undefined) ||
    matchedAdultDevice?.childName ||
    matchedAdultDevice?.deviceName ||
    undefined;
  const resolvedAdultPhone =
    (mode === 'ADULT' ? publicProfile?.phone || undefined : undefined) ||
    matchedAdultDevice?.phone ||
    undefined;

  const adultVisibleSites = useMemo(
    () =>
      customSites.filter((s) =>
        isItemVisibleForAdultoDevice(s, resolvedAdultDeviceId)
      ),
    [customSites, resolvedAdultDeviceId]
  );

  const adultVisibleApps = useMemo(
    () =>
      customApps.filter((a) =>
        isItemVisibleForAdultoDevice(a, resolvedAdultDeviceId)
      ),
    [customApps, resolvedAdultDeviceId]
  );

  const customBlockedItems = useMemo(
    () => [
      ...customSites.filter((s) => s.isActive !== false).map((s) => s.domain),
      ...customApps.filter((a) => a.isActive !== false).map((a) => a.appName),
    ],
    [customSites, customApps]
  );

  const resolvedChildDeviceId =
    publicProfile?.deviceId || matchedChildDevice?.deviceId || deviceUuid || 'all';
  const activeDeviceApps = mode === 'ADULT' ? adultVisibleApps : customApps;
  const activeDeviceFilterId =
    mode === 'ADULT' ? resolvedAdultDeviceId || 'all' : resolvedChildDeviceId;

  const appsUsageSummary = useMemo(
    () =>
      buildBlockedAppsUsageSummary({
        customApps: activeDeviceApps,
        usageSnapshots: appUsageSnapshots,
        deviceId: activeDeviceFilterId,
      }),
    [activeDeviceApps, appUsageSnapshots, activeDeviceFilterId]
  );

  const deviceBlockedAttempts = useMemo(() => {
    const targetDevice = mode === 'ADULT' ? matchedAdultDevice : matchedChildDevice;
    const personalIds = new Set(
      [
        publicProfile?.deviceId,
        targetDevice?.deviceId,
        targetDevice?.deviceUuid,
        deviceUuid,
        storageDeviceKey,
      ].filter((id): id is string => Boolean(id))
    );
    const personalPersistedEvents =
      personalIds.size > 0
        ? persistedBlockedEvents.filter(
            (ev) => !ev.deviceId || personalIds.has(ev.deviceId)
          )
        : persistedBlockedEvents;

    const dataset: BlockedAttemptRecord[] = personalPersistedEvents.map((ev) => ({
      ...ev,
      sourceListType: normalizeAttemptSource(ev.sourceListType),
      count: ev.count ?? 1,
    }));

    const snapshot = computeActivityMetrics(dataset, {
      deviceId: 'all',
      period: 'week',
      recentLimit: 50,
    });
    return snapshot.allFilteredAttempts;
  }, [
    mode,
    publicProfile?.deviceId,
    matchedAdultDevice,
    matchedChildDevice,
    deviceUuid,
    storageDeviceKey,
    persistedBlockedEvents,
  ]);

  const deviceBypassEvents: AttemptEvent[] = useMemo(() => {
    const targetDevice = mode === 'ADULT' ? matchedAdultDevice : matchedChildDevice;
    const personalIds = new Set(
      [
        publicProfile?.deviceId,
        targetDevice?.deviceId,
        targetDevice?.deviceUuid,
        deviceUuid,
        storageDeviceKey,
      ].filter((id): id is string => Boolean(id))
    );

    return persistedSecurityEvents
      .filter((ev) => ev.deviceId && personalIds.has(ev.deviceId))
      .map((ev) => {
        const mapped = SECURITY_EVENT_META[ev.eventType?.toUpperCase()] ?? {
          title: ev.description || 'Alerta de seguridad',
          badge: 'SEGURIDAD',
        };
        const formatted = formatAttemptDateTime(ev.occurredAt);
        return {
          id: ev.id,
          title: mapped.title,
          meta: formatted,
          formattedDateTime: formatted,
          source: 'bypass' as const,
          badgeLabel: mapped.badge,
          deviceId: ev.deviceId,
          readAt: ev.readAt ?? null,
        };
      });
  }, [
    mode,
    matchedAdultDevice,
    matchedChildDevice,
    deviceUuid,
    storageDeviceKey,
    persistedSecurityEvents,
  ]);

  return {
    customSites,
    customApps,
    pairedDevices,
    grantedPermsCount,
    refreshPermissions,
    loadCustomBlockedList,
    loadActivityUsageAndBlocks,

    resolvedTutorName,
    resolvedChildName,
    resolvedChildPhone,
    resolvedAdultDeviceId,
    resolvedAdultName,
    resolvedAdultPhone,
    adultVisibleSites,
    adultVisibleApps,
    customBlockedItems,

    appsUsageSummary,
    deviceBlockedAttempts,
    deviceBypassEvents,
  };
}
