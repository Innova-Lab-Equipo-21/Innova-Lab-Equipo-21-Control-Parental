// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeviceCard (Tarjeta Individual de Dispositivo)
// Archivo: src/components/dashboard/dispositivos/DeviceCard.tsx
// Descripción: Tarjeta modular que representa un dispositivo (Responsable o Protegido)
//              con cabecera, botón de engrenaje a la izquierda de editar, badge inferior
//              y toggle de autoprotección en el card del responsable.
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Badge } from '../../Badge';
import { Icon } from '../../Icon';
import { ToggleSwitch } from '../../ToggleSwitch';
import { DeviceInfo, SelfControlState } from '../../../types';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import { apiService } from '../../../services/api.service';
import { DevicePermissionsModal } from './DevicePermissionsModal';
import { styles } from './ProtectedDevicesSection.styles';

interface DeviceCardProps {
  device: DeviceInfo;
  index: number;
  isSelf: boolean;
  isPermsExpanded?: boolean;
  isCadastralExpanded?: boolean;
  onTogglePerms?: () => void;
  onToggleCadastral?: () => void;
  onEdit: (dev: DeviceInfo) => void;
  onUnbind: (dev: DeviceInfo) => void;
  onAuditPermissions?: (dev: DeviceInfo) => void;
  isAuditing?: boolean;
  selfControl?: SelfControlState;
  onStartSelfControlFlow?: () => void;
  onDisableSelfControl?: () => void;
  onOpenPermissions?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  index,
  isSelf,
  onEdit,
  onUnbind,
  selfControl,
  onStartSelfControlFlow,
  onDisableSelfControl,
  onOpenPermissions,
}) => {
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const highlight = getDeviceHighlight(
    device.deviceId,
    device.childName,
    device.deviceName,
    isSelf ? 0 : (device.colorIndex ?? index)
  );

  const isAutocontrolActive = Boolean(
    selfControl?.active ||
    selfControl?.status === 'ACTIVE_LOCKED' ||
    selfControl?.status === 'DEACTIVATION_PENDING'
  );

  const handleSelfControlPress = async () => {
    let currentSc = selfControl;
    try {
      currentSc = await apiService.getSelfControlStatus();
    } catch {
      // Usar estado en memoria como respaldo
    }
    if (!currentSc) return;

    if (currentSc.status === 'TEMPORARILY_UNLOCKED') {
      const unlH = currentSc.remainingUnlockHours ?? currentSc.remainingHours ?? 0;
      const unlM = (currentSc.remainingUnlockMinutes ?? currentSc.remainingMinutes ?? 0).toString().padStart(2, '0');
      const unlS = (currentSc.remainingUnlockSeconds ?? currentSc.remainingSeconds ?? 0).toString().padStart(2, '0');
      Alert.alert(
        'Autocontrol del responsable',
        `El sistema está desbloqueado temporalmente. Restan ${unlH}h ${unlM}m ${unlS}s para el rebloqueo automático.\n\n¿Deseás volver a activar el autocontrol ahora?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reactivar ahora', onPress: onStartSelfControlFlow },
        ]
      );
    } else if (currentSc.status === 'DEACTIVATION_READY') {
      Alert.alert(
        'Autocontrol del responsable',
        'Pasaron las 24 horas requeridas de espera. Presioná confirmar para desbloquear inmediatamente por un pase temporal de 24 horas.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar desbloqueo (24 hs)', onPress: onDisableSelfControl },
        ]
      );
    } else if (currentSc.status === 'DEACTIVATION_PENDING') {
      const waitH = currentSc.remainingWaitHours ?? currentSc.remainingHours ?? 0;
      const waitM = (currentSc.remainingWaitMinutes ?? currentSc.remainingMinutes ?? 0).toString().padStart(2, '0');
      const waitS = (currentSc.remainingWaitSeconds ?? currentSc.remainingSeconds ?? 0).toString().padStart(2, '0');
      Alert.alert(
        'Autocontrol en espera de 24hs',
        `La desactivación ya fue solicitada. Tiempo restante de espera: ${waitH}h ${waitM}m ${waitS}s.\n\nDurante este lapso, el bloqueo se mantendrá activo.`
      );
    } else if (currentSc.active) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'El autocontrol está activo en tu dispositivo impidiendo acceder o eliminar sitios y aplicaciones bloqueadas.\n\nAl solicitar la desactivación se iniciará una espera obligatoria de 24 horas. ¿Deseás solicitar la desactivación ahora?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Solicitar desactivación (espera 24h)', onPress: onDisableSelfControl },
        ]
      );
    } else {
      if (onStartSelfControlFlow) {
        onStartSelfControlFlow();
      }
    }
  };

  const isActive =
    device.status === 'ACTIVE' ||
    (device.status as any)?.effectiveStatus === 'ACTIVE' ||
    device.isProtected;

  // Título del dispositivo: "Nombre" (ej. "Mateo", "Cesar", "Tutor Responsable")
  const deviceTitle = isSelf
    ? (device.childName || 'Tutor Responsable')
    : (device.childName || device.deviceName?.replace(/^.*?\((.*?)\)$/, '$1') || device.deviceName || 'Protegido');

  return (
    <View
      style={[
        styles.deviceCard,
        {
          borderLeftColor: highlight.color,
          borderColor: highlight.borderColor,
        },
      ]}
    >
      {/* Cabecera del Card */}
      <View style={styles.deviceHeader}>
        <View style={[styles.deviceAvatar, { backgroundColor: highlight.bgColor }]}>
          <Text style={styles.deviceAvatarIcon}>{highlight.icon}</Text>
        </View>

        <View style={styles.deviceTitleCol}>
          <Text style={styles.deviceName} numberOfLines={1}>
            {deviceTitle}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          {/* Ícono de Engranaje / Permisos (al lado izquierdo de editar) */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowPermissionsModal(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Permisos del dispositivo"
          >
            <Icon name="engrenaje" size={20} />
          </TouchableOpacity>

          {/* Ícono de Edición de Datos */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onEdit(device)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Editar dispositivo"
          >
            <Icon name="editar" size={20} />
          </TouchableOpacity>

          {/* Ícono de Desvinculación (Solo dispositivos protegidos) */}
          {!isSelf && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onUnbind(device)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Desvincular dispositivo"
            >
              <Icon name="eliminar" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Línea inferior: Badge Vinculado/Inactivo a la izquierda (solo protegidos), y Autocontrol con Toggle a la derecha (solo responsable) */}
      <View style={styles.deviceFooterRow}>
        {!isSelf ? (
          <Badge
            status={isActive ? 'activo' : 'inactivo'}
            label={isActive ? 'Vinculado' : 'Inactivo'}
          />
        ) : (
          <View />
        )}

        {isSelf && (
          <TouchableOpacity
            style={styles.autoprotectionRow}
            activeOpacity={0.8}
            onPress={handleSelfControlPress}
          >
            <Text style={styles.autoprotectionLabel}>Autocontrol</Text>
            <ToggleSwitch
              value={isAutocontrolActive}
              onValueChange={handleSelfControlPress}
              activeColor="#007AFF"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Modal Bottom Sheet de Permisos del Dispositivo */}
      <DevicePermissionsModal
        visible={showPermissionsModal}
        device={device}
        isSelf={isSelf}
        onClose={() => setShowPermissionsModal(false)}
        onNavigateToPermissions={onOpenPermissions}
      />
    </View>
  );
};
