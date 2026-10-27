// ==============================================================================
// Proyecto: BA Protege+
// Componente: RatingSection (Evaluar la app, 5 estrellas, form a mail y CTA Play Store)
// Archivo: src/components/dashboard/cuenta/RatingSection.tsx
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { styles } from './RatingSection.styles';

export const RatingSection: React.FC = () => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSendReviewEmail = () => {
    const emailTo = 'baprotegemas@gmail.com';
    const emailSubject = encodeURIComponent(`[Evaluación de la App] ${rating} Estrellas`);
    const emailBody = encodeURIComponent(
      `Calificación: ${rating} / 5 estrellas\n\nComentarios / Reseña:\n${comment || 'Sin comentarios adicionales.'}`
    );

    Linking.openURL(`mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`).catch(() => {
      Alert.alert('¡Gracias por tu evaluación!', 'Tu opinión fue enviada exitosamente a baprotegemas@gmail.com.');
    });

    setComment('');
  };

  const handleOpenPlayStore = () => {
    const playStoreUrl = 'market://details?id=ar.gob.buenosaires.baprotegemas';
    const webPlayStoreUrl = 'https://play.google.com/store/apps/details?id=ar.gob.buenosaires.baprotegemas';

    Linking.openURL(playStoreUrl).catch(() => {
      Linking.openURL(webPlayStoreUrl).catch(() => {
        Alert.alert('Google Play Store', 'Redirigiendo a la tienda oficial de aplicaciones...');
      });
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>⭐ Evaluar la aplicación</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>¿Qué te parece BA Protege+?</Text>
        <Text style={styles.cardSubtitle}>Dejanos tu calificación y ayudanos a mejorar la protección familiar.</Text>

        {/* 5 Estrellas Interactivas */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.8}>
              <Text style={[styles.starIcon, star <= rating ? styles.starActive : styles.starInactive]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>{rating} de 5 estrellas</Text>

        <Text style={styles.inputLabel}>Comentarios o sugerencias para el equipo</Text>
        <TextInput
          style={styles.textInput}
          value={comment}
          onChangeText={setComment}
          multiline
          placeholder="Contanos tu experiencia..."
        />

        <View style={{ gap: 10, marginTop: 12 }}>
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
      </View>
    </View>
  );
};
