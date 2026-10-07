// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedDevicesSection (Auditoría de Dispositivos Protegidos)
// Archivo: src/components/dashboard/ProtectedDevicesSection.tsx
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Badge } from '../Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { DeviceInfo } from '../../types';

interface ProtectedDevicesSectionProps {
  devices: DeviceInfo[];
}

export const ProtectedDevicesSection: React.FC<ProtectedDevicesSectionProps> = ({
  devices,
}) => {
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);

  if (devices.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No hay dispositivos vinculados aún.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {devices.map((dev) => {
        const isActive =
          (dev.status as any) === 'ACTIVE' ||
          (dev.status as any)?.effectiveStatus === 'ACTIVE' ||
          dev.isProtected;
        const perms = dev.permissions || {
          vpn: true,
          accessibility: true,
          notifications: true,
          batteryOptimization: true,
          grantedCount: 4,
        };
        const isExpanded = expandedDeviceId === dev.deviceId;

        return (
          <View key={dev.deviceId || dev.deviceUuid} style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <View style={styles.deviceTitleCol}>
                <Text style={styles.deviceName}>{dev.deviceName}</Text>
                <Text style={styles.deviceInfo}>
                  Asignado a: {dev.childName || 'Menor'}
                </Text>
              </View>
              <Badge status={isActive ? 'activo' : 'inactivo'} />
            </View>

            {/* Resumen de Permisos */}
            <TouchableOpacity
              style={styles.permSummaryRow}
              onPress={() => setExpandedDeviceId(isExpanded ? null : dev.deviceId)}
              activeOpacity={0.7}
            >
              <View style={styles.permBadgeContainer}>
                <Text style={styles.permLabel}>Permisos Android:</Text>
                <Badge
                  status={perms.grantedCount === 4 ? 'activo' : 'alerta'}
                  label={`${perms.grantedCount}/4 CONCEDIDOS`}
                />
              </View>
              <Text style={styles.expandToggleText}>
                {isExpanded ? 'Ocultar ▲' : 'Ver Detalle ▼'}
              </Text>
            </TouchableOpacity>

            {/* Detalle Desplegable de Permisos */}
            {isExpanded && (
              <View style={styles.permDetailBox}>
                <Text style={styles.permDetailTitle}>Estado de Permisos del Sistema:</Text>

                <View style={styles.permItemRow}>
                  <Text style={styles.permItemText}>🌐 Servicio VPN (Filtrado LOTBA):</Text>
                  <Text style={[styles.permStatusText, perms.vpn ? styles.textGreen : styles.textRed]}>
                    {perms.vpn ? '✓ Concedido' : '✕ Pendiente'}
                  </Text>
                </View>

                <View style={styles.permItemRow}>
                  <Text style={styles.permItemText}>🔒 Accesibilidad (Antidesinstalación):</Text>
                  <Text style={[styles.permStatusText, perms.accessibility ? styles.textGreen : styles.textRed]}>
                    {perms.accessibility ? '✓ Concedido' : '⚠️ Pendiente'}
                  </Text>
                </View>

                <View style={styles.permItemRow}>
                  <Text style={styles.permItemText}>🔔 Notificaciones en Primer Plano:</Text>
                  <Text style={[styles.permStatusText, perms.notifications ? styles.textGreen : styles.textRed]}>
                    {perms.notifications ? '✓ Concedido' : '✕ Pendiente'}
                  </Text>
                </View>

                <View style={styles.permItemRow}>
                  <Text style={styles.permItemText}>🔋 Sin Optimización de Batería:</Text>
                  <Text style={[styles.permStatusText, perms.batteryOptimization ? styles.textGreen : styles.textRed]}>
                    {perms.batteryOptimization ? '✓ Concedido' : '⚠️ Pendiente'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 4,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  deviceInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  permSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  permBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  permLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  expandToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  permDetailBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permDetailTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  permItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  permItemText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  permStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textGreen: {
    color: colors.statusActive,
  },
  textRed: {
    color: colors.statusDanger,
  },
});
