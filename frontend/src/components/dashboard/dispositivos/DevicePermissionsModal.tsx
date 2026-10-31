// ==============================================================================
// Proyecto: BA Protege+
// Componente: DevicePermissionsModal (Modal Bottom Sheet de Permisos de Dispositivo)
// Archivo: src/components/dashboard/dispositivos/DevicePermissionsModal.tsx
// Descripción: Modal Bottom Sheet que muestra la lista de permisos habilitados para
//              un dispositivo protegido, y para el responsable incluye el CTA
//              para navegar a la pantalla de configuración de Permisos.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Badge } from '../../Badge';
import { ActionButton } from '../../ActionButton';
import { DeviceInfo } from '../../../types';
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
  desc: string;
  icon: string;
  isGranted: boolean;
}

export const DevicePermissionsModal: React.FC<DevicePermissionsModalProps> = ({
  visible,
  onClose,
  device,
  isSelf,
  onNavigateToPermissions,
}) => {
  const perms = device.permissions || {
    vpn: true,
    accessibility: true,
    notifications: true,
    batteryOptimization: true,
    location: true,
    usageStats: true,
    grantedCount: 6,
  };

  const permissionList: PermissionDefinition[] = [
    {
      id: 'vpn',
      name: 'Servicio de filtrado VPN',
      desc: 'Bloqueo de sitios de apuestas y contenido no seguro (LOTBA)',
      icon: '🌐',
      isGranted: !!perms.vpn,
    },
    {
      id: 'accessibility',
      name: 'Servicio de accesibilidad',
      desc: 'Protección antidesinstalación y cierre forzado de la app',
      icon: '🔒',
      isGranted: !!perms.accessibility,
    },
    {
      id: 'notifications',
      name: 'Notificaciones del sistema',
      desc: 'Alertas inmediatas y estado de supervisión continua',
      icon: '🔔',
      isGranted: !!perms.notifications,
    },
    {
      id: 'batteryOptimization',
      name: 'Optimización de batería',
      desc: 'Protección ininterrumpida con pantalla apagada en segundo plano',
      icon: '🔋',
      isGranted: !!perms.batteryOptimization,
    },
    {
      id: 'location',
      name: 'Ubicación y geolocalización',
      desc: 'Registro de localización y seguridad familiar',
      icon: '📍',
      isGranted: !!perms.location,
    },
    {
      id: 'usageStats',
      name: 'Estadísticas de uso de aplicaciones',
      desc: 'Supervisión de tiempo en pantalla y límites de apps',
      icon: '⏱️',
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
                  ? 'Dispositivo Responsable • Auditoría de seguridad'
                  : 'Dispositivo Protegido • Estado de supervisión'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Resumen de permisos concedidos */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>
                {grantedCount === 6
                  ? '✓ Todos los permisos activos'
                  : `${grantedCount} de 6 permisos habilitados`}
              </Text>
              <Badge
                status={grantedCount === 6 ? 'activo' : 'alerta'}
                label={`${grantedCount}/6 activos`}
              />
            </View>
            <Text style={styles.summaryDesc}>
              {isSelf
                ? 'Permisos otorgados en tu dispositivo para administrar y supervisar la protección familiar.'
                : 'Listado de permisos otorgados en el celular del protegido para el filtrado y control preventivo.'}
            </Text>
          </View>

          {/* Listado de los 6 Permisos */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={true}
          >
            {permissionList.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.permCard,
                  !item.isGranted && styles.permCardPending,
                ]}
              >
                <View style={styles.permIconContainer}>
                  <Text style={styles.permIcon}>{item.icon}</Text>
                </View>

                <View style={styles.permInfoCol}>
                  <View style={styles.permTitleRow}>
                    <Text style={styles.permName}>{item.name}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        item.isGranted ? styles.statusPillGreen : styles.statusPillOrange,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          item.isGranted ? styles.statusPillTextGreen : styles.statusPillTextOrange,
                        ]}
                      >
                        {item.isGranted ? '✓ Habilitado' : '⚠️ Pendiente'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.permDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}

            {!isSelf && (
              <View style={styles.protectedNoticeBox}>
                <Text style={styles.protectedNoticeText}>
                  ℹ️ Para autorizar o modificar permisos en este dispositivo, deben ser otorgados directamente en el celular del menor.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Acciones / Botones al pie del Modal */}
          <View style={styles.footerActions}>
            {isSelf ? (
              <View style={{ gap: 8 }}>
                <ActionButton
                  title="Ir a Permisos ⚙️"
                  variant="primary"
                  onPress={() => {
                    onClose();
                    if (onNavigateToPermissions) {
                      onNavigateToPermissions();
                    }
                  }}
                />
                <ActionButton
                  title="Cerrar"
                  variant="secondary"
                  onPress={onClose}
                />
              </View>
            ) : (
              <ActionButton
                title="Entendido"
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

