// ==============================================================================
// Proyecto: BA Protege+
// Componente: AnalyticsPanel (Panel de Analítica completo)
// Archivo: src/components/dashboard/actividad/AnalyticsPanel.tsx
// Descripción: Orquestador del panel de analítica "Propuesta Superadora MVP".
//              Compone la cabecera, el selector de dispositivos, los KPIs, el
//              gráfico interactivo y la auditoría en bloques reutilizables.
//              Recibe los datos por props (con datos demo por defecto) para
//              mantenerse desacoplado del backend.
// ==============================================================================

import React from 'react';
import { ScrollView, View } from 'react-native';
import { Header } from '../../Header';
import { PeriodOption, PeriodSelector } from './blocks/PeriodSelector';
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
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
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
  hideBrandHeader?: boolean;
  hidePanelHeader?: boolean;
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
  hideBrandHeader = false,
  hidePanelHeader = false,
}) => {
  const panel = useAnalyticsPanel({ devices, weekData, hourlyData, allUptime });

  const content = (
    <>
      <Header
        title="Actividad del sistema"
        subtitle="Auditoría de bloqueos y eventos de protección"
        onBack={onBack}
        rightElement={
          <PeriodSelector
            options={PERIOD_OPTIONS}
            value={panel.period}
            onChange={(value) => panel.changePeriod(value as AnalyticsPeriod)}
          />
        }
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
        >
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
            embedded={true}
          />
        </BlocksBySourceCard>

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
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: 85 }]}>
      {content}
    </ScrollView>
  );
};
