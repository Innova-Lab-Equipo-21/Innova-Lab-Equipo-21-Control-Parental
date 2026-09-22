// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile & Web (Design System)
// Archivo: src/components/Logo.tsx
// Descripción: Componente de logotipo genérico con isotipo de candado abierto y tipografía oficial.
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.js';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  align?: 'center' | 'left';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  align = 'center',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const badgeSize = isSm ? 44 : isLg ? 72 : 56;
  const lockWidth = isSm ? 22 : isLg ? 36 : 28;
  const lockHeight = isSm ? 16 : isLg ? 26 : 20;
  const titleSize = isSm ? 18 : isLg ? 26 : 22;
  const subtitleSize = isSm ? 11 : isLg ? 13 : 12;

  return (
    <View
      style={[
        styles.container,
        align === 'center' ? styles.alignCenter : styles.alignLeft,
      ]}
    >
      {/* Insignia con Candado Abierto */}
      <View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
          },
        ]}
      >
        {/* Contenedor del Candado Abierto */}
        <View style={styles.lockContainer}>
          {/* Arco / Grillete abierto del candado */}
          <View
            style={[
              styles.lockShackle,
              {
                width: lockWidth * 0.65,
                height: lockHeight * 0.85,
                borderTopLeftRadius: lockWidth * 0.35,
                borderTopRightRadius: lockWidth * 0.35,
                borderWidth: isSm ? 2.5 : isLg ? 4 : 3,
                top: isSm ? -8 : isLg ? -14 : -11,
                left: isSm ? 1 : isLg ? 3 : 2,
                transform: [{ rotate: '-18deg' }],
              },
            ]}
          />
          {/* Cuerpo principal del candado */}
          <View
            style={[
              styles.lockBody,
              {
                width: lockWidth,
                height: lockHeight,
                borderRadius: isSm ? 4 : 6,
              },
            ]}
          >
            {/* Ojo de la cerradura / Keyhole */}
            <View
              style={[
                styles.keyholeTop,
                {
                  width: isSm ? 4 : isLg ? 7 : 5,
                  height: isSm ? 4 : isLg ? 7 : 5,
                  borderRadius: 3.5,
                },
              ]}
            />
            <View
              style={[
                styles.keyholeBottom,
                {
                  width: isSm ? 2 : isLg ? 3.5 : 2.5,
                  height: isSm ? 3 : isLg ? 6 : 4.5,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Identidad de Marca */}
      <View style={align === 'center' ? styles.textAlignCenter : styles.textAlignLeft}>
        <View style={styles.titleRow}>
          <Text style={[styles.titleBrand, { fontSize: titleSize }]}>BA Protege</Text>
          <Text style={[styles.titlePlus, { fontSize: titleSize }]}>+</Text>
        </View>
        {showSubtitle && (
          <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
            Control Parental y Protección Digital
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  alignCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  textAlignCenter: {
    alignItems: 'center',
  },
  textAlignLeft: {
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: '#B6D4FE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  lockContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  lockShackle: {
    position: 'absolute',
    borderColor: colors.primary,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  lockBody: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  keyholeTop: {
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  keyholeBottom: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBrand: {
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  titlePlus: {
    fontWeight: '900',
    color: colors.primary,
    marginLeft: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
