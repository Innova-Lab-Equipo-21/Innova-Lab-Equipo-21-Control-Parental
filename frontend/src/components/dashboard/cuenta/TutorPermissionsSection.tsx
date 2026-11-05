// ==============================================================================
// Proyecto: BA Protege+
// Componente: TutorPermissionsSection (Auditoría de Permisos del Dispositivo Tutor)
// Archivo: src/components/dashboard/cuenta/TutorPermissionsSection.tsx
// Descripción: Muestra el estado de permisos clave concedidos en el dispositivo responsable,
//              desplegando una tarjeta de advertencia si existen permisos faltantes.
// ==============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { Badge } from '../../Badge';
import { PermissionItemState } from '../../../screens/PermissionsScreen';
import { styles } from './TutorPermissionsSection.styles';

/**
 * Propiedades para el componente TutorPermissionsSection.
 *
 * @property permissions - Estado actual de los 5 permisos críticos del sistema (VPN, Accesibilidad, Notificaciones, Batería, Ubicación).
 * @property onConfigurePermissions - Callback invocado al presionar el botón de auditar o configurar permisos faltantes.
 */
interface TutorPermissionsSectionProps {
  permissions?: PermissionItemState;
  onConfigurePermissions: () => void;
}

/**
 * Componente que audita y visualiza el estado de los permisos requeridos en el dispositivo del tutor.
 * Muestra un banner verde simplificado si todos los permisos se encuentran activos (5/5),
 * o un banner de advertencia detallado con el listado de los permisos pendientes en caso contrario.
 */
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
            ⚠️ Permisos pendientes del tutor ({localGrantedCount}/5 concedidos)
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
            title="Configurar permisos faltantes ⚙️"
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
        <Text style={styles.permissionsTitle}>Permisos del dispositivo tutor</Text>
        <Text style={styles.permissionsDesc}>Todos los permisos configurados (5/5 concedidos).</Text>
      </View>
      <ActionButton
        title="Auditar ⚙️"
        variant="secondary"
        onPress={onConfigurePermissions}
      />
    </View>
  );
};
