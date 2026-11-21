// ==============================================================================
// Proyecto: BA Protege+
// Componente: PermissionsInfoBox
// Archivo: src/components/permissions/PermissionsInfoBox.tsx
// Descripción: Tarjeta de información azul institucional con ícono de escudo y
//              propósito general de la configuración de permisos.
// ==============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from '../Icon';
import { colors } from '../../theme/colors';
import { styles } from '../../screens/PermissionsScreen.styles';

interface PermissionsInfoBoxProps {
  title?: string;
  description?: string;
}

export const PermissionsInfoBox: React.FC<PermissionsInfoBoxProps> = ({
  title = 'Configurá tu dispositivo',
  description = 'Activá los permisos necesarios para garantizar la protección continua y el bienestar digital de tu entorno.',
}) => {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoHeader}>
        <Icon name="escudo" size={18} color={colors.primary} style={styles.infoIcon} />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={styles.infoDescription}>{description}</Text>
    </View>
  );
};
