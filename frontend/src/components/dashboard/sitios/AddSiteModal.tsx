// ==============================================================================
// Proyecto: BA Protege+
// Componente: AddSiteModal (Modal Bottom Sheet para Bloquear Nuevo Sitio Web)
// Archivo: src/components/dashboard/sitios/AddSiteModal.tsx
// ==============================================================================

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { ToggleSwitch } from '../../ToggleSwitch';
import { colors } from '../../../theme/colors';
import { DeviceInfo } from '../../../types';
import { getDeviceHighlight, isValidDomainOrUrl, cleanDomainInput } from '../../../utils/deviceColors';
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
  const hasInput = domain.trim().length > 0;
  const isDomainValid = isValidDomainOrUrl(domain);
  const normalizedDomain = hasInput ? cleanDomainInput(domain) : '';

  const selfHighlight = getDeviceHighlight('self');

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
            <Text style={styles.sheetTitle}>Bloquear sitio web</Text>
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
            Ingresá el dominio o dirección web que deseás restringir en los dispositivos de tu familia.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <Text style={styles.inputLabel}>Dominio o URL del sitio:</Text>
            <TextInput
              style={[
                styles.formInput,
                hasInput && (isDomainValid ? styles.inputValid : styles.inputInvalid),
              ]}
              placeholder="ejemplo: casino-ilegal.bet o https://..."
              placeholderTextColor={colors.textSecondary}
              value={domain}
              selectTextOnFocus={true}
              onChangeText={onDomainChange}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Verificación de Sitio Válido en Tiempo Real */}
            {hasInput && (
              <View style={isDomainValid ? styles.domainFeedbackValid : styles.domainFeedbackInvalid}>
                <Text style={isDomainValid ? styles.domainFeedbackTextValid : styles.domainFeedbackTextInvalid}>
                  {isDomainValid
                    ? `✓ Sitio válido (se bloqueará: ${normalizedDomain})`
                    : '⚠️ Ingresá una dirección válida con extensión (ej. casino.bet, sitio.com.ar)'}
                </Text>
              </View>
            )}

            <View style={styles.deviceSelectionContainer}>
              <View style={styles.applyToAllRow}>
                <Text style={styles.inputLabel}>Aplicar a todos los dispositivos (regla global)</Text>
                <ToggleSwitch value={applyToAll} onValueChange={onApplyToAllChange} />
              </View>

              {/* Listado siempre visible de dispositivos registrados */}
              <View style={styles.deviceListContainer}>
                <Text style={styles.deviceListTitle}>Seleccioná los dispositivos:</Text>

                {/* Mi dispositivo (Responsable) */}
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
