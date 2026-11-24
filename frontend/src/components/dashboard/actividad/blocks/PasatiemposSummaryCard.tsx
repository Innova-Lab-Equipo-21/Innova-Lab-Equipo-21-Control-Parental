// ==============================================================================
// Proyecto: BA Protege+
// Componente: PasatiemposSummaryCard (Monitoreo de Pasatiempos — Responsable)
// Archivo: src/components/dashboard/actividad/blocks/PasatiemposSummaryCard.tsx
// Descripción: Bloque del panel de Actividad del Responsable para seguir el
//              estado diario (No iniciado / En curso / Completado), Racha y
//              desempeño semanal de Menores y Mayores con pestañas limpias.
// ==============================================================================

import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  PasatiempoGameStatus,
  ResponsiblePasatiemposSummary,
} from '../../../../utils/pasatiemposMetrics';
import { PASATIEMPOS_CATALOG } from '../../../../utils/pasatiempos';
import { SegmentedTabs } from '../atomic/SegmentedTabs';
import { analyticsPalette as palette } from '../palette';
import { cardStyles } from '../card.styles';
import { styles } from './PasatiemposSummaryCard.styles';

export interface PasatiemposSummaryCardProps {
  summary: ResponsiblePasatiemposSummary;
}

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
}) => {
  const hasMinors = summary.menores.deviceCount > 0;
  const hasAdults = summary.adultos.deviceCount > 0;
  const [selectedGroup, setSelectedGroup] = useState<'menores' | 'adultos'>(
    'menores'
  );

  const activeGroup: 'menores' | 'adultos' =
    hasMinors && hasAdults
      ? selectedGroup
      : hasMinors
        ? 'menores'
        : 'adultos';

  return (
    <View style={cardStyles.card}>
      <Text style={styles.kpiLabel}>Pasatiempos</Text>

      {!hasMinors && !hasAdults ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>
            Sin dispositivos protegidos seleccionados
          </Text>
          <Text style={styles.emptySubtitle}>
            Seleccioná «Todos» o un usuario protegido en los filtros para seguir sus resultados y racha diaria.
          </Text>
        </View>
      ) : (
        <>
          {hasMinors && hasAdults ? (
            <View style={styles.tabsWrapper}>
              <SegmentedTabs
                tabs={[
                  { key: 'menores', label: 'Menores' },
                  { key: 'adultos', label: 'Mayores' },
                ]}
                activeKey={activeGroup}
                onChange={(key) =>
                  setSelectedGroup(key === 'adultos' ? 'adultos' : 'menores')
                }
              />
            </View>
          ) : null}

          {activeGroup === 'menores' ? (
            <View style={styles.devicesList}>
              {summary.menores.devices.map((dev, idx) => (
                <View
                  key={dev.deviceId}
                  style={[
                    styles.deviceSection,
                    idx > 0 && styles.deviceSectionDivider,
                  ]}
                >
                  <View style={styles.deviceHeaderRow}>
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

                  {/* 1. Quiz */}
                  <View style={styles.gameRow}>
                    <View style={styles.gameLeft}>
                      <View
                        style={[
                          styles.gameIconBox,
                          { backgroundColor: PASATIEMPOS_CATALOG.quiz.bgColor },
                        ]}
                      >
                        <Text style={styles.gameIconText}>?</Text>
                      </View>
                      <View style={styles.gameInfo}>
                        <Text style={styles.gameName}>Quiz</Text>
                        <Text style={styles.gameSubDetail}>
                          {dev.quiz.correctAnswers} correctas ·{' '}
                          {dev.quiz.wrongAnswers} incorrectas
                        </Text>
                      </View>
                    </View>
                    {renderStatusBadge(dev.quiz.status)}
                  </View>

                  {/* 2. Sopa de letras */}
                  <View style={styles.gameRow}>
                    <View style={styles.gameLeft}>
                      <View
                        style={[
                          styles.gameIconBox,
                          {
                            backgroundColor:
                              PASATIEMPOS_CATALOG.wordsearch.bgColor,
                          },
                        ]}
                      >
                        <Text style={styles.gameIconText}>A</Text>
                      </View>
                      <View style={styles.gameInfo}>
                        <Text style={styles.gameName}>Sopa de letras</Text>
                        <Text style={styles.gameSubDetail}>
                          {dev.wordsearch.foundWordsTotal} encontradas ·{' '}
                          {dev.wordsearch.missingWordsTotal} faltantes
                        </Text>
                      </View>
                    </View>
                    {renderStatusBadge(dev.wordsearch.status)}
                  </View>

                  {/* 3. Juego de la memoria */}
                  <View style={[styles.gameRow, styles.gameRowLast]}>
                    <View style={styles.gameLeft}>
                      <View
                        style={[
                          styles.gameIconBox,
                          {
                            backgroundColor: PASATIEMPOS_CATALOG.memory.bgColor,
                          },
                        ]}
                      >
                        <Text style={styles.gameIconText}>🃏</Text>
                      </View>
                      <View style={styles.gameInfo}>
                        <Text style={styles.gameName}>Juego de la memoria</Text>
                        <Text style={styles.gameSubDetail}>
                          {dev.memory.matchedPairs} pares encontrados ·{' '}
                          {dev.memory.unmatchedPairs} faltantes
                        </Text>
                      </View>
                    </View>
                    {renderStatusBadge(dev.memory.status)}
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
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.devicesList}>
              {summary.adultos.devices.map((dev, idx) => (
                <View
                  key={dev.deviceId}
                  style={[
                    styles.deviceSection,
                    idx > 0 && styles.deviceSectionDivider,
                  ]}
                >
                  <View style={styles.deviceHeaderRow}>
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

                  {/* Cuestionario diario (Mayores) */}
                  <View style={[styles.gameRow, styles.gameRowLast]}>
                    <View style={styles.gameLeft}>
                      <View
                        style={[
                          styles.gameIconBox,
                          { backgroundColor: palette.lotbaBlue },
                        ]}
                      >
                        <Text style={styles.gameIconText}>✓</Text>
                      </View>
                      <View style={styles.gameInfo}>
                        <Text style={styles.gameName}>Cuestionario diario</Text>
                        <Text style={styles.gameSubDetail}>
                          {dev.correctToday} correctas · {dev.wrongToday}{' '}
                          incorrectas
                        </Text>
                      </View>
                    </View>
                    {renderStatusBadge(dev.status)}
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
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};
