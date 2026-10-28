// ==============================================================================
// Proyecto: BA Protege+
// Componente: ToggleSwitch (Switch OFF/ON UI Kit)
// Archivo: src/components/ToggleSwitch.tsx
// ==============================================================================

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[
        styles.track,
        value ? styles.trackActive : styles.trackInactive,
        disabled && styles.disabled,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <View
        style={[
          styles.thumb,
          value ? styles.thumbActive : styles.thumbInactive,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: '#007AFF',
  },
  trackInactive: {
    backgroundColor: '#D1D5DB',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2.5,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  thumbInactive: {
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
});
