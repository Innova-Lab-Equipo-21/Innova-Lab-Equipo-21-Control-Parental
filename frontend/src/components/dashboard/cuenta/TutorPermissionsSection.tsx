// ==============================================================================
// Proyecto: BA Protege+
// Componente: TutorPermissionsSection (Auditoría de Permisos del Dispositivo Tutor)
// Archivo: src/components/dashboard/cuenta/TutorPermissionsSection.tsx
// ==============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { Badge } from '../../Badge';
import { PermissionItemState } from '../../../screens/PermissionsScreen';
import { styles } from './TutorPermissionsSection.styles';

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
    if (!permissions.location) missingLocalPermissions.push('Ubicación y Geolocalización (GPS)');
  }
  const localGrantedCount = permissions ? 5 - missingLocalPermissions.length : 5;

  if (missingLocalPermissions.length > 0) {
    return (
      <View style={styles.warningBannerCard}>
        <View style={styles.warningHeaderRow}>
          <Text style={styles.warningTitle}>
            ⚠️ Permisos Pendientes del Tutor ({localGrantedCount}/5 Concedidos)
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
        <Text style={styles.permissionsDesc}>Todos los permisos configurados (5/5 Concedidos).</Text>
      </View>
      <ActionButton
        title="Auditar ⚙️"
        variant="secondary"
        onPress={onConfigurePermissions}
      />
    </View>
  );
};
