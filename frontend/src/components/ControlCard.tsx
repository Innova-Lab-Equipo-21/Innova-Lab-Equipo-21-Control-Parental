// ==============================================================================
// Proyecto: BA Protege+
// Componente: ControlCard (Tarjeta de Control UI Kit)
// Archivo: src/components/ControlCard.tsx
// Descripción: Tarjeta genérica de control configurable de UI Kit que integra
//              un título, descripción informativa, insignia de estado (Badge) y
//              un interruptor de activación/desactivación (ToggleSwitch).
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Badge, BadgeStatus } from './Badge';
import { ToggleSwitch } from './ToggleSwitch';

/**
 * Propiedades para la tarjeta de control ControlCard.
 *
 * @property title - Título del ajuste o regla de control parental.
 * @property description - Explicación breve sobre el funcionamiento de la regla.
 * @property active - Estado booleano de activación del control (true = activo).
 * @property disabled - Si se establece en true, deshabilita la interacción con el switch.
 * @property status - Estado personalizado opcional para la insignia Badge.
 * @property onToggle - Callback ejecutado cuando el usuario conmuta el estado del interruptor.
 */
interface ControlCardProps {
  title: string;
  description: string;
  active: boolean;
  disabled?: boolean;
  status?: BadgeStatus;
  onToggle: (newValue: boolean) => void;
}

/**
 * Componente que renderiza una tarjeta interactiva para la gestión de filtros o reglas.
 * Agrupa la descripción explicativa de la función junto a su switch de control.
 */
export const ControlCard: React.FC<ControlCardProps> = ({
  title,
  description,
  active,
  disabled = false,
  status,
  onToggle,
}) => {
  const currentBadgeStatus: BadgeStatus = status || (active ? 'activo' : 'inactivo');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Badge status={currentBadgeStatus} />
        </View>
        <ToggleSwitch value={active} onValueChange={onToggle} disabled={disabled} />
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
