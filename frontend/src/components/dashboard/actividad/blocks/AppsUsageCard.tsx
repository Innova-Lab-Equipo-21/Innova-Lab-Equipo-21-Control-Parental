// ==============================================================================
// Proyecto: BA Protege+
// Componente: AppsUsageCard (Uso diario de aplicaciones de la lista de bloqueos)
// Archivo: src/components/dashboard/actividad/blocks/AppsUsageCard.tsx
// Descripción: Bloque reutilizable que mide el consumo diario únicamente de las
//              apps presentes en la lista de bloqueos (Responsable y Protegido
//              Adulto), ordenadas de mayor a menor uso, con totalizador destacado
//              y barra de progreso individual (total, consumido y restante).
// ==============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  selectedDeviceId?: string;
  selectedDeviceLabel?: string;
  initialExpanded?: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
}

const CAROUSEL_GAP = 8;

const formatLongDuration = (minutes: number): string => {
  const safe = Math.max(0, Math.round(Number.isFinite(minutes) ? minutes : 0));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  const hLabel = hours === 1 ? '1 hora' : `${hours} horas`;
  const mLabel = mins === 1 ? '1 minuto' : `${mins} minutos`;
  if (hours === 0) return mLabel;
  if (mins === 0) return hLabel;
  return `${hLabel}, ${mLabel}`;
};

const formatNamesList = (names: string[]): string => {
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} y ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')} y ${clean[clean.length - 1]}`;
};

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
  selectedDeviceId = 'all',
  selectedDeviceLabel,
  initialExpanded = false,
  actionLabel,
  onActionPress,
}) => {
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  const [activeAppIndex, setActiveAppIndex] = useState<number>(0);
  const [carouselWidth, setCarouselWidth] = useState<number>(0);

  const resolvedTitle =
    title ||
    (variant === 'child'
      ? 'Mis apps hoy'
      : 'Tiempo de uso de las aplicaciones');

  // Carrusel horizontal en orden alfabético A-Z (Responsable, Protegido Adulto y Menor)
  const sortedItems = useMemo(
    () =>
      [...summary.items].sort((a, b) =>
        a.appName.localeCompare(b.appName, 'es', { sensitivity: 'base' })
      ),
    [summary.items]
  );

  useEffect(() => {
    if (activeAppIndex >= sortedItems.length) {
      setActiveAppIndex(0);
    }
  }, [sortedItems.length, activeAppIndex]);

  const activeApp =
    sortedItems.length > 0
      ? sortedItems[Math.min(activeAppIndex, sortedItems.length - 1)]
      : null;

  const buildNarrative = (): string => {
    if (variant === 'child') {
      if (!activeApp) {
        return 'La persona responsable de tu cuenta todavía no estableció un límite de tiempo de uso para las aplicaciones.';
      }

      const usedText = formatLongDuration(activeApp.usedMinutes);
      const remainingText = formatLongDuration(activeApp.remainingMinutes);

      if (!activeApp.isTotalBlock && activeApp.remainingMinutes > 0) {
        return `Hoy usaste ${activeApp.appName} durante ${usedText}. Dentro de ${remainingText} se bloqueará la aplicación para cuidar tu bienestar digital.`;
      }

      if (activeApp.isTotalBlock) {
        return `Hoy usaste ${activeApp.appName} durante ${usedText}. La aplicación permanece bloqueada para cuidar tu bienestar digital.`;
      }

      return `Hoy usaste ${activeApp.appName} durante ${usedText}. La aplicación alcanzó su límite diario y permanecerá bloqueada para cuidar tu bienestar digital.`;
    }

    if (variant === 'adult') {
      if (!activeApp) {
        return 'Todavía no estableciste un límite de tiempo de uso para las aplicaciones. Podés hacerlo desde “Sitios y apps”.';
      }

      const usedText = formatLongDuration(activeApp.usedMinutes);
      const remainingText = formatLongDuration(activeApp.remainingMinutes);

      if (!activeApp.isTotalBlock && activeApp.remainingMinutes > 0) {
        return `Hoy usaste ${activeApp.appName} durante ${usedText}. Dentro de ${remainingText} se bloqueará la aplicación para mantener activa la protección.`;
      }

      if (activeApp.isTotalBlock) {
        return `Hoy usaste ${activeApp.appName} durante ${usedText}. La aplicación permanece bloqueada para mantener activa la protección.`;
      }

      return `Hoy usaste ${activeApp.appName} durante ${usedText}. La aplicación alcanzó su límite diario y permanecerá bloqueada para mantener activa la protección.`;
    }

    if (!activeApp) {
      return 'Todavía no se aplicó un límite de tiempo de uso para las aplicaciones. Podés realizar la configuración cuando quieras desde “Sitios y apps”.';
    }

    const usedText = formatLongDuration(activeApp.usedMinutes);
    const remainingText = formatLongDuration(activeApp.remainingMinutes);

    if (selectedDeviceId === 'all') {
      const isSelfEntry = (d: { deviceId: string; label: string }) =>
        d.deviceId === 'self' || d.label.trim().toLowerCase() === 'yo';
      const otherNames = activeApp.deviceBreakdowns
        .filter((d) => !isSelfEntry(d))
        .map((d) => d.label.trim())
        .filter(Boolean);
      const selfNames = activeApp.deviceBreakdowns
        .filter((d) => isSelfEntry(d))
        .map((d) => d.label.trim() || 'Yo');
      const names = [...otherNames, ...selfNames];
      const namesText = formatNamesList(names);
      const hasSelf = selfNames.length > 0;
      const verb =
        names.length > 1
          ? hasSelf
            ? 'usamos'
            : 'usaron'
          : hasSelf
            ? 'usé'
            : 'usó';
      const subjectPrefix = namesText
        ? `En total, ${namesText} ${verb}`
        : 'En total, se usó';
      return `${subjectPrefix} ${activeApp.appName} durante ${usedText} hoy.`;
    }

    const personName = selectedDeviceLabel?.trim() || 'Este dispositivo';
    const isSelfSelected =
      selectedDeviceId === 'self' || personName.toLowerCase() === 'yo';
    const verb = isSelfSelected ? 'usé' : 'usó';
    const possessive = isSelfSelected ? 'mi' : 'su';
    const closing =
      activeApp.remainingMinutes > 0
        ? `Dentro de ${remainingText} se bloqueará la aplicación para cuidar ${possessive} bienestar digital.`
        : `La aplicación alcanzó su límite diario y permanecerá bloqueada para cuidar ${possessive} bienestar digital.`;
    return `${personName} ${verb} ${activeApp.appName} durante ${usedText} hoy. ${closing}`;
  };

  const renderAppDetails = (item: BlockedAppUsageEntry) => {
    const fillWidth = item.isTotalBlock
      ? 100
      : Math.max(item.usedMinutes > 0 ? 4 : 0, item.progressPct);
    const barColor = getProgressBarColor(item);
    const hasDeviceBreakdowns =
      Array.isArray(item.deviceBreakdowns) &&
      item.deviceBreakdowns.length > 0;

    return (
      <>
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
      </>
    );
  };

  const canExpand = sortedItems.length > 0;
  const isSingleItem = sortedItems.length === 1;
  const carouselItemWidth =
    carouselWidth > 0
      ? Math.max(220, Math.round(carouselWidth * 0.93))
      : 295;

  const handleCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const step = carouselItemWidth + CAROUSEL_GAP;
    if (step > 0) {
      const idx = Math.round(offsetX / step);
      const clamped = Math.max(0, Math.min(sortedItems.length - 1, idx));
      if (clamped !== activeAppIndex) {
        setActiveAppIndex(clamped);
      }
    }
  };

  return (
    <View
      style={cardStyles.card}
      onLayout={(e: LayoutChangeEvent) => {
        const innerWidth = Math.max(0, Math.floor(e.nativeEvent.layout.width - 29));
        if (innerWidth > 0 && carouselWidth === 0) {
          setCarouselWidth(innerWidth);
        }
      }}
    >
      <TouchableOpacity
        activeOpacity={canExpand ? 0.75 : 1}
        disabled={!canExpand}
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.accordionHeaderRow}>
          <Text style={styles.accordionTitle}>{resolvedTitle}</Text>
          {canExpand ? (
            <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
          ) : null}
        </View>

        <View style={styles.mainRow}>
          <Text style={styles.kpiNumber}>
            {formatDurationMinutes(summary.totalUsedMinutes)}
          </Text>
          <Text style={styles.kpiSub}>consumidos hoy</Text>
        </View>

        <Text style={styles.narrativeText}>{buildNarrative()}</Text>
      </TouchableOpacity>

      {expanded && sortedItems.length > 0 ? (
        <View
          style={styles.carouselSection}
          onLayout={(e: LayoutChangeEvent) => {
            const exactWidth = Math.max(0, Math.floor(e.nativeEvent.layout.width));
            if (exactWidth > 0 && Math.abs(exactWidth - carouselWidth) > 1) {
              setCarouselWidth(exactWidth);
            }
          }}
        >
          {isSingleItem ? (
            <View
              style={[
                styles.carouselCard,
                styles.carouselCardSingle,
                styles.carouselCardActive,
              ]}
            >
              {renderAppDetails(sortedItems[0])}
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={carouselItemWidth + CAROUSEL_GAP}
                snapToAlignment="start"
                onMomentumScrollEnd={handleCarouselScroll}
                onScrollEndDrag={handleCarouselScroll}
                contentContainerStyle={styles.carouselContent}
              >
                {sortedItems.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.92}
                    onPress={() => setActiveAppIndex(idx)}
                    style={[
                      styles.carouselCard,
                      { width: carouselItemWidth },
                      idx === activeAppIndex && styles.carouselCardActive,
                    ]}
                  >
                    {renderAppDetails(item)}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.dotsRow}>
                {sortedItems.map((item, idx) => (
                  <View
                    key={`dot-${item.id}`}
                    style={[
                      styles.dot,
                      idx === activeAppIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      ) : null}

      {actionLabel && onActionPress ? (
        <View style={styles.actionFooterRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onActionPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionBtnText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};
