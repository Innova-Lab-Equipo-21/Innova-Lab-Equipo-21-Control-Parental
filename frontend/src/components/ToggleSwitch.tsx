// ==============================================================================
// Proyecto: BA Protege+
// Componente: ToggleSwitch (Switch OFF/ON UI Kit)
// Archivo: src/components/ToggleSwitch.tsx
// ==============================================================================

import React from 'react';
import { Switch, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

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
    <View style={styles.container}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.border,
          true: colors.primary,
        }}
        thumbColor={colors.surface}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
