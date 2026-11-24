// ==============================================================================
// Proyecto: BA Protege+
// Módulo: Métricas de Consumo Diario de Aplicaciones Bloqueadas
// Archivo: src/utils/appUsageMetrics.ts
// Descripción: Lógica pura para calcular el bloque "Uso de apps" / "Mis apps hoy":
//              - Incluye ÚNICAMENTE aplicaciones presentes en la lista de bloqueos
//                alimentada por el Responsable y el Protegido Adulto.
//              - Ordena las apps de mayor a menor consumo diario.
//              - Calcula para cada app: tiempo usado, límite total, tiempo restante,
//                porcentaje de progreso y estado (Disponible / Esperá / Bloqueo total).
//              - Calcula el totalizador consolidado del consumo de las apps de la lista.
// ==============================================================================

import { CustomBlockedApp } from '../types';

export interface AppUsageRawSnapshot {
  deviceId?: string;
  packageName: string;
  appName: string;
  usedMinutes: number;
  dailyLimitMinutes?: number | null;
  isBlocked?: boolean;
}

export interface AppUsageTargetDevice {
  id: string;
  label: string;
  color: string;
}

export interface BlockedAppDeviceUsage {
  deviceId: string;
  label: string;
  color: string;
  usedMinutes: number;
  dailyLimitMinutes: number | null; // null = bloqueo total
  remainingMinutes: number;
  progressPct: number; // 0..100
  isTotalBlock: boolean;
}

export interface BlockedAppUsageEntry {
  id: string;
  appName: string;
  packageName: string;
  initial: string;
  usedMinutes: number;
  dailyLimitMinutes: number | null; // null = bloqueo total (sin cupo diario)
  remainingMinutes: number;
  progressPct: number; // 0..100
  isTotalBlock: boolean;
  isLimitReached: boolean;
  statusType: 'available' | 'waiting' | 'blocked';
  /** Desglose por dispositivo cuando el filtro está en "Todos". */
  deviceBreakdowns: BlockedAppDeviceUsage[];
}

export interface BlockedAppsUsageSummary {
  items: BlockedAppUsageEntry[];
  appsCount: number;
  totalUsedMinutes: number;
  totalLimitMinutes: number;
  totalRemainingMinutes: number;
  hasAnyTimeLimit: boolean;
  totalProgressPct: number;
  appNamesLabel: string;
}

/**
 * Formatea una duración en minutos al formato legible es-AR:
 * - 0 -> "0 min"
 * - 45 -> "45 min"
 * - 120 -> "2 h"
 * - 155 -> "2 h 35 min"
 */
export function formatDurationMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(Number.isFinite(minutes) ? minutes : 0));
  if (safe < 60) {
    return `${safe} min`;
  }
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (mins === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${mins} min`;
}

/**
 * Normaliza la clave de emparejamiento de una aplicación (por packageName o appName).
 */
export function normalizeAppKey(appName: string, packageName?: string): string {
  const pkg = (packageName || '').trim().toLowerCase();
  if (pkg) return pkg;
  return (appName || '').trim().toLowerCase();
}

/**
 * Verifica si una app de la lista de bloqueos aplica a un dispositivo dado.
 */
export function isBlockedAppApplicableToDevice(
  app: CustomBlockedApp,
  deviceId: string
): boolean {
  if (app.isActive === false) return false;
  if (deviceId === 'all') return true;
  if (app.applyToAll) return true;
  if (Array.isArray(app.deviceIds) && app.deviceIds.includes(deviceId)) {
    return true;
  }
  return false;
}

/**
 * Resuelve el límite diario efectivo (en minutos) de una app para un dispositivo.
 * Devuelve null si tiene bloqueo total (indeterminado o <= 0).
 */
export function resolveEffectiveDailyLimit(
  app: CustomBlockedApp,
  deviceId: string,
  targetDeviceIds?: string[]
): number | null {
  if (deviceId !== 'all') {
    const specific = app.deviceLimits?.[deviceId];
    const limit = specific !== undefined ? specific : app.dailyLimitMinutes;
    return typeof limit === 'number' && limit > 0 ? Math.round(limit) : null;
  }

  // Cuando el filtro es "Todos": sumar los cupos aplicables si se conocen los dispositivos,
  // o usar el límite general configurado.
  if (targetDeviceIds && targetDeviceIds.length > 0) {
    const applicableIds = targetDeviceIds.filter((id) =>
      isBlockedAppApplicableToDevice(app, id)
    );
    if (applicableIds.length > 0) {
      let limitSum = 0;
      let hasLimit = false;
      for (const id of applicableIds) {
        const specific = app.deviceLimits?.[id];
        const limit = specific !== undefined ? specific : app.dailyLimitMinutes;
        if (typeof limit === 'number' && limit > 0) {
          limitSum += Math.round(limit);
          hasLimit = true;
        }
      }
      return hasLimit ? limitSum : null;
    }
  }

  return typeof app.dailyLimitMinutes === 'number' && app.dailyLimitMinutes > 0
    ? Math.round(app.dailyLimitMinutes)
    : null;
}

/**
 * Construye el modelo completo del bloque de uso de apps bloqueadas:
 * 1) Filtra únicamente apps activas en la lista de bloqueos aplicable al dispositivo.
 * 2) Consolida los minutos consumidos desde snapshots reales (nativo / backend).
 * 3) Ordena de mayor a menor tiempo de uso diario.
 * 4) Calcula progreso, restante, estado y totalizador general.
 */
export function buildBlockedAppsUsageSummary(params: {
  customApps: CustomBlockedApp[];
  usageSnapshots?: AppUsageRawSnapshot[];
  deviceId?: string;
  targetDeviceIds?: string[];
  targetDevices?: AppUsageTargetDevice[];
}): BlockedAppsUsageSummary {
  const {
    customApps = [],
    usageSnapshots = [],
    deviceId = 'all',
    targetDeviceIds,
    targetDevices = [],
  } = params;

  const effectiveTargetDeviceIds =
    targetDeviceIds ??
    (targetDevices.length > 0 ? targetDevices.map((d) => d.id) : undefined);

  const filteredApps = customApps.filter((app) =>
    isBlockedAppApplicableToDevice(app, deviceId)
  );

  // Indexar snapshots de uso por clave normalizada de app y también por (deviceId, appKey)
  const usageByAppKey = new Map<string, number>();
  const usageByDeviceAndAppKey = new Map<string, number>();

  for (const snap of usageSnapshots) {
    if (
      deviceId !== 'all' &&
      snap.deviceId &&
      snap.deviceId !== deviceId
    ) {
      continue;
    }
    const key = normalizeAppKey(snap.appName, snap.packageName);
    const nameKey = normalizeAppKey(snap.appName);
    const mins = Math.max(0, Math.round(snap.usedMinutes || 0));
    const snapDeviceId = snap.deviceId || 'self';

    const devKey = `${snapDeviceId}::${key}`;
    usageByDeviceAndAppKey.set(
      devKey,
      Math.max(usageByDeviceAndAppKey.get(devKey) || 0, mins)
    );
    if (nameKey !== key) {
      const devNameKey = `${snapDeviceId}::${nameKey}`;
      usageByDeviceAndAppKey.set(
        devNameKey,
        Math.max(usageByDeviceAndAppKey.get(devNameKey) || 0, mins)
      );
    }

    if (deviceId === 'all') {
      usageByAppKey.set(key, (usageByAppKey.get(key) || 0) + mins);
      if (nameKey !== key) {
        usageByAppKey.set(nameKey, (usageByAppKey.get(nameKey) || 0) + mins);
      }
    } else {
      usageByAppKey.set(key, Math.max(usageByAppKey.get(key) || 0, mins));
      if (nameKey !== key) {
        usageByAppKey.set(nameKey, Math.max(usageByAppKey.get(nameKey) || 0, mins));
      }
    }
  }

  const entries: BlockedAppUsageEntry[] = [];

  for (const app of filteredApps) {
    const pkgKey = normalizeAppKey(app.appName, app.packageName);
    const nameKey = normalizeAppKey(app.appName);
    const usedMinutes = usageByAppKey.get(pkgKey) ?? usageByAppKey.get(nameKey) ?? 0;
    const dailyLimitMinutes = resolveEffectiveDailyLimit(
      app,
      deviceId,
      effectiveTargetDeviceIds
    );
    const isTotalBlock = dailyLimitMinutes === null || dailyLimitMinutes <= 0;

    // Apps con bloqueo total (100% bloqueadas, sin cupo de tiempo) no se listan en Uso de apps
    if (isTotalBlock) {
      continue;
    }

    const remainingMinutes = Math.max(0, dailyLimitMinutes - usedMinutes);
    const isLimitReached = usedMinutes >= dailyLimitMinutes;
    const progressPct = Math.min(
      100,
      Math.round((usedMinutes / dailyLimitMinutes) * 100)
    );

    const statusType: BlockedAppUsageEntry['statusType'] = isLimitReached
      ? 'waiting'
      : 'available';

    const cleanName = (app.appName || 'App').trim();

    // Desglose por dispositivo listado únicamente cuando el filtro está en "Todos"
    // (excluye dispositivos donde la app tenga bloqueo total 100%)
    const deviceBreakdowns: BlockedAppDeviceUsage[] =
      deviceId === 'all' && targetDevices.length > 0
        ? targetDevices
            .filter((dev) => isBlockedAppApplicableToDevice(app, dev.id))
            .map<BlockedAppDeviceUsage | null>((dev) => {
              const devUsed =
                usageByDeviceAndAppKey.get(`${dev.id}::${pkgKey}`) ??
                usageByDeviceAndAppKey.get(`${dev.id}::${nameKey}`) ??
                0;
              const devLimit = resolveEffectiveDailyLimit(app, dev.id);
              const devIsTotalBlock = devLimit === null || devLimit <= 0;
              if (devIsTotalBlock) {
                return null;
              }
              const devRemaining = Math.max(0, devLimit - devUsed);
              const devProgressPct = Math.min(
                100,
                Math.round((devUsed / devLimit) * 100)
              );

              return {
                deviceId: dev.id,
                label: dev.label,
                color: dev.color,
                usedMinutes: devUsed,
                dailyLimitMinutes: devLimit,
                remainingMinutes: devRemaining,
                progressPct: devProgressPct,
                isTotalBlock: false,
              };
            })
            .filter((item): item is BlockedAppDeviceUsage => item !== null)
        : [];

    entries.push({
      id: app.id,
      appName: cleanName,
      packageName: app.packageName || '',
      initial: cleanName.charAt(0).toUpperCase() || 'A',
      usedMinutes,
      dailyLimitMinutes,
      remainingMinutes,
      progressPct,
      isTotalBlock: false,
      isLimitReached,
      statusType,
      deviceBreakdowns,
    });
  }

  // Ordenar estrictamente del más usado al menos usado (desempate A-Z)
  entries.sort((a, b) => {
    if (b.usedMinutes !== a.usedMinutes) {
      return b.usedMinutes - a.usedMinutes;
    }
    return a.appName.localeCompare(b.appName, 'es', { sensitivity: 'base' });
  });

  const totalUsedMinutes = entries.reduce((sum, item) => sum + item.usedMinutes, 0);
  const limitedItems = entries.filter(
    (item) => item.dailyLimitMinutes !== null && item.dailyLimitMinutes > 0
  );
  const totalLimitMinutes = limitedItems.reduce(
    (sum, item) => sum + (item.dailyLimitMinutes || 0),
    0
  );
  const totalRemainingMinutes = limitedItems.reduce(
    (sum, item) => sum + item.remainingMinutes,
    0
  );
  const hasAnyTimeLimit = totalLimitMinutes > 0;
  const totalProgressPct = hasAnyTimeLimit
    ? Math.min(100, Math.round((totalUsedMinutes / totalLimitMinutes) * 100))
    : totalUsedMinutes > 0
      ? 100
      : 0;

  const displayedNames = entries.slice(0, 3).map((e) => e.appName);
  const extraCount = entries.length - displayedNames.length;
  const appNamesLabel =
    entries.length === 0
      ? 'Sin apps elegidas'
      : extraCount > 0
        ? `${displayedNames.join(' + ')} + ${extraCount} más`
        : displayedNames.join(' + ');

  return {
    items: entries,
    appsCount: entries.length,
    totalUsedMinutes,
    totalLimitMinutes,
    totalRemainingMinutes,
    hasAnyTimeLimit,
    totalProgressPct,
    appNamesLabel,
  };
}
