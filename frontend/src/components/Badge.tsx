// ==============================================================================
// Proyecto: BA Protege+
// Componente: Badge (Etiqueta de Estado UI Kit)
// Archivo: src/components/Badge.tsx
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export type BadgeStatus = 'activo' | 'inactivo' | 'alerta';

interface BadgeProps {
  status: BadgeStatus;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
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
    }
  };

  const currentStyle = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: currentStyle.bg }]}>
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
