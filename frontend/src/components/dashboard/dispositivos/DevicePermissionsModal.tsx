// ==============================================================================
// Proyecto: BA Protege+
// Componente: DevicePermissionsModal (Modal Bottom Sheet de Permisos de Dispositivo)
// Archivo: src/components/dashboard/dispositivos/DevicePermissionsModal.tsx
// Descripción: Modal Bottom Sheet que muestra el estado real de los permisos para
//              un dispositivo protegido o responsable con badges Activo/Inactivo
//              y CTA "Permisos" sin emojis y diseño compacto sin scroll.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Badge } from '../../Badge';
import { ActionButton } from '../../ActionButton';
import { DeviceInfo, DevicePermissionsStatus } from '../../../types';
import { checkRealDevicePermissions } from '../../../utils/permissionChecker';
import { styles } from './DevicePermissionsModal.styles';

export interface DevicePermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  device: DeviceInfo;
  isSelf: boolean;
  onNavigateToPermissions?: () => void;
}

interface PermissionDefinition {
  id: string;
  name: string;
  isGranted: boolean;
}

export const DevicePermissionsModal: React.FC<DevicePermissionsModalProps> = ({
  visible,
  onClose,
  device,
  isSelf,
  onNavigateToPermissions,
}) => {
  const [livePerms, setLivePerms] = useState<DevicePermissionsStatus | null>(null);

  // Consulta el estado real de permisos del hardware/sistema operativo al abrir el modal
  useEffect(() => {
    if (visible && isSelf) {
      checkRealDevicePermissions()
        .then((real) => setLivePerms(real))
        .catch(() => {});
    }
  }, [visible, isSelf]);

  const defaultPerms: DevicePermissionsStatus = {
    vpn: false,
    accessibility: false,
    notifications: false,
    batteryOptimization: false,
    location: false,
    usageStats: false,
    grantedCount: 0,
  };

  const perms = isSelf
    ? (livePerms || device.permissions || defaultPerms)
    : (device.permissions || defaultPerms);

  const permissionList: PermissionDefinition[] = [
    {
      id: 'vpn',
      name: 'Filtro para bloquear sitios no seguros',
      isGranted: !!perms.vpn,
    },
    {
      id: 'accessibility',
      name: 'Protección antidesinstalación',
      isGranted: !!perms.accessibility,
    },
    {
      id: 'notifications',
      name: 'Notificaciones del sistema',
      isGranted: !!perms.notifications,
    },
    {
      id: 'batteryOptimization',
      name: 'Protección con pantalla apagada',
      isGranted: !!perms.batteryOptimization,
    },
    {
      id: 'location',
      name: 'Ubicación y geolocalización',
      isGranted: !!perms.location,
    },
    {
      id: 'usageStats',
      name: 'Estadísticas de uso de aplicaciones',
      isGranted: !!perms.usageStats,
    },
  ];

  const grantedCount = permissionList.filter((p) => p.isGranted).length;
  const deviceName = isSelf
    ? (device.childName || 'Tutor Responsable')
    : (device.childName || device.deviceName || 'Dispositivo Protegido');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalCard}
          onStartShouldSetResponder={() => true}
        >
          {/* Manija táctil del Bottom Sheet */}
          <View style={styles.bottomSheetHandle} />

          {/* Cabecera */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {isSelf ? 'Permisos de mi dispositivo' : `Permisos de ${deviceName}`}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isSelf
                  ? 'Para que los bloqueos y avisos funcionen de manera continua.'
                  : 'Dispositivo Protegido • Estado de supervisión'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Cerrar modal"
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Resumen de permisos concedidos */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>
                {grantedCount === 6
                  ? 'Todos los permisos activos'
                  : `${grantedCount} de 6 permisos activos`}
              </Text>
              <Badge
                status={grantedCount === 6 ? 'activo' : (grantedCount === 0 ? 'inactivo' : 'alerta')}
                label={`${grantedCount}/6 activos`}
              />
            </View>
            {!isSelf && (
              <Text style={styles.summaryDesc} numberOfLines={1}>
                Permisos del menor para filtrado y control.
              </Text>
            )}
          </View>

          {/* Listado de los 6 Permisos */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={{ paddingBottom: 4 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {permissionList.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.permCard,
                  !item.isGranted && styles.permCardPending,
                ]}
              >
                <View style={styles.permInfoCol}>
                  <View style={styles.permTitleRow}>
                    <Text style={styles.permName} numberOfLines={1}>{item.name}</Text>
                    <Badge
                      status={item.isGranted ? 'activo' : 'inactivo'}
                      label={item.isGranted ? 'Activo' : 'Inactivo'}
                      style={styles.badgeItem}
                    />
                  </View>
                </View>
              </View>
            ))}

            {!isSelf && (
              <View style={styles.protectedNoticeBox}>
                <Text style={styles.protectedNoticeText} numberOfLines={2}>
                  Para autorizar o modificar permisos, deben ser otorgados directamente en el celular del protegido.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Acciones / Botones al pie del Modal */}
          <View style={styles.footerActions}>
            {isSelf ? (
              <View style={styles.footerButtonsRow}>
                <View style={styles.footerBtnCol}>
                  <ActionButton
                    title="Cerrar"
                    variant="secondary"
                    onPress={onClose}
                  />
                </View>
                <View style={styles.footerBtnCol}>
                  <ActionButton
                    title="Ver permisos"
                    variant="primary"
                    onPress={() => {
                      onClose();
                      if (onNavigateToPermissions) {
                        onNavigateToPermissions();
                      }
                    }}
                  />
                </View>
              </View>
            ) : (
              <ActionButton
                title="Cerrar"
                variant="primary"
                onPress={onClose}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
