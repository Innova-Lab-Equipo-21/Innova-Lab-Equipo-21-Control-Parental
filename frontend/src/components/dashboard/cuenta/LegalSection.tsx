// ==============================================================================
// Proyecto: BA Protege+
// Componente: LegalSection (Términos y condiciones y Política de privacidad)
// Archivo: src/components/dashboard/cuenta/LegalSection.tsx
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TermsModal } from '../../auth/TermsModal';
import { PrivacyModal } from '../../auth/PrivacyModal';
import { styles } from './LegalSection.styles';

export const LegalSection: React.FC = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Información legal</Text>

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

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </View>
  );
};
