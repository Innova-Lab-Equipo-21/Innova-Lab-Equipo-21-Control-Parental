// ==============================================================================
// Proyecto: BA Protege+
// Componente: Badge (Etiqueta de Estado UI Kit)
// Archivo: src/components/Badge.tsx
// Descripción: Componente reutilizable de UI Kit para mostrar insignias informativas de estado
//              ('activo', 'inactivo', 'alerta', 'danger') con colores e identidades visuales adaptativas.
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

/** Estados semánticos posibles para el componente Badge */
export type BadgeStatus = 'activo' | 'inactivo' | 'alerta' | 'danger';

/**
 * Propiedades recibidas por el componente Badge.
 *
 * @property status - Tipo de estado visual a representar ('activo' | 'inactivo' | 'alerta' | 'danger').
 * @property label - Texto personalizado opcional. Si no se provee, se usará el nombre genérico del estado.
 * @property style - Estilos adicionales opcionales para extender el contenedor de la insignia.
 */
interface BadgeProps {
  status: BadgeStatus;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente que renderiza una pequeña píldora o etiqueta de estado de color predeterminado.
 * Se utiliza para marcar la condición operativa de dispositivos, reglas o permisos en toda la app.
 */
export const Badge: React.FC<BadgeProps> = ({ status, label, style }) => {
  /** Obtiene la paleta de colores y etiqueta por defecto asociada a cada estado */
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
