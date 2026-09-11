// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (UI Component)
// Archivo: src/components/ActionButton.tsx
// Descripción: Botón de acción principal y secundario con soporte de estado de carga.
// ==============================================================================

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors.js';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) => {
  let btnBg = colors.primary;
  let textColor = colors.textLight;

  if (variant === 'secondary') {
    btnBg = colors.primaryLight;
    textColor = colors.primaryDark;
  } else if (variant === 'danger') {
    btnBg = colors.statusDanger;
    textColor = colors.textLight;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: btnBg },
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
