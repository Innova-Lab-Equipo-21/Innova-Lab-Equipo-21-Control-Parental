// ==============================================================================
// Proyecto: BA Protege+
// Módulo: Motor de Métricas de Actividad (Modo Responsable)
// Archivo: src/utils/activityMetrics.ts
// Descripción: Lógica pura para calcular las métricas de la pestaña Actividad:
//              1) Filtros por Dispositivo (Todos, Mi dispositivo, Dispositivos A..N)
//                 y Período (Semana, Mes, Año, Total)
//              2) Bloqueos totales y variación porcentual vs. período previo
//              3) Bloqueos por fuente (Lista LOTBA vs. Personalizada)
//              4) Franja horaria de intentos (24 horas, hora pico y desglose)
//              5) Últimos intentos bloqueados (dominio/app, dispositivo, hace cuánto, fuente)
// ==============================================================================

import { DeviceInfo } from '../types';
import { getDeviceFirstName } from './authValidation';

export type ActivityPeriod = 'week' | 'month' | 'year' | 'total';

export type AttemptSourceType = 'LOTBA' | 'CUSTOM';

export interface ActivityPeriodOption {
  key: ActivityPeriod;
  label: string;
  description: string;
}

export const ACTIVITY_PERIOD_OPTIONS: ActivityPeriodOption[] = [
  {
    key: 'week',
    label: 'Semana',
    description: 'Últimos 7 días vs. semana previa',
  },
  {
    key: 'month',
    label: 'Mes',
    description: 'Últimos 30 días vs. mes previo',
  },
  {
    key: 'year',
    label: 'Año',
    description: 'Últimos 12 meses vs. año previo',
  },
  {
    key: 'total',
    label: 'Total',
    description: 'Acumulado histórico registrado',
  },
];

export interface ActivityDeviceFilterOption {
  id: string;
  label: string;
  subtitle: string;
  isSelf: boolean;
  isAll: boolean;
  colorIndex?: number;
}

export type BlockedItemType = 'site' | 'app';

export interface BlockedAttemptRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  attemptedDomain: string;
  sourceListType: AttemptSourceType;
  itemType?: BlockedItemType;
  blockedAt: string;
  count?: number;
}

export interface HourlyAttemptBucket {
  hour: number;
  lotba: number;
  custom: number;
  total: number;
}

export interface FormattedBlockedAttempt {
  id: string;
  deviceId: string;
  deviceName: string;
  attemptedDomain: string;
  sourceListType: AttemptSourceType;
  sourceLabel: 'LOTBA' | 'Personalizada';
  itemType: BlockedItemType;
  displayTitle: string;
  blockedAt: string;
  timestampMs: number;
  relativeTime: string;
  formattedDateTime: string;
  count: number;
}

export interface ActivityMetricsSnapshot {
  deviceId: string;
  period: ActivityPeriod;
  totalBlocks: number;
  formattedTotalBlocks: string;
  previousBlocks: number | null;
  changePercentage: number | null;
  changeDirection: 'up' | 'down' | 'neutral';
  changeBadgeText: string;
  sources: {
    lotba: {
      count: number;
      formattedCount: string;
      pct: number;
    };
    custom: {
      count: number;
      formattedCount: string;
      pct: number;
    };
  };
  hourly: HourlyAttemptBucket[];
  maxHourlyTotal: number;
  peakHour: {
    hour: number;
    endHour: number;
    total: number;
    formattedTotal: string;
    lotba: number;
    custom: number;
    rangeLabel: string;
    fullLabel: string;
  } | null;
  recentAttempts: FormattedBlockedAttempt[];
  allFilteredAttempts: FormattedBlockedAttempt[];
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Formatea enteros con separador de miles '.' al estilo es-AR (ej. 1250 -> "1.250").
 */
export function formatMetricNumber(value: number): string {
  const safe = Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
  return safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Normaliza cualquier identificador de origen a 'LOTBA' o 'CUSTOM'.
 */
export function normalizeAttemptSource(raw?: string | null): AttemptSourceType {
  if (!raw) return 'LOTBA';
  const upper = raw.trim().toUpperCase();
  if (
    upper === 'CUSTOM' ||
    upper === 'CUSTOM_APP' ||
    upper === 'PERSONALIZADA' ||
    upper === 'RESPONSABLE' ||
    upper === 'ADULTO_PROTEGIDO'
  ) {
    return 'CUSTOM';
  }
  return 'LOTBA';
}

/**
 * Determina si el evento corresponde a una app o a un sitio web.
 */
export function inferBlockedItemType(
  attemptedDomain: string,
  sourceListType?: string | null,
  explicitType?: BlockedItemType
): BlockedItemType {
  if (explicitType === 'app' || explicitType === 'site') return explicitType;
  const rawSource = (sourceListType || '').trim().toUpperCase();
  const target = (attemptedDomain || '').trim().toLowerCase();
  if (
    rawSource.endsWith('_APP') ||
    target.includes('(app)') ||
    target.startsWith('app:') ||
    target === 'app no autorizada'
  ) {
    return 'app';
  }
  return 'site';
}

/**
 * Devuelve el título visible para un intento bloqueado:
 * - Si pertenece a la lista LOTBA: "Sitio no autorizado" o "App no autorizada".
 * - Si pertenece a la Lista Personalizada: muestra el sitio o app normalmente.
 */
export function getDisplayTitleForBlockedAttempt(
  attemptedDomain: string,
  sourceListType: AttemptSourceType,
  itemType: BlockedItemType = 'site'
): string {
  if (sourceListType === 'LOTBA') {
    return itemType === 'app' ? 'App no autorizada' : 'Sitio no autorizado';
  }
  return attemptedDomain;
}

/**
 * Formatea fecha (dd/mm/aaaa | Hoy | Ayer) y horario (hh:mm) de una tentativa de acceso.
 * Ejemplos:
 * - "Hoy · 21:14"
 * - "Ayer · 18:02"
 * - "21/11/2026 · 23:40"
 */
export function formatAttemptDateTime(
  blockedAtIso: string,
  nowMs: number = Date.now()
): string {
  const date = new Date(blockedAtIso);
  if (!Number.isFinite(date.getTime())) return 'Hoy · 00:00';

  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${mins}`;

  const now = new Date(nowMs);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfEventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfEventDay) / DAY_MS);

  if (diffDays === 0) {
    return `Hoy · ${timeStr}`;
  }
  if (diffDays === 1) {
    return `Ayer · ${timeStr}`;
  }

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy} · ${timeStr}`;
}

/**
 * Devuelve la etiqueta legible del período seleccionado.
 */
export function getActivityPeriodLabel(period: ActivityPeriod): string {
  const found = ACTIVITY_PERIOD_OPTIONS.find((opt) => opt.key === period);
  return found ? found.label : 'Semana';
}

/**
 * Calcula los límites temporales (ventana actual y ventana previa equivalente)
 * según el período seleccionado.
 */
export function getPeriodWindowMs(
  period: ActivityPeriod,
  nowMs: number = Date.now()
): {
  currentStartMs: number;
  currentEndMs: number;
  previousStartMs: number | null;
  previousEndMs: number | null;
  comparisonSuffix: string | null;
} {
  switch (period) {
    case 'week':
      return {
        currentStartMs: nowMs - 7 * DAY_MS,
        currentEndMs: nowMs,
        previousStartMs: nowMs - 14 * DAY_MS,
        previousEndMs: nowMs - 7 * DAY_MS,
        comparisonSuffix: 'vs. semana previa',
      };
    case 'month':
      return {
        currentStartMs: nowMs - 30 * DAY_MS,
        currentEndMs: nowMs,
        previousStartMs: nowMs - 60 * DAY_MS,
        previousEndMs: nowMs - 30 * DAY_MS,
        comparisonSuffix: 'vs. mes previo',
      };
    case 'year':
      return {
        currentStartMs: nowMs - 365 * DAY_MS,
        currentEndMs: nowMs,
        previousStartMs: nowMs - 730 * DAY_MS,
        previousEndMs: nowMs - 365 * DAY_MS,
        comparisonSuffix: 'vs. año previo',
      };
    case 'total':
    default:
      return {
        currentStartMs: 0,
        currentEndMs: nowMs,
        previousStartMs: null,
        previousEndMs: null,
        comparisonSuffix: null,
      };
  }
}

/**
 * Formatea una marca de tiempo ISO de forma relativa ("hace 4 min", "hace 1 h", etc.).
 */
export function formatRelativeAttemptTime(
  blockedAtIso: string,
  nowMs: number = Date.now()
): string {
  const ts = new Date(blockedAtIso).getTime();
  if (!Number.isFinite(ts)) return 'reciente';

  const diffMs = Math.max(0, nowMs - ts);
  const mins = Math.floor(diffMs / MINUTE_MS);
  if (mins < 1) return 'hace instantes';
  if (mins < 60) return `hace ${mins} min`;

  const hours = Math.floor(diffMs / HOUR_MS);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(diffMs / DAY_MS);
  if (days < 7) return `hace ${days} d`;

  const weeks = Math.floor(days / 7);
  if (days < 30) return `hace ${weeks} sem`;

  const months = Math.floor(days / 30);
  if (days < 365) return `hace ${months} mes.`;

  const years = Math.max(1, Math.floor(days / 365));
  return `hace ${years} a`;
}

/**
 * Construye las opciones del selector de Dispositivos:
 * - Todos (con el conteo total de dispositivos monitoreados)
 * - Yo (dispositivo del responsable, siempre de primero)
 * - Dispositivos protegidos vinculados ordenados alfabéticamente (A-Z) con solo el primer nombre
 */
export function buildDeviceFilterOptions(
  devices: DeviceInfo[] = [],
  includeSelf: boolean = true
): ActivityDeviceFilterOption[] {
  const protectedDevices = devices
    .filter((d) => d.deviceId !== 'self' && d.profileType !== 'Responsable')
    .map((dev, idx) => {
      const id = dev.deviceId || dev.deviceUuid || `dev-${idx}`;
      const rawName = dev.childName || dev.deviceName || `Dispositivo ${idx + 1}`;
      const label = getDeviceFirstName(rawName);
      const roleLabel =
        dev.profileType === 'Adulto' ? 'Protegido adulto' : 'Protegido menor';
      return {
        id,
        label,
        subtitle: roleLabel,
        isSelf: false,
        isAll: false,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));

  const totalCount = protectedDevices.length + (includeSelf ? 1 : 0);
  const options: ActivityDeviceFilterOption[] = [
    {
      id: 'all',
      label: 'Todos',
      subtitle:
        totalCount === 1 ? '1 dispositivo' : `${totalCount} dispositivos`,
      isSelf: false,
      isAll: true,
    },
  ];

  if (includeSelf) {
    options.push({
      id: 'self',
      label: 'Yo',
      subtitle: 'Dispositivo del responsable',
      isSelf: true,
      isAll: false,
      colorIndex: 0,
    });
  }

  options.push(...protectedDevices);
  return options;
}

/**
 * Formatea el rango horario de una hora (0..23), p.ej. 20 -> "20 a 21 h".
 */
export function formatHourRangeLabel(hour: number): string {
  const safeHour = ((Math.floor(hour) % 24) + 24) % 24;
  const nextHour = safeHour + 1;
  return `${safeHour} a ${nextHour} h`;
}

/**
 * Calcula de forma exacta todas las métricas para los 4 bloques de Actividad
 * a partir del conjunto de eventos filtrados por dispositivo y período.
 */
export function computeActivityMetrics(
  records: BlockedAttemptRecord[],
  params: {
    deviceId?: string;
    period?: ActivityPeriod;
    nowMs?: number;
    recentLimit?: number;
  } = {}
): ActivityMetricsSnapshot {
  const deviceId = params.deviceId || 'all';
  const period: ActivityPeriod = params.period || 'week';
  const nowMs = params.nowMs ?? Date.now();
  const recentLimit = params.recentLimit ?? 4;

  const {
    currentStartMs,
    currentEndMs,
    previousStartMs,
    previousEndMs,
    comparisonSuffix,
  } = getPeriodWindowMs(period, nowMs);

  const matchesDevice = (rec: BlockedAttemptRecord) =>
    deviceId === 'all' || rec.deviceId === deviceId;

  const currentRecords: Array<BlockedAttemptRecord & { ts: number }> = [];
  let previousBlocksTotal = 0;

  for (const rec of records) {
    if (!matchesDevice(rec)) continue;
    const ts = new Date(rec.blockedAt).getTime();
    if (!Number.isFinite(ts)) continue;
    const weight = Math.max(1, Math.round(rec.count ?? 1));

    if (ts >= currentStartMs && ts <= currentEndMs) {
      currentRecords.push({ ...rec, ts });
    } else if (
      previousStartMs !== null &&
      previousEndMs !== null &&
      ts >= previousStartMs &&
      ts < previousEndMs
    ) {
      previousBlocksTotal += weight;
    }
  }

  // 1 & 2. Bloqueos totales y Bloqueos por fuente
  let totalBlocks = 0;
  let lotbaCount = 0;
  let customCount = 0;

  // 3. Franja horaria de intentos (0..23 h)
  const hourly: HourlyAttemptBucket[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    lotba: 0,
    custom: 0,
    total: 0,
  }));

  for (const rec of currentRecords) {
    const weight = Math.max(1, Math.round(rec.count ?? 1));
    const source = normalizeAttemptSource(rec.sourceListType);
    const hour = new Date(rec.ts).getHours();

    totalBlocks += weight;
    if (source === 'CUSTOM') {
      customCount += weight;
      hourly[hour].custom += weight;
    } else {
      lotbaCount += weight;
      hourly[hour].lotba += weight;
    }
    hourly[hour].total += weight;
  }

  // Variación respecto del período anterior
  let previousBlocks: number | null = null;
  let changePercentage: number | null = null;
  let changeDirection: 'up' | 'down' | 'neutral' = 'neutral';
  let changeBadgeText = 'Acumulado histórico';

  if (comparisonSuffix !== null) {
    previousBlocks = previousBlocksTotal;
    if (previousBlocksTotal > 0) {
      changePercentage = Math.round(
        ((totalBlocks - previousBlocksTotal) / previousBlocksTotal) * 100
      );
    } else {
      changePercentage = totalBlocks > 0 ? 100 : 0;
    }

    if (changePercentage > 0) {
      changeDirection = 'up';
      changeBadgeText = `+${changePercentage}% ${comparisonSuffix}`;
    } else if (changePercentage < 0) {
      changeDirection = 'down';
      changeBadgeText = `${changePercentage}% ${comparisonSuffix}`;
    } else {
      changeDirection = 'neutral';
      changeBadgeText = `0% ${comparisonSuffix}`;
    }
  }

  // Porcentajes por fuente (garantizando suma exacta de 100% cuando totalBlocks > 0)
  let lotbaPct = 0;
  let customPct = 0;
  if (totalBlocks > 0) {
    if (lotbaCount === 0) {
      lotbaPct = 0;
      customPct = 100;
    } else if (customCount === 0) {
      lotbaPct = 100;
      customPct = 0;
    } else {
      lotbaPct = Math.max(
        1,
        Math.min(99, Math.round((lotbaCount / totalBlocks) * 100))
      );
      customPct = 100 - lotbaPct;
    }
  }

  // Hora pico (0..23 h)
  const maxHourlyTotal = Math.max(0, ...hourly.map((b) => b.total));
  let peakHour: ActivityMetricsSnapshot['peakHour'] = null;

  if (maxHourlyTotal > 0) {
    const best = hourly.reduce((acc, curr) =>
      curr.total > acc.total ? curr : acc
    );
    const rangeLabel = formatHourRangeLabel(best.hour);
    const formattedTotal = formatMetricNumber(best.total);
    peakHour = {
      hour: best.hour,
      endHour: best.hour + 1,
      total: best.total,
      formattedTotal,
      lotba: best.lotba,
      custom: best.custom,
      rangeLabel,
      fullLabel: `Pico: ${rangeLabel} (${formattedTotal})`,
    };
  }

  // 4. Últimos intentos bloqueados (ordenados del más reciente al más antiguo)
  const sortedAttempts: FormattedBlockedAttempt[] = [...currentRecords]
    .sort((a, b) => b.ts - a.ts)
    .map((rec) => {
      const source = normalizeAttemptSource(rec.sourceListType);
      const itemType = inferBlockedItemType(
        rec.attemptedDomain,
        rec.sourceListType,
        rec.itemType
      );
      return {
        id: rec.id,
        deviceId: rec.deviceId,
        deviceName: rec.deviceName,
        attemptedDomain: rec.attemptedDomain,
        sourceListType: source,
        sourceLabel: source === 'CUSTOM' ? 'Personalizada' : 'LOTBA',
        itemType,
        displayTitle: getDisplayTitleForBlockedAttempt(
          rec.attemptedDomain,
          source,
          itemType
        ),
        blockedAt: rec.blockedAt,
        timestampMs: rec.ts,
        relativeTime: formatRelativeAttemptTime(rec.blockedAt, nowMs),
        formattedDateTime: formatAttemptDateTime(rec.blockedAt, nowMs),
        count: Math.max(1, Math.round(rec.count ?? 1)),
      };
    });

  return {
    deviceId,
    period,
    totalBlocks,
    formattedTotalBlocks: formatMetricNumber(totalBlocks),
    previousBlocks,
    changePercentage,
    changeDirection,
    changeBadgeText,
    sources: {
      lotba: {
        count: lotbaCount,
        formattedCount: formatMetricNumber(lotbaCount),
        pct: lotbaPct,
      },
      custom: {
        count: customCount,
        formattedCount: formatMetricNumber(customCount),
        pct: customPct,
      },
    },
    hourly,
    maxHourlyTotal,
    peakHour,
    recentAttempts: sortedAttempts.slice(0, Math.max(1, recentLimit)),
    allFilteredAttempts: sortedAttempts,
  };
}
