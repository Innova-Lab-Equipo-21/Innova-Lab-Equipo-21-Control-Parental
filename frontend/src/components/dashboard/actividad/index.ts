// ==============================================================================
// Proyecto: BA Protege+
// Componente: Panel de Analítica — Barrel de exports
// Archivo: src/components/dashboard/actividad/index.ts
// Descripción: Punto de entrada público del módulo de analítica. Exporta los
//              bloques compuestos, los componentes atómicos reutilizables, los
//              hooks, los tipos y las estructuras vacías base.
// ==============================================================================

// Orquestador
export { AnalyticsPanel, PERIOD_OPTIONS } from './AnalyticsPanel';
export type { AnalyticsPanelProps } from './AnalyticsPanel';

// Bloques compuestos
export { PeriodSelector } from './blocks/PeriodSelector';
export type { PeriodOption } from './blocks/PeriodSelector';
export { DeviceSelector } from './blocks/DeviceSelector';
export type { DeviceSelectorOption, DeviceSelectorProps } from './blocks/DeviceSelector';
export { HeartbeatBanner } from './blocks/HeartbeatBanner';
export type { HeartbeatAlertItem, HeartbeatBannerProps } from './blocks/HeartbeatBanner';
export { TotalBlocksCard } from './blocks/TotalBlocksCard';
export { BlocksBySourceCard } from './blocks/BlocksBySourceCard';
export { ActivityChartCard } from './blocks/ActivityChartCard';
export { AppsUsageCard } from './blocks/AppsUsageCard';
export type { AppsUsageCardProps, AppsUsageVariant } from './blocks/AppsUsageCard';
export { PasatiemposSummaryCard } from './blocks/PasatiemposSummaryCard';
export type { PasatiemposSummaryCardProps } from './blocks/PasatiemposSummaryCard';
export { AuditEventsCard } from './blocks/AuditEventsCard';

// Componentes atómicos reutilizables
export { SegmentedTabs } from './atomic/SegmentedTabs';
export type { SegmentedTabItem, SegmentedTabsProps } from './atomic/SegmentedTabs';
export { SourceBadge } from './atomic/SourceBadge';
export { StackedBarChart } from './atomic/StackedBarChart';
export type { StackedBarChartProps } from './atomic/StackedBarChart';

// Hooks y estado
export { useAnalyticsPanel } from './hooks/useAnalyticsPanel';
export type {
  InspectorInfo,
  UseAnalyticsPanelParams,
  UseAnalyticsPanelResult,
} from './hooks/useAnalyticsPanel';
export { useRealAnalyticsData } from './useRealAnalyticsData';
export type {
  UseRealAnalyticsDataParams,
  RealAnalyticsDataResult,
} from './useRealAnalyticsData';

// Tipos y tokens
export * from './types';
export { analyticsPalette } from './palette';

// Estructuras vacías base (sin datos ficticios)
export { EMPTY_WEEK_DATA, EMPTY_HOURLY_DATA } from './data';
