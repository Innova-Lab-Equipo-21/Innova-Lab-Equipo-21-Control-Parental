// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoAddAppModal (Modal Bottom Sheet para Bloquear Aplicación)
// Archivo: src/components/dashboard/protected/adulto/AdultoAddAppModal.tsx
// Descripción: Modal Bottom Sheet en Modo Protegido Adulto para restringir una
//              aplicación (con sugerencias rápidas Top 15 Play Store), informando
//              que solo el responsable podrá desactivarla o eliminarla.
// ==============================================================================

import React, { useState, useEffect } from 'react';
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
import { top15PlayStoreApps } from '../../sitios/AddAppModal';
import { ADULTO_APP_MODAL_WARNING } from '../../../../utils/adultoSitios';
import { BOTI_ASSETS } from '../botAssets';
import { styles } from './AdultoAddAppModal.styles';

export interface AdultoAddAppModalProps {
  visible: boolean;
  onClose: () => void;
  appName: string;
  onAppNameChange: (text: string) => void;
  onSelectSuggestion: (sug: { name: string; pkg: string; category: string }) => void;
  loading: boolean;
  onSave: () => void;
}

export const AdultoAddAppModal: React.FC<AdultoAddAppModalProps> = ({
  visible,
  onClose,
  appName,
  onAppNameChange,
  onSelectSuggestion,
  loading,
  onSave,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowDropdown(false);
    }
  }, [visible]);

  const selectedDropdownApp = top15PlayStoreApps.find(
    (item) => item.name.toLowerCase().trim() === appName.toLowerCase().trim()
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
            Seleccioná o ingresá la aplicación que deseás restringir en este dispositivo.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 12 }}
          >
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
                    ? `${selectedDropdownApp.name} (${selectedDropdownApp.category})`
                    : 'Seleccionar app de la lista (Top 15 Play Store)...'}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: 'bold' }}>
                {showDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator>
                  {top15PlayStoreApps.map((item) => {
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
                          <View>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                isCurrent && styles.dropdownItemTextActive,
                              ]}
                            >
                              {item.name}
                            </Text>
                            <Text style={styles.dropdownItemSubtext}>{item.category}</Text>
                          </View>
                        </View>
                        {isCurrent && (
                          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 }}>
                            ✓
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
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

            <View style={styles.warningNoticeBox}>
              <Image
                source={BOTI_ASSETS.nervioso}
                style={styles.warningMascot}
                resizeMode="contain"
              />
              <View style={styles.warningTextCol}>
                <Text style={styles.warningNoticeTitle}>⚠️ Aviso importante</Text>
                <Text style={styles.warningNoticeText}>{ADULTO_APP_MODAL_WARNING}</Text>
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
                onPress={onSave}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
