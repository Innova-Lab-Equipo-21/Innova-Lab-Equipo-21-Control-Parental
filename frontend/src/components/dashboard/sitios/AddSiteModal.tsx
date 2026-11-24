// ==============================================================================
// Proyecto: BA Protege+
// Componente: AddSiteModal (Modal Bottom Sheet para Bloquear Nuevo Sitio Web)
// Archivo: src/components/dashboard/sitios/AddSiteModal.tsx
// Descripción: Modal Bottom Sheet para ingresar y bloquear un nuevo dominio web,
//              con selector de sugerencias rápidas (Top 15 sitios Argentina),
//              validación en tiempo real y asignación personalizada de dispositivos.
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { ToggleSwitch } from '../../ToggleSwitch';
import { colors } from '../../../theme/colors';
import { CustomBlockedDomain, DeviceInfo } from '../../../types';
import { getDeviceHighlight, isValidDomainOrUrl, cleanDomainInput } from '../../../utils/deviceColors';
import { validateDomainInputDetailed, getDomainAutocompleteSuggestions } from '../../../utils/domainValidation';
import { styles } from './AddSiteModal.styles';

// Lista de los 15 sitios web más visitados de Argentina
export const top15ArgentinaSites = [
  { name: 'Instagram', domain: 'instagram.com', category: 'Redes sociales', icon: '📷' },
  { name: 'TikTok', domain: 'tiktok.com', category: 'Redes sociales', icon: '📱' },
  { name: 'Facebook', domain: 'facebook.com', category: 'Redes sociales', icon: '👥' },
  { name: 'X (Twitter)', domain: 'x.com', category: 'Redes sociales', icon: '🌐' },
  { name: 'YouTube', domain: 'youtube.com', category: 'Entretenimiento', icon: '▶️' },
  { name: 'Netflix', domain: 'netflix.com', category: 'Entretenimiento', icon: '🎬' },
  { name: 'Twitch', domain: 'twitch.tv', category: 'Entretenimiento', icon: '🎮' },
  { name: 'Spotify', domain: 'spotify.com', category: 'Música', icon: '🎵' },
  { name: 'Roblox', domain: 'roblox.com', category: 'Juegos', icon: '🕹️' },
  { name: 'Bet365', domain: 'bet365.com', category: 'Apuestas', icon: '🎲' },
  { name: 'bplay', domain: 'bplay.bet.ar', category: 'Apuestas', icon: '🎰' },
  { name: 'Mercado Libre', domain: 'mercadolibre.com.ar', category: 'Compras', icon: '🛍️' },
  { name: 'Infobae', domain: 'infobae.com', category: 'Noticias', icon: '📰' },
  { name: 'Olē', domain: 'ole.com.ar', category: 'Deportes', icon: '⚽' },
  { name: 'Promiedos', domain: 'promiedos.com.ar', category: 'Deportes', icon: '🏆' },
];

export const popularSiteCatalog = top15ArgentinaSites;

interface AddSiteModalProps {
  visible: boolean;
  onClose: () => void;
  domain: string;
  onDomainChange: (text: string) => void;
  quickSuggestions?: Array<{ name: string; domain: string; category: string; icon?: string }>;
  onSelectSuggestion?: (sug: { name: string; domain: string; category: string; icon?: string }) => void;
  category?: string;
  onCategoryChange?: (cat: string) => void;
  applyToAll: boolean;
  onApplyToAllChange: (val: boolean) => void;
  deviceIds: string[];
  devices: DeviceInfo[];
  onToggleDevice: (deviceId: string) => void;
  existingSites?: CustomBlockedDomain[];
  loading: boolean;
  onSave: () => void;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({
  visible,
  onClose,
  domain,
  onDomainChange,
  onSelectSuggestion,
  category,
  onCategoryChange,
  applyToAll,
  onApplyToAllChange,
  deviceIds,
  devices,
  onToggleDevice,
  existingSites,
  loading,
  onSave,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowDropdown(false);
    }
  }, [visible]);

  const hasInput = domain.trim().length > 0;
  const validation = validateDomainInputDetailed(domain);
  const isDomainValid = validation.isValid;
  const normalizedDomain = hasInput ? cleanDomainInput(domain) : '';

  const blockedDomainsSet = useMemo(
    () =>
      new Set(
        (existingSites ?? []).map((site) => cleanDomainInput(site.domain).toLowerCase())
      ),
    [existingSites]
  );

  const availableSiteSuggestions = useMemo(
    () =>
      top15ArgentinaSites.filter(
        (item) => !blockedDomainsSet.has(cleanDomainInput(item.domain).toLowerCase())
      ),
    [blockedDomainsSet]
  );

  const autocompleteItems = getDomainAutocompleteSuggestions(
    domain,
    availableSiteSuggestions
  ).filter((item) => !blockedDomainsSet.has(cleanDomainInput(item.domain).toLowerCase()));

  const isDuplicate =
    hasInput && blockedDomainsSet.has(normalizedDomain.toLowerCase());

  // Sitio seleccionado en el dropdown
  const selectedDropdownSite = availableSiteSuggestions.find(
    (item) =>
      item.domain.toLowerCase().trim() === normalizedDomain.toLowerCase().trim() ||
      item.name.toLowerCase().trim() === domain.toLowerCase().trim()
  );

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
            Elegí de la lista o escribí la dirección web que querés bloquear.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Dropdown de los 15 sitios web más visitados de Argentina */}
            <Text style={styles.inputLabel}>Sugerencias rápidas:</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setShowDropdown((prev) => !prev)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{selectedDropdownSite?.icon || '🌐'}</Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: selectedDropdownSite ? colors.textPrimary : colors.textSecondary,
                    fontWeight: selectedDropdownSite ? '600' : '400',
                  }}
                  numberOfLines={1}
                >
                  {selectedDropdownSite
                    ? selectedDropdownSite.name
                    : 'Seleccionar un sitio de la lista'}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: 'bold' }}>
                {showDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator>
                  {availableSiteSuggestions.length === 0 ? (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownItemSubtext}>
                        Todas las sugerencias ya están en tu lista de bloqueo.
                      </Text>
                    </View>
                  ) : (
                    availableSiteSuggestions.map((item) => {
                      const isCurrent =
                        normalizedDomain.toLowerCase().trim() === item.domain.toLowerCase().trim() ||
                        domain.toLowerCase().trim() === item.name.toLowerCase().trim();
                      return (
                        <TouchableOpacity
                          key={item.domain}
                          style={[styles.dropdownItem, isCurrent && styles.dropdownItemActive]}
                          onPress={() => {
                            onDomainChange(item.domain);
                            if (onCategoryChange) {
                              onCategoryChange(item.category);
                            }
                            onSelectSuggestion?.(item);
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

            <Text style={styles.inputLabel}>Dirección del sitio o enlace:</Text>
            <TextInput
              style={[
                styles.formInput,
                hasInput && (isDomainValid ? styles.inputValid : styles.inputInvalid),
              ]}
              placeholder="Ejemplo: casino-ilegal.bet o https://..."
              placeholderTextColor={colors.textSecondary}
              value={domain}
              selectTextOnFocus={true}
              onChangeText={onDomainChange}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Chips de Autocompletado Inteligente en Tiempo Real */}
            {hasInput && autocompleteItems.length > 0 && (
              <View style={styles.autocompleteContainer}>
                <Text style={styles.autocompleteTitle}>Autocompletar sitio sugerido:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {autocompleteItems.map((item) => (
                    <TouchableOpacity
                      key={item.domain}
                      style={styles.autocompleteChip}
                      onPress={() => {
                        onDomainChange(item.domain);
                        if (item.category && onCategoryChange) {
                          onCategoryChange(item.category);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.autocompleteChipText}>{item.domain}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Verificación de Errores y Retroalimentación en Tiempo Real */}
            {hasInput && (
              <View
                style={
                  !isDuplicate && isDomainValid
                    ? styles.domainFeedbackValid
                    : styles.domainFeedbackInvalid
                }
              >
                <Text
                  style={
                    !isDuplicate && isDomainValid
                      ? styles.domainFeedbackTextValid
                      : styles.domainFeedbackTextInvalid
                  }
                >
                  {isDuplicate
                    ? '⚠️ Este sitio web ya está en tu lista de bloqueo.'
                    : isDomainValid
                    ? `¡Listo! Se bloqueará: ${normalizedDomain}`
                    : validation.message ||
                      '⚠️ Ingresá una dirección válida con extensión (ej. casino.bet, sitio.com.ar)'}
                </Text>
                {!isDuplicate && !isDomainValid && validation.suggestedCorrection && (
                  <TouchableOpacity
                    style={styles.suggestionActionBtn}
                    onPress={() => onDomainChange(validation.suggestedCorrection!)}
                  >
                    <Text style={styles.suggestionActionBtnText}>
                      Completar como {validation.suggestedCorrection}
                    </Text>
                  </TouchableOpacity>
                )}
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
                  Elegí o escribí primero el sitio para indicar en qué dispositivos aplicar el bloqueo.
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
                disabled={!hasInput || !isDomainValid || isDuplicate || (!applyToAll && deviceIds.length === 0)}
                onPress={onSave}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

