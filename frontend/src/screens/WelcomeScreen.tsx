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
          <View style={styles.titleRow}>
            {onOpenOnboarding && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => onOpenOnboarding(3)}
                activeOpacity={0.7}
                accessibilityLabel="Volver al último paso de onboarding"
              >
                <Icon name="volver" size={24} color="#000000" />
              </TouchableOpacity>
            )}
            <Text style={styles.mainTitle}>Elegí cómo vas a usar la app</Text>
          </View>
          <Text style={styles.mainSubtitle}>
            Seleccioná el modo que más se adecúa a tus necesidades.
          </Text>
        </View>

        {/* CARD 1: MODO RESPONSABLE */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="escudo" size={24} color={colors.primary} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Modo responsable</Text>
          </View>

          <Text style={styles.cardDesc}>
            Ideal para quienes gestionan reglas, restricciones y bloqueos de sitios web y apps en este u outros dispositivos.
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
            <Icon name="corazon" size={24} color={colors.primary} style={styles.cardIcon} />
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
    paddingBottom: 24,
  },
  headerLogoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  backBtn: {
    marginRight: 10,
    paddingVertical: 4,
    paddingRight: 4,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 28,
    flex: 1,
  },
  mainSubtitle: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#F0F7FF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  cardDesc: {
    fontSize: 13.5,
    color: '#1C1C1E',
    lineHeight: 19,
    marginBottom: 14,
  },
  pillContainer: {
    backgroundColor: '#D0E2FF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  actionBtn: {
    backgroundColor: '#007AFF',
    height: 44,
    width: 160,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
