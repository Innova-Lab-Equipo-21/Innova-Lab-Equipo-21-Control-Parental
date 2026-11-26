// ==============================================================================
// Proyecto: BA Protege+
// Componente: FeedbackModal (Modal Estándar de Retroalimentación del App)
// Archivo: src/components/FeedbackModal.tsx
// Descripción: Modal informativo y de confirmación que reemplaza las alertas nativas
//              en los flujos de gestión de dispositivos, permisos y modos protegidos.
//              Soporta tanto emoji identificador como imagen de mascota (Boti / Botito)
//              según el sentimiento del mensaje.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { ActionButton } from './ActionButton';
import { BOTITO_ASSETS } from './dashboard/protected/botAssets';
import { styles } from './FeedbackModal.styles';

const resolveBotitoImageFromIcon = (icon?: string): ImageSourcePropType => {
  switch (icon?.trim()) {
    case '⚠️':
    case '⚠':
    case '❌':
    case '🚨':
    case '⛔':
      return BOTITO_ASSETS.nervioso;
    case '😢':
    case '😔':
    case '💔':
      return BOTITO_ASSETS.triste;
    case '📱':
    case '📷':
    case '🏪':
    case '⏱️':
    case '⏳':
    case '❓':
    case 'ℹ️':
    case '🗑️':
    case '🔓':
    case '🛡️':
      return BOTITO_ASSETS.pensando;
    case '✅':
    case '⭐':
    case '🎉':
    case '🔒':
    default:
      return BOTITO_ASSETS.feliz;
  }
};

export interface FeedbackModalProps {
  visible: boolean;
  icon?: string;
  imageSource?: ImageSourcePropType;
  title: string;
  message: string;
  buttonText?: string;
  onConfirm?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  onClose: () => void;
  asOverlay?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  icon,
  imageSource,
  title,
  message,
  buttonText = 'Entendido',
  onConfirm,
  secondaryButtonText,
  onSecondaryPress,
  onClose,
  asOverlay = false,
}) => {
  if (!visible) {
    return null;
  }

  const resolvedImageSource = imageSource ?? resolveBotitoImageFromIcon(icon);

  const handlePrimaryPress = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    } else {
      onClose();
    }
  };

  const modalBodyContent = (
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

        {/* Ilustración de Botito según el contexto del mensaje */}
        <Image
          source={resolvedImageSource}
          style={styles.modalMascotImage}
          resizeMode="contain"
        />

        {/* Título en Sentence case */}
        <Text style={styles.modalTitle}>{title}</Text>

        {/* Cuerpo descriptivo */}
        <Text style={styles.modalBody}>{message}</Text>

        {/* Fila de botones de acción */}
        {secondaryButtonText ? (
          <View style={styles.dualButtonRow}>
            <View style={styles.dualButtonItem}>
              <ActionButton
                title={secondaryButtonText}
                variant="secondary"
                onPress={handleSecondaryPress}
              />
            </View>
            <View style={styles.dualButtonItem}>
              <ActionButton
                title={buttonText}
                variant="primary"
                onPress={handlePrimaryPress}
              />
            </View>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <ActionButton
              title={buttonText}
              variant="primary"
              onPress={handlePrimaryPress}
            />
          </View>
        )}
      </View>
    </View>
  );

  if (asOverlay) {
    return (
      <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
        {modalBodyContent}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {modalBodyContent}
    </Modal>
  );
};
