// ==============================================================================
// Proyecto: BA Protege+
// Componente: EditAppModal (Modal para Editar Aplicación Bloqueada con Límite Diario por Dispositivo)
// Archivo: src/components/dashboard/sitios/EditAppModal.tsx
// Descripción: Modal de edición de aplicación bloqueada:
//              - Nombre de la aplicación fijo (no editable).
//              - Límite de tiempo diario configurado individualmente por dispositivo.
//              - Mismo diseño y funcionalidades que Bloquear aplicación (AddAppModal).
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { ToggleSwitch } from '../../ToggleSwitch';
import { colors } from '../../../theme/colors';
import { CustomBlockedApp, DeviceInfo } from '../../../types';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import { styles } from './EditAppModal.styles';

interface EditAppModalProps {
  editingApp: CustomBlockedApp | null;
  onClose: () => void;
  appName: string;
  category?: string;
  onCategoryChange?: (cat: string) => void;
  applyToAll: boolean;
  onApplyToAllChange: (val: boolean) => void;
  deviceIds: string[];
  devices: DeviceInfo[];
  onToggleDevice: (deviceId: string) => void;
  deviceLimits?: Record<string, number | undefined>;
  onDeviceLimitChange?: (deviceId: string, mins?: number) => void;
  loading: boolean;
  onSave: () => void;
}

export const EditAppModal: React.FC<EditAppModalProps> = ({
  editingApp,
  onClose,
  appName,
  applyToAll,
  onApplyToAllChange,
  deviceIds,
  devices,
  onToggleDevice,
  deviceLimits = {},
  onDeviceLimitChange,
  loading,
  onSave,
}) => {
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});
  const [customInput, setCustomInput] = useState<Record<string, string>>({});

  // Sincronizar estado personalizado al abrir o cambiar la aplicación
  useEffect(() => {
    if (editingApp) {
      const initialCustomMode: Record<string, boolean> = {};
      const initialCustomInput: Record<string, string> = {};

      Object.entries(deviceLimits).forEach(([deviceId, mins]) => {
        if (mins !== undefined && ![30, 60, 120, 300].includes(mins)) {
          initialCustomMode[deviceId] = true;
          initialCustomInput[deviceId] = String(mins);
        }
      });

      setCustomMode(initialCustomMode);
      setCustomInput(initialCustomInput);
    } else {
      setCustomMode({});
      setCustomInput({});
    }
  }, [editingApp, visibleStateKey(deviceLimits)]);

  // Helper para detectar cambios en deviceLimits
  function visibleStateKey(limits: Record<string, number | undefined>): string {
    return Object.entries(limits)
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
  }

  // Formateador de etiqueta para el límite de tiempo
  const formatLimitBadge = (mins?: number) => {
    if (mins === undefined) return 'Bloqueo total';
    if (mins === 30) return '30 min';
    if (mins === 60) return '1 hora';
    if (mins === 120) return '2 horas';
    if (mins === 300) return '5 horas';
    return `${mins} min`;
  };

  const handleSelectPreset = (deviceId: string, mins?: number) => {
    setCustomMode((prev) => ({ ...prev, [deviceId]: false }));
    onDeviceLimitChange?.(deviceId, mins);
  };

  const handleActivateCustom = (deviceId: string) => {
    setCustomMode((prev) => ({ ...prev, [deviceId]: true }));
    const current = deviceLimits[deviceId];
    if (current && ![30, 60, 120, 300].includes(current)) {
      setCustomInput((prev) => ({ ...prev, [deviceId]: String(current) }));
    } else {
      setCustomInput((prev) => ({ ...prev, [deviceId]: '' }));
    }
  };

  const handleCustomInputChange = (deviceId: string, text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomInput((prev) => ({ ...prev, [deviceId]: cleaned }));
    if (cleaned.length > 0) {
      const parsed = parseInt(cleaned, 10);
      onDeviceLimitChange?.(deviceId, parsed > 0 ? parsed : undefined);
    } else {
      onDeviceLimitChange?.(deviceId, undefined);
    }
  };

  const renderDeviceCard = (
    deviceId: string,
    name: string,
    highlight: { color: string; bgColor: string; borderColor: string; icon: string; badgeLabel: string }
  ) => {
    const isSelected = deviceIds.includes(deviceId);
    const currentLimit = deviceLimits[deviceId];
    const isCustom =
      customMode[deviceId] ||
      (currentLimit !== undefined && ![30, 60, 120, 300].includes(currentLimit));

    return (
      <View
        key={deviceId}
        style={[
          styles.deviceCardContainer,
          {
            borderLeftWidth: 4,
            borderLeftColor: highlight.color,
            backgroundColor: isSelected ? highlight.bgColor : '#FFFFFF',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deviceRowHeader}
          onPress={() => onToggleDevice(deviceId)}
          activeOpacity={0.7}
        >
          <View style={styles.deviceLeftCol}>
            <View style={[styles.deviceIconBox, { backgroundColor: highlight.bgColor }]}>
              <Text style={styles.deviceIconText}>{highlight.icon}</Text>
            </View>
            <View style={styles.deviceTextCol}>
              <Text style={styles.deviceName}>{name}</Text>
            </View>
          </View>
          <ToggleSwitch
            value={isSelected}
            onValueChange={() => onToggleDevice(deviceId)}
          />
        </TouchableOpacity>

        {/* Límite de tiempo diario individual si el dispositivo está seleccionado */}
        {isSelected && (
          <View style={styles.deviceTimeLimitContainer}>
            <View style={styles.deviceTimeLimitHeader}>
              <Text style={styles.deviceTimeLimitLabel}>Límite de tiempo diario:</Text>
              <Text style={styles.deviceTimeLimitBadgeText}>
                {formatLimitBadge(currentLimit)}
              </Text>
            </View>

            <View style={styles.quickAppChipContainer}>
              {/* Bloqueo total */}
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  currentLimit === undefined && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(deviceId, undefined)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    currentLimit === undefined && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  Bloqueo total
                </Text>
              </TouchableOpacity>

              {/* 30 min */}
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  currentLimit === 30 && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(deviceId, 30)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    currentLimit === 30 && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  30 min
                </Text>
              </TouchableOpacity>

              {/* 1 hora */}
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  currentLimit === 60 && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(deviceId, 60)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    currentLimit === 60 && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  1 hora
                </Text>
              </TouchableOpacity>

              {/* 2 horas */}
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  currentLimit === 120 && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(deviceId, 120)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    currentLimit === 120 && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  2 horas
                </Text>
              </TouchableOpacity>

              {/* 5 horas */}
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  currentLimit === 300 && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(deviceId, 300)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    currentLimit === 300 && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  5 horas
                </Text>
              </TouchableOpacity>

              {/* Otro */}
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleActivateCustom(deviceId)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  Otro
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input de minutos si Personalizado está activo */}
            {isCustom && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <TextInput
                  style={styles.customMinutesInput}
                  placeholder="ej: 45"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={customInput[deviceId] ?? (currentLimit ? String(currentLimit) : '')}
                  selectTextOnFocus={true}
                  onChangeText={(text) => handleCustomInputChange(deviceId, text)}
                />
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>minutos por día</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={!!editingApp}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetOverlay}>
        <View style={styles.bottomSheetModalContent}>
          {/* Manija táctil del Bottom Sheet */}
          <View style={styles.bottomSheetHandle} />

          {/* Encabezado */}
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Editar aplicación bloqueada</Text>
            <TouchableOpacity
              style={styles.sheetCloseBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Cerrar modal"
            >
              <Text style={styles.sheetCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetSubtitle}>
            Cambiá en qué dispositivos aplicar el bloqueo o modificá el límite de tiempo de uso.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Nombre de la aplicación (No editable) */}
            <Text style={styles.inputLabel}>Nombre de la aplicación:</Text>
            <TextInput
              style={[
                styles.formInput,
                {
                  backgroundColor: '#F0F2F5',
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              value={appName}
              editable={false}
              selectTextOnFocus={false}
            />

            <View style={styles.deviceSelectionContainer}>
              <View style={styles.applyToAllRow}>
                <Text style={styles.inputLabel}>Aplicar a todos los dispositivos</Text>
                <ToggleSwitch
                  value={applyToAll}
                  onValueChange={onApplyToAllChange}
                />
              </View>

              {/* Listado de dispositivos con configuración de tiempo por dispositivo */}
              <View style={styles.deviceListContainer}>
                <Text style={styles.deviceListTitle}>Elegí los dispositivos:</Text>

                {/* Mi dispositivo (Responsable) */}
                {renderDeviceCard('self', 'Mi dispositivo', getDeviceHighlight('self'))}

                {/* Dispositivos Protegidos */}
                {devices.map((device, idx) => {
                  const highlight = getDeviceHighlight(
                    device.deviceId,
                    device.childName,
                    device.deviceName,
                    device.colorIndex ?? idx
                  );
                  return renderDeviceCard(
                    device.deviceId,
                    device.deviceName,
                    highlight
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Fila de CTAs con igual tamaño */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <ActionButton
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ActionButton
                title="Guardar"
                variant="primary"
                loading={loading}
                onPress={onSave}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
