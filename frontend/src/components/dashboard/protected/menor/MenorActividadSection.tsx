// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorActividadSection
// Archivo: src/components/dashboard/protected/menor/MenorActividadSection.tsx
// Descripción: Pestaña Actividad exclusiva del Modo Protegido Menor con
//              exactamente 2 bloques en este orden:
//              1. Mis apps hoy
//              2. Mis pasatiempos (Quiz, Sopa de letras [3 sopas] y Memoria)
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BlockedAppsUsageSummary } from '../../../../utils/appUsageMetrics';
import {
  DailyPasatiemposRecord,
  PasatiempoGameStatus,
} from '../../../../utils/pasatiemposMetrics';
import {
  PASATIEMPOS_CATALOG,
  PasatiempoGameId,
} from '../../../../utils/pasatiempos';
import { PasatiempoVisualIcon } from '../components/PasatiempoVisualIcon';
import { AppsUsageCard } from '../../actividad/blocks/AppsUsageCard';
import { cardStyles } from '../../actividad/card.styles';
import { analyticsPalette as palette } from '../../actividad/palette';
import { styles } from './MenorActividadSection.styles';

export interface MenorActividadSectionProps {
  appsUsageSummary: BlockedAppsUsageSummary;
  todayRecord: DailyPasatiemposRecord;
  streakDays: number;
  onOpenGame?: (gameId: PasatiempoGameId) => void;
  /** Prop opcional preservada por compatibilidad */
  customBlockedItems?: string[];
}

const getStatusLabel = (status: PasatiempoGameStatus): string => {
  if (status === 'completed') return '✓ Completado';
  if (status === 'in_progress') return 'En curso';
  return 'Pendiente';
};

export const MenorActividadSection: React.FC<MenorActividadSectionProps> = ({
  appsUsageSummary,
  todayRecord,
  streakDays,
  onOpenGame,
}) => {
  const { quiz, wordsearch, memory } = todayRecord;

  const handlePressGame = (gameId: PasatiempoGameId, status: PasatiempoGameStatus) => {
    if (status === 'completed') return;
    onOpenGame?.(gameId);
  };

  // Segmentos del Quiz: correctas (verde), incorrectas (rojo suave), sin responder (gris)
  const quizSegments = Array.from({ length: Math.max(1, quiz.totalQuestions) }, (_, i) => {
    if (i < quiz.correctAnswers) return PASATIEMPOS_CATALOG.quiz.bgColor;
    if (i < quiz.correctAnswers + quiz.wrongAnswers) return '#FCA5A5';
    return palette.cardBorder;
  });

  // Segmentos de Sopa de letras: 10 segmentos proporcionales a palabras encontradas de las 3 sopas
  const wsSegmentsCount = 10;
  const wsFilledSegments =
    wordsearch.totalWords > 0
      ? Math.round((wordsearch.foundWordsTotal / wordsearch.totalWords) * wsSegmentsCount)
      : 0;
  const wsSegments = Array.from({ length: wsSegmentsCount }, (_, i) =>
    i < wsFilledSegments
      ? PASATIEMPOS_CATALOG.wordsearch.bgColor
      : palette.cardBorder
  );

  // Segmentos de Memoria: 1 segmento por par (6 pares)
  const memorySegments = Array.from({ length: Math.max(1, memory.totalPairs) }, (_, i) =>
    i < memory.matchedPairs
      ? PASATIEMPOS_CATALOG.memory.bgColor
      : palette.cardBorder
  );

  return (
    <View style={styles.container}>
      {/* 1. Mis apps hoy */}
      <AppsUsageCard
        summary={appsUsageSummary}
        variant="child"
        title="Mis apps hoy"
      />

      {/* 2. Mis pasatiempos */}
      <View style={cardStyles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Mis pasatiempos</Text>
          {streakDays > 0 && (
            <View style={styles.headerPillsRow}>
              <View style={styles.streakPill}>
                <Text style={styles.streakPillText}>
                  🔥 {streakDays} {streakDays === 1 ? 'día' : 'días'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Juego 1: Juego de preguntas (correctas e incorrectas) */}
        <TouchableOpacity
          style={[styles.gameSection, styles.gameSectionFirst]}
          activeOpacity={quiz.status === 'completed' ? 1 : 0.8}
          disabled={quiz.status === 'completed' || !onOpenGame}
          onPress={() => handlePressGame('quiz', quiz.status)}
        >
          <View style={styles.gameTopRow}>
            <View style={styles.gameIdentityRow}>
              <PasatiempoVisualIcon gameId="quiz" size={40} />
              <View style={styles.gameTextCol}>
                <Text style={styles.gameTitle}>Juego de preguntas</Text>
                <Text style={styles.gameSubtitle}>
                  {quiz.correctAnswers}{' '}
                  {quiz.correctAnswers === 1 ? 'correcta' : 'correctas'} ·{' '}
                  {quiz.wrongAnswers}{' '}
                  {quiz.wrongAnswers === 1 ? 'incorrecta' : 'incorrectas'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                quiz.status === 'completed'
                  ? styles.statusBadgeCompleted
                  : quiz.status === 'in_progress'
                    ? styles.statusBadgeInProgress
                    : styles.statusBadgePending,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  quiz.status === 'completed'
                    ? styles.statusBadgeTextCompleted
                    : quiz.status === 'in_progress'
                      ? styles.statusBadgeTextInProgress
                      : styles.statusBadgeTextPending,
                ]}
              >
                {getStatusLabel(quiz.status)}
              </Text>
            </View>
          </View>

          <View style={styles.segmentsRow}>
            {quizSegments.map((color, idx) => (
              <View
                key={`quiz-seg-${idx}`}
                style={[styles.segmentPill, { backgroundColor: color }]}
              />
            ))}
          </View>
        </TouchableOpacity>

        {/* Juego 2: Sopa de letras (3 sopas diferentes: encontradas y no encontradas) */}
        <TouchableOpacity
          style={styles.gameSection}
          activeOpacity={wordsearch.status === 'completed' ? 1 : 0.8}
          disabled={wordsearch.status === 'completed' || !onOpenGame}
          onPress={() => handlePressGame('wordsearch', wordsearch.status)}
        >
          <View style={styles.gameTopRow}>
            <View style={styles.gameIdentityRow}>
              <PasatiempoVisualIcon gameId="wordsearch" size={40} />
              <View style={styles.gameTextCol}>
                <Text style={styles.gameTitle}>Sopa de letras</Text>
                <Text style={styles.gameSubtitle}>
                  {wordsearch.foundWordsTotal}{' '}
                  {wordsearch.foundWordsTotal === 1 ? 'encontrada' : 'encontradas'} ·{' '}
                  {wordsearch.missingWordsTotal}{' '}
                  {wordsearch.missingWordsTotal === 1 ? 'faltante' : 'faltantes'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                wordsearch.status === 'completed'
                  ? styles.statusBadgeCompleted
                  : wordsearch.status === 'in_progress'
                    ? styles.statusBadgeInProgress
                    : styles.statusBadgePending,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  wordsearch.status === 'completed'
                    ? styles.statusBadgeTextCompleted
                    : wordsearch.status === 'in_progress'
                      ? styles.statusBadgeTextInProgress
                      : styles.statusBadgeTextPending,
                ]}
              >
                {getStatusLabel(wordsearch.status)}
              </Text>
            </View>
          </View>

          <View style={styles.segmentsRow}>
            {wsSegments.map((color, idx) => (
              <View
                key={`ws-seg-${idx}`}
                style={[styles.segmentPill, { backgroundColor: color }]}
              />
            ))}
          </View>

          {/* Desglose individual de las 3 sopas de letras */}
          <View style={styles.boardsBreakdownContainer}>
            {wordsearch.boards.map((board) => (
              <View key={board.boardId} style={styles.boardRow}>
                <Text style={styles.boardName} numberOfLines={1}>
                  {board.completed ? '✓ ' : '• '}
                  {board.title}
                </Text>
                <Text
                  style={[
                    styles.boardStats,
                    board.completed && styles.boardStatsDone,
                  ]}
                >
                  {board.foundCount}{' '}
                  {board.foundCount === 1 ? 'encontrada' : 'encontradas'} ·{' '}
                  {board.missingCount}{' '}
                  {board.missingCount === 1 ? 'faltante' : 'faltantes'}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Juego 3: Juego de la memoria (pares encontrados, faltantes e intentos) */}
        <TouchableOpacity
          style={styles.gameSection}
          activeOpacity={memory.status === 'completed' ? 1 : 0.8}
          disabled={memory.status === 'completed' || !onOpenGame}
          onPress={() => handlePressGame('memory', memory.status)}
        >
          <View style={styles.gameTopRow}>
            <View style={styles.gameIdentityRow}>
              <PasatiempoVisualIcon gameId="memory" size={40} />
              <View style={styles.gameTextCol}>
                <Text style={styles.gameTitle}>Juego de la memoria</Text>
                <Text style={styles.gameSubtitle}>
                  {memory.matchedPairs}{' '}
                  {memory.matchedPairs === 1 ? 'par encontrado' : 'pares encontrados'} ·{' '}
                  {memory.unmatchedPairs}{' '}
                  {memory.unmatchedPairs === 1 ? 'faltante' : 'faltantes'} ·{' '}
                  {memory.attempts}{' '}
                  {memory.attempts === 1 ? 'intento' : 'intentos'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                memory.status === 'completed'
                  ? styles.statusBadgeCompleted
                  : memory.status === 'in_progress'
                    ? styles.statusBadgeInProgress
                    : styles.statusBadgePending,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  memory.status === 'completed'
                    ? styles.statusBadgeTextCompleted
                    : memory.status === 'in_progress'
                      ? styles.statusBadgeTextInProgress
                      : styles.statusBadgeTextPending,
                ]}
              >
                {getStatusLabel(memory.status)}
              </Text>
            </View>
          </View>

          <View style={styles.segmentsRow}>
            {memorySegments.map((color, idx) => (
              <View
                key={`mem-seg-${idx}`}
                style={[styles.segmentPill, { backgroundColor: color }]}
              />
            ))}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
