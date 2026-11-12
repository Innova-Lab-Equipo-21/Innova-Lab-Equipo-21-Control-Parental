// ==============================================================================
// Proyecto: BA Protege+
// Componente: Panel de Analítica (Hook de estado y derivación de métricas)
// Archivo: components/analytics/hooks/useAnalyticsPanel.ts
// Descripción: Encapsula la selección de dispositivo, período, vista del gráfico,
//              día/hora inspeccionados y pestaña de auditoría. Deriva en tiempo
//              real el dataset escalado y los textos del inspector y del pico.
// ==============================================================================

import { useMemo, useState } from 'react';
import {
  AnalyticsDevice,
  AnalyticsPeriod,
  AuditTab,
  ChartBar,
  ChartView,
  DayBlock,
  DeviceBreakdownItem,
  HourBlock,
} from '../types';

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
  /** Continuidad de protección cuando el filtro está en "Todos". */
  allUptime?: string;
}

export interface UseAnalyticsPanelResult {
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  period: AnalyticsPeriod;
  changePeriod: (period: AnalyticsPeriod) => void;
  chartView: ChartView;
  setChartView: (view: ChartView) => void;
  selectedDayIndex: number;
  selectDay: (index: number) => void;
  selectedHourIndex: number;
  selectHour: (index: number) => void;
  onSelectChart: (index: number) => void;
  auditTab: AuditTab;
  setAuditTab: (tab: AuditTab) => void;

  deviceOptions: { id: string; label: string; status: AnalyticsDevice['status'] }[];
  activeDevice: AnalyticsDevice | null;
  totalBlocks: number;
  lotbaCount: number;
  customCount: number;
  uptime: string;
  showAlert: boolean;
  alertText?: string;
  alertTag?: string;
  breakdown: DeviceBreakdownItem[];
  sourceLotbaPct: number;
  sourceCustomPct: number;

  chartBars: ChartBar[];
  selectedChartIndex: number;
  inspector: InspectorInfo;
  peakInfo: { label: string; value: string };
  daySelector: { short: string; index: number }[];
}

export function useAnalyticsPanel({
  devices = [],
  weekData = [],
  hourlyData = [],
  allUptime = '98.4%',
}: UseAnalyticsPanelParams): UseAnalyticsPanelResult {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [chartView, setChartView] = useState<ChartView>('daily');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(5);
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(20);
  const [auditTab, setAuditTab] = useState<AuditTab>('urls');

  // ---- Agregados del equipo (suma de dispositivos) ----
  const allTotal = devices.reduce((sum, d) => sum + d.total, 0);
  const allLotba = devices.reduce((sum, d) => sum + d.lotba, 0);
  const allCustom = devices.reduce((sum, d) => sum + d.custom, 0);

  const activeDevice = useMemo(
    () => devices.find((d) => d.id === selectedDeviceId) ?? null,
    [devices, selectedDeviceId]
  );

  const deviceOptions = useMemo(
    () =>
      devices.map((d) => ({
        id: d.id,
        label: d.label,
        status: d.status,
      })),
    [devices]
  );

  // ---- Métricas del dispositivo (o del equipo en "Todos") ----
  const mult = activeDevice?.mult ?? 1;
  const totalBlocks = activeDevice ? activeDevice.total : allTotal;
  const lotbaCount = activeDevice ? activeDevice.lotba : allLotba;
  const customCount = activeDevice ? activeDevice.custom : allCustom;
  const uptime = activeDevice ? activeDevice.uptime : allUptime;

  const sourceLotbaPct =
    totalBlocks > 0 ? Math.round((lotbaCount / totalBlocks) * 100) : 0;
  const sourceCustomPct = 100 - sourceLotbaPct;

  // ---- Desglose por dispositivo (respecto del total del equipo) ----
  const breakdown: DeviceBreakdownItem[] = useMemo(
    () =>
      devices.map((d) => ({
        label: d.shortLabel,
        count: d.total,
        pct: allTotal > 0 ? Math.round((d.total / allTotal) * 100) : 0,
      })),
    [devices, allTotal]
  );

  // ---- Alerta de heartbeat (dispositivo que dejó de reportar) ----
  const alertDevice = useMemo(() => devices.find((d) => d.showAlert) ?? null, [devices]);
  const showAlert = Boolean(
    alertDevice &&
      (selectedDeviceId === 'all' || selectedDeviceId === alertDevice.id)
  );

  // ---- Dataset escalado por dispositivo ----
  const scaledWeek = useMemo(
    () =>
      weekData.map((d) => ({
        ...d,
        lotbaVal: Math.max(1, Math.round(d.lotba * mult)),
        customVal: Math.max(1, Math.round(d.custom * mult)),
      })),
    [weekData, mult]
  );

  const peakDayTotal = useMemo(
    () => Math.max(...weekData.map((d) => d.lotba + d.custom), 1),
    [weekData]
  );

  const selectedDay: DayBlock =
    weekData[selectedDayIndex] ??
    weekData[0] ?? { short: '', full: '', lotba: 0, custom: 0 };
  const dayFactor =
    peakDayTotal > 0
      ? ((selectedDay.lotba + selectedDay.custom) / peakDayTotal) * mult
      : mult;

  const scaledHours = useMemo(
    () =>
      hourlyData.map((h) => ({
        ...h,
        lotbaVal: Math.max(1, Math.round(h.lotba * dayFactor)),
        customVal: Math.max(0, Math.round(h.custom * dayFactor)),
      })),
    [hourlyData, dayFactor]
  );

  // ---- Barras del gráfico según la vista activa ----
  const dailyBars: ChartBar[] = useMemo(
    () =>
      scaledWeek.map((d) => ({
        lotba: d.lotbaVal,
        custom: d.customVal,
        isPeak: d.isPeak,
        peakLabel: 'PICO',
        label: d.short,
        fullLabel: d.full,
      })),
    [scaledWeek]
  );

  const hourlyBars: ChartBar[] = useMemo(
    () =>
      scaledHours.map((h) => ({
        lotba: h.lotbaVal,
        custom: h.customVal,
        isPeak: h.isPeak,
        peakLabel: h.label,
        label: h.label,
      })),
    [scaledHours]
  );

  const chartBars = chartView === 'daily' ? dailyBars : hourlyBars;
  const selectedChartIndex = chartView === 'daily' ? selectedDayIndex : selectedHourIndex;

  // ---- Inspector y texto de pico ----
  const inspector: InspectorInfo = useMemo(() => {
    if (chartView === 'daily') {
      const d = scaledWeek[selectedDayIndex] ?? scaledWeek[0];
      if (!d) {
        return { label: 'Sin datos', total: 0, lotba: 0, custom: 0 };
      }
      return {
        label: `${d.full}: ${d.lotbaVal + d.customVal} intentos`,
        total: d.lotbaVal + d.customVal,
        lotba: d.lotbaVal,
        custom: d.customVal,
      };
    }
    const h = scaledHours[selectedHourIndex] ?? scaledHours[0];
    if (!h) {
      return { label: 'Sin datos', total: 0, lotba: 0, custom: 0 };
    }
    const nextH = (selectedHourIndex + 1) % 24;
    return {
      label: `${selectedDay.full} (${selectedHourIndex} a ${nextH} h): ${h.lotbaVal + h.customVal} int.`,
      total: h.lotbaVal + h.customVal,
      lotba: h.lotbaVal,
      custom: h.customVal,
    };
  }, [chartView, scaledWeek, scaledHours, selectedDayIndex, selectedHourIndex, selectedDay]);

  const peakInfo = useMemo(() => {
    if (chartView === 'daily') {
      if (scaledWeek.length === 0) {
        return { label: 'Día pico', value: '0' };
      }
      const peak =
        scaledWeek.find((d) => d.isPeak) ??
        scaledWeek.reduce((max, d) =>
          d.lotbaVal + d.customVal > max.lotbaVal + max.customVal ? d : max
        );
      return {
        label: `Día pico: ${peak.short}`,
        value: `${peak.lotbaVal + peak.customVal}`,
      };
    }
    if (scaledHours.length === 0) {
      return { label: 'Pico', value: '0' };
    }
    const peak =
      scaledHours.find((h) => h.isPeak) ??
      scaledHours.reduce((max, h) =>
        h.lotbaVal + h.customVal > max.lotbaVal + max.customVal ? h : max
      );
    const peakIndex = scaledHours.indexOf(peak);
    const nextH = (peakIndex + 1) % 24;
    return {
      label: `Pico ${selectedDay.short}: ${peakIndex} a ${nextH} h`,
      value: `${peak.lotbaVal + peak.customVal}`,
    };
  }, [chartView, scaledWeek, scaledHours, selectedDay]);

  // ---- Selector de día estilo Google Maps (modo horario) ----
  const daySelector = useMemo(
    () =>
      weekData.map((d, index) => ({
        short: d.short,
        index,
      })),
    [weekData]
  );

  // ---- Acciones ----
  const changePeriod = (nextPeriod: AnalyticsPeriod) => {
    setPeriod(nextPeriod);
    setChartView(nextPeriod === 'today' ? 'hourly' : 'daily');
  };

  const selectDay = (index: number) => setSelectedDayIndex(index);
  const selectHour = (index: number) => setSelectedHourIndex(index);

  const onSelectChart = (index: number) => {
    if (chartView === 'daily') {
      setSelectedDayIndex(index);
    } else {
      setSelectedHourIndex(index);
    }
  };

  return {
    selectedDeviceId,
    setSelectedDeviceId,
    period,
    changePeriod,
    chartView,
    setChartView,
    selectedDayIndex,
    selectDay,
    selectedHourIndex,
    selectHour,
    onSelectChart,
    auditTab,
    setAuditTab,

    deviceOptions,
    activeDevice,
    totalBlocks,
    lotbaCount,
    customCount,
    uptime,
    showAlert,
    alertText: alertDevice?.alertText,
    alertTag: alertDevice?.alertTag,
    breakdown,
    sourceLotbaPct,
    sourceCustomPct,

    chartBars,
    selectedChartIndex,
    inspector,
    peakInfo,
    daySelector,
  };
}
