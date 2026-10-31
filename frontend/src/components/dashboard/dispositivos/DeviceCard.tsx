// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeviceCard (Tarjeta Individual de Dispositivo)
// Archivo: src/components/dashboard/dispositivos/DeviceCard.tsx
// Descripción: Tarjeta modular que representa un dispositivo (Responsable o Protegido)
//              con cabecera, datos cadastrales colapsables, 6 permisos y autocontrol.
// ==============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Badge } from '../../Badge';
import { Icon } from '../../Icon';
import { colors } from '../../../theme/colors';
import { DeviceInfo, SelfControlState } from '../../../types';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import { calculateAge } from '../../../utils/age';
import { apiService } from '../../../services/api.service';
import { styles } from './ProtectedDevicesSection.styles';

interface DeviceCardProps {
  device: DeviceInfo;
  index: number;
  isSelf: boolean;
  isPermsExpanded: boolean;
  isCadastralExpanded: boolean;
  onTogglePerms: () => void;
  onToggleCadastral: () => void;
  onEdit: (dev: DeviceInfo) => void;
  onUnbind: (dev: DeviceInfo) => void;
  onAuditPermissions?: (dev: DeviceInfo) => void;
  isAuditing?: boolean;
  selfControl?: SelfControlState;
  onStartSelfControlFlow?: () => void;
  onDisableSelfControl?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  index,
  isSelf,
  isPermsExpanded,
  isCadastralExpanded,
  onTogglePerms,
  onToggleCadastral,
  onEdit,
  onUnbind,
  onAuditPermissions,
  isAuditing = false,
  selfControl,
  onStartSelfControlFlow,
  onDisableSelfControl,
}) => {
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

  const perms = device.permissions || {
    vpn: true,
    accessibility: true,
    notifications: true,
    batteryOptimization: true,
    location: true,
    usageStats: true,
    grantedCount: 6,
  };

  const age = device.birthDate ? calculateAge(device.birthDate) : null;

  // Título del dispositivo: "Nombre" (ej. "Mateo", "Cesar", "Tutor Responsable") en vez de "Dispositivo (Nombre)"
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
          {/* Badge de Estado: al lado izquierdo de los íconos de acción, perfectamente centrado verticalmente */}
          <Badge status={isActive ? 'activo' : 'inactivo'} style={styles.headerBadge} />

          {/* Ícono de Edición de Datos */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onEdit(device)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Editar dispositivo"
          >
            <Icon name="editar" size={20} />
          </TouchableOpacity>

          {/* Ícono Inteligente de Autocontrol (Solo responsable, verde si activo) */}
          {isSelf && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSelfControlPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Autocontrol del responsable"
            >
              <Icon
                name="escudo"
                size={20}
                color={isAutocontrolActive ? '#28A745' : colors.textSecondary}
              />
            </TouchableOpacity>
          )}

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

      {/* Resumen de Datos Registrados y Toggle Desplegable (Solo flecha ▼/▲) */}
      <TouchableOpacity
        style={styles.cadastralSummaryRow}
        onPress={onToggleCadastral}
        activeOpacity={0.7}
      >
        <View style={styles.cadastralBadgeContainer}>
          <Text style={styles.permLabel}>Datos registrados:</Text>
          {device.createdAt && (
            <Text style={styles.countText}>Vinculado: {device.createdAt}</Text>
          )}
        </View>
        <Text style={styles.expandArrowOnly}>
          {isCadastralExpanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Detalle Desplegable de Datos Registrados */}
      {isCadastralExpanded && (
        <View style={styles.cadastralBox}>
          <View style={styles.cadastralGrid}>
            <View style={styles.cadastralRow}>
              <View style={styles.cadastralCol}>
                <Text style={styles.cadastralLabel}>Titular / protegido:</Text>
                <Text style={styles.cadastralValue} numberOfLines={1}>
                  {device.childName || 'No informado'}
                </Text>
              </View>
              <View style={styles.cadastralCol}>
                <Text style={styles.cadastralLabel}>Perfil:</Text>
                <Text style={styles.cadastralValue}>
                  {device.profileType || (isSelf ? 'Responsable' : 'Menor')}
                  {age !== null ? ` (${age} años)` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.cadastralRow}>
              <View style={styles.cadastralCol}>
                <Text style={styles.cadastralLabel}>Teléfono / línea:</Text>
                <Text style={styles.cadastralValue} numberOfLines={1}>
                  {device.phone || 'Sin registrar'}
                </Text>
              </View>
              <View style={styles.cadastralCol}>
                <Text style={styles.cadastralLabel}>Modelo:</Text>
                <Text style={styles.cadastralValue} numberOfLines={1}>
                  {device.deviceModel || device.deviceName}
                </Text>
              </View>
            </View>

            <View style={styles.cadastralRow}>
              <View style={styles.cadastralCol}>
                <Text style={styles.cadastralLabel}>Género:</Text>
                <Text style={styles.cadastralValue}>{device.gender || 'No informado'}</Text>
              </View>
              {device.birthDate ? (
                <View style={styles.cadastralCol}>
                  <Text style={styles.cadastralLabel}>Fecha de nac.:</Text>
                  <Text style={styles.cadastralValue}>{device.birthDate}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      )}

      {/* Resumen de Permisos y Toggle Desplegable (6 Permisos, Solo flecha ▼/▲) */}
      <TouchableOpacity
        style={styles.permSummaryRow}
        onPress={onTogglePerms}
        activeOpacity={0.7}
      >
        <View style={styles.permBadgeContainer}>
          <Text style={styles.permLabel}>Permisos Android:</Text>
          <Badge
            status={perms.grantedCount === 6 ? 'activo' : 'alerta'}
            label={`${perms.grantedCount}/6 concedidos`}
          />
          {perms.grantedCount < 6 && (
            <View style={styles.auditAttentionTag}>
              <Text style={styles.auditAttentionTagText}>⚠️ Atención</Text>
            </View>
          )}
        </View>
        <Text style={styles.expandArrowOnly}>
          {isPermsExpanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Detalle Desplegable de Permisos Android (Los 6 Permisos del Sistema) */}
      {isPermsExpanded && (
        <View style={styles.permDetailBox}>
          <View style={styles.permAuditHeaderRow}>
            <Text style={styles.permDetailTitle}>Estado de permisos del sistema (6):</Text>
            <Text style={styles.permAuditTimestamp}>
              {device.lastHeartbeat ? `Reporte: ${device.lastHeartbeat}` : 'En línea'}
            </Text>
          </View>

          {perms.grantedCount < 6 ? (
            <View style={styles.permWarningBox}>
              <Text style={styles.permWarningText}>
                {isSelf
                  ? `⚠️ Atención: Faltan ${6 - perms.grantedCount} permiso(s) en este celular. Para garantizar el filtrado y la autoprotección, debés activarlos en este dispositivo.`
                  : `⚠️ Atención: Faltan ${6 - perms.grantedCount} permiso(s) en este celular. Para garantizar el filtrado y la protección antidesinstalación, deben otorgarse en el dispositivo protegido.`}
              </Text>
            </View>
          ) : (
            <View style={styles.permSuccessBox}>
              <Text style={styles.permSuccessText}>
                {isSelf
                  ? '✓ Todos los permisos del sistema están activos en tu dispositivo.'
                  : '✓ Todos los permisos del sistema están activos y reportando normalmente.'}
              </Text>
            </View>
          )}

          <View style={styles.permItemRow}>
            <Text style={styles.permItemText}>🌐 Servicio VPN (filtrado LOTBA):</Text>
            <Text style={[styles.permStatusText, perms.vpn ? styles.textGreen : styles.textRed]}>
              {perms.vpn ? '✓ Concedido' : '✕ Pendiente'}
            </Text>
          </View>

          <View style={styles.permItemRow}>
            <Text style={styles.permItemText}>🔒 Accesibilidad (antidesinstalación):</Text>
            <Text style={[styles.permStatusText, perms.accessibility ? styles.textGreen : styles.textRed]}>
              {perms.accessibility ? '✓ Concedido' : '⚠️ Pendiente'}
            </Text>
          </View>

          <View style={styles.permItemRow}>
            <Text style={styles.permItemText}>🔔 Notificaciones en primer plano:</Text>
            <Text style={[styles.permStatusText, perms.notifications ? styles.textGreen : styles.textRed]}>
              {perms.notifications ? '✓ Concedido' : '✕ Pendiente'}
            </Text>
          </View>

          <View style={styles.permItemRow}>
            <Text style={styles.permItemText}>🔋 Sin optimización de batería:</Text>
            <Text style={[styles.permStatusText, perms.batteryOptimization ? styles.textGreen : styles.textRed]}>
              {perms.batteryOptimization ? '✓ Concedido' : '⚠️ Pendiente'}
            </Text>
          </View>

          <View style={styles.permItemRow}>
            <Text style={styles.permItemText}>📍 Ubicación (geolocalización segura):</Text>
            <Text style={[styles.permStatusText, perms.location ? styles.textGreen : styles.textRed]}>
              {perms.location ? '✓ Concedido' : '⚠️ Pendiente'}
            </Text>
          </View>

          <View style={styles.permItemRow}>
            <Text style={styles.permItemText}>⏱️ Acceso al uso (límites de tiempo):</Text>
            <Text style={[styles.permStatusText, perms.usageStats ? styles.textGreen : styles.textRed]}>
              {perms.usageStats ? '✓ Concedido' : '⚠️ Pendiente'}
            </Text>
          </View>

          {/* Botón de Auditoría y Verificación de Permisos */}
          {onAuditPermissions && (
            <TouchableOpacity
              style={styles.auditPermsBtn}
              onPress={() => onAuditPermissions(device)}
              activeOpacity={0.7}
              disabled={isAuditing}
            >
              <Text style={styles.auditPermsBtnText}>
                {isAuditing
                  ? 'Auditando permisos...'
                  : isSelf
                  ? '🔄 Auditar permisos de mi celular'
                  : '🔄 Auditar permisos del protegido'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
