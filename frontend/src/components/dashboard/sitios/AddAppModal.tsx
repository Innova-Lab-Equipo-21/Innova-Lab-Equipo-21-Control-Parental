// ==============================================================================
// Proyecto: BA Protege+
// Componente: AddAppModal (Modal para Bloquear Nueva Aplicación con Catálogo Autocompletado y Límite Diario)
// Archivo: src/components/dashboard/sitios/AddAppModal.tsx
// ==============================================================================

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { ToggleSwitch } from '../../ToggleSwitch';
import { colors } from '../../../theme/colors';
import { DeviceInfo } from '../../../types';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import { styles } from './CustomSitesSection.styles';

export const popularAppCatalog = [
  { name: 'Bet365', pkg: 'com.bet365.mobile', category: 'Apuestas' },
  { name: '1xBet', pkg: 'com.oneXbet.app', category: 'Apuestas' },
  { name: 'Pokerstars', pkg: 'com.pokerstars.mobile', category: 'Apuestas' },
  { name: 'Betano', pkg: 'com.betano.mobile', category: 'Apuestas' },
  { name: 'Codere', pkg: 'com.codere.apuestas', category: 'Apuestas' },
  { name: 'Bwin', pkg: 'com.bwin.sports', category: 'Apuestas' },
  { name: 'TikTok', pkg: 'com.zhiliaoapp.musically', category: 'Redes sociales' },
  { name: 'Instagram', pkg: 'com.instagram.android', category: 'Redes sociales' },
  { name: 'Kwai', pkg: 'com.kwai.video', category: 'Redes sociales' },
  { name: 'Free Fire', pkg: 'com.dts.freefireth', category: 'Juegos' },
  { name: 'Roblox', pkg: 'com.roblox.client', category: 'Juegos' },
  { name: 'Twitch', pkg: 'tv.twitch.android.app', category: 'Entretenimiento' },
];

interface AddAppModalProps {
  visible: boolean;
  onClose: () => void;
  appName: string;
  onAppNameChange: (text: string) => void;
  quickSuggestions: Array<{ name: string; pkg: string; category: string }>;
  onSelectSuggestion: (sug: { name: string; pkg: string; category: string }) => void;
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

export const AddAppModal: React.FC<AddAppModalProps> = ({
  visible,
  onClose,
  appName,
  onAppNameChange,
  quickSuggestions,
  onSelectSuggestion,
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
  // Coincidencias en tiempo real mientras el usuario escribe
  const liveMatches = appName.trim().length > 0
    ? popularAppCatalog.filter((item) =>
        item.name.toLowerCase().includes(appName.toLowerCase().trim())
      )
    : [];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          <Image
            source={require('../../../assets/icons/bot/beti.png')}
            style={styles.modalHeaderImage}
          />
          <Text style={styles.modalTitle}>Bloquear aplicación</Text>
          <Text style={styles.modalBody}>
            Selecciona o ingresa la aplicación a restringir y define opcionalmente su límite de tiempo diario.
          </Text>

          <Text style={styles.inputLabel}>Sugerencias rápidas:</Text>
          <View style={styles.quickAppChipContainer}>
            {quickSuggestions.map((sug) => (
              <TouchableOpacity
                key={sug.pkg}
                style={styles.quickAppChip}
                onPress={() => onSelectSuggestion(sug)}
              >
                <Text style={styles.quickAppChipText}>{sug.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Nombre de la aplicación:</Text>
          <TextInput
            style={styles.formInput}
            placeholder="ejemplo: Bet365, TikTok"
            placeholderTextColor={colors.textSecondary}
            value={appName}
            onChangeText={onAppNameChange}
          />

          {/* Autocompletado en tiempo real */}
          {liveMatches.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 11, color: colors.primary, fontWeight: 'bold', marginBottom: 4 }}>
                🔍 Aplicaciones encontradas en el catálogo oficial:
              </Text>
              <View style={styles.quickAppChipContainer}>
                {liveMatches.map((sug) => (
                  <TouchableOpacity
                    key={sug.pkg}
                    style={[styles.quickAppChip, { backgroundColor: '#E7F1FF', borderColor: colors.primary }]}
                    onPress={() => onSelectSuggestion(sug)}
                  >
                    <Text style={[styles.quickAppChipText, { color: colors.primary, fontWeight: 'bold' }]}>
                      ✓ {sug.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Límite de tiempo diario */}
          <Text style={styles.inputLabel}>Límite de tiempo diario (Opcional):</Text>
          <View style={styles.quickAppChipContainer}>
            <TouchableOpacity
              style={[styles.quickAppChip, dailyLimitMinutes === undefined && { backgroundColor: '#E7F1FF', borderColor: colors.primary }]}
              onPress={() => onDailyLimitChange(undefined)}
            >
              <Text style={[styles.quickAppChipText, dailyLimitMinutes === undefined && { color: colors.primary, fontWeight: 'bold' }]}>
                ∞ Indeterminado (Por defecto)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAppChip, dailyLimitMinutes === 30 && { backgroundColor: '#E7F1FF', borderColor: colors.primary }]}
              onPress={() => onDailyLimitChange(30)}
            >
              <Text style={[styles.quickAppChipText, dailyLimitMinutes === 30 && { color: colors.primary, fontWeight: 'bold' }]}>
                ⏱️ 30 min
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAppChip, dailyLimitMinutes === 60 && { backgroundColor: '#E7F1FF', borderColor: colors.primary }]}
              onPress={() => onDailyLimitChange(60)}
            >
              <Text style={[styles.quickAppChipText, dailyLimitMinutes === 60 && { color: colors.primary, fontWeight: 'bold' }]}>
                ⏱️ 1 hora
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAppChip, dailyLimitMinutes === 120 && { backgroundColor: '#E7F1FF', borderColor: colors.primary }]}
              onPress={() => onDailyLimitChange(120)}
            >
              <Text style={[styles.quickAppChipText, dailyLimitMinutes === 120 && { color: colors.primary, fontWeight: 'bold' }]}>
                ⏱️ 2 horas
              </Text>
            </TouchableOpacity>
          </View>

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
                        <View style={styles.deviceNameRow}>
                          <Text style={styles.deviceName}>Mi dispositivo</Text>
                          <View
                            style={[
                              styles.deviceRoleBadge,
                              { backgroundColor: selfHighlight.bgColor, borderColor: selfHighlight.borderColor },
                            ]}
                          >
                            <Text style={[styles.deviceRoleBadgeText, { color: selfHighlight.color }]}>
                              {selfHighlight.badgeLabel}
                            </Text>
                          </View>
                        </View>
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
                const highlight = getDeviceHighlight(device.deviceId, device.childName, device.deviceName, idx);
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
                        <View style={styles.deviceNameRow}>
                          <Text style={styles.deviceName}>{device.deviceName}</Text>
                          <View
                            style={[
                              styles.deviceRoleBadge,
                              { backgroundColor: highlight.bgColor, borderColor: highlight.borderColor },
                            ]}
                          >
                            <Text style={[styles.deviceRoleBadgeText, { color: highlight.color }]}>
                              {highlight.badgeLabel}
                            </Text>
                          </View>
                        </View>
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
