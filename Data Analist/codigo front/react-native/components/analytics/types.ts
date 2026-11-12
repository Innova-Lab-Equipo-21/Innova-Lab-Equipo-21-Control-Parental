// ==============================================================================
// Proyecto: BA Protege+
// Componente: Panel de Analítica (Tipos y Modelos de Datos)
// Archivo: components/analytics/types.ts
// Descripción: Tipos reutilizables del panel de analítica. Mantienen la UI
//              desacoplada de la capa de datos para permitir cualquier origen
//              (API, mock, estado local).
// ==============================================================================

/** Vista del gráfico de actividad: distribución por día o franja horaria. */
export type ChartView = 'daily' | 'hourly';

/** Estado operativo de un dispositivo (dot de color en el chip). */
export type DeviceStatus = 'online' | 'warning' | 'offline';

/** Fuente de un evento de bloqueo. */
export type SourceType = 'lotba' | 'custom' | 'bypass';

/** Pestaña activa en el bloque de auditoría. */
export type AuditTab = 'urls' | 'bypass';

/** Período seleccionado en el selector superior. */
export type AnalyticsPeriod = 'week' | 'today' | 'month';

/**
 * Dispositivo protegido del responsable, con su agregado de bloqueos y su
 * estado de salud operativa.
 */
export interface AnalyticsDevice {
  id: string;
  /** Etiqueta completa mostrada en el chip, ej. "Celular de Tomás". */
  label: string;
  /** Nombre corto usado en el desglose, ej. "Tomás". */
  shortLabel: string;
  status: DeviceStatus;
  /** Total de intentos frenados del dispositivo. */
  total: number;
  /** Bloqueos provenientes de Lista LOTBA. */
  lotba: number;
  /** Bloqueos provenientes de Lista Personalizada. */
  custom: number;
  /** Continuidad de protección formateada, ej. "98.4%". */
  uptime: string;
  /** Marca si este dispositivo dispara la alerta de heartbeat. */
  showAlert: boolean;
  alertText?: string;
  alertTag?: string;
  /** Multiplicador aplicado a la distribución para derivar el dataset filtrado. */
  mult: number;
}

/** Bloque de bloqueos de un día de la semana. */
export interface DayBlock {
  short: string;
  full: string;
  lotba: number;
  custom: number;
  isPeak?: boolean;
}

/** Bloque de bloqueos de una franja horaria (1 hora). */
export interface HourBlock {
  label: string;
  lotba: number;
  custom: number;
  isPeak?: boolean;
}

/** Evento individual mostrado en la lista de auditoría. */
export interface AttemptEvent {
  id: string;
  title: string;
  meta: string;
  source: SourceType;
  /** Texto del badge cuando no se usa el label por defecto (ej. "VPN_STOP"). */
  badgeLabel?: string;
}

/** Elemento del desglose de bloqueos por dispositivo. */
export interface DeviceBreakdownItem {
  label: string;
  count: number;
  pct: number;
}

/** Barra individual del gráfico apilado (ya escalada por el hook). */
export interface ChartBar {
  lotba: number;
  custom: number;
  isPeak?: boolean;
  /** Texto del "crown" de pico, ej. "PICO" o "20h". */
  peakLabel?: string;
  /** Etiqueta corta del eje X, ej. "Lun" o "20h". */
  label?: string;
  /** Etiqueta completa usada en el inspector, ej. "Lunes". */
  fullLabel?: string;
}
