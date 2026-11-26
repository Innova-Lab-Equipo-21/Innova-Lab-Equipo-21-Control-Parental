// ==============================================================================
// Proyecto: BA Protege+
// Componente: BlocksBySourceCard (Bloqueos por fuente)
// Archivo: src/components/dashboard/actividad/blocks/BlocksBySourceCard.tsx
// Descripción: CORRECCIÓN 1 del prototipo: barra apilada Azul (LOTBA) vs Ámbar
//              (Personalizada) con corte blanco de 3px para accesibilidad visual.
// ==============================================================================

import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { cardStyles } from '../card.styles';
import { styles } from './BlocksBySourceCard.styles';

export interface BlocksBySourceCardProps {
  lotbaPct: number;
  customPct: number;
  children?: React.ReactNode;
  embedded?: boolean;
  initialExpanded?: boolean;
}

export const BlocksBySourceCard: React.FC<BlocksBySourceCardProps> = ({
  lotbaPct,
  customPct,
  children,
  embedded = false,
  initialExpanded = false,
}) => {
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  const isEmpty = lotbaPct === 0 && customPct === 0;
  const hasExpandableContent = Boolean(children);

  return (
    <View style={embedded ? styles.embeddedCard : cardStyles.card}>
      <TouchableOpacity
        activeOpacity={hasExpandableContent ? 0.75 : 1}
        disabled={!hasExpandableContent}
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            Cantidad de intentos según la lista
          </Text>
          {hasExpandableContent ? (
            <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
          ) : null}
        </View>

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
      </TouchableOpacity>

      {children && expanded ? (
        <View style={styles.expandedContent}>{children}</View>
      ) : null}
    </View>
  );
};
