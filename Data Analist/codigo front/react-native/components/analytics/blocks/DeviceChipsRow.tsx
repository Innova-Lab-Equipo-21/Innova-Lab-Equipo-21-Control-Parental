// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeviceChipsRow (Selector de dispositivos por chips)
// Archivo: components/analytics/DeviceChipsRow.tsx
// Descripción: Fila de chips horizontales para filtrar el panel por dispositivo
//              ("Todos" + dispositivos del usuario) con dot de estado en vivo.
// ==============================================================================

import React from 'react';
import { ScrollView, View } from 'react-native';
import { PillChip, StatusDotColor } from '../atomic/PillChip';
import { styles } from './DeviceChipsRow.styles';

export interface DeviceChipOption {
  id: string;
  label: string;
  status?: StatusDotColor;
}

export interface DeviceChipsRowProps {
  options: DeviceChipOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  allLabel?: string;
  testID?: string;
}

export const DeviceChipsRow: React.FC<DeviceChipsRowProps> = ({
  options,
  selectedId,
  onSelect,
  allLabel = 'Todos',
  testID,
}) => {
  return (
    <View testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PillChip
          label={allLabel}
          selected={selectedId === 'all'}
          onPress={() => onSelect('all')}
        />
        {options.map((opt) => (
          <PillChip
            key={opt.id}
            label={opt.label}
            statusDot={opt.status}
            selected={selectedId === opt.id}
            onPress={() => onSelect(opt.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
