// ==============================================================================
// Proyecto: BA Protege+
// Componente: Hook de Datos Reales de Analítica (useRealAnalyticsData)
// Archivo: src/components/dashboard/actividad/useRealAnalyticsData.ts
// Descripción: Transforma los dispositivos reales, sitios/apps personalizados,
//              eventos de bloqueo, consumo diario de apps bloqueadas y sesiones
//              de Pasatiempos en el modelo de datos del Panel de Actividad.
// ==============================================================================

import { useEffect, useMemo, useState } from 'react';
import {
  CustomBlockedApp,
  CustomBlockedDomain,
  DeviceInfo,
} from '../../../types';
import { apiService } from '../../../services/api.service';
import { SecurityEventOverviewItem } from '../../../services/api/telemetry.api';
import { protectionService } from '../../../services/protection.service';
import { getDeviceFirstName } from '../../../utils/authValidation';
import {
  BlockedAttemptRecord,
  computeActivityMetrics,
  formatAttemptDateTime,
  normalizeAttemptSource,
} from '../../../utils/activityMetrics';
import { AppUsageRawSnapshot } from '../../../utils/appUsageMetrics';
import {
  DailyPasatiemposRecord,
  computePasatiemposStreakDays,
  computeWeeklyQuizAccuracyPct,
  getLocalDateKey,
  hydrateDailyRecordFromSessions,
} from '../../../utils/pasatiemposMetrics';
import {
  AnalyticsDevice,
  AttemptEvent,
  DayBlock,
  HourBlock,
} from './types';

export interface UseRealAnalyticsDataParams {
  devices?: DeviceInfo[];
  customSites?: CustomBlockedDomain[];
  customApps?: CustomBlockedApp[];
  currentUser?: any;
}

export interface RealAnalyticsDataResult {
  devices: AnalyticsDevice[];
  rawDevices: DeviceInfo[];
  customApps: CustomBlockedApp[];
  weekData: DayBlock[];
  hourlyData: HourBlock[];
  blockedAttempts: AttemptEvent[];
  rawBlockedEvents: BlockedAttemptRecord[];
  bypassEvents: AttemptEvent[];
  appUsageSnapshots: AppUsageRawSnapshot[];
  pasatiemposRecordsByDevice: Record<string, DailyPasatiemposRecord>;
  pasatiemposStreakByDevice: Record<string, number>;
  pasatiemposWeeklyPctByDevice: Record<string, number>;
  allUptime: string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const DAY_ORDER: Array<{ short: string; full: string; dayIndex: number }> = [
  { short: 'Lun', full: 'Lunes', dayIndex: 1 },
  { short: 'Mar', full: 'Martes', dayIndex: 2 },
  { short: 'Mié', full: 'Miércoles', dayIndex: 3 },
  { short: 'Jue', full: 'Jueves', dayIndex: 4 },
  { short: 'Vie', full: 'Viernes', dayIndex: 5 },
  { short: 'Sáb', full: 'Sábado', dayIndex: 6 },
  { short: 'Dom', full: 'Domingo', dayIndex: 0 },
];

export function useRealAnalyticsData({
  devices = [],
  customSites = [],
  customApps = [],
  currentUser,
}: UseRealAnalyticsDataParams): RealAnalyticsDataResult {
  const [persistedEvents, setPersistedEvents] = useState<BlockedAttemptRecord[]>([]);
  const [persistedSecurityEvents, setPersistedSecurityEvents] = useState<
    SecurityEventOverviewItem[]
  >([]);
  const [localSites, setLocalSites] = useState<CustomBlockedDomain[]>(customSites);
  const [localApps, setLocalApps] = useState<CustomBlockedApp[]>(customApps);
  const [appUsageSnapshots, setAppUsageSnapshots] = useState<AppUsageRawSnapshot[]>([]);
  const [pasatiemposRecordsByDevice, setPasatiemposRecordsByDevice] = useState<
    Record<string, DailyPasatiemposRecord>
  >({});
  const [pasatiemposStreakByDevice, setPasatiemposStreakByDevice] = useState<
    Record<string, number>
  >({});
  const [pasatiemposWeeklyPctByDevice, setPasatiemposWeeklyPctByDevice] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const todayKey = getLocalDateKey();
    try {
      const [events, storedSecurityEvents, customRes, overview] = await Promise.all([
        apiService.getBlockedEvents().catch(() => []),
        apiService.getSecurityEvents().catch(() => []),
        customSites.length === 0 || customApps.length === 0
          ? apiService.getCustomBlocklist().catch(() => null)
          : Promise.resolve(null),
        apiService.getActivityOverview(todayKey).catch(() => null),
      ]);

      // Alertas de seguridad reales de dispositivos protegidos (backend + local)
      const remoteSecurity: SecurityEventOverviewItem[] = Array.isArray(
        overview?.securityEvents
      )
        ? overview.securityEvents
        : [];
      const seenSecurityIds = new Set<string>();
      const mergedSecurity = [...remoteSecurity, ...storedSecurityEvents].filter(
        (ev) => {
          if (!ev?.id || seenSecurityIds.has(ev.id)) return false;
          seenSecurityIds.add(ev.id);
          return true;
        }
      );
      setPersistedSecurityEvents(mergedSecurity);

      const resolvedApps: CustomBlockedApp[] =
        customRes?.data?.apps || localApps || customApps;
      if (customRes?.data?.domains) {
        setLocalSites(customRes.data.domains);
      }
      if (customRes?.data?.apps) {
        setLocalApps(customRes.data.apps);
      }

      // 1. Combinar eventos de bloqueo locales + remotos del backend
      const mergedEventsMap = new Map<string, BlockedAttemptRecord>();
      if (Array.isArray(overview?.blockedEvents)) {
        for (const ev of overview.blockedEvents) {
          mergedEventsMap.set(ev.id, {
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
      if (Array.isArray(events)) {
        for (const ev of events) {
          if (!mergedEventsMap.has(ev.id)) {
            mergedEventsMap.set(ev.id, ev);
          }
        }
      }
      setPersistedEvents(Array.from(mergedEventsMap.values()));

      // 2. Combinar snapshots de uso de apps del backend + consumo real local del Responsable
      const combinedSnapshots: AppUsageRawSnapshot[] = Array.isArray(overview?.appUsage)
        ? [...overview.appUsage]
        : [];

      const activeAppsForSelf = resolvedApps.filter(
        (a) => a.isActive !== false && (a.applyToAll || a.deviceIds?.includes('self'))
      );

      let selfUsage: AppUsageRawSnapshot[] = [];
      if (activeAppsForSelf.length > 0) {
        try {
          const nativeUsage = await protectionService.getBlockedAppsUsageToday(
            activeAppsForSelf
          );
          if (nativeUsage.length > 0) {
            selfUsage = nativeUsage.map((item) => ({
              deviceId: 'self',
              packageName: item.packageName,
              appName: item.appName,
              usedMinutes: item.usedMinutes,
              dailyLimitMinutes: item.dailyLimitMinutes ?? null,
              isBlocked: item.isBlocked,
            }));
            apiService.syncAppUsageSnapshot('self', selfUsage, todayKey).catch(() => {});
          }
        } catch {
          // Respaldo desde caché local si el módulo nativo no está disponible
        }
      }

      if (selfUsage.length === 0) {
        const cachedSelf = await apiService
          .getLocalAppUsageSnapshot('self', todayKey)
          .catch(() => []);
        selfUsage = cachedSelf.map((s) => ({ ...s, deviceId: 'self' }));
      }

      const selfKeys = new Set(
        selfUsage.map((s) => `${s.deviceId || 'self'}:${(s.packageName || s.appName).toLowerCase()}`)
      );
      const filteredRemote = combinedSnapshots.filter(
        (s) =>
          !selfKeys.has(
            `${s.deviceId || 'self'}:${(s.packageName || s.appName).toLowerCase()}`
          )
      );
      setAppUsageSnapshots([...filteredRemote, ...selfUsage]);

      // 3. Pasatiempos por dispositivo protegido (backend + respaldo local)
      const nextRecords: Record<string, DailyPasatiemposRecord> = {};
      const nextStreaks: Record<string, number> = {};
      const nextWeekly: Record<string, number> = {};

      if (Array.isArray(overview?.pasatiemposByDevice)) {
        for (const entry of overview.pasatiemposByDevice) {
          const rec = hydrateDailyRecordFromSessions(
            entry.deviceId,
            entry.profileType,
            todayKey,
            entry.today || []
          );
          nextRecords[entry.deviceId] = rec;
          if (entry.deviceUuid) nextRecords[entry.deviceUuid] = rec;
          nextStreaks[entry.deviceId] = entry.streakDays || 0;
          if (entry.deviceUuid) nextStreaks[entry.deviceUuid] = entry.streakDays || 0;
          nextWeekly[entry.deviceId] = entry.weeklyQuizAccuracyPct || 0;
          if (entry.deviceUuid) nextWeekly[entry.deviceUuid] = entry.weeklyQuizAccuracyPct || 0;
        }
      }

      // Completar desde AsyncStorage local si algún dispositivo no vino del backend
      for (const dev of devices) {
        const devId = dev.deviceId || dev.deviceUuid;
        if (!devId || nextRecords[devId]) continue;
        const profileType = dev.profileType === 'Adulto' ? 'ADULTO' : 'MENOR';
        const localHistory = await apiService
          .getLocalPasatiemposHistory(dev.deviceUuid || devId)
          .catch(() => []);
        if (localHistory.length > 0) {
          const todayRec = localHistory.find((r) => r.dateKey === todayKey);
          if (todayRec) {
            nextRecords[devId] = todayRec;
            if (dev.deviceUuid) nextRecords[dev.deviceUuid] = todayRec;
          }
          const streak = computePasatiemposStreakDays(localHistory, profileType, todayKey);
          const weekly = computeWeeklyQuizAccuracyPct(localHistory, todayKey);
          nextStreaks[devId] = streak;
          nextWeekly[devId] = weekly;
        }
      }

      setPasatiemposRecordsByDevice(nextRecords);
      setPasatiemposStreakByDevice(nextStreaks);
      setPasatiemposWeeklyPctByDevice(nextWeekly);
    } catch {
      // Usar estado en memoria como respaldo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [devices.length, customApps.length]);

  useEffect(() => {
    if (customSites.length > 0) setLocalSites(customSites);
    if (customApps.length > 0) setLocalApps(customApps);
  }, [customSites, customApps]);

  // Dataset exclusivamente con eventos reales persistidos (sin datos fake ni semillas sintéticas)
  const dataset: BlockedAttemptRecord[] = useMemo(
    () =>
      persistedEvents.map((ev) => ({
        ...ev,
        sourceListType: normalizeAttemptSource(ev.sourceListType),
        count: ev.count ?? 1,
      })),
    [persistedEvents]
  );

  // Métricas agregadas de la semana a partir de eventos reales
  const metrics = useMemo(
    () =>
      computeActivityMetrics(dataset, {
        deviceId: 'all',
        period: 'week',
        recentLimit: 50,
      }),
    [dataset]
  );

  // 1. Mapeo de Dispositivos reales a AnalyticsDevice[] (siempre incluye "Yo", nunca DEMO_DEVICES)
  const analyticsDevices: AnalyticsDevice[] = useMemo(() => {
    const totalAll = Math.max(1, metrics.totalBlocks);
    const result: AnalyticsDevice[] = [];

    // Dispositivo propio del Responsable
    const selfEvents = dataset.filter((e) => e.deviceId === 'self');
    const selfLotba = selfEvents
      .filter((e) => normalizeAttemptSource(e.sourceListType) === 'LOTBA')
      .reduce((sum, e) => sum + (e.count ?? 1), 0);
    const selfCustom = selfEvents
      .filter((e) => normalizeAttemptSource(e.sourceListType) === 'CUSTOM')
      .reduce((sum, e) => sum + (e.count ?? 1), 0);
    const selfTotal = selfLotba + selfCustom;

    result.push({
      id: 'self',
      label: 'Yo',
      shortLabel: 'Yo',
      status: 'online',
      colorIndex: 0,
      total: selfTotal,
      lotba: selfLotba,
      custom: selfCustom,
      uptime: '100%',
      showAlert: false,
      mult: Number((selfTotal / totalAll).toFixed(2)) || 0.1,
    });

    // Dispositivos protegidos (Menores y Adultos)
    devices.forEach((dev, idx) => {
      const devId = dev.deviceId || dev.deviceUuid || `dev-${idx}`;
      const rawName = dev.childName || dev.deviceName || `Dispositivo ${idx + 1}`;
      const firstName = getDeviceFirstName(rawName);

      const devEvents = dataset.filter((e) => e.deviceId === devId);
      const devLotba = devEvents
        .filter((e) => normalizeAttemptSource(e.sourceListType) === 'LOTBA')
        .reduce((sum, e) => sum + (e.count ?? 1), 0);
      const devCustom = devEvents
        .filter((e) => normalizeAttemptSource(e.sourceListType) === 'CUSTOM')
        .reduce((sum, e) => sum + (e.count ?? 1), 0);
      const devTotal = devLotba + devCustom;

      const isOnline =
        dev.status === 'ACTIVE' ||
        (dev.status as any)?.effectiveStatus === 'ACTIVE' ||
        (Boolean(dev.isProtected) && dev.status !== 'INACTIVE');
      const isInactive = !isOnline;

      result.push({
        id: devId,
        label: firstName,
        shortLabel: firstName,
        status: isInactive ? 'offline' : 'online',
        colorIndex: dev.colorIndex ?? idx,
        total: devTotal,
        lotba: devLotba,
        custom: devCustom,
        uptime: isInactive ? '0%' : '99.5%',
        showAlert: isInactive,
        alertText: isInactive
          ? `${firstName} aún no completó la vinculación con el código`
          : undefined,
        mult: Number((devTotal / totalAll).toFixed(2)) || 0.1,
      });
    });

    return result;
  }, [devices, dataset, metrics.totalBlocks, currentUser]);

  // 2. Mapeo de Distribución Semanal (DayBlock[])
  const weekData: DayBlock[] = useMemo(() => {
    const countsByDayIndex: Record<number, { lotba: number; custom: number }> = {
      0: { lotba: 0, custom: 0 },
      1: { lotba: 0, custom: 0 },
      2: { lotba: 0, custom: 0 },
      3: { lotba: 0, custom: 0 },
      4: { lotba: 0, custom: 0 },
      5: { lotba: 0, custom: 0 },
      6: { lotba: 0, custom: 0 },
    };

    dataset.forEach((rec) => {
      const d = new Date(rec.blockedAt);
      if (Number.isFinite(d.getTime())) {
        const dayIdx = d.getDay();
        const weight = rec.count ?? 1;
        if (normalizeAttemptSource(rec.sourceListType) === 'CUSTOM') {
          countsByDayIndex[dayIdx].custom += weight;
        } else {
          countsByDayIndex[dayIdx].lotba += weight;
        }
      }
    });

    const dayTotals = DAY_ORDER.map(
      (d) => countsByDayIndex[d.dayIndex].lotba + countsByDayIndex[d.dayIndex].custom
    );
    const maxDayTotal = Math.max(...dayTotals, 1);

    return DAY_ORDER.map((d) => {
      const bucket = countsByDayIndex[d.dayIndex];
      const isPeak = bucket.lotba + bucket.custom === maxDayTotal;
      return {
        short: d.short,
        full: d.full,
        lotba: bucket.lotba,
        custom: bucket.custom,
        isPeak,
      };
    });
  }, [dataset]);

  // 3. Mapeo de Franja Horaria (HourBlock[])
  const hourlyData: HourBlock[] = useMemo(() => {
    return metrics.hourly.map((h) => ({
      label: `${h.hour}h`,
      lotba: h.lotba,
      custom: h.custom,
      isPeak: metrics.peakHour?.hour === h.hour,
    }));
  }, [metrics.hourly, metrics.peakHour]);

  // 4. Últimos intentos bloqueados reales (AttemptEvent[]) con fecha (Hoy/Ayer/dd/mm/aaaa) y horario (hh:mm)
  const blockedAttempts: AttemptEvent[] = useMemo(() => {
    if (metrics.allFilteredAttempts.length === 0) {
      return [];
    }

    return metrics.allFilteredAttempts.slice(0, 25).map((att) => {
      const isLotba = att.sourceListType !== 'CUSTOM';
      return {
        id: att.id,
        title: att.displayTitle,
        meta: `${getDeviceFirstName(att.deviceName)} · ${att.formattedDateTime}`,
        formattedDateTime: att.formattedDateTime,
        itemType: att.itemType,
        source: isLotba ? 'lotba' : 'custom',
        badgeLabel: att.sourceLabel,
        deviceId: att.deviceId,
      };
    });
  }, [metrics.allFilteredAttempts]);

  // 5. Alertas de seguridad reales generadas por acciones de dispositivos protegidos
  const bypassEvents: AttemptEvent[] = useMemo(() => {
    const SECURITY_EVENT_META: Record<string, { title: string; badge: string }> = {
      PERMISSION_REVOKED: {
        title: 'Permiso deshabilitado',
        badge: 'PERMISOS',
      },
      UNINSTALL_ATTEMPT: {
        title: 'Intento de desinstalación',
        badge: 'DESINSTALACIÓN',
      },
      VPN_DISABLED: {
        title: 'Protección VPN desactivada',
        badge: 'VPN',
      },
      APP_FORCE_STOP: {
        title: 'Intento de detener la app',
        badge: 'DETENCIÓN',
      },
      DNS_TAMPERING: {
        title: 'Cambio en configuración DNS',
        badge: 'DNS',
      },
      DEVICE_REBOOT: {
        title: 'Dispositivo reiniciado',
        badge: 'REINICIO',
      },
      NETWORK_CHANGE: {
        title: 'Cambio de red detectado',
        badge: 'RED',
      },
    };

    const deviceNameById = new Map<string, string>();
    devices.forEach((d) => {
      const name = getDeviceFirstName(d.childName || d.deviceName || 'Protegido');
      if (d.deviceId) deviceNameById.set(d.deviceId, name);
      if (d.deviceUuid) deviceNameById.set(d.deviceUuid, name);
    });

    const list: AttemptEvent[] = persistedSecurityEvents
      .filter((ev) => ev.deviceId !== 'self')
      .map((ev) => {
        const mapped = SECURITY_EVENT_META[ev.eventType?.toUpperCase()] ?? {
          title: ev.description || 'Alerta de seguridad',
          badge: 'SEGURIDAD',
        };
        const devName =
          deviceNameById.get(ev.deviceId) ||
          getDeviceFirstName(ev.deviceName || 'Protegido');
        const formatted = formatAttemptDateTime(ev.occurredAt);
        return {
          id: ev.id,
          title: mapped.title,
          meta: `${devName} · ${formatted}`,
          formattedDateTime: formatted,
          source: 'bypass' as const,
          badgeLabel: mapped.badge,
          deviceId: ev.deviceId,
          readAt: ev.readAt ?? null,
        };
      });

    // Si un dispositivo protegido vinculado reporta permisos revocados o bypass activo
    // en su estado en tiempo real y no figura aún en el listado, agregar alerta real.
    devices.forEach((d) => {
      const devId = d.deviceId || d.deviceUuid;
      if (!devId || devId === 'self' || d.profileType === 'Responsable') return;
      const effectiveStatus = String(
        (d.status as any)?.effectiveStatus || d.status || ''
      ).toUpperCase();
      if (effectiveStatus !== 'PERMISSION_REQUIRED' && effectiveStatus !== 'BYPASS_DETECTED') {
        return;
      }
      const alreadyReported = list.some(
        (item) => item.deviceId === devId || item.deviceId === d.deviceUuid
      );
      if (alreadyReported) return;

      const devName = getDeviceFirstName(d.childName || d.deviceName || 'Protegido');
      const isPerm = effectiveStatus === 'PERMISSION_REQUIRED';
      list.push({
        id: `sec-live-${effectiveStatus.toLowerCase()}-${devId}`,
        title: isPerm ? 'Permiso deshabilitado' : 'Protección interrumpida',
        meta: `${devName} · Estado actual`,
        source: 'bypass',
        badgeLabel: isPerm ? 'PERMISOS' : 'SEGURIDAD',
        deviceId: devId,
      });
    });

    return list;
  }, [devices, persistedSecurityEvents]);

  // 6. Uptime general del equipo
  const allUptime = useMemo(() => {
    const totalDevices = devices.length + 1;
    const activeDevices = devices.filter((d) => d.status === 'ACTIVE').length + 1;
    if (totalDevices === 0) return '100%';
    const pct = ((activeDevices / totalDevices) * 100).toFixed(1);
    return `${pct}%`;
  }, [devices]);

  return {
    devices: analyticsDevices,
    rawDevices: devices,
    customApps: localApps,
    weekData,
    hourlyData,
    blockedAttempts,
    rawBlockedEvents: dataset,
    bypassEvents,
    appUsageSnapshots,
    pasatiemposRecordsByDevice,
    pasatiemposStreakByDevice,
    pasatiemposWeeklyPctByDevice,
    allUptime,
    loading,
    refresh: loadData,
  };
}
