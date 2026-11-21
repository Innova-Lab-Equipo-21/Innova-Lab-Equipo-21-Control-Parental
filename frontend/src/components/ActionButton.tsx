// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (UI Component)
// Archivo: src/components/ActionButton.tsx
// Descripción: Botón de acción principal y secundario con soporte de estado de carga.
// ==============================================================================

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

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
  const isSecondary = variant === 'secondary';
  let btnBg = colors.primary;
  let textColor = colors.textLight;

  if (isSecondary) {
    btnBg = colors.surface;
    textColor = colors.primary;
  } else if (variant === 'danger') {
    btnBg = colors.statusDanger;
    textColor = colors.textLight;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: btnBg },
        isSecondary && styles.buttonSecondary,
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
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginVertical: 8,
  },
  buttonSecondary: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15.5,
    fontWeight: '700',
    textAlign: 'center',
  },
});
