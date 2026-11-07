// ==============================================================================
// Proyecto: BA Protege+
// Componente: RecentAttemptsCard (Bloque 5: Últimos intentos bloqueados)
// Archivo: src/components/dashboard/actividad/RecentAttemptsCard.tsx
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FormattedBlockedAttempt } from '../../../utils/activityMetrics';
import { styles as baseStyles } from './ActivitySection.styles';
import { BlockedAttemptRow } from './BlockedAttemptRow';
import { styles } from './RecentAttemptsCard.styles';

export interface RecentAttemptsCardProps {
  recentAttempts: FormattedBlockedAttempt[];
  hasAnyAttempts: boolean;
  onSeeAll: () => void;
}

export const RecentAttemptsCard: React.FC<RecentAttemptsCardProps> = ({
  recentAttempts,
  hasAnyAttempts,
  onSeeAll,
}) => {
  return (
    <View style={baseStyles.card}>
      <View style={baseStyles.cardHeaderRow}>
        <Text style={baseStyles.sectionCardTitle}>
          Últimos intentos bloqueados
        </Text>
        {hasAnyAttempts && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAllLink}>Ver todo</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentAttempts.length === 0 ? (
        <Text style={styles.emptyText}>
          Sin intentos bloqueados en este período.
        </Text>
      ) : (
        recentAttempts.map((attempt, idx) => (
          <BlockedAttemptRow
            key={attempt.id}
            attempt={attempt}
            isLast={idx === recentAttempts.length - 1}
          />
        ))
      )}
    </View>
  );
};
