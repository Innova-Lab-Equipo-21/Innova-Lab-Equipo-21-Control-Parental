// ==============================================================================
// Proyecto: BA Protege+
// Componente: PermissionsHeader
// Archivo: src/components/permissions/PermissionsHeader.tsx
// Descripción: Encabezado institucional superior con logo y barra de navegación con
//              botón volver y título.
// ==============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from '../../screens/PermissionsScreen.styles';

interface PermissionsHeaderProps {
  onBack?: () => void;
  title?: string;
}

export const PermissionsHeader: React.FC<PermissionsHeaderProps> = ({
  onBack,
  title = 'Permisos de aplicación',
}) => {
  return (
    <>
      <View style={styles.topHeaderBar}>
        <Image
          source={require('../../assets/logo/logo_baprotege_texto.png')}
          style={styles.topHeaderLogo}
          resizeMode="contain"
          accessibilityLabel="BA Protege +"
        />
      </View>

      <View style={styles.subHeaderRow}>
        <View style={styles.subHeaderLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Volver a la pantalla anterior"
          >
            <Image
              source={require('../../assets/icons/volver.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>{title}</Text>
        </View>
      </View>
    </>
  );
};
