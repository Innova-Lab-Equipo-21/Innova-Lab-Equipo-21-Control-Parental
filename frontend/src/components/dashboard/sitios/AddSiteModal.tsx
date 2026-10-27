// ==============================================================================
// Proyecto: BA Protege+
// Componente: AddSiteModal (Modal para Bloquear Nuevo Sitio Web)
// Archivo: src/components/dashboard/sitios/AddSiteModal.tsx
// ==============================================================================

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { ToggleSwitch } from '../../ToggleSwitch';
import { colors } from '../../../theme/colors';
import { DeviceInfo } from '../../../types';
import { styles } from './CustomSitesSection.styles';

interface AddSiteModalProps {
  visible: boolean;
  onClose: () => void;
  domain: string;
  onDomainChange: (text: string) => void;
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

export const AddSiteModal: React.FC<AddSiteModalProps> = ({
  visible,
  onClose,
  domain,
  onDomainChange,
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
          <Text style={styles.modalTitle}>Bloquear sitio web</Text>
          <Text style={styles.modalBody}>
            Ingresa el dominio o dirección web que deseas restringir en los dispositivos de tu familia.
          </Text>

          <Text style={styles.inputLabel}>Dominio o URL del sitio:</Text>
          <TextInput
            style={styles.formInput}
            placeholder="ejemplo: casino-ilegal.bet"
            placeholderTextColor={colors.textSecondary}
            value={domain}
            onChangeText={onDomainChange}
            autoCapitalize="none"
            autoCorrect={false}
          />

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
