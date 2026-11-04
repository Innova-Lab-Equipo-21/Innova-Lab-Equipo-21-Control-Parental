// ==============================================================================
// Proyecto: BA Protege+
// Componente: Badge (Etiqueta de Estado UI Kit)
// Archivo: src/components/Badge.tsx
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export type BadgeStatus = 'activo' | 'inactivo' | 'alerta' | 'danger';

interface BadgeProps {
  status: BadgeStatus;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, style }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'activo':
        return {
          bg: colors.statusActiveBg,
          text: colors.statusActive,
          defaultLabel: 'Activo',
        };
      case 'inactivo':
        return {
          bg: colors.statusInactiveBg,
          text: colors.statusInactive,
          defaultLabel: 'Inactivo',
        };
      case 'alerta':
        return {
          bg: colors.statusWarningBg,
          text: colors.statusWarning,
          defaultLabel: 'Alerta',
        };
      case 'danger':
        return {
          bg: colors.statusDangerBg,
          text: colors.statusDanger,
          defaultLabel: 'Desbloqueado',
        };
    }
  };

  const currentStyle = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: currentStyle.bg }, style]}>
      <Text style={[styles.text, { color: currentStyle.text }]}>
        {label || currentStyle.defaultLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
