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
  Alert,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { DeviceInfo, DevicePermissionsStatus, SelfControlState } from '../../../types';
import { apiService } from '../../../services/api.service';
import { DeviceCard } from './DeviceCard';
import { EditResponsibleModal } from '../cuenta/EditResponsibleModal';
import { EditProtectedDeviceModal } from './EditProtectedDeviceModal';
import { UnbindConfirmationModal } from './UnbindConfirmationModal';
import { styles } from './ProtectedDevicesSection.styles';

interface ProtectedDevicesSectionProps {
  devices: DeviceInfo[];
  selfDevice?: DeviceInfo;
  selfControl?: SelfControlState;
  currentUser?: any;
  onUpdateUser?: (updated: any) => void;
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
  currentUser,
  onUpdateUser,
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

  const handleSelfControlStart = () => {
    if (onStartSelfControlFlow) {
      onStartSelfControlFlow();
    } else {
      apiService
        .enableSelfControl()
        .then((updated) => {
          setLocalSelfControl(updated);
          Alert.alert(
            '🛡️ Autocontrol activado exitosamente',
            'La protección de autocontrol está activa de forma permanente. Para desactivarla, deberás solicitar la espera de 24 horas.'
          );
        })
        .catch((e: any) => {
          Alert.alert('Error', e.message || 'No se pudo activar el autocontrol.');
        });
    }
  };

  const handleSelfControlDisable = () => {
    if (onDisableSelfControl) {
      onDisableSelfControl();
    } else {
      apiService
        .disableSelfControl()
        .then((updated) => {
          setLocalSelfControl(updated);
          Alert.alert(
            '🔓 Pase temporal de 24 horas iniciado',
            'El sistema se ha desbloqueado temporalmente por 24 horas. Cumplido este plazo, se reactivará automáticamente.'
          );
        })
        .catch((e: any) => {
          Alert.alert('🔒 Desactivación en espera', e.message || 'La desactivación se habilitará en 24 horas.');
        });
    }
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
        vpn: true,
        accessibility: true,
        notifications: true,
        batteryOptimization: true,
        location: true,
        usageStats: true,
        grantedCount: 6,
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
        Alert.alert(
          'Auditoría de permisos exitosa',
          `Todos los permisos (6/6) se encuentran activos y reportando correctamente en ${name}.`
        );
      } else {
        Alert.alert(
          'Auditoría de permisos: atención requerida',
          `El dispositivo de ${name} reporta ${perms.grantedCount}/6 permisos concedidos.\n\nPermisos pendientes:\n• ${missing.join('\n• ')}\n\nPara reactivarlos, deben otorgarse directamente en el celular del protegido.`
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo completar la auditoría de permisos.');
    } finally {
      setAuditingDeviceId(null);
    }
  };

  // Guardado de Perfil del Responsable desde su Card
  const handleSaveResponsible = async (updatedUser: any) => {
    try {
      const updatedDevice = await apiService.updateSelfDevice({
        childName: updatedUser.fullName || `${updatedUser.firstName} ${updatedUser.lastName}`,
        birthDate: updatedUser.birthDate,
        gender: updatedUser.gender,
        phone: updatedUser.phone,
      });
      setSelfDev(updatedDevice);

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      Alert.alert('Perfil actualizado', 'Los datos del responsable han sido actualizados exitosamente.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudieron actualizar los datos del responsable.');
    }
  };

  // Construcción del objeto de usuario para el modal del responsable
  const responsibleUserData = currentUser || {
    firstName: selfDev?.childName?.split(' ')[0] || 'Tutor',
    lastName: selfDev?.childName?.split(' ').slice(1).join(' ') || 'Responsable',
    fullName: selfDev?.childName || 'Tutor Responsable',
    birthDate: selfDev?.birthDate || '10/03/1985',
    gender: selfDev?.gender || 'Masculino',
    phone: selfDev?.phone || '11 5544-3322',
    email: 'tutor@baprotege.gob.ar',
    password: '••••••••',
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (isSearchActive || searchTerm.length > 0) {
          handleCloseSearch();
        }
      }}
    >
      <View style={styles.container}>
        {/* SECCIÓN 1: MI DISPOSITIVO (RESPONSABLE) */}
        {selfDev && (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>Mi dispositivo</Text>
          </View>
        )}

        {selfDev && (
          <DeviceCard
            device={selfDev}
            index={0}
            isSelf={true}
            onEdit={handleEditDevice}
            onUnbind={() => {}}
            onAuditPermissions={handleAuditPermissions}
            isAuditing={auditingDeviceId === selfDev.deviceId}
            selfControl={resolvedSelfControl}
            onStartSelfControlFlow={handleSelfControlStart}
            onDisableSelfControl={handleSelfControlDisable}
            onOpenPermissions={onOpenPermissions}
          />
        )}

        {/* SECCIÓN 2: DISPOSITIVOS PROTEGIDOS */}
        <View style={styles.protectedSectionHeaderRow}>
          <Text style={styles.sectionTitle}>Dispositivos protegidos</Text>
          <Text style={styles.countText}>
            {searchTerm.trim().length > 0
              ? `${filteredDevices.length} de ${devices.length} ${devices.length === 1 ? 'vinculado' : 'vinculados'}`
              : `${devices.length} ${devices.length === 1 ? 'vinculado' : 'vinculados'}`}
          </Text>
        </View>

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
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No se encontraron dispositivos que coincidan con la búsqueda.
              </Text>
            </View>
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
          onSaveSuccess={() => {
            if (onRefreshList) {
              onRefreshList();
            }
          }}
        />

        {/* Modal 3: Doble Confirmación de Desvinculación */}
        <UnbindConfirmationModal
          visible={!!unbindingDevice}
          device={unbindingDevice}
          onClose={() => setUnbindingDevice(null)}
          onSuccess={(deviceId) => {
            if (onUnbindDevice) {
              onUnbindDevice(deviceId);
            }
            if (onRefreshList) {
              onRefreshList();
            }
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};
