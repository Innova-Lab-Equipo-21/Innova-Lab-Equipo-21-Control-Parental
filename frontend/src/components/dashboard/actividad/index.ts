// ==============================================================================
// Proyecto: BA Protege+
// Componente: Panel de Analítica — Barrel de exports
// Archivo: src/components/dashboard/actividad/index.ts
// Descripción: Punto de entrada público del módulo de analítica. Exporta los
//              bloques compuestos, los componentes atómicos reutilizables, el
//              hook, los tipos y los datos de demostración.
// ==============================================================================

// Orquestador
export { AnalyticsPanel, PERIOD_OPTIONS } from './AnalyticsPanel';
export type { AnalyticsPanelProps } from './AnalyticsPanel';

// Bloques compuestos
export { BrandHeader } from './blocks/BrandHeader';
export { PanelHeader } from './blocks/PanelHeader';
export { PeriodSelector } from './blocks/PeriodSelector';
export type { PeriodOption } from './blocks/PeriodSelector';
export { DeviceSelector } from './blocks/DeviceSelector';
export type { DeviceSelectorOption, DeviceSelectorProps } from './blocks/DeviceSelector';
export { DeviceChipsRow } from './blocks/DeviceChipsRow';
export type { DeviceChipOption } from './blocks/DeviceChipsRow';
export { HeartbeatBanner } from './blocks/HeartbeatBanner';
export { TotalBlocksCard } from './blocks/TotalBlocksCard';
export { BlocksBySourceCard } from './blocks/BlocksBySourceCard';
export { ActivityChartCard } from './blocks/ActivityChartCard';
export { AuditEventsCard } from './blocks/AuditEventsCard';

// Componentes atómicos reutilizables
export { PillChip } from './atomic/PillChip';
export type { PillChipProps, StatusDotColor } from './atomic/PillChip';
export { SegmentedTabs } from './atomic/SegmentedTabs';
export type { SegmentedTabItem, SegmentedTabsProps } from './atomic/SegmentedTabs';
export { SourceBadge } from './atomic/SourceBadge';
export { StackedBarChart } from './atomic/StackedBarChart';
export type { StackedBarChartProps } from './atomic/StackedBarChart';

// Hook y estado
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

// Datos de demostración
export {
  TEAM_TOTAL,
  DEMO_DEVICES,
  DEMO_WEEK_DATA,
  DEMO_HOURLY_DATA,
  DEMO_BLOCKED_ATTEMPTS,
  DEMO_BYPASS_EVENTS,
} from './data';
