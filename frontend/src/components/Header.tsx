// ==============================================================================
// Proyecto: BA Protege+
// Componente: Header (Encabezado Institucional Unificado)
// Archivo: src/components/Header.tsx
// Descripción: Encabezado institucional unificado para todas las pantallas con usuario logeado,
//              compuesto por la barra superior #EAF3FF con logo_baprotege_texto.png
//              y la subcabecera con título, subtítulo, botón de retorno y elemento derecho opcional.
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  showTopLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'BA Protege+',
  subtitle,
  onBack,
  rightElement,
  showTopLogo = true,
}) => {
  return (
    <View>
      {/* 1. Encabezado Superior Institucional con logo_baprotege_texto.png sobre fondo #EAF3FF */}
      {showTopLogo && (
        <View style={styles.topHeaderBar}>
          <Image
            source={require('../assets/logo/logo_baprotege_texto.png')}
            style={styles.topHeaderLogo}
            resizeMode="contain"
            accessibilityLabel="BA Protege +"
          />
        </View>
      )}

      {/* 2. Subheader con botón volver, título y elemento derecho opcional */}
      <View style={styles.subHeaderRow}>
        <View style={styles.subHeaderLeft}>
          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Volver"
            >
              <Image
                source={require('../assets/icons/volver.png')}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          <View style={styles.titleColumn}>
            <Text style={styles.screenTitle}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {rightElement ? <View>{rightElement}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeaderBar: {
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  topHeaderLogo: {
    width: 75,
    height: 36,
    resizeMode: 'contain',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#000000',
  },
  titleColumn: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 18,
  },
});
