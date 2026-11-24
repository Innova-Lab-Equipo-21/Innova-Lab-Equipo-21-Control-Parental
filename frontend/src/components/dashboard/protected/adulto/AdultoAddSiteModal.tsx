// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoAddSiteModal (Modal Bottom Sheet para Bloquear Sitio Web)
// Archivo: src/components/dashboard/protected/adulto/AdultoAddSiteModal.tsx
// Descripción: Modal Bottom Sheet en Modo Protegido Adulto para agregar un sitio
//              web a la lista de bloqueo (con sugerencias rápidas Top 15 Argentina),
//              advirtiendo explícitamente que solo el responsable podrá desactivarlo o eliminarlo.
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { ActionButton } from '../../../ActionButton';
import { colors } from '../../../../theme/colors';
import { CustomBlockedDomain } from '../../../../types';
import { isValidDomainOrUrl, cleanDomainInput } from '../../../../utils/deviceColors';
import { validateDomainInputDetailed, getDomainAutocompleteSuggestions } from '../../../../utils/domainValidation';
import { ADULTO_SITE_MODAL_WARNING } from '../../../../utils/adultoSitios';
import { top15ArgentinaSites } from '../../sitios/AddSiteModal';
import { BOTI_ASSETS } from '../botAssets';
import { styles } from './AdultoAddSiteModal.styles';

export interface AdultoAddSiteModalProps {
  visible: boolean;
  onClose: () => void;
  domain: string;
  onDomainChange: (text: string) => void;
  onSelectSuggestion?: (sug: { name: string; domain: string; category: string; icon?: string }) => void;
  existingSites?: CustomBlockedDomain[];
  loading: boolean;
  onSave: () => void;
}

export const AdultoAddSiteModal: React.FC<AdultoAddSiteModalProps> = ({
  visible,
  onClose,
  domain,
  onDomainChange,
  onSelectSuggestion,
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
        (existingSites ?? []).map((item) => cleanDomainInput(item.domain).toLowerCase())
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

  const selectedDropdownSite = availableSiteSuggestions.find(
    (item) =>
      item.domain.toLowerCase().trim() === normalizedDomain.toLowerCase().trim() ||
      item.name.toLowerCase().trim() === domain.toLowerCase().trim()
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetOverlay}>
        <View style={styles.bottomSheetModalContent}>
          <View style={styles.bottomSheetHandle} />

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
            Seleccioná o ingresá el sitio web que deseás restringir en este dispositivo.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {/* Sugerencias rápidas (Top 15 Argentina) */}
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
                    : 'Seleccionar sitio de la lista (Top 15 Argentina)...'}
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

            {/* Chips de Autocompletado Inteligente en Tiempo Real */}
            {hasInput && autocompleteItems.length > 0 && (
              <View style={styles.autocompleteContainer}>
                <Text style={styles.autocompleteTitle}>💡 Autocompletar sitio sugerido:</Text>
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
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.autocompleteChipIcon}>{item.icon || '🌐'}</Text>
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
                    ? '⚠️ Este sitio web ya se encuentra en tu lista de bloqueo.'
                    : isDomainValid
                    ? `✓ Sitio válido (se bloqueará: ${normalizedDomain})`
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

            <View style={styles.warningNoticeBox}>
              <Image
                source={BOTI_ASSETS.nervioso}
                style={styles.warningMascot}
                resizeMode="contain"
              />
              <View style={styles.warningTextCol}>
                <Text style={styles.warningNoticeTitle}>⚠️ Aviso importante</Text>
                <Text style={styles.warningNoticeText}>{ADULTO_SITE_MODAL_WARNING}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonsRow}>
            <View style={styles.buttonFlex}>
              <ActionButton
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
              />
            </View>
            <View style={styles.buttonFlex}>
              <ActionButton
                title="Guardar"
                variant="primary"
                loading={loading}
                disabled={!hasInput || !isDomainValid || isDuplicate}
                onPress={onSave}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
