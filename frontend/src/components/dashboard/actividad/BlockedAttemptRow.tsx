// ==============================================================================
// Proyecto: BA Protege+
// Componente: BlockedAttemptRow (Fila reutilizable de intento bloqueado)
// Archivo: src/components/dashboard/actividad/BlockedAttemptRow.tsx
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { FormattedBlockedAttempt } from '../../../utils/activityMetrics';
import { styles } from './RecentAttemptsCard.styles';

export interface BlockedAttemptRowProps {
  attempt: FormattedBlockedAttempt;
  isLast?: boolean;
}

export const BlockedAttemptRow: React.FC<BlockedAttemptRowProps> = ({
  attempt,
  isLast = false,
}) => {
  const isCustom = attempt.sourceListType === 'CUSTOM';

  return (
    <View style={[styles.attemptRow, isLast && styles.attemptRowLast]}>
      <View style={styles.attemptLeftCol}>
        <Text style={styles.attemptDomain} numberOfLines={1}>
          {attempt.attemptedDomain}
        </Text>
        <Text style={styles.attemptMeta} numberOfLines={1}>
          {attempt.deviceName} · {attempt.relativeTime}
        </Text>
      </View>

      <View
        style={[
          styles.sourcePill,
          isCustom ? styles.sourcePillCustom : styles.sourcePillLotba,
        ]}
      >
        <Text
          style={[
            styles.sourcePillText,
            isCustom ? styles.sourcePillTextCustom : styles.sourcePillTextLotba,
          ]}
        >
          {attempt.sourceLabel}
        </Text>
      </View>
    </View>
  );
};
