// ==============================================================================
// Proyecto: BA Protege+
// Hook: useProtectedDeviceData
// Archivo: src/components/dashboard/protected/hooks/useProtectedDeviceData.ts
// Descripción: Encapsula la carga de listas bloqueadas, dispositivos vinculados,
//              permisos reales del sistema, consumo diario de apps bloqueadas y
//              eventos bloqueados filtrados para el dispositivo protegido.
// ==============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { CustomBlockedApp, CustomBlockedDomain, DeviceInfo } from '../../../../types';
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
  buildActivityDataset,
  computeActivityMetrics,
  normalizeAttemptSource,
} from '../../../../utils/activityMetrics';
import { getLocalDateKey } from '../../../../utils/pasatiemposMetrics';
import { protectionService } from '../../../../services/protection.service';
import { apiService } from '../../../../services/api.service';

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
}

export function useProtectedDeviceData({
  deviceUuid,
  mode,
  onForegroundResume,
}: UseProtectedDeviceDataParams): UseProtectedDeviceDataResult {
  const storageDeviceKey = deviceUuid || 'local';

  const [customSites, setCustomSites] = useState<CustomBlockedDomain[]>([]);
  const [customApps, setCustomApps] = useState<CustomBlockedApp[]>([]);
  const [pairedDevices, setPairedDevices] = useState<DeviceInfo[]>([]);
  const [grantedPermsCount, setGrantedPermsCount] = useState<number>(6);
  const [appUsageSnapshots, setAppUsageSnapshots] = useState<AppUsageRawSnapshot[]>([]);
  const [persistedBlockedEvents, setPersistedBlockedEvents] = useState<BlockedAttemptRecord[]>(
    []
  );

  const refreshPermissions = useCallback(async () => {
    try {
      const real = await checkRealDevicePermissions(deviceUuid);
      setGrantedPermsCount(real.grantedCount);
    } catch {
      // Mantener conteo actual si falla la lectura
    }
  }, [deviceUuid]);

  const loadCustomBlockedList = useCallback(async () => {
    try {
      const [res, devRes] = await Promise.all([
        apiService.getCustomBlocklist(),
        apiService.listDevices().catch(() => null),
      ]);
      setCustomSites(res.data?.domains || []);
      setCustomApps(res.data?.apps || []);
      if (devRes?.data && Array.isArray(devRes.data)) {
        setPairedDevices(devRes.data);
      }
      await protectionService.syncProtectionRulesWithNative(deviceUuid || 'self', mode);
    } catch {
      // Mantener estado actual ante error de red
    }
  }, [deviceUuid, mode]);

  const loadActivityUsageAndBlocks = useCallback(async () => {
    const todayKey = getLocalDateKey();
    try {
      const [remoteMetrics, localBlocked] = await Promise.all([
        apiService.getDeviceActivityMetrics(storageDeviceKey, todayKey).catch(() => null),
        apiService.getBlockedEvents().catch(() => []),
      ]);

      // 1. Combinar eventos bloqueados remotos y locales
      const mergedEvents = new Map<string, BlockedAttemptRecord>();
      if (Array.isArray(remoteMetrics?.blockedEvents)) {
        for (const ev of remoteMetrics.blockedEvents) {
          mergedEvents.set(ev.id, {
            id: ev.id,
            deviceId: ev.deviceId,
            deviceName: ev.deviceName,
            attemptedDomain: ev.attemptedDomain,
            sourceListType: normalizeAttemptSource(ev.sourceListType),
            itemType: ev.itemType,
            blockedAt: ev.blockedAt,
            count: 1,
          });
        }
      }
      if (Array.isArray(localBlocked)) {
        for (const ev of localBlocked) {
          if (!mergedEvents.has(ev.id)) {
            mergedEvents.set(ev.id, ev);
          }
        }
      }
      setPersistedBlockedEvents(Array.from(mergedEvents.values()));

      // 2. Leer consumo real nativo de las apps bloqueadas y sincronizar con backend
      const activeApps = customApps.filter((a) => a.isActive !== false);
      let snapshots: AppUsageRawSnapshot[] = [];
      if (activeApps.length > 0) {
        try {
          const nativeUsage = await protectionService.getBlockedAppsUsageToday(activeApps);
          if (nativeUsage.length > 0) {
            snapshots = nativeUsage.map((item) => ({
              deviceId: storageDeviceKey,
              packageName: item.packageName,
              appName: item.appName,
              usedMinutes: item.usedMinutes,
              dailyLimitMinutes: item.dailyLimitMinutes ?? null,
              isBlocked: item.isBlocked,
            }));
            apiService
              .syncAppUsageSnapshot(storageDeviceKey, snapshots, todayKey)
              .catch(() => {});
          }
        } catch {
          // Respaldo si el módulo nativo no está disponible
        }
      }

      if (snapshots.length === 0) {
        const cached = await apiService
          .getLocalAppUsageSnapshot(storageDeviceKey, todayKey)
          .catch(() => []);
        if (cached.length > 0) {
          snapshots = cached;
        } else if (
          Array.isArray(remoteMetrics?.appUsage) &&
          remoteMetrics.appUsage.length > 0
        ) {
          snapshots = remoteMetrics.appUsage;
        }
      }

      setAppUsageSnapshots(snapshots);
    } catch {
      // Mantener datos en memoria
    }
  }, [storageDeviceKey, customApps]);

  // Carga inicial de VPN, blocklist y permisos
  useEffect(() => {
    protectionService.isProtectionActive().catch(() => {
      console.warn('Servicio VPN en modo emulador');
    });
    loadCustomBlockedList();
    refreshPermissions();
  }, [loadCustomBlockedList, refreshPermissions]);

  // Actualizar métricas de uso de apps y bloqueos cuando cambian las apps bloqueadas
  useEffect(() => {
    loadActivityUsageAndBlocks();
  }, [loadActivityUsageAndBlocks]);

  // Monitorear cuando la app regresa a primer plano desde Ajustes del sistema
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshPermissions();
        onForegroundResume?.();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [refreshPermissions, onForegroundResume]);

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
    matchedChildDevice?.childName || matchedChildDevice?.deviceName || undefined;
  const resolvedChildPhone = matchedChildDevice?.phone || undefined;

  const resolvedAdultDeviceId = matchedAdultDevice?.deviceId || deviceUuid;
  const resolvedAdultName =
    matchedAdultDevice?.childName || matchedAdultDevice?.deviceName || undefined;
  const resolvedAdultPhone = matchedAdultDevice?.phone || undefined;

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

  const resolvedChildDeviceId = matchedChildDevice?.deviceId || deviceUuid || 'all';
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
    const dataset = buildActivityDataset({
      devices: targetDevice ? [targetDevice] : pairedDevices,
      customSites: mode === 'ADULT' ? adultVisibleSites : customSites,
      customApps: activeDeviceApps,
      persistedEvents: persistedBlockedEvents,
    });
    const filterId = targetDevice?.deviceId || targetDevice?.deviceUuid || 'all';
    const snapshot = computeActivityMetrics(dataset, {
      deviceId: filterId,
      period: 'week',
      recentLimit: 30,
    });
    return snapshot.allFilteredAttempts;
  }, [
    mode,
    matchedAdultDevice,
    matchedChildDevice,
    pairedDevices,
    adultVisibleSites,
    customSites,
    activeDeviceApps,
    persistedBlockedEvents,
  ]);

  return {
    customSites,
    customApps,
    pairedDevices,
    grantedPermsCount,
    refreshPermissions,
    loadCustomBlockedList,
    loadActivityUsageAndBlocks,

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
  };
}
