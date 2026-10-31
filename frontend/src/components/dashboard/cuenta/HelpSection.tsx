// ==============================================================================
// Proyecto: BA Protege+
// Componente: HelpSection (Sección de Ayuda y soporte)
// Archivo: src/components/dashboard/cuenta/HelpSection.tsx
// Descripción: Sección que agrupa el Tutorial/Onboarding y Preguntas Frecuentes (FAQ)
//              con el mismo estilo visual de Información legal y valoración.
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FaqModal } from './FaqModal';
import { styles } from './HelpSection.styles';

export interface HelpSectionProps {
  onOpenOnboarding: () => void;
}

export const HelpSection: React.FC<HelpSectionProps> = ({ onOpenOnboarding }) => {
  const [showFaq, setShowFaq] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Ayuda y soporte</Text>

      <TouchableOpacity
        style={styles.helpItem}
        onPress={onOpenOnboarding}
        activeOpacity={0.8}
      >
        <Text style={styles.helpItemText}>📖 Tutorial</Text>
        <Text style={styles.helpArrow}>➔</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.helpItem}
        onPress={() => setShowFaq(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.helpItemText}>❓ Preguntas frecuentes (FAQ)</Text>
        <Text style={styles.helpArrow}>➔</Text>
      </TouchableOpacity>

      <FaqModal visible={showFaq} onClose={() => setShowFaq(false)} />
    </View>
  );
};
