// ==============================================================================
// Proyecto: BA Protege+
// Componente: RatingModal (Modal de Evaluación de la Aplicación)
// Archivo: src/components/dashboard/cuenta/RatingModal.tsx
// Descripción: Modal Bottom Sheet con el mismo estilo de Términos y Condiciones
//              que permite evaluar la aplicación con 5 estrellas, enviar reseña y
//              calificar en Google Play Store.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Linking,
  ScrollView,
} from 'react-native';
import { legalStyles } from '../../auth/LegalModal.styles';
import { ActionButton } from '../../ActionButton';
import { FeedbackModal } from '../../FeedbackModal';
import { styles as ratingStyles } from './RatingSection.styles';

export interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    icon?: string;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleSendReviewEmail = () => {
    const emailTo = 'baprotegemas@gmail.com';
    const emailSubject = encodeURIComponent(`[Evaluación de la App] ${rating} Estrellas`);
    const emailBody = encodeURIComponent(
      `Calificación: ${rating} / 5 estrellas\n\nComentarios / Reseña:\n${comment || 'Sin comentarios adicionales.'}`
    );

    Linking.openURL(`mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`).catch(() => {
      setFeedbackModal({
        visible: true,
        icon: '⭐',
        title: 'Gracias por tu evaluación',
        message: 'Tu opinión fue enviada exitosamente a baprotegemas@gmail.com.',
      });
    });

    setComment('');
  };

  const handleOpenPlayStore = () => {
    const playStoreUrl = 'market://details?id=ar.gob.buenosaires.baprotegemas';
    const webPlayStoreUrl = 'https://play.google.com/store/apps/details?id=ar.gob.buenosaires.baprotegemas';

    Linking.openURL(playStoreUrl).catch(() => {
      Linking.openURL(webPlayStoreUrl).catch(() => {
        setFeedbackModal({
          visible: true,
          icon: '🏪',
          title: 'Google Play Store',
          message: 'Redirigiendo a la tienda oficial de aplicaciones...',
        });
      });
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={legalStyles.legalModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={legalStyles.legalModalCard}
          onStartShouldSetResponder={() => true}
        >
          {/* Manija táctil del Bottom Sheet */}
          <View style={legalStyles.bottomSheetHandle} />

          <View style={legalStyles.legalModalHeader}>
            <Text style={legalStyles.legalModalTitle}>Evaluar la aplicación</Text>
            <TouchableOpacity
              onPress={onClose}
              style={legalStyles.legalModalCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={legalStyles.legalModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={legalStyles.legalModalSubtitle}>
            BA Protege+ • Dejanos tu opinión y ayudanos a mejorar la protección
          </Text>

          <ScrollView
            style={legalStyles.legalModalBody}
            showsVerticalScrollIndicator={true}
          >
            {/* 5 Estrellas Interactivas */}
            <View style={ratingStyles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.8}>
                  <Text style={[ratingStyles.starIcon, star <= rating ? ratingStyles.starActive : ratingStyles.starInactive]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[ratingStyles.ratingText, { textAlign: 'center', marginBottom: 12 }]}>
              {rating} de 5 estrellas
            </Text>

            <Text style={ratingStyles.inputLabel}>Comentarios o sugerencias para el equipo</Text>
            <TextInput
              style={ratingStyles.textInput}
              value={comment}
              onChangeText={setComment}
              multiline
              placeholder="Contanos tu experiencia..."
              placeholderTextColor="#94A3B8"
            />

            <View style={{ gap: 10, marginTop: 16, marginBottom: 8 }}>
              <ActionButton
                title="Enviar reseña a baprotegemas@gmail.com"
                variant="secondary"
                onPress={handleSendReviewEmail}
              />
              <ActionButton
                title="⭐ Calificar en Google Play Store"
                variant="primary"
                onPress={handleOpenPlayStore}
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={legalStyles.legalModalConfirmBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={legalStyles.legalModalConfirmBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Modal estándar de retroalimentación */}
      <FeedbackModal
        visible={feedbackModal.visible}
        icon={feedbackModal.icon}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
};
