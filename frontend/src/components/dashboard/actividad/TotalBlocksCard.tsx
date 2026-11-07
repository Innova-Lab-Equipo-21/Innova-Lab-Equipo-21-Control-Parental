// ==============================================================================
// Proyecto: BA Protege+
// Componente: TotalBlocksCard (Bloque 2: Bloqueos totales y variación vs. previo)
// Archivo: src/components/dashboard/actividad/TotalBlocksCard.tsx
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { styles as baseStyles } from './ActivitySection.styles';
import { styles } from './TotalBlocksCard.styles';

export interface TotalBlocksCardProps {
  formattedTotalBlocks: string;
  changeDirection: 'up' | 'down' | 'neutral';
  changeBadgeText: string;
}

export const TotalBlocksCard: React.FC<TotalBlocksCardProps> = ({
  formattedTotalBlocks,
  changeDirection,
  changeBadgeText,
}) => {
  const deltaBadgeVariant =
    changeDirection === 'up'
      ? styles.kpiDeltaBadgeUp
      : changeDirection === 'down'
        ? styles.kpiDeltaBadgeDown
        : styles.kpiDeltaBadgeNeutral;

  const deltaTextVariant =
    changeDirection === 'up'
      ? styles.kpiDeltaTextUp
      : changeDirection === 'down'
        ? styles.kpiDeltaTextDown
        : styles.kpiDeltaTextNeutral;

  return (
    <View style={baseStyles.card}>
      <Text style={styles.kpiOverline}>Bloqueos totales</Text>
      <View style={styles.kpiMainRow}>
        <Text style={styles.kpiValue}>{formattedTotalBlocks}</Text>
        <View style={[styles.kpiDeltaBadge, deltaBadgeVariant]}>
          <Text style={[styles.kpiDeltaText, deltaTextVariant]}>
            {changeBadgeText}
          </Text>
        </View>
      </View>
      <Text style={styles.kpiSubtitle}>Intentos de acceso frenados</Text>
    </View>
  );
};
