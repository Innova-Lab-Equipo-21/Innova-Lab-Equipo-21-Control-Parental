// ==============================================================================
// Proyecto: BA Protege+
// Componente: Hook de Datos Reales de Analítica (useRealAnalyticsData)
// Archivo: src/components/dashboard/actividad/useRealAnalyticsData.ts
// Descripción: Transforma los dispositivos reales, sitios/apps personalizados y
//              eventos de telemetría y bloqueos persistidos en el modelo de
//              datos de la Propuesta Superadora MVP (AnalyticsPanel).
// ==============================================================================

import { useEffect, useMemo, useState } from 'react';
import {
  CustomBlockedApp,
  CustomBlockedDomain,
  DeviceInfo,
} from '../../../types';
import { apiService } from '../../../services/api.service';
import {
  BlockedAttemptRecord,
  buildActivityDataset,
  computeActivityMetrics,
  normalizeAttemptSource,
} from '../../../utils/activityMetrics';
import {
  AnalyticsDevice,
  AttemptEvent,
  DayBlock,
  HourBlock,
} from './types';
import {
  DEMO_BLOCKED_ATTEMPTS,
  DEMO_BYPASS_EVENTS,
  DEMO_DEVICES,
  DEMO_HOURLY_DATA,
  DEMO_WEEK_DATA,
} from './data';

export interface UseRealAnalyticsDataParams {
  devices?: DeviceInfo[];
  customSites?: CustomBlockedDomain[];
  customApps?: CustomBlockedApp[];
  currentUser?: any;
}

export interface RealAnalyticsDataResult {
  devices: AnalyticsDevice[];
  weekData: DayBlock[];
  hourlyData: HourBlock[];
  blockedAttempts: AttemptEvent[];
  bypassEvents: AttemptEvent[];
  blocklistVersion: string;
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

/**
 * Anonimiza un dominio de la lista secreta de LOTBA para proteger la confidencialidad.
 * Ejemplo: "apuestas-online-ilegal.bet" -> "apuestas-***.bet" o "ap***.bet"
 */
function anonymizeLotbaDomain(domain: string): string {
  if (!domain) return 'sitio-protegido.lotba';
  const parts = domain.split('.');
  if (parts.length < 2) return `${domain.slice(0, 3)}***`;
  const ext = parts.slice(1).join('.');
  const name = parts[0];
  if (name.length <= 4) {
    return `${name.slice(0, 2)}***.${ext}`;
  }
  const prefix = name.slice(0, Math.min(5, Math.floor(name.length / 2)));
  return `${prefix}***.${ext}`;
}

export function useRealAnalyticsData({
  devices = [],
  customSites = [],
  customApps = [],
  currentUser,
}: UseRealAnalyticsDataParams): RealAnalyticsDataResult {
  const [persistedEvents, setPersistedEvents] = useState<BlockedAttemptRecord[]>([]);
  const [localSites, setLocalSites] = useState<CustomBlockedDomain[]>(customSites);
  const [localApps, setLocalApps] = useState<CustomBlockedApp[]>(customApps);
  const [loading, setLoading] = useState<boolean>(false);
  const [blocklistVersion, setBlocklistVersion] = useState<string>('v24.11');

  const loadData = async () => {
    setLoading(true);
    try {
      const [events, customRes] = await Promise.all([
        apiService.getBlockedEvents().catch(() => []),
        customSites.length === 0
          ? apiService.getCustomBlocklist().catch(() => null)
          : Promise.resolve(null),
      ]);

      if (Array.isArray(events)) {
        setPersistedEvents(events);
      }

      if (customRes?.data?.domains) {
        setLocalSites(customRes.data.domains);
      }
      if (customRes?.data?.apps) {
        setLocalApps(customRes.data.apps);
      }
    } catch {
      // Usar estado en memoria como respaldo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (customSites.length > 0) setLocalSites(customSites);
    if (customApps.length > 0) setLocalApps(customApps);
  }, [customSites, customApps]);

  // Dataset consolidado (eventos reales persistidos + dataset base por dispositivo)
  const dataset = useMemo(
    () =>
      buildActivityDataset({
        devices,
        customSites: localSites,
        customApps: localApps,
        persistedEvents,
      }),
    [devices, localSites, localApps, persistedEvents]
  );

  // Métricas agregadas de la semana
  const metrics = useMemo(
    () =>
      computeActivityMetrics(dataset, {
        deviceId: 'all',
        period: 'week',
        recentLimit: 50,
      }),
    [dataset]
  );

  // 1. Mapeo de Dispositivos a AnalyticsDevice[]
  const analyticsDevices: AnalyticsDevice[] = useMemo(() => {
    // Si no hay dispositivos registrados aún, usar demostración fiel
    if (devices.length === 0) {
      return DEMO_DEVICES;
    }

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
      const name = dev.childName || dev.deviceName || `Dispositivo ${idx + 1}`;
      const shortName = name.split(' ')[0];

      const devEvents = dataset.filter((e) => e.deviceId === devId);
      const devLotba = devEvents
        .filter((e) => normalizeAttemptSource(e.sourceListType) === 'LOTBA')
        .reduce((sum, e) => sum + (e.count ?? 1), 0);
      const devCustom = devEvents
        .filter((e) => normalizeAttemptSource(e.sourceListType) === 'CUSTOM')
        .reduce((sum, e) => sum + (e.count ?? 1), 0);
      const devTotal = devLotba + devCustom;

      const isInactive = dev.status === 'INACTIVE';
      const isOnline = dev.status === 'ACTIVE' || dev.isProtected;

      result.push({
        id: devId,
        label: name,
        shortLabel: shortName,
        status: isInactive ? 'offline' : isOnline ? 'online' : 'warning',
        total: devTotal,
        lotba: devLotba,
        custom: devCustom,
        uptime: isInactive ? '0%' : '99.5%',
        showAlert: isInactive,
        alertText: isInactive
          ? `${name} aún no completó la vinculación con el código`
          : undefined,
        alertTag: isInactive ? 'Inactivo' : undefined,
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

  // 4. Últimos intentos bloqueados (AttemptEvent[])
  const blockedAttempts: AttemptEvent[] = useMemo(() => {
    if (metrics.allFilteredAttempts.length === 0) {
      return DEMO_BLOCKED_ATTEMPTS;
    }

    return metrics.allFilteredAttempts.slice(0, 15).map((att) => {
      const isLotba = att.sourceListType !== 'CUSTOM';
      const displayDomain = isLotba
        ? anonymizeLotbaDomain(att.attemptedDomain)
        : att.attemptedDomain;

      return {
        id: att.id,
        title: displayDomain,
        meta: `${att.deviceName} · ${att.relativeTime}`,
        source: isLotba ? 'lotba' : 'custom',
        badgeLabel: att.sourceLabel,
        deviceId: att.deviceId,
      };
    });
  }, [metrics.allFilteredAttempts]);

  // 5. Eventos Anti-bypass y auditoría de seguridad
  const bypassEvents: AttemptEvent[] = useMemo(() => {
    const list: AttemptEvent[] = [];

    // Alertas por dispositivos inactivos o pendientes de vinculación
    devices
      .filter((d) => d.status === 'INACTIVE')
      .forEach((d, idx) => {
        list.push({
          id: `bypass-inactive-${idx}`,
          title: `Dispositivo ${d.childName || d.deviceName} pendiente de vincular`,
          meta: `${d.childName || d.deviceName} · Requiere ingresar código`,
          source: 'bypass',
          badgeLabel: 'VINCULACIÓN',
          deviceId: d.deviceId || d.deviceUuid,
        });
      });

    // Complementar con eventos de seguridad estándar de protección
    if (list.length < 3) {
      list.push(...DEMO_BYPASS_EVENTS.slice(0, 3 - list.length));
    }

    return list;
  }, [devices]);

  // 6. Uptime general del equipo
  const allUptime = useMemo(() => {
    const totalDevices = devices.length + 1; // +1 por el dispositivo del responsable
    const activeDevices = devices.filter((d) => d.status === 'ACTIVE').length + 1;
    if (totalDevices === 0) return '98.4%';
    const pct = ((activeDevices / totalDevices) * 100).toFixed(1);
    return `${pct}%`;
  }, [devices]);

  return {
    devices: analyticsDevices,
    weekData,
    hourlyData,
    blockedAttempts,
    bypassEvents,
    blocklistVersion,
    allUptime,
    loading,
    refresh: loadData,
  };
}
