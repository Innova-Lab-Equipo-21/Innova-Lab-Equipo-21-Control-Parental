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

import {
  CustomBlockedApp,
  CustomBlockedDomain,
  DeviceInfo,
} from '../types';

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

export interface BlockedAttemptRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  attemptedDomain: string;
  sourceListType: AttemptSourceType;
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
  blockedAt: string;
  timestampMs: number;
  relativeTime: string;
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

const DEFAULT_LOTBA_DOMAINS = [
  'apuestas-online-ilegal.bet',
  'casino-sin-licencia.com',
  'juegos-azar-clandestino.net',
  'ruleta-online-clandestina.bet',
  'slot-virtual-no-autorizado.xyz',
  'poker-ilegal-argentina.com',
  'tragamonedas-prohibido.club',
  'apuestas-deportivas-no-oficial.io',
];

const DEFAULT_CUSTOM_DOMAINS = [
  'casino-clandestino.net',
  'red-social-peligrosa.org',
  'sitio-bloqueado.com',
];

/**
 * Formatea enteros con separador de miles '.' al estilo es-AR (ej. 1426 -> "1.426").
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
    upper === 'PERSONALIZADA' ||
    upper === 'RESPONSABLE' ||
    upper === 'ADULTO_PROTEGIDO'
  ) {
    return 'CUSTOM';
  }
  return 'LOTBA';
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
 * - Mi dispositivo (dispositivo del responsable)
 * - Dispositivos protegidos vinculados ordenados alfabéticamente (A-Z)
 */
export function buildDeviceFilterOptions(
  devices: DeviceInfo[] = [],
  includeSelf: boolean = true
): ActivityDeviceFilterOption[] {
  const protectedDevices = devices
    .filter((d) => d.deviceId !== 'self' && d.profileType !== 'Responsable')
    .sort((a, b) => {
      const nameA = (a.childName || a.deviceName || '').toLowerCase();
      const nameB = (b.childName || b.deviceName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

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
      label: 'Mi dispositivo',
      subtitle: 'Dispositivo del responsable',
      isSelf: true,
      isAll: false,
      colorIndex: 0,
    });
  }

  protectedDevices.forEach((dev, idx) => {
    const id = dev.deviceId || dev.deviceUuid || `dev-${idx}`;
    const label = dev.childName || dev.deviceName || `Dispositivo ${idx + 1}`;
    const roleLabel =
      dev.profileType === 'Adulto' ? 'Protegido adulto' : 'Protegido menor';
    options.push({
      id,
      label,
      subtitle: roleLabel,
      isSelf: false,
      isAll: false,
      colorIndex: dev.colorIndex ?? idx,
    });
  });

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
      return {
        id: rec.id,
        deviceId: rec.deviceId,
        deviceName: rec.deviceName,
        attemptedDomain: rec.attemptedDomain,
        sourceListType: source,
        sourceLabel: source === 'CUSTOM' ? 'Personalizada' : 'LOTBA',
        blockedAt: rec.blockedAt,
        timestampMs: rec.ts,
        relativeTime: formatRelativeAttemptTime(rec.blockedAt, nowMs),
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

/**
 * Hash determinístico ligero para generar actividad consistente y estable por dispositivo.
 */
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0) || 1;
}

/**
 * Curva horaria base realista (baja de madrugada, sube por la tarde y alcanza pico nocturno).
 */
const BASE_HOURLY_CURVE = [
  2, 1, 1, 1, 1, 2, 4, 6, 8, 10, 11, 13,
  15, 16, 18, 21, 25, 31, 40, 52, 68, 56, 36, 16,
];

/**
 * Genera registros determinísticos de actividad para los dispositivos monitoreados
 * combinándolos con dominios personalizados reales del responsable y eventos persistidos.
 */
export function buildActivityDataset(options: {
  devices?: DeviceInfo[];
  customSites?: CustomBlockedDomain[];
  customApps?: CustomBlockedApp[];
  persistedEvents?: BlockedAttemptRecord[];
  nowMs?: number;
}): BlockedAttemptRecord[] {
  const {
    devices = [],
    customSites = [],
    customApps = [],
    persistedEvents = [],
    nowMs = Date.now(),
  } = options;

  const activeCustomNames: string[] = [
    ...customSites
      .filter((s) => s.isActive !== false && s.domain)
      .map((s) => s.domain),
    ...customApps
      .filter((a) => a.isActive !== false && a.appName)
      .map((a) => a.appName),
  ];

  const customPool =
    activeCustomNames.length > 0 ? activeCustomNames : DEFAULT_CUSTOM_DOMAINS;

  const deviceEntries: Array<{ id: string; name: string; seedOffset: number }> = [
    { id: 'self', name: 'Mi dispositivo', seedOffset: 0 },
    ...devices
      .filter((d) => d.deviceId !== 'self' && d.profileType !== 'Responsable')
      .map((d, idx) => ({
        id: d.deviceId || d.deviceUuid || `dev-${idx}`,
        name: d.childName || d.deviceName || `Dispositivo ${idx + 1}`,
        seedOffset: idx + 1,
      })),
  ];

  const generated: BlockedAttemptRecord[] = [];

  for (const dev of deviceEntries) {
    const seed = hashSeed(`${dev.id}:${dev.name}`);
    const peakShift = (seed % 3) - 1; // Desplaza el pico entre 19h, 20h y 21h según dispositivo
    const customShare = 0.22 + ((seed % 14) / 100); // Entre 22% y 35% personalizada
    const volumeScale = dev.id === 'self' ? 0.65 : 0.85 + ((seed % 4) * 0.12);

    // 1. Eventos individuales recientes (últimas horas / días) para "Últimos intentos bloqueados"
    const recentOffsetsMinutes = [
      4 + (seed % 5) + dev.seedOffset * 3,
      22 + (seed % 11) + dev.seedOffset * 7,
      68 + (seed % 25) + dev.seedOffset * 12,
      195 + (seed % 40) + dev.seedOffset * 18,
      410 + (seed % 55),
      1560 + (seed % 120),
      3120 + (seed % 180),
      5400 + (seed % 240),
    ];

    recentOffsetsMinutes.forEach((minsAgo, idx) => {
      const ts = nowMs - minsAgo * MINUTE_MS;
      const isCustom = (idx + seed) % 3 === 1;
      const domain = isCustom
        ? customPool[(seed + idx) % customPool.length]
        : DEFAULT_LOTBA_DOMAINS[(seed + idx) % DEFAULT_LOTBA_DOMAINS.length];

      generated.push({
        id: `seed-recent-${dev.id}-${idx}`,
        deviceId: dev.id,
        deviceName: dev.name,
        attemptedDomain: domain,
        sourceListType: isCustom ? 'CUSTOM' : 'LOTBA',
        blockedAt: new Date(ts).toISOString(),
        count: 1,
      });
    });

    // 2. Bloques horarios distribuidos en las ventanas temporales:
    //    - Semana actual (hace 2d y 5d)
    //    - Semana previa (hace 9d y 12d -> dentro del Mes actual)
    //    - Mes previo (hace 38d y 48d -> dentro del Año actual)
    //    - Resto del año actual (hace 120d y 240d)
    //    - Año previo / histórico (hace 410d y 540d)
    const timeAnchors: Array<{ daysAgo: number; mult: number }> = [
      { daysAgo: 1, mult: 0.48 },
      { daysAgo: 4, mult: 0.52 },
      { daysAgo: 9, mult: 0.44 },
      { daysAgo: 12, mult: 0.43 },
      { daysAgo: 20, mult: 0.95 },
      { daysAgo: 38, mult: 1.28 },
      { daysAgo: 49, mult: 1.24 },
      { daysAgo: 130, mult: 3.1 },
      { daysAgo: 250, mult: 3.4 },
      { daysAgo: 420, mult: 4.3 },
      { daysAgo: 560, mult: 4.1 },
    ];

    timeAnchors.forEach((anchor, anchorIdx) => {
      const anchorBaseDate = new Date(nowMs - anchor.daysAgo * DAY_MS);
      for (let h = 0; h < 24; h += 1) {
        const curveIdx = (h - peakShift + 24) % 24;
        const rawWeight =
          BASE_HOURLY_CURVE[curveIdx] * volumeScale * anchor.mult;
        const totalForHour = Math.max(0, Math.round(rawWeight));
        if (totalForHour <= 0) continue;

        const customForHour = Math.round(totalForHour * customShare);
        const lotbaForHour = Math.max(0, totalForHour - customForHour);

        const slotDate = new Date(anchorBaseDate);
        slotDate.setHours(h, (seed + anchorIdx * 7 + h * 3) % 55, 0, 0);
        // Garantizar que nunca quede en el futuro respecto de nowMs
        const safeTs = Math.min(slotDate.getTime(), nowMs - MINUTE_MS);
        const iso = new Date(safeTs).toISOString();

        if (lotbaForHour > 0) {
          generated.push({
            id: `seed-lotba-${dev.id}-${anchor.daysAgo}-${h}`,
            deviceId: dev.id,
            deviceName: dev.name,
            attemptedDomain:
              DEFAULT_LOTBA_DOMAINS[
                (seed + anchorIdx + h) % DEFAULT_LOTBA_DOMAINS.length
              ],
            sourceListType: 'LOTBA',
            blockedAt: iso,
            count: lotbaForHour,
          });
        }

        if (customForHour > 0) {
          const customSlotTs = Math.min(
            slotDate.getTime() + 2 * MINUTE_MS,
            nowMs - MINUTE_MS
          );
          generated.push({
            id: `seed-custom-${dev.id}-${anchor.daysAgo}-${h}`,
            deviceId: dev.id,
            deviceName: dev.name,
            attemptedDomain:
              customPool[(seed + anchorIdx + h) % customPool.length],
            sourceListType: 'CUSTOM',
            blockedAt: new Date(customSlotTs).toISOString(),
            count: customForHour,
          });
        }
      }
    });
  }

  // Combinar eventos reales reportados (prioritarios, sin duplicados por ID) con la base
  const mergedMap = new Map<string, BlockedAttemptRecord>();
  for (const item of generated) {
    mergedMap.set(item.id, item);
  }
  for (const realEvent of persistedEvents) {
    mergedMap.set(realEvent.id, {
      ...realEvent,
      sourceListType: normalizeAttemptSource(realEvent.sourceListType),
      count: realEvent.count ?? 1,
    });
  }

  return Array.from(mergedMap.values());
}
