// ==============================================================================
// Proyecto: BA Protege+
// Componente: AntiUninstallCodeModal
// Archivo: src/components/dashboard/cuenta/AntiUninstallCodeModal.tsx
// Descripción: Modal institucional estándar que solicita un código de verificación
//              de 6 dígitos enviado al correo del responsable que vinculó el dispositivo
//              para poder desactivar la protección antidesinstalación en modos protegidos.
//              Si el usuario cierra el modal y lo vuelve a abrir, el código anterior
//              queda invalidado y se emite uno nuevo hacia el responsable.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ActionButton } from '../../ActionButton';
import { getBotMascotImage } from '../protected/botAssets';
import { styles } from './AntiUninstallCodeModal.styles';

export interface AntiUninstallCodeModalProps {
  visible: boolean;
  maskedEmail: string;
  profileType?: 'CHILD' | 'ADULT';
  loading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (code: string) => void;
  onResendCode?: () => void;
}

export const AntiUninstallCodeModal: React.FC<AntiUninstallCodeModalProps> = ({
  visible,
  maskedEmail,
  profileType = 'CHILD',
  loading = false,
  errorMessage = null,
  onClose,
  onConfirm,
  onResendCode,
}) => {
  const [code, setCode] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      setCode('');
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const handleTextChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(cleaned);
  };

  const handleConfirmPress = () => {
    if (code.length === 6 && !loading) {
      onConfirm(code);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Botón de cierre X superior derecho */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Cerrar modal"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Ilustración institucional de mascota (Boti / Botito pensando) */}
          <Image
            source={getBotMascotImage(profileType, 'pensando')}
            style={styles.modalMascotImage}
            resizeMode="contain"
          />

          {/* Título en Sentence case */}
          <Text style={styles.modalTitle}>Desactivar antidesinstalación</Text>

          {/* Mensaje descriptivo con correo del responsable enmascarado */}
          <Text style={styles.modalBody}>
            Ingresá el código de 6 dígitos enviado al correo del responsable:{' '}
            <Text style={styles.emailHighlight}>{maskedEmail}</Text>
          </Text>

          {/* Cuadro informativo de advertencia */}
          <View style={styles.warningNoticeBox}>
            <Text style={styles.warningNoticeText}>
              🔒 Si cerrás este modal, el código actual quedará invalidado y deberás solicitar uno nuevo.
            </Text>
          </View>

          {/* Campo de ingreso del código de 6 dígitos */}
          <View style={styles.codeInputContainer}>
            <TextInput
              style={[
                styles.codeInput,
                isFocused && styles.codeInputFocused,
                Boolean(errorMessage) && styles.codeInputError,
              ]}
              value={code}
              onChangeText={handleTextChange}
              placeholder="••••••"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus={true}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {errorMessage ? (
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            ) : null}
          </View>

          {/* Opción para reenviar código */}
          {onResendCode && (
            <TouchableOpacity
              style={styles.resendContainer}
              onPress={onResendCode}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendText, loading && styles.resendTextDisabled]}>
                Reenviar nuevo código
              </Text>
            </TouchableOpacity>
          )}

          {/* Fila simétrica de botones: Cancelar y Confirmar */}
          <View style={styles.dualButtonRow}>
            <View style={styles.dualButtonItem}>
              <ActionButton
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                disabled={loading}
              />
            </View>
            <View style={styles.dualButtonItem}>
              <ActionButton
                title="Confirmar"
                variant="primary"
                onPress={handleConfirmPress}
                disabled={code.length !== 6 || loading}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
