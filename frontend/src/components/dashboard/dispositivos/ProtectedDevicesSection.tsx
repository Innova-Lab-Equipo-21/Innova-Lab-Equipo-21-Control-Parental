// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedDevicesSection (Auditoría y Gestión de Dispositivos Protegidos)
// Archivo: src/components/dashboard/dispositivos/ProtectedDevicesSection.tsx
// Descripción: Vista modular de dispositivos con paleta de 6 colores específicos.
//              Primer card SIEMPRE el responsable (#007AFF) con edición vía EditResponsibleModal.
//              Cards de protegidos con edición idéntica al formulario de vinculación (EditProtectedDeviceModal).
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { DeviceInfo, DevicePermissionsStatus, SelfControlState } from '../../../types';
import { apiService } from '../../../services/api.service';
import { DeviceCard } from './DeviceCard';
import { EditResponsibleModal } from '../cuenta/EditResponsibleModal';
import { EditProtectedDeviceModal } from './EditProtectedDeviceModal';
import { UnbindConfirmationModal } from './UnbindConfirmationModal';
import {
  AutocontrolConfirmationModal,
  AutocontrolModalMode,
} from './AutocontrolConfirmationModal';
import { FeedbackModal } from '../../FeedbackModal';
import { BOTITO_ASSETS } from '../protected/botAssets';
import { styles } from './ProtectedDevicesSection.styles';

interface ProtectedDevicesSectionProps {
  devices: DeviceInfo[];
  selfDevice?: DeviceInfo;
  selfControl?: SelfControlState;
  hasSitesOrApps?: boolean;
  currentUser?: any;
  onUpdateUser?: (updated: any) => void;
  onUpdateSelfControl?: (sc: SelfControlState) => void;
  onStartSelfControlFlow?: () => void;
  onDisableSelfControl?: () => void;
  onUnbindDevice?: (deviceId: string) => void;
  onRefreshList?: () => void;
  onOpenPermissions?: () => void;
}

export const ProtectedDevicesSection: React.FC<ProtectedDevicesSectionProps> = ({
  devices,
  selfDevice: externalSelfDevice,
  selfControl: propSelfControl,
  hasSitesOrApps = true,
  currentUser,
  onUpdateUser,
  onUpdateSelfControl,
  onStartSelfControlFlow,
  onDisableSelfControl,
  onUnbindDevice,
  onRefreshList,
  onOpenPermissions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Ref y estado para control de cierre de búsqueda al tocar fuera
  const searchInputRef = useRef<TextInput>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleCloseSearch = () => {
    setSearchTerm('');
    setIsSearchActive(false);
    searchInputRef.current?.blur();
    Keyboard.dismiss();
  };

  // Dispositivo propio del responsable (primer card siempre)
  const [selfDev, setSelfDev] = useState<DeviceInfo | null>(externalSelfDevice || null);

  // Estados de los Modales Modulares
  const [isEditingSelf, setIsEditingSelf] = useState(false);
  const [editingProtectedDevice, setEditingProtectedDevice] = useState<DeviceInfo | null>(null);
  const [unbindingDevice, setUnbindingDevice] = useState<DeviceInfo | null>(null);

  // Modal estándar de retroalimentación / éxito del app
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    icon?: string;
    imageSource?: any;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const showFeedback = (config: {
    icon?: string;
    imageSource?: any;
    title: string;
    message: string;
  }) => {
    setFeedbackModal({
      visible: true,
      icon: undefined,
      imageSource: undefined,
      ...config,
    });
  };

  // Cargar datos del dispositivo del responsable (se recarga ante cambios externos o actualización de lista)
  useEffect(() => {
    if (externalSelfDevice) {
      setSelfDev(externalSelfDevice);
    } else {
      apiService.getSelfDevice().then((dev) => setSelfDev(dev));
    }
  }, [externalSelfDevice, devices]);

  // Estado local de Autocontrol (sincronizado con props si existen)
  const [localSelfControl, setLocalSelfControl] = useState<SelfControlState | null>(null);

  useEffect(() => {
    if (!propSelfControl) {
      apiService.getSelfControlStatus().then(setLocalSelfControl).catch(() => {});
    }
  }, [propSelfControl]);

  const resolvedSelfControl: SelfControlState = propSelfControl || localSelfControl || {
    active: false,
    canDisable: false,
    expiresAt: null,
    enabledAt: null,
    remainingHours: 0,
    remainingMinutes: 0,
  };

  // Estados y manejadores de Modal de Autocontrol con doble confirmación
  const [autocontrolModalVisible, setAutocontrolModalVisible] = useState(false);
  const [autocontrolModalMode, setAutocontrolModalMode] = useState<AutocontrolModalMode | null>(null);

  const isSelfControlActive = Boolean(
    resolvedSelfControl.active ||
    resolvedSelfControl.status === 'ACTIVE_LOCKED' ||
    resolvedSelfControl.status === 'DEACTIVATION_PENDING' ||
    resolvedSelfControl.status === 'DEACTIVATION_READY'
  );
  const isAutoproteccionDisabled = !isSelfControlActive && !hasSitesOrApps;

  const handleOpenSelfControlModal = async () => {
    let currentSc = resolvedSelfControl;
    try {
      currentSc = await apiService.getSelfControlStatus();
      setLocalSelfControl(currentSc);
      if (onUpdateSelfControl) {
        onUpdateSelfControl(currentSc);
      }
    } catch {
      // Usar estado en memoria como respaldo
    }

    const currentlyActive = Boolean(
      currentSc.active ||
      currentSc.status === 'ACTIVE_LOCKED' ||
      currentSc.status === 'DEACTIVATION_PENDING' ||
      currentSc.status === 'DEACTIVATION_READY'
    );

    if (!currentlyActive && !hasSitesOrApps) {
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Agregá un sitio o aplicación',
        message:
          'Para activar la autoprotección, primero sumá al menos un sitio o aplicación en “Mi dispositivo”.',
      });
      return;
    }

    if (!currentSc.active || currentSc.status === 'INACTIVE') {
      // Estado inicial: Desactivado -> Doble confirmación para activar
      setAutocontrolModalMode('ACTIVATE');
      setAutocontrolModalVisible(true);
    } else if (!currentSc.canDisable || currentSc.status === 'ACTIVE_LOCKED') {
      // Activado: Durante las 24h, la desactivación NO está permitida -> Mostrar aviso
      setAutocontrolModalMode('ACTIVE_LOCKED');
      setAutocontrolModalVisible(true);
    } else {
      // Activado: Tras 24h, la desactivación ESTÁ permitida -> Confirmar desactivación
      setAutocontrolModalMode('DEACTIVATION_READY');
      setAutocontrolModalVisible(true);
    }
  };

  const handleActivateSelfControl = async () => {
    const res = await apiService.enableSelfControl();
    setLocalSelfControl(res);
    if (onUpdateSelfControl) onUpdateSelfControl(res);
    setAutocontrolModalVisible(false);
    if (onRefreshList) onRefreshList();
  };

  const handleConfirmDeactivation = async () => {
    const res = await apiService.disableSelfControl();
    setLocalSelfControl(res);
    if (onUpdateSelfControl) onUpdateSelfControl(res);
    setAutocontrolModalVisible(false);
    if (onRefreshList) onRefreshList();
  };

  // Filtrado de dispositivos protegidos por buscador
  const filteredDevices = devices.filter((dev) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      dev.deviceName?.toLowerCase().includes(term) ||
      (dev.childName && dev.childName.toLowerCase().includes(term)) ||
      dev.deviceId?.toLowerCase().includes(term) ||
      (dev.phone && dev.phone.includes(term)) ||
      (dev.deviceModel && dev.deviceModel.toLowerCase().includes(term))
    );
  });

  // Manejador de Edición: Abre Modal según el tipo de dispositivo
  const handleEditDevice = (dev: DeviceInfo) => {
    if (dev.deviceId === 'self') {
      // Abre modal de "Editar perfil del responsable" existente en Cuenta
      setIsEditingSelf(true);
    } else {
      // Abre modal con estilo, campos y reglas de vinculación
      setEditingProtectedDevice(dev);
    }
  };

  // Estado y manejador de auditoría de permisos para dispositivos (responsable o protegidos)
  const [auditingDeviceId, setAuditingDeviceId] = useState<string | null>(null);

  const handleAuditPermissions = async (device: DeviceInfo) => {
    // Si es el dispositivo del responsable, navega directamente a PermissionsScreen para activar los permisos faltantes
    if (device.deviceId === 'self') {
      if (onOpenPermissions) {
        onOpenPermissions();
        return;
      }
    }

    try {
      setAuditingDeviceId(device.deviceId);
      const updated = await apiService.auditDevicePermissions(device.deviceId);
      if (device.deviceId === 'self') {
        setSelfDev(updated);
      }
      if (onRefreshList) {
        onRefreshList();
      }

      const perms: DevicePermissionsStatus = updated.permissions || {
        vpn: false,
        accessibility: false,
        notifications: false,
        batteryOptimization: false,
        location: false,
        usageStats: false,
        grantedCount: 0,
      };
      const missing: string[] = [];
      if (!perms.vpn) missing.push('Servicio VPN (filtrado LOTBA)');
      if (!perms.accessibility) missing.push('Accesibilidad (antidesinstalación)');
      if (!perms.notifications) missing.push('Notificaciones en primer plano');
      if (!perms.batteryOptimization) missing.push('Sin optimización de batería');
      if (!perms.location) missing.push('Ubicación (geolocalización segura)');
      if (!perms.usageStats) missing.push('Acceso al uso (límites de tiempo)');

      const name = device.childName || device.deviceName;
      if (missing.length === 0) {
        showFeedback({
          imageSource: BOTITO_ASSETS.feliz,
          title: 'Auditoría de permisos exitosa',
          message: `Todos los permisos (6/6) se encuentran activos y reportando correctamente en ${name}.`,
        });
      } else {
        showFeedback({
          imageSource: BOTITO_ASSETS.pensando,
          title: 'Auditoría de permisos',
          message: `El dispositivo de ${name} reporta ${perms.grantedCount}/6 permisos concedidos.\n\nPermisos pendientes:\n• ${missing.join('\n• ')}\n\nPara reactivarlos, deben otorgarse directamente en el celular del protegido.`,
        });
      }
    } catch (e: any) {
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Error de auditoría',
        message: e.message || 'No se pudo completar la auditoría de permisos.',
      });
    } finally {
      setAuditingDeviceId(null);
    }
  };

  // Guardado de Perfil del Responsable desde su Card
  const handleSaveResponsible = async (updatedUser: any) => {
    const updatedFullName = (
      updatedUser.fullName ||
      `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim()
    ).trim();

    const payload: any = {
      fullName: updatedFullName,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      gender: updatedUser.gender,
      birthDate: updatedUser.birthDate,
      phone: updatedUser.phone,
    };
    if (updatedUser.password) {
      payload.currentPassword = updatedUser.currentPassword;
      payload.password = updatedUser.password;
    }

    try {
      await apiService.updateProfile(payload);
    } catch (apiErr: any) {
      if (apiErr?.response) {
        throw apiErr;
      }
    }

    const updatedDevice = await apiService.updateSelfDevice({
      childName: updatedFullName,
      deviceName: updatedFullName,
      birthDate: updatedUser.birthDate,
      gender: updatedUser.gender,
      phone: updatedUser.phone,
    });
    setSelfDev(updatedDevice);

    const sanitizedUser = { ...updatedUser };
    delete sanitizedUser.currentPassword;
    delete sanitizedUser.password;

    if (onUpdateUser) {
      onUpdateUser(sanitizedUser);
    }
    setIsEditingSelf(false);
    showFeedback({
      imageSource: BOTITO_ASSETS.feliz,
      title: '¡Tu perfil se actualizó con éxito!',
      message: 'Guardamos los cambios que realizaste.',
    });
  };

  // Resuelve el nombre real de la persona responsable (evitando placeholders como "Yo" o "Tutor Responsable")
  const isPlaceholderResponsibleName = (name?: string | null): boolean => {
    const normalized = (name || '').trim().toLowerCase();
    return !normalized || normalized === 'yo' || normalized === 'tutor responsable';
  };

  const resolveResponsibleName = (): string => {
    const firstName = (currentUser?.firstName || '').trim();
    const lastName = (currentUser?.lastName || '').trim();
    const combinedName = `${firstName} ${lastName}`.trim();
    const userFullName = (currentUser?.fullName || currentUser?.name || '').trim();

    if (firstName && lastName && !isPlaceholderResponsibleName(combinedName)) {
      return combinedName;
    }
    if (!isPlaceholderResponsibleName(userFullName)) {
      return userFullName;
    }
    if (!isPlaceholderResponsibleName(combinedName)) {
      return combinedName;
    }
    if (!isPlaceholderResponsibleName(selfDev?.childName)) {
      return selfDev!.childName!.trim();
    }
    if (!isPlaceholderResponsibleName(selfDev?.deviceName)) {
      return selfDev!.deviceName!.trim();
    }
    return '';
  };

  const responsibleDisplayName = resolveResponsibleName();
  const resolvedSelfDevice: DeviceInfo | null = selfDev
    ? {
        ...selfDev,
        childName: responsibleDisplayName || selfDev.childName,
        deviceName: responsibleDisplayName || selfDev.deviceName,
      }
    : null;

  // Construcción del objeto de usuario para el modal del responsable
  const responsibleUserData = currentUser || {
    firstName: responsibleDisplayName.split(' ')[0] || '',
    lastName: responsibleDisplayName.split(' ').slice(1).join(' ') || '',
    fullName: responsibleDisplayName,
    birthDate: selfDev?.birthDate || '10/03/1985',
    gender: selfDev?.gender || 'Masculino',
    phone: selfDev?.phone || '11 5544-3322',
    email: 'tutor@baprotege.gob.ar',
    password: '••••••••',
  };

  // Cálculo preciso de totalizadores: Vinculados e Inactivos respetando singular y plural
  const isDeviceActive = (d: DeviceInfo) =>
    d.status === 'ACTIVE' ||
    (d.status as any)?.effectiveStatus === 'ACTIVE' ||
    (Boolean(d.isProtected) && d.status !== 'INACTIVE');

  const countVinculados = devices.filter(isDeviceActive).length;
  const countInactivos = devices.filter((d) => !isDeviceActive(d)).length;

  const filteredVinculados = filteredDevices.filter(isDeviceActive).length;
  const filteredInactivos = filteredDevices.filter((d) => !isDeviceActive(d)).length;

  const formatPlural = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural}`;

  const counterText =
    searchTerm.trim().length > 0
      ? `${formatPlural(filteredVinculados, 'vinculado', 'vinculados')} • ${formatPlural(filteredInactivos, 'inactivo', 'inactivos')}`
      : `${formatPlural(countVinculados, 'vinculado', 'vinculados')} • ${formatPlural(countInactivos, 'inactivo', 'inactivos')}`;

  return (
    <Pressable
      style={{ flex: 1, minHeight: '100%' }}
      onPress={() => {
        if (isSearchActive || searchTerm.length > 0) {
          handleCloseSearch();
        }
      }}
    >
      <View style={styles.container}>
        {/* SECCIÓN 1: MI DISPOSITIVO (RESPONSABLE) */}
        {selfDev && (
          <Pressable
            style={styles.sectionHeaderContainer}
            onPress={() => {
              if (isSearchActive || searchTerm.length > 0) {
                handleCloseSearch();
              }
            }}
          >
            <Text style={styles.sectionTitle}>Mi dispositivo</Text>
          </Pressable>
        )}

        {resolvedSelfDevice && (
          <DeviceCard
            device={resolvedSelfDevice}
            index={0}
            isSelf={true}
            onEdit={handleEditDevice}
            onUnbind={() => {}}
            onAuditPermissions={handleAuditPermissions}
            isAuditing={auditingDeviceId === resolvedSelfDevice.deviceId}
            selfControl={resolvedSelfControl}
            isAutoproteccionDisabled={isAutoproteccionDisabled}
            onStartSelfControlFlow={handleOpenSelfControlModal}
            onDisableSelfControl={handleOpenSelfControlModal}
            onPressSelfControl={handleOpenSelfControlModal}
            onOpenPermissions={onOpenPermissions}
          />
        )}

        {/* SECCIÓN 2: DISPOSITIVOS PROTEGIDOS */}
        <Pressable
          style={styles.protectedSectionHeaderRow}
          onPress={() => {
            if (isSearchActive || searchTerm.length > 0) {
              handleCloseSearch();
            }
          }}
        >
          <Text style={styles.sectionTitle}>Dispositivos protegidos</Text>
          <Text style={styles.countText}>{counterText}</Text>
        </Pressable>

        {/* Buscador de Dispositivos Protegidos a Ancho Completo */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIconPrefix}>🔍</Text>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInputCompact}
              placeholder="Buscar por dispositivo, titular..."
              placeholderTextColor={colors.textSecondary}
              value={searchTerm}
              selectTextOnFocus={true}
              onChangeText={(text) => {
                setSearchTerm(text);
                if (text.length > 0) {
                  setIsSearchActive(true);
                }
              }}
              onFocus={() => setIsSearchActive(true)}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                onPress={handleCloseSearch}
                style={styles.clearSearchBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* LISTA DE DISPOSITIVOS PROTEGIDOS */}
        {filteredDevices.length === 0 ? (
          devices.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No hay celulares protegidos vinculados aún. Usa el botón + para vincular.
              </Text>
            </View>
          ) : (
            <Pressable
              style={styles.emptyCard}
              onPress={handleCloseSearch}
            >
              <Text style={styles.emptyText}>
                No se encontraron dispositivos que coincidan con la búsqueda.
              </Text>
            </Pressable>
          )
        ) : (
          filteredDevices.map((dev, idx) => (
            <DeviceCard
              key={dev.deviceId || dev.deviceUuid}
              device={dev}
              index={dev.colorIndex ?? idx}
              isSelf={false}
              onEdit={handleEditDevice}
              onUnbind={(d) => setUnbindingDevice(d)}
              onAuditPermissions={handleAuditPermissions}
              isAuditing={auditingDeviceId === dev.deviceId}
              onOpenPermissions={onOpenPermissions}
            />
          ))
        )}

        {/* Modal 1: Editar Perfil del Responsable (desde Cuenta) */}
        <EditResponsibleModal
          visible={isEditingSelf}
          currentUser={responsibleUserData}
          onClose={() => setIsEditingSelf(false)}
          onSave={handleSaveResponsible}
        />

        {/* Modal 2: Editar Dispositivo Protegido (estilo y reglas de Pairing) */}
        <EditProtectedDeviceModal
          visible={!!editingProtectedDevice}
          device={editingProtectedDevice}
          onClose={() => setEditingProtectedDevice(null)}
          onSaveSuccess={(savedName) => {
            const devName = savedName || editingProtectedDevice?.childName || 'este dispositivo';
            setEditingProtectedDevice(null);
            if (onRefreshList) {
              onRefreshList();
            }
            showFeedback({
              imageSource: BOTITO_ASSETS.feliz,
              title: 'Datos actualizados',
              message: `Los datos del protegido "${devName}" fueron actualizados correctamente.`,
            });
          }}
        />

        {/* Modal 3: Doble Confirmación de Desvinculación */}
        <UnbindConfirmationModal
          visible={!!unbindingDevice}
          device={unbindingDevice}
          onClose={() => setUnbindingDevice(null)}
          onSuccess={(deviceId) => {
            const devName = unbindingDevice?.childName || unbindingDevice?.deviceName || 'este dispositivo';
            setUnbindingDevice(null);
            if (onUnbindDevice) {
              onUnbindDevice(deviceId);
            }
            if (onRefreshList) {
              onRefreshList();
            }
            showFeedback({
              imageSource: BOTITO_ASSETS.nervioso,
              title: 'Dispositivo desvinculado',
              message: `El celular de ${devName} ya no está en tu lista de dispositivos protegidos.`,
            });
          }}
        />

        {/* Modal 4: Gestión y Doble Confirmación de Autocontrol */}
        <AutocontrolConfirmationModal
          visible={autocontrolModalVisible}
          mode={autocontrolModalMode}
          selfControl={resolvedSelfControl}
          onClose={() => setAutocontrolModalVisible(false)}
          onActivate={handleActivateSelfControl}
          onRequestDeactivation={handleConfirmDeactivation}
          onConfirmDeactivation={handleConfirmDeactivation}
          onReactivate={handleActivateSelfControl}
        />

        {/* Modal Estándar de Retroalimentación del App */}
        <FeedbackModal
          visible={feedbackModal.visible}
          icon={feedbackModal.icon}
          imageSource={feedbackModal.imageSource}
          title={feedbackModal.title}
          message={feedbackModal.message}
          buttonText="Entendido"
          onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
        />
      </View>
    </Pressable>
  );
};
