// ==============================================================================
// Proyecto: BA Protege+
// Componente: BlocksBySourceCard (Bloque 3: Bloqueos por fuente)
// Archivo: src/components/dashboard/actividad/BlocksBySourceCard.tsx
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { ActivityMetricsSnapshot } from '../../../utils/activityMetrics';
import { styles as baseStyles } from './ActivitySection.styles';
import { styles } from './BlocksBySourceCard.styles';

export interface BlocksBySourceCardProps {
  totalBlocks: number;
  sources: ActivityMetricsSnapshot['sources'];
}

export const BlocksBySourceCard: React.FC<BlocksBySourceCardProps> = ({
  totalBlocks,
  sources,
}) => {
  return (
    <View style={baseStyles.card}>
      <Text style={baseStyles.sectionCardTitle}>Bloqueos por fuente</Text>

      <View style={styles.sourceBarTrack}>
        {totalBlocks > 0 ? (
          <>
            {sources.lotba.pct > 0 && (
              <View
                style={[
                  styles.sourceBarSegmentLotba,
                  { flex: sources.lotba.pct },
                ]}
              />
            )}
            {sources.custom.pct > 0 && (
              <View
                style={[
                  styles.sourceBarSegmentCustom,
                  { flex: sources.custom.pct },
                ]}
              />
            )}
          </>
        ) : (
          <View style={styles.sourceBarEmpty} />
        )}
      </View>

      <View style={styles.sourceLegendRow}>
        <Text style={styles.sourceLegendItem}>
          <Text style={styles.sourceLegendNameLotba}>Lista LOTBA </Text>
          <Text style={styles.sourceLegendCount}>
            {sources.lotba.formattedCount}{' '}
          </Text>
          <Text style={styles.sourceLegendPct}>{sources.lotba.pct}%</Text>
        </Text>

        <Text style={styles.sourceLegendItem}>
          <Text style={styles.sourceLegendNameCustom}>Personalizada </Text>
          <Text style={styles.sourceLegendCount}>
            {sources.custom.formattedCount}{' '}
          </Text>
          <Text style={styles.sourceLegendPct}>{sources.custom.pct}%</Text>
        </Text>
      </View>
    </View>
  );
};
