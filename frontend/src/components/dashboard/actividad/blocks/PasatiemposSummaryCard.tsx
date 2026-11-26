// ==============================================================================
// Proyecto: BA Protege+
// Componente: PasatiemposSummaryCard (Monitoreo de Pasatiempos — Responsable)
// Archivo: src/components/dashboard/actividad/blocks/PasatiemposSummaryCard.tsx
// Descripción: Bloque del panel de Actividad del Responsable para seguir el
//              estado diario (No iniciado / En curso / Completado), Racha y
//              desempeño semanal de Menores y Mayores con pestañas limpias.
// ==============================================================================

import React, { useMemo, useState } from 'react';
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
  PasatiempoGameStatus,
  ResponsibleAdultDeviceSummary,
  ResponsibleMinorDeviceSummary,
  ResponsiblePasatiemposSummary,
} from '../../../../utils/pasatiemposMetrics';
import { PASATIEMPOS_CATALOG } from '../../../../utils/pasatiempos';
import { PasatiempoVisualIcon } from '../../protected/components/PasatiempoVisualIcon';
import { analyticsPalette as palette } from '../palette';
import { cardStyles } from '../card.styles';
import { styles } from './PasatiemposSummaryCard.styles';

export interface PasatiemposSummaryCardProps {
  summary: ResponsiblePasatiemposSummary;
  initialExpanded?: boolean;
}

const CAROUSEL_GAP = 8;

type ProtectedCarouselItem =
  | { kind: 'minor'; data: ResponsibleMinorDeviceSummary }
  | { kind: 'adult'; data: ResponsibleAdultDeviceSummary };

const formatDaysLabel = (days: number): string =>
  days === 1 ? '1 día' : `${days} días`;

const renderStatusBadge = (status: PasatiempoGameStatus) => {
  const label =
    status === 'completed'
      ? 'Completado'
      : status === 'in_progress'
        ? 'En curso'
        : 'No iniciado';

  return (
    <View
      style={[
        styles.statusBadge,
        status === 'completed' && styles.statusBadgeCompleted,
        status === 'in_progress' && styles.statusBadgeInProgress,
        status === 'pending' && styles.statusBadgePending,
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          status === 'completed' && styles.statusBadgeTextCompleted,
          status === 'in_progress' && styles.statusBadgeTextInProgress,
          status === 'pending' && styles.statusBadgeTextPending,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export const PasatiemposSummaryCard: React.FC<PasatiemposSummaryCardProps> = ({
  summary,
  initialExpanded = true,
}) => {
  const [blockExpanded, setBlockExpanded] = useState<boolean>(initialExpanded);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [carouselWidth, setCarouselWidth] = useState<number>(0);

  const carouselItems = useMemo<ProtectedCarouselItem[]>(() => {
    const combined: ProtectedCarouselItem[] = [
      ...summary.menores.devices.map(
        (dev): ProtectedCarouselItem => ({ kind: 'minor', data: dev })
      ),
      ...summary.adultos.devices.map(
        (dev): ProtectedCarouselItem => ({ kind: 'adult', data: dev })
      ),
    ];

    combined.sort((a, b) =>
      a.data.label.localeCompare(b.data.label, 'es', { sensitivity: 'base' })
    );

    return combined.slice(0, 5);
  }, [summary.menores.devices, summary.adultos.devices]);

  const toggleCardExpanded = (deviceId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  };

  const isSingleItem = carouselItems.length === 1;
  const cardWidth =
    carouselWidth > 0
      ? Math.max(220, Math.round(carouselWidth * 0.93))
      : 295;

  const handleCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const step = cardWidth + CAROUSEL_GAP;
    if (step > 0) {
      const idx = Math.round(offsetX / step);
      const clamped = Math.max(0, Math.min(carouselItems.length - 1, idx));
      if (clamped !== activeCardIndex) {
        setActiveCardIndex(clamped);
      }
    }
  };

  const renderPersonCard = (item: ProtectedCarouselItem, idx: number, single: boolean) => {
    const dev = item.data;
    const isCardExpanded = Boolean(expandedCards[dev.deviceId]);

    return (
      <View
        key={dev.deviceId}
        style={[
          styles.carouselCard,
          single ? styles.carouselCardSingle : { width: cardWidth },
          (single || idx === activeCardIndex) && styles.carouselCardActive,
        ]}
      >
        {/* Parte visible del card: Nombre del protegido + Racha + En la semana */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => toggleCardExpanded(dev.deviceId)}
          accessibilityRole="button"
          accessibilityState={{ expanded: isCardExpanded }}
        >
          <View style={styles.deviceHeaderRow}>
            <View style={styles.deviceIdentity}>
              <View
                style={[
                  styles.deviceColorDot,
                  { backgroundColor: dev.color },
                ]}
              />
              <Text style={styles.deviceHeaderName} numberOfLines={1}>
                {dev.label}
              </Text>
            </View>
            <Text style={styles.cardChevron}>
              {isCardExpanded ? '▲' : '▼'}
            </Text>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiPill}>
              <Text style={styles.kpiPillLabel}>Racha</Text>
              <Text style={styles.kpiPillValue}>
                {formatDaysLabel(dev.streakDays)}
              </Text>
            </View>
            <View style={styles.kpiPill}>
              <Text style={styles.kpiPillLabel}>En la semana</Text>
              <Text style={styles.kpiPillValue}>
                {dev.weeklyAccuracyPct}%
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Parte invisible (desplegable): Métricas de los 3 juegos actuales */}
        {isCardExpanded ? (
          <View style={styles.gamesSection}>
            {item.kind === 'minor' ? (
              <>
                {/* 1. Juego de preguntas */}
                <View style={styles.gameRow}>
                  <View style={styles.gameLeft}>
                    <PasatiempoVisualIcon gameId="quiz" size={38} />
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>Juego de preguntas</Text>
                      <Text style={styles.gameSubDetail}>
                        {item.data.quiz.correctAnswers}{' '}
                        {item.data.quiz.correctAnswers === 1 ? 'correcta' : 'correctas'} ·{' '}
                        {item.data.quiz.wrongAnswers}{' '}
                        {item.data.quiz.wrongAnswers === 1 ? 'incorrecta' : 'incorrectas'}
                      </Text>
                    </View>
                  </View>
                  {renderStatusBadge(item.data.quiz.status)}
                </View>

                {/* 2. Sopa de letras */}
                <View style={styles.gameRow}>
                  <View style={styles.gameLeft}>
                    <PasatiempoVisualIcon gameId="wordsearch" size={38} />
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>Sopa de letras</Text>
                      <Text style={styles.gameSubDetail}>
                        {item.data.wordsearch.foundWordsTotal}{' '}
                        {item.data.wordsearch.foundWordsTotal === 1
                          ? 'encontrada'
                          : 'encontradas'}{' '}
                        · {item.data.wordsearch.missingWordsTotal}{' '}
                        {item.data.wordsearch.missingWordsTotal === 1
                          ? 'faltante'
                          : 'faltantes'}
                      </Text>
                    </View>
                  </View>
                  {renderStatusBadge(item.data.wordsearch.status)}
                </View>

                {/* 3. Juego de la memoria */}
                <View style={[styles.gameRow, styles.gameRowLast]}>
                  <View style={styles.gameLeft}>
                    <PasatiempoVisualIcon gameId="memory" size={38} />
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>Juego de la memoria</Text>
                      <Text style={styles.gameSubDetail}>
                        {item.data.memory.matchedPairs}{' '}
                        {item.data.memory.matchedPairs === 1
                          ? 'par encontrado'
                          : 'pares encontrados'}{' '}
                        · {item.data.memory.unmatchedPairs}{' '}
                        {item.data.memory.unmatchedPairs === 1
                          ? 'faltante'
                          : 'faltantes'}
                      </Text>
                    </View>
                  </View>
                  {renderStatusBadge(item.data.memory.status)}
                </View>
              </>
            ) : (
              /* Cuestionario diario (Mayores) */
              <View style={[styles.gameRow, styles.gameRowLast]}>
                <View style={styles.gameLeft}>
                  <PasatiempoVisualIcon gameId="quiz" size={38} />
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameName}>Juego de preguntas</Text>
                    <Text style={styles.gameSubDetail}>
                      {item.data.correctToday}{' '}
                      {item.data.correctToday === 1 ? 'correcta' : 'correctas'} ·{' '}
                      {item.data.wrongToday}{' '}
                      {item.data.wrongToday === 1 ? 'incorrecta' : 'incorrectas'}
                    </Text>
                  </View>
                </View>
                {renderStatusBadge(item.data.status)}
              </View>
            )}
          </View>
        ) : null}
      </View>
    );
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
        activeOpacity={0.75}
        onPress={() => setBlockExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityState={{ expanded: blockExpanded }}
        style={[
          styles.blockHeaderRow,
          !blockExpanded && styles.blockHeaderRowCollapsed,
        ]}
      >
        <Text style={styles.blockTitle}>Pasatiempos</Text>
        <Text style={styles.chevron}>{blockExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {blockExpanded ? (
        carouselItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              Sin dispositivos protegidos seleccionados
            </Text>
            <Text style={styles.emptySubtitle}>
              Seleccioná «Todos» o un usuario protegido en los filtros para seguir sus resultados y racha diaria.
            </Text>
          </View>
        ) : (
          <View
            onLayout={(e: LayoutChangeEvent) => {
              const exactWidth = Math.max(0, Math.floor(e.nativeEvent.layout.width));
              if (exactWidth > 0 && Math.abs(exactWidth - carouselWidth) > 1) {
                setCarouselWidth(exactWidth);
              }
            }}
          >
            {isSingleItem ? (
              renderPersonCard(carouselItems[0], 0, true)
            ) : (
              <>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={cardWidth + CAROUSEL_GAP}
                  snapToAlignment="start"
                  onMomentumScrollEnd={handleCarouselScroll}
                  onScrollEndDrag={handleCarouselScroll}
                  contentContainerStyle={styles.carouselContent}
                >
                  {carouselItems.map((item, idx) =>
                    renderPersonCard(item, idx, false)
                  )}
                </ScrollView>

                <View style={styles.dotsRow}>
                  {carouselItems.map((item, idx) => (
                    <View
                      key={`pasatiempos-dot-${item.data.deviceId}`}
                      style={[
                        styles.dot,
                        idx === activeCardIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )
      ) : null}
    </View>
  );
};
