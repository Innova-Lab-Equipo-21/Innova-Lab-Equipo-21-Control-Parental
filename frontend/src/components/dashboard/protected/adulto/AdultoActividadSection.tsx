// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoActividadSection
// Archivo: src/components/dashboard/protected/adulto/AdultoActividadSection.tsx
// Descripción: Pestaña Actividad exclusiva del Modo Protegido Adulto con
//              exactamente 3 bloques en este orden:
//              1. Mis apps hoy
//              2. Cuestionario diario
//              3. Sitios y apps bloqueados (barra horizontal LOTBA vs Personalizada)
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BlockedAppsUsageSummary } from '../../../../utils/appUsageMetrics';
import { DailyPasatiemposRecord } from '../../../../utils/pasatiemposMetrics';
import {
  FormattedBlockedAttempt,
  getDisplayTitleForBlockedAttempt,
} from '../../../../utils/activityMetrics';
import { AppsUsageCard } from '../../actividad/blocks/AppsUsageCard';
import { SourceBadge } from '../../actividad/atomic/SourceBadge';
import { cardStyles } from '../../actividad/card.styles';
import { analyticsPalette as palette } from '../../actividad/palette';
import { styles } from './AdultoActividadSection.styles';

export interface AdultoActividadSectionProps {
  appsUsageSummary: BlockedAppsUsageSummary;
  todayRecord: DailyPasatiemposRecord;
  streakDays: number;
  weeklyQuizAccuracyPct: number;
  blockedAttempts: FormattedBlockedAttempt[];
  onOpenQuiz?: () => void;
  /** Prop opcional preservada por compatibilidad */
  customBlockedItems?: string[];
}

export const AdultoActividadSection: React.FC<AdultoActividadSectionProps> = ({
  appsUsageSummary,
  todayRecord,
  streakDays,
  weeklyQuizAccuracyPct,
  blockedAttempts,
  onOpenQuiz,
}) => {
  const { quiz } = todayRecord;
  const quizCompleted = quiz.status === 'completed';
  const quizInProgress = quiz.status === 'in_progress';

  // Métricas del bloque 3: Sitios y apps bloqueados (LOTBA vs Personalizada)
  const lotbaCount = blockedAttempts
    .filter((a) => a.sourceListType === 'LOTBA')
    .reduce((sum, a) => sum + (a.count || 1), 0);
  const customCount = blockedAttempts
    .filter((a) => a.sourceListType === 'CUSTOM')
    .reduce((sum, a) => sum + (a.count || 1), 0);
  const totalBlockedCount = lotbaCount + customCount;
  const lotbaPct =
    totalBlockedCount > 0 ? Math.round((lotbaCount / totalBlockedCount) * 100) : 0;
  const customPct = totalBlockedCount > 0 ? 100 - lotbaPct : 0;

  return (
    <View style={styles.container}>
      {/* 1. Mis apps hoy */}
      <AppsUsageCard
        summary={appsUsageSummary}
        variant="adult"
        title="Mis apps hoy"
      />

      {/* 2. Cuestionario diario */}
      <View style={cardStyles.card}>
        <View style={styles.quizHeaderRow}>
          <View style={styles.quizTitleGroup}>
            <View
              style={[
                styles.quizIconBox,
                quizCompleted && styles.quizIconBoxDone,
              ]}
            >
              <Text style={styles.quizIconText}>
                {quizCompleted ? '✓' : '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quizTitle}>Cuestionario diario</Text>
              <Text style={styles.quizSubtitle}>Salud digital y prevención</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusPill,
              quizCompleted
                ? styles.statusPillDone
                : quizInProgress
                  ? styles.statusPillProgress
                  : styles.statusPillPending,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                quizCompleted
                  ? styles.statusPillTextDone
                  : quizInProgress
                    ? styles.statusPillTextProgress
                    : styles.statusPillTextPending,
              ]}
            >
              {quizCompleted
                ? '✓ Hecho hoy'
                : quizInProgress
                  ? 'En curso'
                  : 'Pendiente'}
            </Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Aciertos hoy</Text>
            <Text style={styles.kpiValue}>
              {quiz.correctAnswers} de {quiz.totalQuestions}
            </Text>
            <Text style={styles.kpiSub}>
              {quiz.wrongAnswers} {quiz.wrongAnswers === 1 ? 'error' : 'errores'}
            </Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Racha</Text>
            <Text style={styles.kpiValue}>
              {streakDays} {streakDays === 1 ? 'día' : 'días'}
            </Text>
            <Text style={styles.kpiSub}>Días seguidos</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>En la semana</Text>
            <Text style={styles.kpiValue}>{weeklyQuizAccuracyPct}%</Text>
            <Text style={styles.kpiSub}>Precisión 7d</Text>
          </View>
        </View>

        {!quizCompleted && onOpenQuiz && (
          <TouchableOpacity
            style={styles.quizCtaButton}
            onPress={onOpenQuiz}
            activeOpacity={0.85}
          >
            <Text style={styles.quizCtaText}>
              {quizInProgress
                ? 'Continuar cuestionario diario ➔'
                : 'Responder cuestionario diario ➔'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Sitios y apps bloqueados */}
      <View style={cardStyles.card}>
        <View style={styles.blockedHeaderRow}>
          <Text style={styles.blockedTitle}>Sitios y apps bloqueados</Text>
          <Text style={styles.blockedSubtitleCount}>
            {totalBlockedCount === 1
              ? '1 intento en 7 días'
              : `${totalBlockedCount} intentos en 7 días`}
          </Text>
        </View>

        {/* Barra horizontal apilada: Lista LOTBA vs Lista Personalizada */}
        <View style={styles.stackedBarTrack}>
          {lotbaPct > 0 && (
            <View
              style={[styles.stackedBarLotba, { width: `${lotbaPct}%` }]}
            />
          )}
          {lotbaPct > 0 && customPct > 0 && (
            <View style={styles.stackedBarDivider} />
          )}
          {customPct > 0 && (
            <View
              style={[styles.stackedBarCustom, { width: `${customPct}%` }]}
            />
          )}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: palette.lotbaBlue },
              ]}
            />
            <Text style={styles.legendText}>
              LOTBA <Text style={styles.legendStrong}>{lotbaCount}</Text>{' '}
              <Text style={styles.legendPct}>{lotbaPct}%</Text>
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: palette.customAmber },
              ]}
            />
            <Text style={styles.legendText}>
              Personalizada{' '}
              <Text style={styles.legendStrong}>{customCount}</Text>{' '}
              <Text style={styles.legendPct}>{customPct}%</Text>
            </Text>
          </View>
        </View>

        {blockedAttempts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No se registraron intentos bloqueados en este dispositivo.
            </Text>
          </View>
        ) : (
          blockedAttempts.slice(0, 15).map((attempt, index, list) => {
            const isLotba = attempt.sourceListType === 'LOTBA';
            const displayTitle = getDisplayTitleForBlockedAttempt(
              attempt.attemptedDomain,
              attempt.sourceListType,
              attempt.itemType
            );
            return (
              <View
                key={attempt.id}
                style={[
                  styles.attemptRow,
                  index === list.length - 1 && styles.attemptRowLast,
                ]}
              >
                <View style={styles.attemptInfo}>
                  <Text style={styles.attemptTitle} numberOfLines={1}>
                    {displayTitle}
                  </Text>
                  <Text style={styles.attemptDate}>
                    {attempt.formattedDateTime}
                  </Text>
                </View>

                <SourceBadge
                  source={isLotba ? 'lotba' : 'custom'}
                  label={isLotba ? 'LOTBA' : 'Personalizada'}
                />
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};
