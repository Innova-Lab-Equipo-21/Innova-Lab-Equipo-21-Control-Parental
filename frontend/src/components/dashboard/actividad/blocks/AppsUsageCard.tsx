// ==============================================================================
// Proyecto: BA Protege+
// Componente: AppsUsageCard (Uso diario de aplicaciones de la lista de bloqueos)
// Archivo: src/components/dashboard/actividad/blocks/AppsUsageCard.tsx
// Descripción: Bloque reutilizable que mide el consumo diario únicamente de las
//              apps presentes en la lista de bloqueos (Responsable y Protegido
//              Adulto), ordenadas de mayor a menor uso, con totalizador destacado
//              y barra de progreso individual (total, consumido y restante).
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import {
  BlockedAppUsageEntry,
  BlockedAppsUsageSummary,
  formatDurationMinutes,
} from '../../../../utils/appUsageMetrics';
import { analyticsPalette as palette } from '../palette';
import { cardStyles } from '../card.styles';
import { styles } from './AppsUsageCard.styles';

export type AppsUsageVariant = 'parent' | 'adult' | 'child';

export interface AppsUsageCardProps {
  summary: BlockedAppsUsageSummary;
  variant?: AppsUsageVariant;
  title?: string;
}

const getStatusLabel = (
  item: BlockedAppUsageEntry,
  variant: AppsUsageVariant
): string => {
  if (item.statusType === 'blocked') {
    return '🔒 Bloqueada';
  }
  if (item.statusType === 'waiting') {
    return '⏳ Límite alcanzado';
  }
  if (variant === 'child') {
    return '✓ Ya podés usarla';
  }
  return '✓ Disponible';
};

const getProgressBarColor = (item: BlockedAppUsageEntry): string => {
  if (item.statusType === 'blocked') return palette.dangerRed;
  if (item.statusType === 'waiting' || item.progressPct >= 85) {
    return palette.customAmber;
  }
  return palette.lotbaBlue;
};

export const AppsUsageCard: React.FC<AppsUsageCardProps> = ({
  summary,
  variant = 'parent',
  title,
}) => {
  const resolvedTitle =
    title || (variant === 'parent' ? 'Uso de apps' : 'Mis apps hoy');

  return (
    <View style={cardStyles.card}>
      {/* Título */}
      <Text style={styles.kpiLabel}>{resolvedTitle}</Text>

      {summary.items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Sin apps con límite de tiempo</Text>
          <Text style={styles.emptySubtitle}>
            Cuando configures aplicaciones con límite diario en «Sitios y apps», vas a ver acá el tiempo consumido y restante.
          </Text>
        </View>
      ) : (
        <>
          {/* Total en destaque (estilo "intentos frenados") */}
          <View style={styles.mainRow}>
            <Text style={styles.kpiNumber}>
              {formatDurationMinutes(summary.totalUsedMinutes)}
            </Text>
            <Text style={styles.kpiSub}>consumidos hoy</Text>
          </View>

          {/* Listado ordenado de mayor a menor uso */}
          <View style={styles.listContainer}>
            {summary.items.map((item, idx) => {
              const fillWidth = item.isTotalBlock
                ? 100
                : Math.max(item.usedMinutes > 0 ? 4 : 0, item.progressPct);
              const barColor = getProgressBarColor(item);
              const hasDeviceBreakdowns =
                Array.isArray(item.deviceBreakdowns) &&
                item.deviceBreakdowns.length > 0;

              return (
                <View
                  key={item.id}
                  style={[styles.appRow, idx === 0 && styles.appRowFirst]}
                >
                  <View style={styles.appTopRow}>
                    <Text style={styles.appName} numberOfLines={1}>
                      {item.appName}
                    </Text>

                    <View
                      style={[
                        styles.statusPill,
                        item.statusType === 'available' && styles.statusPillAvailable,
                        item.statusType === 'waiting' && styles.statusPillWaiting,
                        item.statusType === 'blocked' && styles.statusPillBlocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          item.statusType === 'available' && styles.statusPillTextAvailable,
                          item.statusType === 'waiting' && styles.statusPillTextWaiting,
                          item.statusType === 'blocked' && styles.statusPillTextBlocked,
                        ]}
                      >
                        {getStatusLabel(item, variant)}
                      </Text>
                    </View>
                  </View>

                  {/* Barra de tiempo total de la app */}
                  {hasDeviceBreakdowns ? (
                    <Text style={styles.barSectionLabel}>Tiempo total</Text>
                  ) : null}

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${fillWidth}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>

                  <View style={styles.metricsFooterRow}>
                    <Text style={styles.metricText}>
                      Consumido{' '}
                      <Text style={styles.metricStrong}>
                        {formatDurationMinutes(item.usedMinutes)}
                      </Text>
                    </Text>

                    <Text style={styles.metricText}>
                      {item.isTotalBlock ? (
                        <Text style={styles.metricStrong}>Bloqueo total</Text>
                      ) : (
                        <>
                          Total{' '}
                          <Text style={styles.metricStrong}>
                            {formatDurationMinutes(item.dailyLimitMinutes || 0)}
                          </Text>
                        </>
                      )}
                    </Text>

                    <Text style={styles.metricText}>
                      {item.isTotalBlock ? (
                        'Sin cupo'
                      ) : (
                        <>
                          Restan{' '}
                          <Text style={styles.metricStrong}>
                            {formatDurationMinutes(item.remainingMinutes)}
                          </Text>
                        </>
                      )}
                    </Text>
                  </View>

                  {/* Barras por dispositivo cuando el filtro está en "Todos" */}
                  {hasDeviceBreakdowns ? (
                    <View style={styles.deviceBarsList}>
                      {item.deviceBreakdowns.map((dev) => {
                        const devFillWidth = dev.isTotalBlock
                          ? 100
                          : Math.max(dev.usedMinutes > 0 ? 4 : 0, dev.progressPct);
                        return (
                          <View
                            key={`${item.id}-${dev.deviceId}`}
                            style={styles.deviceBarRow}
                          >
                            <View style={styles.deviceBarHeader}>
                              <View style={styles.deviceBarIdentity}>
                                <View
                                  style={[
                                    styles.deviceBarDot,
                                    { backgroundColor: dev.color },
                                  ]}
                                />
                                <Text
                                  style={styles.deviceBarLabel}
                                  numberOfLines={1}
                                >
                                  {dev.label}
                                </Text>
                              </View>
                              <Text style={styles.deviceBarValue}>
                                {dev.isTotalBlock
                                  ? 'Bloqueo total'
                                  : `${formatDurationMinutes(dev.usedMinutes)} / ${formatDurationMinutes(dev.dailyLimitMinutes || 0)}`}
                              </Text>
                            </View>
                            <View style={styles.deviceProgressTrack}>
                              <View
                                style={[
                                  styles.deviceProgressFill,
                                  {
                                    width: `${devFillWidth}%`,
                                    backgroundColor: dev.color,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
};
