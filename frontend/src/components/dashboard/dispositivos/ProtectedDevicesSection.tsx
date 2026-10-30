// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedDevicesSection (Auditoría y Gestión de Dispositivos Protegidos)
// Archivo: src/components/dashboard/dispositivos/ProtectedDevicesSection.tsx
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { ActionButton } from '../../ActionButton';
import { Badge } from '../../Badge';
import { colors } from '../../../theme/colors';
import { DeviceInfo } from '../../../types';
import { apiService } from '../../../services/api.service';
import { styles } from './ProtectedDevicesSection.styles';

interface ProtectedDevicesSectionProps {
  devices: DeviceInfo[];
  onUnbindDevice?: (deviceId: string) => void;
  onRefreshList?: () => void;
}

export const ProtectedDevicesSection: React.FC<ProtectedDevicesSectionProps> = ({
  devices,
  onUnbindDevice,
  onRefreshList,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'NAME' | 'DATE'>('NAME');
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);

  // Estados para Modal de Doble Confirmación de Desvinculación
  const [unbindingDevice, setUnbindingDevice] = useState<DeviceInfo | null>(null);
  const [unbindStep, setUnbindStep] = useState<1 | 2>(1);
  const [loadingUnbind, setLoadingUnbind] = useState(false);

  // Filtrado por buscador
  const filteredDevices = devices.filter((dev) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      dev.deviceName?.toLowerCase().includes(term) ||
      (dev.childName && dev.childName.toLowerCase().includes(term)) ||
      dev.deviceId?.toLowerCase().includes(term)
    );
  });

  // Ordenamiento por Nombre o Fecha de Vinculación
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (sortBy === 'NAME') {
      const nameA = a.deviceName || a.childName || '';
      const nameB = b.deviceName || b.childName || '';
      return nameA.localeCompare(nameB);
    } else {
      const dateA = (a as any).pairedAt || (a as any).createdAt || a.lastHeartbeat || '';
      const dateB = (b as any).pairedAt || (b as any).createdAt || b.lastHeartbeat || '';
      return dateB.localeCompare(dateA); // Más recientes primero
    }
  });

  const handleStartUnbind = (dev: DeviceInfo) => {
    setUnbindingDevice(dev);
    setUnbindStep(1);
  };

  const handleConfirmStep1 = () => {
    setUnbindStep(2);
  };

  const handleFinalUnbind = async () => {
    if (!unbindingDevice) return;

    setLoadingUnbind(true);
    try {
      await apiService.unbindDevice(unbindingDevice.deviceId);

      if (onUnbindDevice) {
        onUnbindDevice(unbindingDevice.deviceId);
      }
      if (onRefreshList) {
        onRefreshList();
      }

      Alert.alert(
        '✅ Dispositivo Desvinculado',
        `El dispositivo "${unbindingDevice.deviceName}" fue desvinculado correctamente.`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo desvincular el dispositivo.');
    } finally {
      setLoadingUnbind(false);
      setUnbindingDevice(null);
      setUnbindStep(1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Buscador de Dispositivos */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Buscar por dispositivo o protegido..."
        placeholderTextColor={colors.textSecondary}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Controles de Ordenamiento */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <TouchableOpacity
          style={[
            styles.sortChip,
            sortBy === 'NAME' && styles.sortChipActive,
          ]}
          onPress={() => setSortBy('NAME')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.sortChipText,
              sortBy === 'NAME' && styles.sortChipTextActive,
            ]}
          >
            🔤 Nombre
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortChip,
            sortBy === 'DATE' && styles.sortChipActive,
          ]}
          onPress={() => setSortBy('DATE')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.sortChipText,
              sortBy === 'DATE' && styles.sortChipTextActive,
            ]}
          >
            📅 Fecha vinculación
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contador de Dispositivos */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          Mostrando {sortedDevices.length} de {devices.length} dispositivos vinculados
        </Text>
      </View>

      {/* Lista de Dispositivos */}
      {sortedDevices.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {devices.length === 0
              ? 'No hay dispositivos vinculados aún.'
              : 'No se encontraron dispositivos que coincidan con la búsqueda.'}
          </Text>
        </View>
      ) : (
        sortedDevices.map((dev) => {
          const isActive =
            (dev.status as any) === 'ACTIVE' ||
            (dev.status as any)?.effectiveStatus === 'ACTIVE' ||
            dev.isProtected;
          const perms = dev.permissions || {
            vpn: true,
            accessibility: true,
            notifications: true,
            batteryOptimization: true,
            grantedCount: 4,
          };
          const isExpanded = expandedDeviceId === dev.deviceId;

          return (
            <View key={dev.deviceId || dev.deviceUuid} style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                <View style={styles.deviceTitleCol}>
                  <Text style={styles.deviceName}>{dev.deviceName}</Text>
                  <Text style={styles.deviceInfo}>
                    Asignado a: {dev.childName || 'Protegido'}
                  </Text>
                </View>
                <Badge status={isActive ? 'activo' : 'inactivo'} />
              </View>

              {/* Resumen de Permisos y Toggle Desplegable */}
              <TouchableOpacity
                style={styles.permSummaryRow}
                onPress={() => setExpandedDeviceId(isExpanded ? null : dev.deviceId)}
                activeOpacity={0.7}
              >
                <View style={styles.permBadgeContainer}>
                  <Text style={styles.permLabel}>Permisos Android:</Text>
                  <Badge
                    status={perms.grantedCount === 4 ? 'activo' : 'alerta'}
                    label={`${perms.grantedCount}/4 CONCEDIDOS`}
                  />
                </View>
                <Text style={styles.expandToggleText}>
                  {isExpanded ? 'Ocultar ▲' : 'Ver Detalle ▼'}
                </Text>
              </TouchableOpacity>

              {/* Detalle Desplegable de Permisos */}
              {isExpanded && (
                <View style={styles.permDetailBox}>
                  <Text style={styles.permDetailTitle}>Estado de Permisos del Sistema:</Text>

                  <View style={styles.permItemRow}>
                    <Text style={styles.permItemText}>🌐 Servicio VPN (Filtrado LOTBA):</Text>
                    <Text style={[styles.permStatusText, perms.vpn ? styles.textGreen : styles.textRed]}>
                      {perms.vpn ? '✓ Concedido' : '✕ Pendiente'}
                    </Text>
                  </View>

                  <View style={styles.permItemRow}>
                    <Text style={styles.permItemText}>🔒 Accesibilidad (Antidesinstalación):</Text>
                    <Text style={[styles.permStatusText, perms.accessibility ? styles.textGreen : styles.textRed]}>
                      {perms.accessibility ? '✓ Concedido' : '⚠️ Pendiente'}
                    </Text>
                  </View>

                  <View style={styles.permItemRow}>
                    <Text style={styles.permItemText}>🔔 Notificaciones en Primer Plano:</Text>
                    <Text style={[styles.permStatusText, perms.notifications ? styles.textGreen : styles.textRed]}>
                      {perms.notifications ? '✓ Concedido' : '✕ Pendiente'}
                    </Text>
                  </View>

                  <View style={styles.permItemRow}>
                    <Text style={styles.permItemText}>🔋 Sin Optimización de Batería:</Text>
                    <Text style={[styles.permStatusText, perms.batteryOptimization ? styles.textGreen : styles.textRed]}>
                      {perms.batteryOptimization ? '✓ Concedido' : '⚠️ Pendiente'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Botón para Desvincular con Dupla Confirmação */}
              <View style={styles.deviceActionsRow}>
                <TouchableOpacity
                  style={styles.unbindButton}
                  onPress={() => handleStartUnbind(dev)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.unbindButtonText}>🔗 Desvincular Dispositivo</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Modal de Doble Confirmación para Desvincular Dispositivo */}
      <Modal
        visible={!!unbindingDevice}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUnbindingDevice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {unbindStep === 1 ? (
              <View>
                <Text style={styles.modalEmoji}>🔗</Text>
                <Text style={styles.modalTitle}>
                  Confirmación 1 de 2: Desvincular Dispositivo
                </Text>
                <Text style={styles.modalBody}>
                  ¿Deseas desvincular el dispositivo "{unbindingDevice?.deviceName}" (Protegido: {unbindingDevice?.childName || 'Protegido'})?
                </Text>
                <View style={styles.warningBox}>
                  <Text style={styles.warningBoxText}>
                    ⚠️ IMPORTANTE: Al desvincular el dispositivo, el motor de protección de red local se desactivará en dicho celular y dejará de recibir bloqueos LOTBA.
                  </Text>
                </View>

                <ActionButton
                  title="Entiendo las consecuencias, Continuar ➔"
                  variant="primary"
                  onPress={handleConfirmStep1}
                />
                <ActionButton
                  title="Cancelar"
                  variant="secondary"
                  onPress={() => setUnbindingDevice(null)}
                />
              </View>
            ) : (
              <View>
                <Text style={styles.modalEmoji}>⚠️</Text>
                <Text style={styles.modalTitle}>
                  Confirmación 2 de 2: Confirmar Desvinculación
                </Text>
                <Text style={styles.modalBody}>
                  ¿Estás completamente seguro de eliminar permanentemente la vinculación de "{unbindingDevice?.deviceName}"?
                </Text>

                <ActionButton
                  title="Desvincular dispositivo"
                  variant="danger"
                  loading={loadingUnbind}
                  onPress={handleFinalUnbind}
                />
                <ActionButton
                  title="Volver Atrás"
                  variant="secondary"
                  disabled={loadingUnbind}
                  onPress={() => setUnbindStep(1)}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
