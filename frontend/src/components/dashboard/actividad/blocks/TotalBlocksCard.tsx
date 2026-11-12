// ==============================================================================
// Proyecto: BA Protege+
// Componente: TotalBlocksCard (Bloqueos totales + uptime + desglose por equipo)
// Archivo: src/components/dashboard/actividad/blocks/TotalBlocksCard.tsx
// Descripción: CORRECCIÓN 2 y 3 del prototipo: elimina el "% vs semana previa"
//              fuera de alcance y muestra la Continuidad de protección (#5) y el
//              desglose directo de Bloqueos por dispositivo (#22).
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { DeviceBreakdownItem } from '../types';
import { cardStyles } from '../card.styles';
import { styles } from './TotalBlocksCard.styles';

export interface TotalBlocksCardProps {
  totalBlocks: number;
  uptime: string;
  breakdown: DeviceBreakdownItem[];
}

export const TotalBlocksCard: React.FC<TotalBlocksCardProps> = ({
  totalBlocks,
  uptime,
  breakdown,
}) => {
  const formatted = totalBlocks.toLocaleString('es-AR');

  return (
    <View style={cardStyles.card}>
      <View style={styles.topRow}>
        <Text style={styles.kpiLabel}>Bloqueos totales</Text>
        <View style={styles.uptimeBadge}>
          <Text style={styles.uptimeText}>🛡️ Protección activa: {uptime}</Text>
        </View>
      </View>

      <View style={styles.mainRow}>
        <Text style={styles.kpiNumber}>{formatted}</Text>
        <Text style={styles.kpiSub}>intentos frenados</Text>
      </View>

      <View style={styles.breakdownRow}>
        {breakdown.map((item) => (
          <View key={item.label} style={styles.pill}>
            <Text style={styles.pillText}>
              {item.label}:{' '}
              <Text style={styles.pillStrong}>
                {item.count.toLocaleString('es-AR')}
              </Text>{' '}
              ({item.pct}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
