// ==============================================================================
// Proyecto: BA Protege+
// Componente: Panel de Analítica (Tipos y Modelos de Datos)
// Archivo: src/components/dashboard/actividad/types.ts
// Descripción: Tipos reutilizables del panel de analítica. Mantienen la UI
//              desacoplada de la capa de datos para permitir cualquier origen
//              (API, mock, estado local).
// ==============================================================================

/** Estado operativo de un dispositivo (dot de color en el selector). */
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
  /** Índice de color asignado en Dispositivos para ícono y color consistente. */
  colorIndex?: number;
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
  /** Tipo de recurso bloqueado: sitio web o aplicación. */
  itemType?: 'site' | 'app';
  /** Fecha y hora formateada (Hoy / Ayer / dd/mm/aaaa · hh:mm). */
  formattedDateTime?: string;
  /** Texto del badge cuando no se usa el label por defecto (ej. "VPN_STOP"). */
  badgeLabel?: string;
  deviceId?: string;
  /** Timestamp ISO en que el Responsable marcó la alerta como leída (persistido en BD). */
  readAt?: string | null;
}

/** Serie temporal de intentos bloqueados por dispositivo para el gráfico de historial. */
export interface DeviceHistorySeries {
  id: string;
  label: string;
  color: string;
  /** Conteo de intentos por punto temporal del período seleccionado. */
  values: number[];
}

/** Barra individual del gráfico apilado (ya escalada por el hook). */
export interface ChartBar {
  lotba: number;
  custom: number;
  isPeak?: boolean;
  isToday?: boolean;
  /** Texto del "crown" de pico, ej. "PICO" o "20h". */
  peakLabel?: string;
  /** Etiqueta corta del eje X, ej. "Lun" o "20h". */
  label?: string;
  /** Etiqueta completa usada en el inspector, ej. "Lunes". */
  fullLabel?: string;
}
