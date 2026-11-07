// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoAddSiteModal (Modal Bottom Sheet para Bloquear Sitio Web)
// Archivo: src/components/dashboard/protected/adulto/AdultoAddSiteModal.tsx
// Descripción: Modal Bottom Sheet en Modo Protegido Adulto para agregar un sitio
//              web a la lista de bloqueo, advirtiendo explícitamente que solo el
//              responsable podrá desactivarlo o eliminarlo.
// ==============================================================================

import React from 'react';
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
import { isValidDomainOrUrl, cleanDomainInput } from '../../../../utils/deviceColors';
import { ADULTO_SITE_MODAL_WARNING } from '../../../../utils/adultoSitios';
import { BOTI_ASSETS } from '../botAssets';
import { styles } from './AdultoAddSiteModal.styles';

export interface AdultoAddSiteModalProps {
  visible: boolean;
  onClose: () => void;
  domain: string;
  onDomainChange: (text: string) => void;
  loading: boolean;
  onSave: () => void;
}

export const AdultoAddSiteModal: React.FC<AdultoAddSiteModalProps> = ({
  visible,
  onClose,
  domain,
  onDomainChange,
  loading,
  onSave,
}) => {
  const hasInput = domain.trim().length > 0;
  const isDomainValid = isValidDomainOrUrl(domain);
  const normalizedDomain = hasInput ? cleanDomainInput(domain) : '';

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
            Ingresá el dominio o dirección web que deseás restringir en este dispositivo.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 12 }}
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

            {hasInput && (
              <View style={isDomainValid ? styles.domainFeedbackValid : styles.domainFeedbackInvalid}>
                <Text style={isDomainValid ? styles.domainFeedbackTextValid : styles.domainFeedbackTextInvalid}>
                  {isDomainValid
                    ? `✓ Sitio válido (se bloqueará: ${normalizedDomain})`
                    : '⚠️ Ingresá una dirección válida con extensión (ej. casino.bet, sitio.com.ar)'}
                </Text>
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
                onPress={onSave}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
