// ==============================================================================
// Proyecto: BA Protege+
// Componente: StatusCard (Tarjeta de Estado Visual del Kit UI/UX)
// Archivo: src/components/StatusCard.tsx
// Descripción: Tarjeta visual de estado efectivo de protección con Badge e indicadores.
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Badge } from './Badge';
import { ProtectionStatus } from '../types';

interface StatusCardProps {
  status: ProtectionStatus;
  domainCount: number;
  blocklistVersion: number;
  lastSyncText?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  domainCount,
  blocklistVersion,
  lastSyncText = 'Ahora',
}) => {
  const isProtected = status === 'ACTIVE';

  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <Badge
          status={isProtected ? 'activo' : 'inactivo'}
          label={isProtected ? 'PROTECCIÓN ACTIVA' : 'PROTECCIÓN INACTIVA'}
        />
      </View>

      <Text style={styles.mainTitle}>
        {isProtected
          ? 'El dispositivo está protegido contra apuestas no autorizadas'
          : 'Atención: El filtrado de dominios está pausado'}
      </Text>

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{domainCount}</Text>
          <Text style={styles.metricLabel}>Dominios LOTBA</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>v{blocklistVersion}</Text>
          <Text style={styles.metricLabel}>Versión Lista</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{lastSyncText}</Text>
          <Text style={styles.metricLabel}>Último Latido</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeRow: {
    marginBottom: 12,
  },
  mainTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    ...typography.subtitle,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: '70%',
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
});
