// ==============================================================================
// Proyecto: BA Protege+
// Componente: ControlCard (Tarjeta de Control UI Kit)
// Archivo: src/components/ControlCard.tsx
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Badge, BadgeStatus } from './Badge';
import { ToggleSwitch } from './ToggleSwitch';

interface ControlCardProps {
  title: string;
  description: string;
  active: boolean;
  disabled?: boolean;
  status?: BadgeStatus;
  onToggle: (newValue: boolean) => void;
}

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
