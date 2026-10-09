// ==============================================================================
// Proyecto: BA Protege+
// Componente: Header (Encabezado Institucional UI Kit)
// Archivo: src/components/Header.tsx
// Descripción: Encabezado institucional con soporte para ícono de retorno,
//              títulos y logotipo oficial logo_ba.png en el Dashboard.
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Logo } from './Logo';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import logoBaPng from '../assets/logo/logo_ba.png';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  useBaLogo?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'BA Protege+',
  subtitle,
  showLogo = true,
  useBaLogo = false,
  onBack,
}) => {
  const isDefaultTitle = !title || title === 'BA Protege+';

  return (
    <View style={styles.container}>
      <View style={styles.headerTopRow}>
        <View style={styles.titleRow}>
          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Volver a la pantalla anterior"
            >
              <Image
                source={require('../assets/icons/volver.png')}
                style={styles.backIconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}

          {showLogo && isDefaultTitle ? (
            <View style={styles.logoContainer}>
              <Logo variant="complete" size="sm" align="left" />
            </View>
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}
        </View>

        {useBaLogo && (
          <Image
            source={logoBaPng}
            style={styles.headerLogoBa}
            resizeMode="contain"
          />
        )}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  backButton: {
    marginRight: 10,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconImage: {
    width: 22,
    height: 22,
  },
  logoContainer: {
    marginBottom: 2,
  },
  title: {
    ...typography.header,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerLogoBa: {
    width: 36,
    height: 36,
  },
});
