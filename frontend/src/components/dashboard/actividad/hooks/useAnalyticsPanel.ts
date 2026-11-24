// ==============================================================================
// Proyecto: BA Protege+
// Componente: Panel de Analítica (Hook de estado y derivación de métricas)
// Archivo: src/components/dashboard/actividad/hooks/useAnalyticsPanel.ts
// Descripción: Encapsula la selección de dispositivo, período (con persistencia
//              en AsyncStorage iniciando en "Hoy"), día/hora inspeccionados en
//              franja horaria, series reales de historial por dispositivo y
//              pestaña de auditoría.
// ==============================================================================

import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceFirstName } from '../../../../utils/authValidation';
import {
  BlockedAttemptRecord,
  normalizeAttemptSource,
} from '../../../../utils/activityMetrics';
import { getDeviceHighlight } from '../../../../utils/deviceColors';
import {
  AnalyticsDevice,
  AnalyticsPeriod,
  AuditTab,
  ChartBar,
  DayBlock,
  DeviceHistorySeries,
  HourBlock,
} from '../types';
import { HeartbeatAlertItem } from '../blocks/HeartbeatBanner';

export const STORAGE_KEY_PERIOD = '@ba_protege_actividad_period';

const DAY_MS = 24 * 60 * 60 * 1000;
const SHORT_MONTHS_ES = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

const formatShortAxisDate = (ms: number): string => {
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = SHORT_MONTHS_ES[d.getMonth()] ?? 'ENE';
  return `${dd} ${mmm}`;
};

const safeGetPeriod = async (): Promise<AnalyticsPeriod | null> => {
  try {
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_PERIOD);
      if (saved === 'today' || saved === 'week' || saved === 'month') {
        return saved as AnalyticsPeriod;
      }
    }
  } catch {
    // Fallback silencioso si no está disponible AsyncStorage
  }
  return null;
};

const safeSetPeriod = async (val: AnalyticsPeriod): Promise<void> => {
  try {
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      await AsyncStorage.setItem(STORAGE_KEY_PERIOD, val);
    }
  } catch {
    // Fallback silencioso si no está disponible AsyncStorage
  }
};

export interface InspectorInfo {
  label: string;
  total: number;
  lotba: number;
  custom: number;
}

export interface UseAnalyticsPanelParams {
  devices?: AnalyticsDevice[];
  weekData?: DayBlock[];
  hourlyData?: HourBlock[];
  /** Eventos reales de bloqueo para derivar totales y gráfico histórico sin datos fake. */
  rawBlockedEvents?: BlockedAttemptRecord[];
  /** Continuidad de protección cuando el filtro está en "Todos". */
  allUptime?: string;
}

export interface UseAnalyticsPanelResult {
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  period: AnalyticsPeriod;
  changePeriod: (period: AnalyticsPeriod) => void;
  selectedDayIndex: number;
  selectDay: (index: number) => void;
  selectedHourIndex: number;
  selectHour: (index: number) => void;
  onSelectChart: (index: number) => void;
  auditTab: AuditTab;
  setAuditTab: (tab: AuditTab) => void;

  deviceOptions: {
    id: string;
    label: string;
    status: AnalyticsDevice['status'];
    colorIndex?: number;
  }[];
  activeDevice: AnalyticsDevice | null;
  totalBlocks: number;
  lotbaCount: number;
  customCount: number;
  uptime: string;
  showAlert: boolean;
  alertDevices: HeartbeatAlertItem[];
  historySeries: DeviceHistorySeries[];
  historyDateLabels: [string, string, string];
  sourceLotbaPct: number;
  sourceCustomPct: number;

  chartBars: ChartBar[];
  selectedChartIndex: number;
  inspector: InspectorInfo;
  peakInfo: { range: string | null };
  daySelector: { short: string; index: number; isToday?: boolean }[];
}

export function useAnalyticsPanel({
  devices = [],
  weekData = [],
  hourlyData = [],
  rawBlockedEvents,
  allUptime = '100%',
}: UseAnalyticsPanelParams): UseAnalyticsPanelResult {
  // Cálculo de día actual (0=Dom, 1=Lun..6=Sáb) y hora actual
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const currentHour = now.getHours();

  // Índice de hoy en el arreglo ordenado Lun (0) a Dom (6)
  const todayDayIndex = useMemo(() => {
    const idx = (currentDayOfWeek + 6) % 7;
    return idx >= 0 && idx < weekData.length ? idx : 0;
  }, [currentDayOfWeek, weekData.length]);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  // Requisito: siempre abrir en 'today' (Hoy) por defecto en la primera carga
  const [period, setPeriod] = useState<AnalyticsPeriod>('today');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayDayIndex);
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(currentHour);
  const [auditTab, setAuditTab] = useState<AuditTab>('urls');

  // Cargar preferencia persistida si el usuario ya la había modificado
  useEffect(() => {
    let isMounted = true;
    safeGetPeriod().then((saved) => {
      if (isMounted && saved) {
        setPeriod(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeDevice = useMemo(
    () => devices.find((d) => d.id === selectedDeviceId) ?? null,
    [devices, selectedDeviceId]
  );

  const deviceOptions = useMemo(() => {
    // 1. "Yo" siempre de primero entre los dispositivos individuales
    const selfDevice = devices.find(
      (d) => d.id === 'self' || d.label === 'Yo' || d.label === 'Mi dispositivo'
    );

    // 2. Dispositivos protegidos ordenados alfabéticamente (A-Z) mostrando solo el primer nombre
    //    preservando el colorIndex asignado en la pantalla de Dispositivos
    const protectedDevices = devices
      .filter(
        (d) => d.id !== 'self' && d.label !== 'Yo' && d.label !== 'Mi dispositivo'
      )
      .map((d, idx) => {
        const firstName = getDeviceFirstName(d.label);
        return {
          ...d,
          label: firstName,
          shortLabel: firstName,
          colorIndex: d.colorIndex ?? idx,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));

    const sortedList: AnalyticsDevice[] = [];
    if (selfDevice) {
      sortedList.push({
        ...selfDevice,
        label: 'Yo',
        shortLabel: 'Yo',
        colorIndex: 0,
      });
    }
    sortedList.push(...protectedDevices);

    return sortedList.map((d) => ({
      id: d.id,
      label: d.label,
      status: d.status,
      colorIndex: d.colorIndex,
    }));
  }, [devices]);

  // ---- Ventana temporal del período seleccionado ----
  const periodWindow = useMemo(() => {
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    if (period === 'today') {
      return {
        startMs: startOfToday,
        endMs: startOfToday + DAY_MS,
        bucketCount: 8, // 8 franjas de 3 h
        labels: ['00 h', '12 h', '23 h'] as [string, string, string],
      };
    }

    if (period === 'week') {
      const startMs = startOfToday - 6 * DAY_MS;
      const midMs = startOfToday - 3 * DAY_MS;
      return {
        startMs,
        endMs: startOfToday + DAY_MS,
        bucketCount: 7, // 7 días calendario
        labels: [
          formatShortAxisDate(startMs),
          formatShortAxisDate(midMs),
          'HOY',
        ] as [string, string, string],
      };
    }

    // 'month' (30 días -> 15 puntos de 2 días)
    const startMs = startOfToday - 29 * DAY_MS;
    const midMs = startOfToday - 15 * DAY_MS;
    return {
      startMs,
      endMs: startOfToday + DAY_MS,
      bucketCount: 15,
      labels: [
        formatShortAxisDate(startMs),
        formatShortAxisDate(midMs),
        'HOY',
      ] as [string, string, string],
    };
  }, [period, currentDayOfWeek]);

  // ---- Eventos filtrados por período y dispositivo (cuando hay fuente real) ----
  const filteredRawEvents = useMemo(() => {
    if (!rawBlockedEvents) return null;
    return rawBlockedEvents.filter((ev) => {
      if (selectedDeviceId !== 'all' && ev.deviceId !== selectedDeviceId) {
        return false;
      }
      const ts = new Date(ev.blockedAt).getTime();
      if (!Number.isFinite(ts)) return false;
      return ts >= periodWindow.startMs && ts <= periodWindow.endMs;
    });
  }, [rawBlockedEvents, selectedDeviceId, periodWindow]);

  // ---- Métricas del dispositivo (o del equipo en "Todos") ----
  const allTotal = devices.reduce((sum, d) => sum + d.total, 0);
  const allLotba = devices.reduce((sum, d) => sum + d.lotba, 0);
  const allCustom = devices.reduce((sum, d) => sum + d.custom, 0);

  const { totalBlocks, lotbaCount, customCount } = useMemo(() => {
    if (filteredRawEvents !== null) {
      let lotba = 0;
      let custom = 0;
      for (const ev of filteredRawEvents) {
        const w = Math.max(1, Math.round(ev.count ?? 1));
        if (normalizeAttemptSource(ev.sourceListType) === 'CUSTOM') {
          custom += w;
        } else {
          lotba += w;
        }
      }
      return { totalBlocks: lotba + custom, lotbaCount: lotba, customCount: custom };
    }

    return {
      totalBlocks: activeDevice ? activeDevice.total : allTotal,
      lotbaCount: activeDevice ? activeDevice.lotba : allLotba,
      customCount: activeDevice ? activeDevice.custom : allCustom,
    };
  }, [filteredRawEvents, activeDevice, allTotal, allLotba, allCustom]);

  const mult = activeDevice?.mult ?? 1;
  const uptime = activeDevice ? activeDevice.uptime : allUptime;

  const sourceLotbaPct =
    totalBlocks > 0 ? Math.round((lotbaCount / totalBlocks) * 100) : 0;
  const sourceCustomPct = totalBlocks > 0 ? 100 - sourceLotbaPct : 0;

  // ---- Series históricas por dispositivo ("Yo" siempre primero, respetando color oficial) ----
  const historySeries: DeviceHistorySeries[] = useMemo(() => {
    // Dispositivos visibles en la leyenda:
    // - Si se filtró uno específico: solo ese dispositivo.
    // - Si está en "Todos": "Yo" siempre primero + dispositivos protegidos vinculados (A-Z).
    const candidates =
      selectedDeviceId !== 'all'
        ? deviceOptions.filter((d) => d.id === selectedDeviceId)
        : deviceOptions.filter(
            (d) => d.id === 'self' || d.status === 'online'
          );

    const ensuredCandidates =
      candidates.length > 0
        ? candidates
        : [{ id: 'self', label: 'Yo', status: 'online' as const, colorIndex: 0 }];

    const { startMs, endMs, bucketCount } = periodWindow;
    const spanMs = Math.max(1, endMs - startMs);

    return ensuredCandidates.map((dev, idx) => {
      const highlight = getDeviceHighlight(
        dev.id,
        dev.label,
        dev.label,
        dev.id === 'self' ? 0 : (dev.colorIndex ?? idx)
      );
      const values = Array.from({ length: bucketCount }, () => 0);

      if (filteredRawEvents) {
        for (const ev of filteredRawEvents) {
          if (ev.deviceId !== dev.id) continue;
          const ts = new Date(ev.blockedAt).getTime();
          if (!Number.isFinite(ts)) continue;
          const ratio = Math.max(0, Math.min(0.9999, (ts - startMs) / spanMs));
          const bucketIdx = Math.floor(ratio * bucketCount);
          values[bucketIdx] += Math.max(1, Math.round(ev.count ?? 1));
        }
      }

      return {
        id: dev.id,
        label: dev.id === 'self' ? 'Yo' : dev.label,
        color: highlight.color,
        values,
      };
    });
  }, [deviceOptions, selectedDeviceId, periodWindow, filteredRawEvents]);

  // ---- Alertas de dispositivos pendientes de vinculación (todos los aplicables) ----
  const alertDevices: HeartbeatAlertItem[] = useMemo(() => {
    return devices
      .filter(
        (d) =>
          d.showAlert &&
          (selectedDeviceId === 'all' || selectedDeviceId === d.id)
      )
      .map((d, idx) => ({
        id: d.id,
        label: getDeviceFirstName(d.shortLabel || d.label),
        colorIndex: d.colorIndex ?? idx,
        text: d.alertText,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, 'es', { sensitivity: 'base' })
      );
  }, [devices, selectedDeviceId]);

  const showAlert = alertDevices.length > 0;

  // ---- Dataset horario escalado por dispositivo y día seleccionado ----
  const peakDayTotal = useMemo(
    () => Math.max(...weekData.map((d) => d.lotba + d.custom), 0),
    [weekData]
  );

  const selectedDay: DayBlock =
    weekData[selectedDayIndex] ??
    weekData[0] ?? { short: '', full: '', lotba: 0, custom: 0 };
  const dayFactor =
    peakDayTotal > 0
      ? ((selectedDay.lotba + selectedDay.custom) / peakDayTotal) * mult
      : 0;

  const scaledHours = useMemo(
    () =>
      hourlyData.map((h) => ({
        ...h,
        lotbaVal:
          h.lotba > 0 && dayFactor > 0
            ? Math.max(1, Math.round(h.lotba * dayFactor))
            : 0,
        customVal:
          h.custom > 0 && dayFactor > 0
            ? Math.max(0, Math.round(h.custom * dayFactor))
            : 0,
      })),
    [hourlyData, dayFactor]
  );

  // Destaca la barra referente al día de hoy / hora actual en "Franja horaria"
  const chartBars: ChartBar[] = useMemo(
    () =>
      scaledHours.map((h, hourIndex) => ({
        lotba: h.lotbaVal,
        custom: h.customVal,
        isPeak: h.isPeak && h.lotbaVal + h.customVal > 0,
        isToday: selectedDayIndex === todayDayIndex && hourIndex === currentHour,
        peakLabel: h.label,
        label: h.label,
      })),
    [scaledHours, selectedDayIndex, todayDayIndex, currentHour]
  );

  const selectedChartIndex = selectedHourIndex;

  // ---- Inspector y texto de pico (Franja horaria) ----
  const inspector: InspectorInfo = useMemo(() => {
    const h = scaledHours[selectedHourIndex] ?? scaledHours[0];
    if (!h) {
      return { label: 'Sin datos', total: 0, lotba: 0, custom: 0 };
    }
    const nextH = (selectedHourIndex + 1) % 24;
    return {
      // Requisito: Excluir "int." ambiguo y usar "intentos" consistente
      label: `${selectedDay.full} (${selectedHourIndex} a ${nextH} h): ${h.lotbaVal + h.customVal} intentos`,
      total: h.lotbaVal + h.customVal,
      lotba: h.lotbaVal,
      custom: h.customVal,
    };
  }, [scaledHours, selectedHourIndex, selectedDay]);

  const peakInfo = useMemo(() => {
    if (scaledHours.length === 0) {
      return { range: null as string | null };
    }
    const peak =
      scaledHours.find((h) => h.isPeak && h.lotbaVal + h.customVal > 0) ??
      scaledHours.reduce((max, h) =>
        h.lotbaVal + h.customVal > max.lotbaVal + max.customVal ? h : max
      );
    const peakTotal = peak.lotbaVal + peak.customVal;
    if (peakTotal === 0) {
      return { range: null as string | null };
    }
    const peakIndex = scaledHours.indexOf(peak);
    const nextH = (peakIndex + 1) % 24;
    return {
      range: `${peakIndex}h-${nextH}h`,
    };
  }, [scaledHours]);

  // ---- Selector de día estilo Google Maps (modo horario) ----
  const daySelector = useMemo(
    () =>
      weekData.map((d, index) => ({
        short: d.short,
        index,
        isToday: index === todayDayIndex,
      })),
    [weekData, todayDayIndex]
  );

  // ---- Acciones ----
  const changePeriod = (nextPeriod: AnalyticsPeriod) => {
    setPeriod(nextPeriod);
    safeSetPeriod(nextPeriod);
  };

  const selectDay = (index: number) => setSelectedDayIndex(index);
  const selectHour = (index: number) => setSelectedHourIndex(index);

  return {
    selectedDeviceId,
    setSelectedDeviceId,
    period,
    changePeriod,
    selectedDayIndex,
    selectDay,
    selectedHourIndex,
    selectHour,
    onSelectChart: selectHour,
    auditTab,
    setAuditTab,

    deviceOptions,
    activeDevice,
    totalBlocks,
    lotbaCount,
    customCount,
    uptime,
    showAlert,
    alertDevices,
    historySeries,
    historyDateLabels: periodWindow.labels,
    sourceLotbaPct,
    sourceCustomPct,

    chartBars,
    selectedChartIndex,
    inspector,
    peakInfo,
    daySelector,
  };
}
