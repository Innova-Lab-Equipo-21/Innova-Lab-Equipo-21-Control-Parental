// ==============================================================================
// Proyecto: BA Protege+
// Componente: LegalSection (Información legal y valoración de la aplicación)
// Archivo: src/components/dashboard/cuenta/LegalSection.tsx
// Descripción: Sección que agrupa los Términos y condiciones, Política de privacidad
//              y la opción de Evaluar la aplicación en formato modal.
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TermsModal } from '../../auth/TermsModal';
import { PrivacyModal } from '../../auth/PrivacyModal';
import { RatingModal } from './RatingModal';
import { styles } from './LegalSection.styles';

export const LegalSection: React.FC = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRating, setShowRating] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Información legal y valoración</Text>

      <TouchableOpacity
        style={styles.legalItem}
        onPress={() => setShowTerms(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.legalItemText}>📄 Términos y condiciones</Text>
        <Text style={styles.legalArrow}>➔</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.legalItem}
        onPress={() => setShowPrivacy(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.legalItemText}>🔒 Política de privacidad (Ley N° 25.326)</Text>
        <Text style={styles.legalArrow}>➔</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.legalItem}
        onPress={() => setShowRating(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.legalItemText}>⭐ Evaluar la aplicación</Text>
        <Text style={styles.legalArrow}>➔</Text>
      </TouchableOpacity>

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <RatingModal visible={showRating} onClose={() => setShowRating(false)} />
    </View>
  );
};
