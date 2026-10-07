// ==============================================================================
// Proyecto: BA Protege+
// Componente: TutorPermissionsSection (Auditoría de Permisos del Dispositivo Tutor)
// Archivo: src/components/dashboard/TutorPermissionsSection.tsx
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActionButton } from '../ActionButton';
import { Badge } from '../Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PermissionItemState } from '../../screens/PermissionsScreen';

interface TutorPermissionsSectionProps {
  permissions?: PermissionItemState;
  onConfigurePermissions: () => void;
}

export const TutorPermissionsSection: React.FC<TutorPermissionsSectionProps> = ({
  permissions,
  onConfigurePermissions,
}) => {
  const missingLocalPermissions: string[] = [];
  if (permissions) {
    if (!permissions.vpn) missingLocalPermissions.push('Servicio de Filtrado VPN');
    if (!permissions.accessibility) missingLocalPermissions.push('Servicio de Accesibilidad (Antidesinstalación)');
    if (!permissions.notifications) missingLocalPermissions.push('Notificaciones del Sistema');
    if (!permissions.batteryOptimization) missingLocalPermissions.push('Exención de Batería (Segundo Plano)');
  }
  const localGrantedCount = permissions ? 4 - missingLocalPermissions.length : 4;

  if (missingLocalPermissions.length > 0) {
    return (
      <View style={styles.warningBannerCard}>
        <View style={styles.warningHeaderRow}>
          <Text style={styles.warningTitle}>
            ⚠️ Permisos Pendientes del Tutor ({localGrantedCount}/4 Concedidos)
          </Text>
          <Badge status="alerta" label="INCOMPLETO" />
        </View>
        <Text style={styles.warningDesc}>
          Tu dispositivo de responsable no cuenta con todos los permisos habilitados. Faltan autorizar:
        </Text>
        {missingLocalPermissions.map((permText, idx) => (
          <Text key={idx} style={styles.missingItemText}>
            • {permText}
          </Text>
        ))}
        <View style={styles.warningActionBox}>
          <ActionButton
            title="Configurar Permisos Faltantes ⚙️"
            variant="primary"
            onPress={onConfigurePermissions}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.permissionsBar}>
      <View style={styles.permissionsTextCol}>
        <Text style={styles.permissionsTitle}>Permisos del Dispositivo Tutor</Text>
        <Text style={styles.permissionsDesc}>Todos los permisos configurados (4/4 Concedidos).</Text>
      </View>
      <ActionButton
        title="Auditar ⚙️"
        variant="secondary"
        onPress={onConfigurePermissions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  warningBannerCard: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginVertical: 4,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '800',
    color: '#856404',
  },
  warningDesc: {
    ...typography.body,
    fontSize: 12,
    color: '#856404',
    marginBottom: 6,
    lineHeight: 16,
  },
  missingItemText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#856404',
    marginLeft: 4,
    marginVertical: 2,
  },
  warningActionBox: {
    marginTop: 8,
  },
  permissionsBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionsTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  permissionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permissionsDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
