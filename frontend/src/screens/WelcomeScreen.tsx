// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Selección de Modo)
// Archivo: src/screens/WelcomeScreen.tsx
// Descripción: Pantalla de selección de modo (Responsable, Menor, Adulto)
//              con acceso directo a la pantalla de Onboarding y tutoriales en video.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme/colors';
import { AppMode } from '../types';

interface WelcomeScreenProps {
  onSelectMode: (mode: AppMode) => void;
  onOpenOnboarding?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectMode,
  onOpenOnboarding,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="BA Protege+"
        subtitle="Protección Digital contra Apuestas Clandestinas"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Banner para abrir el Onboarding y Videos */}
        {onOpenOnboarding && (
          <TouchableOpacity
            style={styles.onboardingBanner}
            onPress={onOpenOnboarding}
            activeOpacity={0.85}
          >
            <View style={styles.onboardingBannerIcon}>
              <Text style={{ fontSize: 20 }}>🎬</Text>
            </View>
            <View style={styles.onboardingBannerTextCol}>
              <Text style={styles.onboardingBannerTitle}>
                ¿Primera vez en la app? Mirá el tutorial
              </Text>
              <Text style={styles.onboardingBannerSubtitle}>
                3 videos explicativos paso a paso para cada modo
              </Text>
            </View>
            <Text style={styles.onboardingBannerArrow}>➔</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoSection}>
          <View style={styles.lockBadge}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </View>
          <Text style={styles.heroTitle}>Selecciona el Modo de Operación</Text>
          <Text style={styles.heroDescription}>
            Control Parental Oficial y Protección Digital respaldada por LOTBA
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Tarjeta 1: Modo Responsable */}
          <View style={styles.optionCard}>
            <Text style={styles.cardEmoji}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.cardTitle}>Modo Responsable</Text>
            <Text style={styles.cardText}>
              Supervisa el estado de protección de los celulares de tus hijos, recibe alertas y administra restricciones de uso.
            </Text>
            <ActionButton
              title="Continuar como Responsable"
              variant="primary"
              onPress={() => onSelectMode('PARENT')}
            />
          </View>

          {/* Tarjeta 2: Modo Menor */}
          <View style={styles.optionCard}>
            <Text style={styles.cardEmoji}>📱</Text>
            <Text style={styles.cardTitle}>Modo Dispositivo Protegido (Menor)</Text>
            <Text style={styles.cardText}>
              Activa el motor de filtrado local VPN con la lista oficial LOTBA y reporta telemetría segura.
            </Text>
            <ActionButton
              title="Configurar este Dispositivo"
              variant="secondary"
              onPress={() => onSelectMode('CHILD')}
            />
          </View>

          {/* Tarjeta 3: Modo Adulto */}
          <View style={[styles.optionCard, styles.optionCardAdult]}>
            <Text style={styles.cardEmoji}>💜</Text>
            <Text style={styles.cardTitle}>Modo Adulto (Autoprotección)</Text>
            <Text style={styles.cardText}>
              Protección voluntaria para mayores de edad contra plataformas de apuestas y acceso directo a asistencia.
            </Text>
            <TouchableOpacity
              style={styles.adultBtn}
              onPress={() => onSelectMode('ADULT')}
              activeOpacity={0.85}
            >
              <Text style={styles.adultBtnText}>Activar Autoprotección</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Línea de ayuda al pie */}
        <View style={styles.helpFooter}>
          <Text style={styles.helpFooterText}>
            Línea de Orientación al Jugador Problemático: <Text style={{ fontWeight: '700' }}>0800-444-5682</Text> (Gratuito y 24hs)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  onboardingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  onboardingBannerIcon: {
    marginRight: 10,
  },
  onboardingBannerTextCol: {
    flex: 1,
  },
  onboardingBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3730A3',
  },
  onboardingBannerSubtitle: {
    fontSize: 11,
    color: '#6366F1',
    marginTop: 1,
  },
  onboardingBannerArrow: {
    fontSize: 14,
    color: '#4F46E5',
    marginLeft: 6,
  },
  infoSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  lockBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E7F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  lockEmoji: {
    fontSize: 28,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  optionCardAdult: {
    borderColor: '#E9D5FF',
    backgroundColor: '#FAF5FF',
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  adultBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adultBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  helpFooter: {
    marginTop: 24,
    padding: 12,
    alignItems: 'center',
  },
  helpFooterText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
