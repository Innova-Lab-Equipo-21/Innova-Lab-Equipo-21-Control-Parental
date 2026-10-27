// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile & Web (Design System)
// Archivo: src/components/Logo.tsx
// Descripción: Componente de logotipo oficial utilizando la imagen PNG logo_baprotege.png.
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../theme/colors';
import logoPng from '../assets/logo/logo_baprotege.png';

export interface LogoProps {
  variant?: 'complete' | 'icon';
  size?: 'sm' | 'md' | 'lg' | number;
  showSubtitle?: boolean;
  align?: 'center' | 'left';
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = false,
  align = 'center',
}) => {
  const getDimensions = () => {
    if (typeof size === 'number') {
      return { width: size, height: size * 0.436 };
    }
    switch (size) {
      case 'sm':
        return { width: 120, height: 52 };
      case 'lg':
        return { width: 220, height: 96 };
      case 'md':
      default:
        return { width: 160, height: 70 };
    }
  };

  const { width, height } = getDimensions();

  return (
    <View
      style={[
        styles.container,
        align === 'center' ? styles.alignCenter : styles.alignLeft,
      ]}
    >
      <Image
        source={logoPng}
        style={{ width, height, resizeMode: 'contain' }}
      />

      {showSubtitle && (
        <Text style={styles.subtitle}>Control Parental y Protección Digital</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
  },
  alignCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  subtitle: {
    color: colors.textSecondary || '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
