// ==============================================================================
// Proyecto: BA Protege+
// Componente: AnalyticsPanel (Panel de Analítica completo)
// Archivo: components/analytics/AnalyticsPanel.tsx
// Descripción: Orquestador del panel de analítica "Propuesta Superadora MVP".
//              Compone la cabecera, el selector de dispositivos, los KPIs, el
//              gráfico interactivo y la auditoría en bloques reutilizables.
//              Recibe los datos por props (con datos demo por defecto) para
//              mantenerse desacoplado del backend.
// ==============================================================================

import React from 'react';
import { ScrollView, View } from 'react-native';
import { BrandHeader } from './blocks/BrandHeader';
import { PanelHeader } from './blocks/PanelHeader';
import { PeriodOption } from './blocks/PeriodSelector';
import { DeviceChipsRow } from './blocks/DeviceChipsRow';
import { HeartbeatBanner } from './blocks/HeartbeatBanner';
import { TotalBlocksCard } from './blocks/TotalBlocksCard';
import { BlocksBySourceCard } from './blocks/BlocksBySourceCard';
import { ActivityChartCard } from './blocks/ActivityChartCard';
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
import { styles } from './AnalyticsPanel.styles';

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 'week', label: 'Esta semana' },
  { value: 'today', label: 'Hoy' },
  { value: 'month', label: 'Este mes' },
];

export interface AnalyticsPanelProps {
  devices?: AnalyticsDevice[];
  weekData?: DayBlock[];
  hourlyData?: HourBlock[];
  blockedAttempts?: AttemptEvent[];
  bypassEvents?: AttemptEvent[];
  blocklistVersion?: string;
  allUptime?: string;
  onBack?: () => void;
  scrollable?: boolean;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  devices = DEMO_DEVICES,
  weekData = DEMO_WEEK_DATA,
  hourlyData = DEMO_HOURLY_DATA,
  blockedAttempts = DEMO_BLOCKED_ATTEMPTS,
  bypassEvents = DEMO_BYPASS_EVENTS,
  blocklistVersion = 'v24.11',
  allUptime = '98.4%',
  onBack,
  scrollable = true,
}) => {
  const panel = useAnalyticsPanel({ devices, weekData, hourlyData, allUptime });

  const content = (
    <>
      <BrandHeader blocklistVersion={blocklistVersion} />

      <PanelHeader
        onBack={onBack}
        periodOptions={PERIOD_OPTIONS}
        period={panel.period}
        onPeriodChange={(value) => panel.changePeriod(value as AnalyticsPeriod)}
      />

      <View style={styles.body}>
        <DeviceChipsRow
          options={panel.deviceOptions}
          selectedId={panel.selectedDeviceId}
          onSelect={panel.setSelectedDeviceId}
          allLabel={`Todos (${devices.length})`}
        />

        {panel.showAlert ? (
          <HeartbeatBanner text={panel.alertText ?? ''} tag={panel.alertTag} />
        ) : null}

        <TotalBlocksCard
          totalBlocks={panel.totalBlocks}
          uptime={panel.uptime}
          breakdown={panel.breakdown}
        />

        <BlocksBySourceCard
          lotbaCount={panel.lotbaCount}
          customCount={panel.customCount}
          lotbaPct={panel.sourceLotbaPct}
          customPct={panel.sourceCustomPct}
        />

        <ActivityChartCard
          chartView={panel.chartView}
          onChangeChartView={panel.setChartView}
          daySelector={panel.daySelector}
          selectedDayIndex={panel.selectedDayIndex}
          onSelectDay={panel.selectDay}
          peakInfo={panel.peakInfo}
          inspector={panel.inspector}
          chartBars={panel.chartBars}
          selectedChartIndex={panel.selectedChartIndex}
          onSelectChart={panel.onSelectChart}
        />

        <AuditEventsCard
          auditTab={panel.auditTab}
          onChangeAuditTab={panel.setAuditTab}
          blockedAttempts={blockedAttempts}
          bypassEvents={bypassEvents}
          bypassCount={bypassEvents.length}
        />
      </View>
    </>
  );

  if (!scrollable) {
    return <View style={styles.root}>{content}</View>;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {content}
    </ScrollView>
  );
};
