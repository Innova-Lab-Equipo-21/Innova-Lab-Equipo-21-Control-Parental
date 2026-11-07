// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivitySection (Orquestador de la Pestaña Actividad — Modo Responsable)
// Archivo: src/components/dashboard/actividad/ActivitySection.tsx
// Descripción: Orquesta el panel ejecutivo de métricas de Actividad en 5 bloques
//              modulares + 3 modales bottom-sheet:
//              1) ActivityFiltersBar: Dispositivos y Período (Semana, Mes, Año, Total)
//              2) TotalBlocksCard: Bloqueos totales y variación porcentual
//              3) BlocksBySourceCard: Bloqueos por fuente (Lista LOTBA vs. Personalizada)
//              4) HourlyAttemptsCard: Franja horaria de intentos (24h + hora pico)
//              5) RecentAttemptsCard: Últimos intentos bloqueados + Modal "Ver todo"
// ==============================================================================

import React from 'react';
import { View } from 'react-native';
import {
  CustomBlockedApp,
  CustomBlockedDomain,
  DeviceInfo,
  SelfControlState,
} from '../../../types';
import { useActivityDashboard } from './hooks/useActivityDashboard';
import { ActivityFiltersBar } from './ActivityFiltersBar';
import { TotalBlocksCard } from './TotalBlocksCard';
import { BlocksBySourceCard } from './BlocksBySourceCard';
import { HourlyAttemptsCard } from './HourlyAttemptsCard';
import { RecentAttemptsCard } from './RecentAttemptsCard';
import { DeviceFilterSheetModal } from './DeviceFilterSheetModal';
import { PeriodFilterSheetModal } from './PeriodFilterSheetModal';
import { AllBlockedAttemptsModal } from './AllBlockedAttemptsModal';
import { styles } from './ActivitySection.styles';

export interface ActivityLogItem {
  id: string;
  type: 'BLOCK' | 'ALERT' | 'SYSTEM' | 'LOCATION';
  title: string;
  detail: string;
  device: string;
  timestamp: string;
}

export interface ActivitySectionProps {
  devices?: DeviceInfo[];
  customSites?: CustomBlockedDomain[];
  customApps?: CustomBlockedApp[];
  currentUser?: any;
  selfControl?: SelfControlState;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  devices = [],
  customSites = [],
  customApps = [],
}) => {
  const {
    selectedDeviceId,
    setSelectedDeviceId,
    selectedPeriod,
    setSelectedPeriod,
    deviceOptions,
    activeDeviceOption,
    activeDeviceColor,
    metrics,
    inspectedHour,
    inspectedBucket,
    toggleInspectedHour,
    showDeviceModal,
    setShowDeviceModal,
    showPeriodModal,
    setShowPeriodModal,
    showAllAttemptsModal,
    setShowAllAttemptsModal,
  } = useActivityDashboard({
    devices,
    customSites,
    customApps,
  });

  return (
    <View style={styles.wrapper}>
      {/* 1. Bloque Filtros: Dispositivos y Período */}
      <ActivityFiltersBar
        activeDeviceOption={activeDeviceOption}
        activeDeviceColor={activeDeviceColor}
        selectedPeriod={selectedPeriod}
        onOpenDeviceModal={() => setShowDeviceModal(true)}
        onOpenPeriodModal={() => setShowPeriodModal(true)}
      />

      {/* 2. Bloque Bloqueos totales */}
      <TotalBlocksCard
        formattedTotalBlocks={metrics.formattedTotalBlocks}
        changeDirection={metrics.changeDirection}
        changeBadgeText={metrics.changeBadgeText}
      />

      {/* 3. Bloque Bloqueos por fuente */}
      <BlocksBySourceCard
        totalBlocks={metrics.totalBlocks}
        sources={metrics.sources}
      />

      {/* 4. Bloque Franja horaria de intentos */}
      <HourlyAttemptsCard
        hourly={metrics.hourly}
        maxHourlyTotal={metrics.maxHourlyTotal}
        peakHour={metrics.peakHour}
        inspectedHour={inspectedHour}
        inspectedBucket={inspectedBucket}
        onToggleInspectedHour={toggleInspectedHour}
      />

      {/* 5. Bloque Últimos intentos bloqueados */}
      <RecentAttemptsCard
        recentAttempts={metrics.recentAttempts}
        hasAnyAttempts={metrics.allFilteredAttempts.length > 0}
        onSeeAll={() => setShowAllAttemptsModal(true)}
      />

      {/* Modales Bottom-Sheet */}
      <DeviceFilterSheetModal
        visible={showDeviceModal}
        deviceOptions={deviceOptions}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={setSelectedDeviceId}
        onClose={() => setShowDeviceModal(false)}
      />

      <PeriodFilterSheetModal
        visible={showPeriodModal}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        onClose={() => setShowPeriodModal(false)}
      />

      <AllBlockedAttemptsModal
        visible={showAllAttemptsModal}
        deviceLabel={activeDeviceOption.label}
        selectedPeriod={selectedPeriod}
        formattedTotalBlocks={metrics.formattedTotalBlocks}
        attempts={metrics.allFilteredAttempts}
        onClose={() => setShowAllAttemptsModal(false)}
      />
    </View>
  );
};
