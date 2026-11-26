// ==============================================================================
// Proyecto: BA Protege+
// Componente: EditSiteModal (Modal Bottom Sheet para Editar Sitio Web Bloqueado)
// Archivo: src/components/dashboard/sitios/EditSiteModal.tsx
// Descripción: Modal Bottom Sheet para modificar el dominio o asignación de dispositivos
//              de un sitio web previamente restringido.
// ==============================================================================

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { ToggleSwitch } from '../../ToggleSwitch';
import { colors } from '../../../theme/colors';
import { CustomBlockedDomain, DeviceInfo } from '../../../types';
import { getDeviceHighlight, isValidDomainOrUrl, cleanDomainInput } from '../../../utils/deviceColors';
import { styles } from './EditSiteModal.styles';

interface EditSiteModalProps {
  editingSite: CustomBlockedDomain | null;
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

export const EditSiteModal: React.FC<EditSiteModalProps> = ({
  editingSite,
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
      visible={!!editingSite}
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
            <Text style={styles.sheetTitle}>Editar sitio bloqueado</Text>
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
            Cambiá la dirección web o modificá en qué dispositivos aplicar el bloqueo.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <Text style={styles.inputLabel}>Dirección del sitio o enlace:</Text>
            <TextInput
              style={[
                styles.formInput,
                hasInput && (isDomainValid ? styles.inputValid : styles.inputInvalid),
              ]}
              value={domain}
              selectTextOnFocus={true}
              onChangeText={onDomainChange}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="ejemplo: casino-ilegal.bet"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Verificación de Sitio Válido en Tiempo Real */}
            {hasInput && (
              <View style={isDomainValid ? styles.domainFeedbackValid : styles.domainFeedbackInvalid}>
                <Text style={isDomainValid ? styles.domainFeedbackTextValid : styles.domainFeedbackTextInvalid}>
                  {isDomainValid
                    ? `✓ ¡Listo! Se bloqueará ${normalizedDomain}`
                    : '⚠️ Ingresá una dirección válida con extensión (ej. casino.bet, sitio.com.ar)'}
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
                  Ingresá primero el dominio o URL del sitio para seleccionar los dispositivos.
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

              {/* Listado siempre visible de dispositivos registrados */}
              <View style={styles.deviceListContainer}>
                <Text style={styles.deviceListTitle}>Elegí los dispositivos:</Text>

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
                  onPress={hasInput ? () => onToggleDevice('self') : undefined}
                  activeOpacity={0.7}
                  disabled={!hasInput}
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
                    onValueChange={hasInput ? () => onToggleDevice('self') : () => {}}
                    disabled={!hasInput}
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
                      onPress={hasInput ? () => onToggleDevice(device.deviceId) : undefined}
                      activeOpacity={0.7}
                      disabled={!hasInput}
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
                        onValueChange={hasInput ? () => onToggleDevice(device.deviceId) : () => {}}
                        disabled={!hasInput}
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
