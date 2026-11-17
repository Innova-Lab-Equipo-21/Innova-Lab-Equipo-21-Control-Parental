// ==============================================================================
// Proyecto: BA Protege+
// Componente: PermissionsFooter
// Archivo: src/components/permissions/PermissionsFooter.tsx
// Descripción: Barra de pie con botones simétricos de acción "Volver" y "Continuar".
// ==============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../screens/PermissionsScreen.styles';

interface PermissionsFooterProps {
  onBack: () => void;
  onContinue: () => void;
  backText?: string;
  continueText?: string;
}

export const PermissionsFooter: React.FC<PermissionsFooterProps> = ({
  onBack,
  onContinue,
  backText = 'Volver',
  continueText = 'Continuar',
}) => {
  return (
    <View style={styles.footerSection}>
      <TouchableOpacity
        style={styles.backButtonSecondary}
        onPress={onBack}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonSecondaryText} numberOfLines={1}>
          {backText}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={onContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText} numberOfLines={1}>
          {continueText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
