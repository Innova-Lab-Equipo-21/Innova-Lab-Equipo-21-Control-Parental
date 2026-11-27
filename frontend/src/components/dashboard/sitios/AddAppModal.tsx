// ==============================================================================
// Proyecto: BA Protege+
// Componente: AddAppModal (Modal para Bloquear Nueva Aplicación con Dropdown de 15 Apps y Límite Diario por Dispositivo)
// Archivo: src/components/dashboard/sitios/AddAppModal.tsx
// Descripción: Modal Bottom Sheet para bloquear una aplicación con selector rápido de apps populares,
//              asignación por dispositivo y configuración de límites diarios individuales.
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { ToggleSwitch } from '../../ToggleSwitch';
import { colors } from '../../../theme/colors';
import { CustomBlockedApp, DeviceInfo } from '../../../types';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import { styles } from './AddAppModal.styles';

// Lista de las 15 aplicaciones más descargadas de la Play Store
export const top15PlayStoreApps = [
  { name: 'TikTok', pkg: 'com.zhiliaoapp.musically', category: 'Redes sociales', icon: '📱' },
  { name: 'Instagram', pkg: 'com.instagram.android', category: 'Redes sociales', icon: '📷' },
  { name: 'WhatsApp', pkg: 'com.whatsapp', category: 'Comunicación', icon: '💬' },
  { name: 'Facebook', pkg: 'com.facebook.katana', category: 'Redes sociales', icon: '👥' },
  { name: 'Telegram', pkg: 'org.telegram.messenger', category: 'Comunicación', icon: '✈️' },
  { name: 'Snapchat', pkg: 'com.snapchat.android', category: 'Redes sociales', icon: '👻' },
  { name: 'YouTube', pkg: 'com.google.android.youtube', category: 'Entretenimiento', icon: '▶️' },
  { name: 'Spotify', pkg: 'com.spotify.music', category: 'Música', icon: '🎵' },
  { name: 'Netflix', pkg: 'com.netflix.mediaclient', category: 'Entretenimiento', icon: '🎬' },
  { name: 'Twitch', pkg: 'tv.twitch.android.app', category: 'Entretenimiento', icon: '🎮' },
  { name: 'Roblox', pkg: 'com.roblox.client', category: 'Juegos', icon: '🕹️' },
  { name: 'Free Fire', pkg: 'com.dts.freefireth', category: 'Juegos', icon: '🔥' },
  { name: 'Subway Surfers', pkg: 'com.kiloo.subwaysurf', category: 'Juegos', icon: '🏃' },
  { name: 'Candy Crush Saga', pkg: 'com.king.candycrushsaga', category: 'Juegos', icon: '🍬' },
  { name: 'Bet365', pkg: 'com.bet365Wrapper.Bet365_Application', category: 'Apuestas', icon: '🎲' },
];

export const popularAppCatalog = top15PlayStoreApps;

interface AddAppModalProps {
  visible: boolean;
  onClose: () => void;
  appName: string;
  onAppNameChange: (text: string) => void;
  quickSuggestions?: Array<{ name: string; pkg: string; category: string }>;
  onSelectSuggestion: (sug: { name: string; pkg: string; category: string }) => void;
  category: string;
  onCategoryChange: (cat: string) => void;
  applyToAll: boolean;
  onApplyToAllChange: (val: boolean) => void;
  deviceIds: string[];
  devices: DeviceInfo[];
  onToggleDevice: (deviceId: string) => void;
  dailyLimitMinutes?: number;
  onDailyLimitChange?: (mins?: number) => void;
  deviceLimits?: Record<string, number | undefined>;
  onDeviceLimitChange?: (deviceId: string, mins?: number) => void;
  existingApps?: CustomBlockedApp[];
  loading: boolean;
  onSave: () => void;
}

export const AddAppModal: React.FC<AddAppModalProps> = ({
  visible,
  onClose,
  appName,
  onAppNameChange,
  onSelectSuggestion,
  category,
  onCategoryChange,
  applyToAll,
  onApplyToAllChange,
  deviceIds,
  devices,
  onToggleDevice,
  deviceLimits = {},
  onDeviceLimitChange,
  existingApps,
  loading,
  onSave,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});
  const [customInput, setCustomInput] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) {
      setShowDropdown(false);
      setCustomMode({});
      setCustomInput({});
    }
  }, [visible]);

  const blockedAppNamesSet = useMemo(
    () =>
      new Set((existingApps ?? []).map((app) => app.appName.trim().toLowerCase())),
    [existingApps]
  );

  const blockedAppPackagesSet = useMemo(
    () =>
      new Set(
        (existingApps ?? [])
          .map((app) => app.packageName?.trim().toLowerCase())
          .filter((pkg): pkg is string => Boolean(pkg))
      ),
    [existingApps]
  );

  const availableAppSuggestions = useMemo(
    () =>
      top15PlayStoreApps.filter(
        (item) =>
          !blockedAppNamesSet.has(item.name.trim().toLowerCase()) &&
          !blockedAppPackagesSet.has(item.pkg.trim().toLowerCase())
      ),
    [blockedAppNamesSet, blockedAppPackagesSet]
  );

  // Aplicación seleccionada en el dropdown (si coincide con alguna sugerencia disponible)
  const selectedDropdownApp = availableAppSuggestions.find(
    (item) => item.name.toLowerCase().trim() === appName.toLowerCase().trim()
  );

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

  const hasInput = appName.trim().length > 0;
  const isDuplicate =
    hasInput &&
    Boolean(
      existingApps?.some(
        (app) => app.appName.trim().toLowerCase() === appName.trim().toLowerCase()
      )
    );

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
          onPress={hasInput ? () => onToggleDevice(deviceId) : undefined}
          activeOpacity={0.7}
          disabled={!hasInput}
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
            onValueChange={hasInput ? () => onToggleDevice(deviceId) : () => {}}
            disabled={!hasInput}
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
      visible={visible}
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
            <Text style={styles.sheetTitle}>Bloquear aplicación</Text>
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
            Elegí de la lista o escribí la aplicación que querés bloquear y definí un límite de tiempo para usarla.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Dropdown de las 15 aplicaciones más descargadas de la Play Store */}
            <Text style={styles.inputLabel}>Sugerencias rápidas:</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setShowDropdown((prev) => !prev)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{selectedDropdownApp?.icon || '📱'}</Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: selectedDropdownApp ? colors.textPrimary : colors.textSecondary,
                    fontWeight: selectedDropdownApp ? '600' : '400',
                  }}
                  numberOfLines={1}
                >
                  {selectedDropdownApp
                    ? selectedDropdownApp.name
                    : 'Seleccionar una app de la lista...'}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: 'bold' }}>
                {showDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator>
                  {availableAppSuggestions.length === 0 ? (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownItemSubtext}>
                        Todas las sugerencias ya están en tu lista de bloqueo.
                      </Text>
                    </View>
                  ) : (
                    availableAppSuggestions.map((item) => {
                      const isCurrent =
                        appName.toLowerCase().trim() === item.name.toLowerCase().trim();
                      return (
                        <TouchableOpacity
                          key={item.pkg}
                          style={[styles.dropdownItem, isCurrent && styles.dropdownItemActive]}
                          onPress={() => {
                            onSelectSuggestion(item);
                            setShowDropdown(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontSize: 15 }}>{item.icon}</Text>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                isCurrent && styles.dropdownItemTextActive,
                              ]}
                            >
                              {item.name}
                            </Text>
                          </View>
                          {isCurrent && (
                            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 }}>
                              ✓
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            )}

            <Text style={styles.inputLabel}>Nombre de la aplicación:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="ejemplo: Bet365, TikTok"
              placeholderTextColor={colors.textSecondary}
              value={appName}
              selectTextOnFocus={true}
              onChangeText={onAppNameChange}
            />

            {hasInput && isDuplicate && (
              <View style={styles.appFeedbackInvalid}>
                <Text style={styles.appFeedbackTextInvalid}>
                  ⚠️ Esta aplicación ya se encuentra en tu lista de restricción.
                </Text>
              </View>
            )}

            <View
              style={[
                styles.deviceSelectionContainer,
                !hasInput && styles.deviceSelectionContainerDisabled,
              ]}
              pointerEvents={hasInput ? 'auto' : 'none'}
            >
              {!hasInput && (
                <Text style={styles.deviceSelectionDisabledHint}>
                  Elegí o escribí primero el nombre de la app para indicar en qué dispositivos aplicar el bloqueo.
                </Text>
              )}

              <View style={styles.applyToAllRow}>
                <Text style={styles.inputLabel}>Aplicar a todos los dispositivos</Text>
                <ToggleSwitch
                  value={applyToAll}
                  onValueChange={hasInput ? onApplyToAllChange : () => {}}
                  disabled={!hasInput}
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
                disabled={!hasInput || isDuplicate || (!applyToAll && deviceIds.length === 0)}
                onPress={onSave}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
