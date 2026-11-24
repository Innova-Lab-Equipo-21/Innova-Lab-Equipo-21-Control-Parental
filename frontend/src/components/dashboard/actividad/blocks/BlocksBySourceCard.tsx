// ==============================================================================
// Proyecto: BA Protege+
// Componente: BlocksBySourceCard (Bloqueos por fuente)
// Archivo: src/components/dashboard/actividad/blocks/BlocksBySourceCard.tsx
// Descripción: CORRECCIÓN 1 del prototipo: barra apilada Azul (LOTBA) vs Ámbar
//              (Personalizada) con corte blanco de 3px para accesibilidad visual.
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { cardStyles } from '../card.styles';
import { styles } from './BlocksBySourceCard.styles';

export interface BlocksBySourceCardProps {
  lotbaPct: number;
  customPct: number;
  children?: React.ReactNode;
}

export const BlocksBySourceCard: React.FC<BlocksBySourceCardProps> = ({
  lotbaPct,
  customPct,
  children,
}) => {
  const isEmpty = lotbaPct === 0 && customPct === 0;

  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.cardHeaderTitle}>Bloqueos por fuente</Text>

      <View
        style={[
          styles.barContainer,
          isEmpty && styles.barContainerEmpty,
        ]}
      >
        {lotbaPct > 0 ? (
          <View style={[styles.segmentLotba, { flex: lotbaPct }]} />
        ) : null}
        {customPct > 0 ? (
          <View style={[styles.segmentCustom, { flex: customPct }]} />
        ) : null}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, styles.swatchLotba]} />
          <Text style={styles.legendNameLotba}>Lista LOTBA</Text>
          <Text style={styles.legendPct}>{lotbaPct}%</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.swatch, styles.swatchCustom]} />
          <Text style={styles.legendNameCustom}>Personalizada</Text>
          <Text style={styles.legendPct}>{customPct}%</Text>
        </View>
      </View>

      {children ? <View style={{ marginTop: 12 }}>{children}</View> : null}
    </View>
  );
};
