// ==============================================================================
// Proyecto: BA Protege+
// Componente: RatingSection (Evaluar la app, 5 estrellas, form a mail y CTA Play Store)
// Archivo: src/components/dashboard/cuenta/RatingSection.tsx
// Descripción: Sección interactiva que permite a los usuarios calificar la aplicación
//              con un sistema de 1 a 5 estrellas, enviar comentarios por email directo
//              al equipo de soporte y redirigir a Google Play Store.
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Linking } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { FeedbackModal } from '../../FeedbackModal';
import { BOTITO_ASSETS } from '../protected/botAssets';
import { styles } from './RatingSection.styles';

/**
 * Componente que renderiza el módulo de valoración de la aplicación.
 * Permite seleccionar una calificación en estrellas, ingresar un comentario adicional,
 * enviarlo por correo o calificar directamente en la tienda oficial de Google Play.
 */
export const RatingSection: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState(false);
  const [comment, setComment] = useState('');
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    imageSource?: any;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleSelectStar = (star: number) => {
    setRating(star);
    if (ratingError) {
      setRatingError(false);
    }
  };

  /** Abre la aplicación de correo predeterminada con los datos precompletados de la reseña */
  const handleSendReviewEmail = () => {
    if (rating < 1) {
      setRatingError(true);
      return;
    }

    const emailTo = 'baprotegemas@gmail.com';
    const emailSubject = encodeURIComponent(`[Evaluación de la App] ${rating} Estrellas`);
    const emailBody = encodeURIComponent(
      `Calificación: ${rating} / 5 estrellas\n\nComentarios / Reseña:\n${comment || 'Sin comentarios adicionales.'}`
    );

    Linking.openURL(`mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`).catch(() => {
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.feliz,
        title: 'Gracias por tu evaluación',
        message: 'Tu opinión fue enviada exitosamente a baprotegemas@gmail.com.',
      });
    });

    setComment('');
  };

  /** Redirige al usuario a la ficha de la app en la tienda Google Play Store */
  const handleOpenPlayStore = () => {
    const playStoreUrl = 'market://details?id=ar.gob.buenosaires.baprotegemas';
    const webPlayStoreUrl = 'https://play.google.com/store/apps/details?id=ar.gob.buenosaires.baprotegemas';

    Linking.openURL(playStoreUrl).catch(() => {
      Linking.openURL(webPlayStoreUrl).catch(() => {
        setFeedbackModal({
          visible: true,
          imageSource: BOTITO_ASSETS.pensando,
          title: 'Google Play Store',
          message: 'Redirigiendo a la tienda oficial de aplicaciones...',
        });
      });
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Calificar la aplicación</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calificar la aplicación</Text>
        <Text style={styles.cardSubtitle}>Dejanos tu opinión y ayudanos a mejorar la protección.</Text>

        {/* 5 Estrellas Interactivas */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleSelectStar(star)} activeOpacity={0.8}>
              <Text style={[styles.starIcon, star <= rating ? styles.starActive : styles.starInactive]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.ratingText, { marginBottom: ratingError ? 4 : 12 }]}>
          {rating} de 5 estrellas
        </Text>
        {ratingError && (
          <Text style={styles.ratingErrorText}>
            Seleccioná una calificación con estrellas antes de enviar.
          </Text>
        )}

        <Text style={styles.inputLabel}>Comentarios o sugerencias para el equipo</Text>
        <TextInput
          style={styles.textInput}
          value={comment}
          onChangeText={setComment}
          multiline
          placeholder="Contanos tu experiencia…"
        />

        <View style={styles.ctaGroup}>
          <View style={styles.ctaBlock}>
            <Text style={styles.ctaHelperText}>
              Si lo preferís, podés enviarnos tus comentarios a nuestra casilla de correo electrónico.
            </Text>
            <ActionButton
              title="Enviar correo"
              variant="secondary"
              onPress={handleSendReviewEmail}
            />
          </View>

          <View style={styles.ctaBlock}>
            <Text style={styles.ctaHelperText}>
              También podés dejarnos tu reseña en Google Play Store.
            </Text>
            <ActionButton
              title="Dejar reseña"
              variant="primary"
              onPress={handleOpenPlayStore}
            />
          </View>
        </View>
      </View>

      {/* Modal estándar de retroalimentación */}
      <FeedbackModal
        visible={feedbackModal.visible}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
};
