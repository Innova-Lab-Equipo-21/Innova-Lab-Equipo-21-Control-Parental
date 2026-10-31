// ==============================================================================
// Proyecto: BA Protege+
// Componente: EditAppModal (Modal para Editar Aplicación Bloqueada)
// Archivo: src/components/dashboard/sitios/EditAppModal.tsx
// ==============================================================================

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { ToggleSwitch } from '../../ToggleSwitch';
import { colors } from '../../../theme/colors';
import { CustomBlockedApp, DeviceInfo } from '../../../types';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import { styles } from './CustomSitesSection.styles';

interface EditAppModalProps {
  editingApp: CustomBlockedApp | null;
  onClose: () => void;
  appName: string;
  onAppNameChange: (text: string) => void;
  category: string;
  onCategoryChange: (cat: string) => void;
  applyToAll: boolean;
  onApplyToAllChange: (val: boolean) => void;
  deviceIds: string[];
  devices: DeviceInfo[];
  onToggleDevice: (deviceId: string) => void;
  dailyLimitMinutes?: number;
  onDailyLimitChange: (mins?: number) => void;
  loading: boolean;
  onSave: () => void;
}

export const EditAppModal: React.FC<EditAppModalProps> = ({
  editingApp,
  onClose,
  appName,
  onAppNameChange,
  category,
  onCategoryChange,
  applyToAll,
  onApplyToAllChange,
  deviceIds,
  devices,
  onToggleDevice,
  dailyLimitMinutes,
  onDailyLimitChange,
  loading,
  onSave,
}) => {
  const [isCustom, setIsCustom] = React.useState(false);
  const [customText, setCustomText] = React.useState('');

  React.useEffect(() => {
    if (editingApp) {
      if (dailyLimitMinutes !== undefined && ![30, 60, 120, 300].includes(dailyLimitMinutes)) {
        setIsCustom(true);
        setCustomText(String(dailyLimitMinutes));
      } else {
        setIsCustom(false);
        setCustomText('');
      }
    }
  }, [editingApp, dailyLimitMinutes]);

  const handleSelectPreset = (mins?: number) => {
    setIsCustom(false);
    onDailyLimitChange(mins);
  };

  const handleActivateCustom = () => {
    setIsCustom(true);
    if (dailyLimitMinutes && ![30, 60, 120, 300].includes(dailyLimitMinutes)) {
      setCustomText(String(dailyLimitMinutes));
    }
  };

  const handleCustomTextChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomText(cleaned);
    if (cleaned.length > 0) {
      const parsed = parseInt(cleaned, 10);
      onDailyLimitChange(parsed > 0 ? parsed : undefined);
    } else {
      onDailyLimitChange(undefined);
    }
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
            Modificá los detalles, tiempo de uso y dispositivos asignados.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >

            <Text style={styles.inputLabel}>Nombre de la aplicación:</Text>
            <TextInput
              style={styles.formInput}
              value={appName}
              selectTextOnFocus={true}
              onChangeText={onAppNameChange}
              placeholder="ejemplo: Bet365, TikTok"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Límite de tiempo diario */}
            <Text style={styles.inputLabel}>Límite de tiempo diario:</Text>
            <View style={styles.quickAppChipContainer}>
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  dailyLimitMinutes === undefined && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(undefined)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    dailyLimitMinutes === undefined && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  Bloqueo total
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  dailyLimitMinutes === 30 && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(30)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    dailyLimitMinutes === 30 && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  30 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  dailyLimitMinutes === 60 && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(60)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    dailyLimitMinutes === 60 && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  1 hora
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  dailyLimitMinutes === 120 && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(120)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    dailyLimitMinutes === 120 && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  2 horas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  dailyLimitMinutes === 300 && !isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectPreset(300)}
              >
                <Text
                  style={[
                    styles.quickAppChipText,
                    dailyLimitMinutes === 300 && !isCustom && {
                      color: colors.primary,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  5 horas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickAppChip,
                  isCustom && {
                    backgroundColor: '#E7F1FF',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={handleActivateCustom}
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

            {isCustom && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 8 }}>
                <TextInput
                  style={styles.customMinutesInput}
                  placeholder="ej: 45"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={customText}
                  selectTextOnFocus={true}
                  onChangeText={handleCustomTextChange}
                />
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>minutos diarios</Text>
              </View>
            )}

          <View style={styles.deviceSelectionContainer}>
            <View style={styles.applyToAllRow}>
              <Text style={styles.inputLabel}>Aplicar a todos los dispositivos (Regla global)</Text>
              <ToggleSwitch value={applyToAll} onValueChange={onApplyToAllChange} />
            </View>

            {/* Listado siempre visible de dispositivos registrados */}
            <View style={styles.deviceListContainer}>
              <Text style={styles.deviceListTitle}>Selecciona los dispositivos:</Text>

              {/* Mi dispositivo (Responsable) */}
              {(() => {
                const selfHighlight = getDeviceHighlight('self');
                return (
                  <TouchableOpacity
                    style={[
                      styles.deviceRow,
                      {
                        borderLeftWidth: 4,
                        borderLeftColor: selfHighlight.color,
                        backgroundColor: deviceIds.includes('self') ? selfHighlight.bgColor : '#FFFFFF',
                      },
                    ]}
                    onPress={() => onToggleDevice('self')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.deviceLeftCol}>
                      <View style={[styles.deviceIconBox, { backgroundColor: selfHighlight.bgColor }]}>
                        <Text style={styles.deviceIconText}>{selfHighlight.icon}</Text>
                      </View>
                      <View style={styles.deviceTextCol}>
                        <Text style={styles.deviceName}>Mi dispositivo</Text>
                      </View>
                    </View>
                    <ToggleSwitch
                      value={deviceIds.includes('self')}
                      onValueChange={() => onToggleDevice('self')}
                    />
                  </TouchableOpacity>
                );
              })()}

              {/* Dispositivos Protegidos */}
              {devices.map((device, idx) => {
                const highlight = getDeviceHighlight(device.deviceId, device.childName, device.deviceName, device.colorIndex ?? idx);
                const isSelected = deviceIds.includes(device.deviceId);

                return (
                  <TouchableOpacity
                    key={device.deviceId}
                    style={[
                      styles.deviceRow,
                      {
                        borderLeftWidth: 4,
                        borderLeftColor: highlight.color,
                        backgroundColor: isSelected ? highlight.bgColor : '#FFFFFF',
                      },
                    ]}
                    onPress={() => onToggleDevice(device.deviceId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.deviceLeftCol}>
                      <View style={[styles.deviceIconBox, { backgroundColor: highlight.bgColor }]}>
                        <Text style={styles.deviceIconText}>{highlight.icon}</Text>
                      </View>
                      <View style={styles.deviceTextCol}>
                        <Text style={styles.deviceName}>{device.deviceName}</Text>
                      </View>
                    </View>
                    <ToggleSwitch
                      value={isSelected}
                      onValueChange={() => onToggleDevice(device.deviceId)}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          </ScrollView>

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
