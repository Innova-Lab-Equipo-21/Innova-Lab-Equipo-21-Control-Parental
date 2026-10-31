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
  StyleSheet,
  Platform,
} from 'react-native';
import { Badge } from '../../Badge';
import { ActionButton } from '../../ActionButton';
import { colors } from '../../../theme/colors';
import { DeviceInfo } from '../../../types';

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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    maxHeight: '86%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  summaryBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  summaryDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  scrollBody: {
    marginVertical: 4,
  },
  permCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  permCardPending: {
    backgroundColor: '#FFFDF9',
    borderColor: '#FED7AA',
  },
  permIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  permIcon: {
    fontSize: 18,
  },
  permInfoCol: {
    flex: 1,
  },
  permTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  permName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillGreen: {
    backgroundColor: '#E8F5E9',
  },
  statusPillOrange: {
    backgroundColor: '#FFF3E0',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPillTextGreen: {
    color: '#2E7D32',
  },
  statusPillTextOrange: {
    color: '#E65100',
  },
  permDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  protectedNoticeBox: {
    backgroundColor: '#E7F1FF',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#B6D4FE',
  },
  protectedNoticeText: {
    fontSize: 11.5,
    color: '#0A58CA',
    lineHeight: 16,
  },
  footerActions: {
    marginTop: 10,
  },
});
