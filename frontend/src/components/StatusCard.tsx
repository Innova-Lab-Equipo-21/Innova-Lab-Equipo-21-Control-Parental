// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (UI Component)
// Archivo: src/components/StatusCard.tsx
// Descripción: Tarjeta visual de estado efectivo de protección con indicadores en tiempo real.
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
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

  const badgeColor = isProtected ? colors.statusActive : colors.statusDanger;
  const badgeBg = isProtected ? colors.statusActiveBg : colors.statusDangerBg;
  const statusLabel = isProtected ? 'PROTECCIÓN ACTIVA' : 'PROTECCIÓN INACTIVA';

  return (
    <View style={styles.card}>
      <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
        <View style={[styles.statusDot, { backgroundColor: badgeColor }]} />
        <Text style={[styles.statusText, { color: badgeColor }]}>{statusLabel}</Text>
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
    backgroundColor: colors.surface,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
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
