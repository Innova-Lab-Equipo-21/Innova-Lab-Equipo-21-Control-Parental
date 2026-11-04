// ==============================================================================
// Proyecto: BA Protege+
// Componente: FeedbackModal (Modal Estándar de Retroalimentación del App)
// Archivo: src/components/FeedbackModal.tsx
// Descripción: Modal informativo y de confirmación que reemplaza las alertas nativas
//              en los flujos de gestión de dispositivos (inclusión, edición, exclusión)
//              y sitios/apps. Cumple con el diseño unificado del app:
//              - Título en Sentence case.
//              - Botón de cierre X superior derecho.
//              - Emoji centrado identificador.
//              - Botón principal de acción sin emojis.
//              - Soporte para renderizado como Modal o como Overlay absoluto.
// ==============================================================================

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { ActionButton } from './ActionButton';
import { styles } from './FeedbackModal.styles';

export interface FeedbackModalProps {
  visible: boolean;
  icon?: string;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  asOverlay?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  icon = '✅',
  title,
  message,
  buttonText = 'Entendido',
  onClose,
  asOverlay = false,
}) => {
  if (!visible) {
    return null;
  }

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

        {/* Emoji centrado identificador */}
        {icon ? <Text style={styles.modalEmoji}>{icon}</Text> : null}

        {/* Título en Sentence case */}
        <Text style={styles.modalTitle}>{title}</Text>

        {/* Cuerpo descriptivo */}
        <Text style={styles.modalBody}>{message}</Text>

        {/* Botón de confirmación sin emojis */}
        <View style={styles.buttonRow}>
          <ActionButton
            title={buttonText}
            variant="primary"
            onPress={onClose}
          />
        </View>
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
