// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Selección de Modo)
// Archivo: src/screens/WelcomeScreen.tsx
// Descripción: Pantalla alineada con OnboardingScreen en posición de logo, títulos y márgenes.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { colors } from '../theme/colors';
import { AppMode } from '../types';

interface WelcomeScreenProps {
  onSelectMode: (mode: AppMode) => void;
  onOpenOnboarding?: (step?: 1 | 2 | 3) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectMode,
  onOpenOnboarding,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Encabezado con Logotipo Oficial Completo Centrado (Mismo margen y tamaño que Onboarding) */}
        <View style={styles.headerLogoContainer}>
          <Logo variant="complete" size="md" align="center" />
        </View>

        {/* Sección de Títulos (Misma escala y posición que Onboarding) */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Elegí cómo vas a usar la app</Text>
          <Text style={styles.mainSubtitle}>
            Seleccioná el modo que más se adecúa a tus necesidades.
          </Text>
        </View>

        {/* CARD 1: MODO RESPONSABLE */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="escudo" size={22} color={colors.primary} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Modo responsable</Text>
          </View>

          <Text style={styles.cardDesc}>
            Ideal para quienes gestionan reglas, restricciones y bloqueos de sitios web y apps en este u otros dispositivos.
          </Text>

          <View style={styles.pillContainer}>
            <Text style={styles.pillText}>Basado en PIN y contraseña.</Text>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onSelectMode('PARENT')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Empezar</Text>
          </TouchableOpacity>
        </View>

        {/* CARD 2: MODO PROTEGIDO */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="corazon" size={22} color={colors.primary} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Modo protegido</Text>
          </View>

          <Text style={styles.cardDesc}>
            Para dispositivos que reciben protección y navegación segura configurada por un adulto responsable.
          </Text>

          <View style={styles.pillContainer}>
            <Text style={styles.pillText}>Basado en supervisión externa.</Text>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onSelectMode('CHILD')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Empezar</Text>
          </TouchableOpacity>
        </View>

        {/* Botón de Ayuda (Alineado a la derecha debajo del cuadro Modo protegido) */}
        {onOpenOnboarding && (
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => onOpenOnboarding(3)}
            activeOpacity={0.85}
          >
            <Text style={styles.helpIconText}>?</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLogoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
    lineHeight: 28,
  },
  mainSubtitle: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#007AFF',
  },
  cardDesc: {
    fontSize: 12.5,
    color: '#1C1C1E',
    lineHeight: 17,
    marginBottom: 10,
  },
  pillContainer: {
    backgroundColor: '#D0E2FF',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  actionBtn: {
    backgroundColor: '#007AFF',
    height: 38,
    width: 145,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  helpBtn: {
    backgroundColor: '#007AFF',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  helpIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
