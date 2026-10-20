// ==============================================================================
// Proyecto: BA Protege+
// Componente: AddAppModal (Modal para Bloquear Nueva Aplicación con Catálogo Autocompletado)
// Archivo: src/components/dashboard/sitios/AddAppModal.tsx
// ==============================================================================

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { ToggleSwitch } from '../../ToggleSwitch';
import { colors } from '../../../theme/colors';
import { DeviceInfo } from '../../../types';
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
            Selecciona o ingresa el nombre de la aplicación móvil que deseas restringir.
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

          <View style={styles.deviceSelectionContainer}>
            <View style={styles.applyToAllRow}>
              <Text style={styles.inputLabel}>Aplicar a todos los dispositivos (Regla global)</Text>
              <ToggleSwitch value={applyToAll} onValueChange={onApplyToAllChange} />
            </View>

            {!applyToAll && (
              <View style={styles.deviceListContainer}>
                <Text style={styles.deviceListTitle}>Selecciona los dispositivos:</Text>

                {/* Mi dispositivo (Responsable) */}
                <TouchableOpacity
                  style={styles.deviceRow}
                  onPress={() => onToggleDevice('self')}
                >
                  <ToggleSwitch
                    value={deviceIds.includes('self')}
                    onValueChange={() => onToggleDevice('self')}
                  />
                  <Text style={styles.deviceName}>📱 Mi dispositivo (Responsable)</Text>
                </TouchableOpacity>

                {/* Dispositivos Protegidos */}
                {devices.map((device) => (
                  <TouchableOpacity
                    key={device.deviceId}
                    style={styles.deviceRow}
                    onPress={() => onToggleDevice(device.deviceId)}
                  >
                    <ToggleSwitch
                      value={deviceIds.includes(device.deviceId)}
                      onValueChange={() => onToggleDevice(device.deviceId)}
                    />
                    <Text style={styles.deviceName}>📱 {device.deviceName} {device.childName ? `(${device.childName})` : ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
