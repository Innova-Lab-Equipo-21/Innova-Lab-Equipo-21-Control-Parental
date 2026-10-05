// ==============================================================================
// Proyecto: BA Protege+
// Componente: Header (Encabezado Institucional UI Kit)
// Archivo: src/components/Header.tsx
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Logo } from './Logo';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'BA Protege+',
  subtitle,
  showLogo = true,
}) => {
  const isDefaultTitle = !title || title === 'BA Protege+';

  return (
    <View style={styles.container}>
      {showLogo && isDefaultTitle ? (
        <View style={styles.logoContainer}>
          <Logo variant="complete" size="sm" align="left" />
        </View>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    marginTop: 4,
  },
});
