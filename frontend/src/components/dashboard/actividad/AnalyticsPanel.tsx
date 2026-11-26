// ==============================================================================
// Proyecto: BA Protege+
// Componente: AnalyticsPanel (Panel de Actividad del Responsable)
// Archivo: src/components/dashboard/actividad/AnalyticsPanel.tsx
// Descripción: Orquestador de los 6 bloques de Actividad del Responsable:
//              1. Filtros (Dispositivos y Período)
//              2. Bloqueos totales
//              3. Bloqueos por fuente (Franja horaria)
//              4. Apps (uso diario de apps de la lista de bloqueos)
//              5. Pasatiempos (desempeño, intentos y racha de protegidos)
//              6. Sitios y apps bloqueados
// ==============================================================================

import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CustomBlockedApp, DeviceInfo } from '../../../types';
import { BlockedAttemptRecord } from '../../../utils/activityMetrics';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import {
  AppUsageRawSnapshot,
  AppUsageTargetDevice,
  buildBlockedAppsUsageSummary,
} from '../../../utils/appUsageMetrics';
import {
  DailyPasatiemposRecord,
  buildResponsiblePasatiemposSummary,
} from '../../../utils/pasatiemposMetrics';
import { Header } from '../../Header';
import { PeriodOption, PeriodSelector } from './blocks/PeriodSelector';
import { DeviceSelector } from './blocks/DeviceSelector';
import { HeartbeatBanner } from './blocks/HeartbeatBanner';
import { TotalBlocksCard } from './blocks/TotalBlocksCard';
import { BlocksBySourceCard } from './blocks/BlocksBySourceCard';
import { ActivityChartCard } from './blocks/ActivityChartCard';
import { AppsUsageCard } from './blocks/AppsUsageCard';
import { PasatiemposSummaryCard } from './blocks/PasatiemposSummaryCard';
import { AuditEventsCard } from './blocks/AuditEventsCard';
import { useAnalyticsPanel } from './hooks/useAnalyticsPanel';
import {
  DEMO_BLOCKED_ATTEMPTS,
  DEMO_BYPASS_EVENTS,
  DEMO_DEVICES,
  DEMO_HOURLY_DATA,
  DEMO_WEEK_DATA,
} from './data';
import {
  AnalyticsDevice,
  AnalyticsPeriod,
  AttemptEvent,
  DayBlock,
  HourBlock,
} from './types';
import { cardStyles } from './card.styles';
import { styles } from './AnalyticsPanel.styles';

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
];

export interface AnalyticsPanelProps {
  devices?: AnalyticsDevice[];
  rawDevices?: DeviceInfo[];
  customApps?: CustomBlockedApp[];
  weekData?: DayBlock[];
  hourlyData?: HourBlock[];
  blockedAttempts?: AttemptEvent[];
  rawBlockedEvents?: BlockedAttemptRecord[];
  bypassEvents?: AttemptEvent[];
  appUsageSnapshots?: AppUsageRawSnapshot[];
  pasatiemposRecordsByDevice?: Record<string, DailyPasatiemposRecord>;
  pasatiemposStreakByDevice?: Record<string, number>;
  pasatiemposWeeklyPctByDevice?: Record<string, number>;
  allUptime?: string;
  onBack?: () => void;
  scrollable?: boolean;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  devices = DEMO_DEVICES,
  rawDevices = [],
  customApps = [],
  weekData = DEMO_WEEK_DATA,
  hourlyData = DEMO_HOURLY_DATA,
  blockedAttempts = DEMO_BLOCKED_ATTEMPTS,
  rawBlockedEvents,
  bypassEvents = DEMO_BYPASS_EVENTS,
  appUsageSnapshots = [],
  pasatiemposRecordsByDevice = {},
  pasatiemposStreakByDevice = {},
  pasatiemposWeeklyPctByDevice = {},
  allUptime = '100%',
  onBack,
  scrollable = true,
}) => {
  const panel = useAnalyticsPanel({
    devices,
    weekData,
    hourlyData,
    rawBlockedEvents,
    allUptime,
  });
  const [openDropdown, setOpenDropdown] = useState<'device' | 'period' | null>(null);
  const [historyBlockExpanded, setHistoryBlockExpanded] = useState<boolean>(true);

  const selectedDeviceLabel = useMemo(() => {
    if (panel.selectedDeviceId === 'all') return undefined;
    const match = panel.deviceOptions.find((d) => d.id === panel.selectedDeviceId);
    return match?.label;
  }, [panel.deviceOptions, panel.selectedDeviceId]);

  // Bloque 2: Tiempo de uso de las aplicaciones filtrado por dispositivo seleccionado
  const appsUsageSummary = useMemo(() => {
    const targetDevices: AppUsageTargetDevice[] = panel.deviceOptions.map(
      (dev, idx) => {
        const highlight = getDeviceHighlight(
          dev.id,
          dev.label,
          dev.label,
          dev.id === 'self' ? 0 : (dev.colorIndex ?? idx)
        );
        return {
          id: dev.id,
          label: dev.id === 'self' ? 'Yo' : dev.label,
          color: highlight.color,
        };
      }
    );

    const targetDeviceIds = targetDevices.map((d) => d.id);
    return buildBlockedAppsUsageSummary({
      customApps,
      usageSnapshots: appUsageSnapshots,
      deviceId: panel.selectedDeviceId,
      targetDeviceIds,
      targetDevices,
    });
  }, [customApps, appUsageSnapshots, panel.selectedDeviceId, panel.deviceOptions]);

  // Bloque 3: Pasatiempos de usuarios protegidos (Menores y Adultos) con métricas por dispositivo
  const pasatiemposSummary = useMemo(() => {
    const colorByDeviceId: Record<string, string> = {};
    panel.deviceOptions.forEach((dev, idx) => {
      const highlight = getDeviceHighlight(
        dev.id,
        dev.label,
        dev.label,
        dev.id === 'self' ? 0 : (dev.colorIndex ?? idx)
      );
      colorByDeviceId[dev.id] = highlight.color;
    });

    return buildResponsiblePasatiemposSummary({
      devices: rawDevices,
      recordsByDeviceId: pasatiemposRecordsByDevice,
      streakByDeviceId: pasatiemposStreakByDevice,
      weeklyQuizPctByDeviceId: pasatiemposWeeklyPctByDevice,
      colorByDeviceId,
      selectedDeviceId: panel.selectedDeviceId,
    });
  }, [
    rawDevices,
    pasatiemposRecordsByDevice,
    pasatiemposStreakByDevice,
    pasatiemposWeeklyPctByDevice,
    panel.deviceOptions,
    panel.selectedDeviceId,
  ]);

  // Subbloque 1c: Historial de toda la actividad filtrado por dispositivo seleccionado
  const filteredBlockedAttempts = useMemo(() => {
    if (panel.selectedDeviceId === 'all') return blockedAttempts;
    return blockedAttempts.filter(
      (ev) => !ev.deviceId || ev.deviceId === panel.selectedDeviceId
    );
  }, [blockedAttempts, panel.selectedDeviceId]);

  const filteredBypassEvents = useMemo(() => {
    if (panel.selectedDeviceId === 'all') return bypassEvents;
    return bypassEvents.filter(
      (ev) => !ev.deviceId || ev.deviceId === panel.selectedDeviceId
    );
  }, [bypassEvents, panel.selectedDeviceId]);

  const bodyContent = (
    <View style={styles.body}>
      {/* Filtros principales con títulos: Por persona y Por fecha */}
      <View style={styles.dropdownsRow}>
        <View style={styles.dropdownColDevice}>
          <Text style={styles.filterLabel}>Por persona</Text>
          <DeviceSelector
            options={panel.deviceOptions}
            selectedId={panel.selectedDeviceId}
            onSelect={(id) => {
              panel.setSelectedDeviceId(id);
              setOpenDropdown(null);
            }}
            allLabel={`Todos (${devices.length})`}
            isOpen={openDropdown === 'device'}
            onToggle={() =>
              setOpenDropdown((prev) => (prev === 'device' ? null : 'device'))
            }
          />
        </View>
        <View style={styles.dropdownColPeriod}>
          <Text style={styles.filterLabel}>Por fecha</Text>
          <PeriodSelector
            options={PERIOD_OPTIONS}
            value={panel.period}
            onChange={(value) => {
              panel.changePeriod(value as AnalyticsPeriod);
              setOpenDropdown(null);
            }}
            isOpen={openDropdown === 'period'}
            onToggle={() =>
              setOpenDropdown((prev) => (prev === 'period' ? null : 'period'))
            }
          />
        </View>
      </View>

      {panel.showAlert ? (
        <HeartbeatBanner alerts={panel.alertDevices} />
      ) : null}

      {/* Bloque 1: Historial de intentos de acceso a sitios y apps bloqueados (Acordeón con 3 subbloques) */}
      <View style={cardStyles.card}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setHistoryBlockExpanded((prev) => !prev)}
          accessibilityRole="button"
          accessibilityState={{ expanded: historyBlockExpanded }}
          style={[
            styles.accordionHeaderRow,
            !historyBlockExpanded && styles.accordionHeaderRowCollapsed,
          ]}
        >
          <Text style={styles.accordionTitle}>
            Historial de intentos de acceso a sitios y apps bloqueados
          </Text>
          <Text style={styles.accordionChevron}>
            {historyBlockExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {historyBlockExpanded ? (
          <View style={styles.subblocksStack}>
            {/* Subbloque 1a: Cantidad de intentos totales */}
            <TotalBlocksCard
              totalBlocks={panel.totalBlocks}
              historySeries={panel.historySeries}
              historyDateLabels={panel.historyDateLabels}
              embedded={true}
            />

            {/* Subbloque 1b: Cantidad de intentos según la lista */}
            <BlocksBySourceCard
              lotbaPct={panel.sourceLotbaPct}
              customPct={panel.sourceCustomPct}
              embedded={true}
            >
              <ActivityChartCard
                daySelector={panel.daySelector}
                selectedDayIndex={panel.selectedDayIndex}
                onSelectDay={panel.selectDay}
                peakInfo={panel.peakInfo}
                inspector={panel.inspector}
                chartBars={panel.chartBars}
                selectedChartIndex={panel.selectedChartIndex}
                onSelectChart={panel.onSelectChart}
                embedded={true}
              />
            </BlocksBySourceCard>

            {/* Subbloque 1c: Historial de toda la actividad */}
            <AuditEventsCard
              auditTab={panel.auditTab}
              onChangeAuditTab={panel.setAuditTab}
              blockedAttempts={filteredBlockedAttempts}
              bypassEvents={filteredBypassEvents}
              bypassCount={filteredBypassEvents.length}
              embedded={true}
            />
          </View>
        ) : null}
      </View>

      {/* Bloque 2: Tiempo de uso de las aplicaciones */}
      <AppsUsageCard
        summary={appsUsageSummary}
        variant="parent"
        selectedDeviceId={panel.selectedDeviceId}
        selectedDeviceLabel={selectedDeviceLabel}
      />

      {/* Bloque 3: Pasatiempos */}
      <PasatiemposSummaryCard summary={pasatiemposSummary} />
    </View>
  );

  if (!scrollable) {
    return (
      <View style={styles.root}>
        <Header title="Actividad del sistema" onBack={onBack} />
        {bodyContent}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header title="Actividad del sistema" onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 85 }]}
      >
        {bodyContent}
      </ScrollView>
    </View>
  );
};
