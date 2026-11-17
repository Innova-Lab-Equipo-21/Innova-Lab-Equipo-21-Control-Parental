// ==============================================================================
// Proyecto: BA Protege+
// Componente: PillChip (Chip seleccionable reutilizable)
// Archivo: src/components/dashboard/actividad/atomic/PillChip.tsx
// Descripción: Píldora táctil usada para el selector de dispositivos y el
//              selector de día estilo Google Maps. Acepta un dot de estado.
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { analyticsPalette as palette } from '../palette';
import { styles } from './PillChip.styles';

export type StatusDotColor = 'online' | 'warning' | 'offline';

export interface PillChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  statusDot?: StatusDotColor;
  testID?: string;
}

const DOT_COLORS: Record<StatusDotColor, string> = {
  online: palette.success,
  warning: palette.warning,
  offline: palette.offline,
};

export const PillChip: React.FC<PillChipProps> = ({
  label,
  selected = false,
  onPress,
  statusDot,
  testID,
}) => {
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipActive]}
    >
      {statusDot ? (
        <View
          style={[styles.dot, { backgroundColor: DOT_COLORS[statusDot] }]}
        />
      ) : null}
      <Text style={[styles.label, selected && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
};
