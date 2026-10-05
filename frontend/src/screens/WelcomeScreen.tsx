// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Selección de Modo)
// Archivo: src/screens/WelcomeScreen.tsx
// Descripción: Selección de modo compacta sin scroll.
//              - Bloque 1: Modo Responsable destacado con tarjeta con borde.
//              - Bloque 2: Modo Protegido dentro de contenedor unificado con borde externo.
//              - Acceso a tutoriales y línea oficial en el rodapé.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Logo } from '../components/Logo';
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
      <View style={styles.container}>
        {/* Encabezado Superior con Logo Centralizado */}
        <View style={styles.headerRow}>
          <Logo variant="complete" size="md" align="center" />
        </View>

        {/* Título de la Pantalla */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Seleccioná el modo de la app</Text>
          <Text style={styles.mainSubtitle}>
            Elegí el rol correspondiente a este dispositivo:
          </Text>
        </View>

        {/* ======================================================== */}
        {/* 1. MODO RESPONSABLE (BLOQUE CON BORDE DESTACADO)         */}
        {/* ======================================================== */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredBadgeRow}>
            <Text style={styles.featuredBadgeText}>MODO RESPONSABLE</Text>
          </View>

          <View style={styles.featuredHeaderRow}>
            <Text style={styles.featuredEmoji}>👨‍👩‍👧‍👦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featuredTitle}>Tutor</Text>
              <Text style={styles.featuredDesc}>
                Configurá reglas, supervisá el escudo en vivo y administrá tus dispositivos.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.featuredBtn}
            onPress={() => onSelectMode('PARENT')}
            activeOpacity={0.85}
          >
            <Text style={styles.featuredBtnText}>Configurar Tutor</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* 2. MODO PROTEGIDO (BLOQUE UNIFICADO CON BORDE EXTERNO)    */}
        {/* ======================================================== */}
        <View style={styles.protectedContainerCard}>
          <View style={styles.protectedBadgeRow}>
            <Text style={styles.protectedBadgeText}>
              MODO PROTEGIDO (RECIBE REGLAS DE UN TUTOR)
            </Text>
          </View>

          <View style={styles.protectedRow}>
            {/* Tarjeta Menor */}
            <TouchableOpacity
              style={styles.protectedCard}
              onPress={() => onSelectMode('CHILD')}
              activeOpacity={0.85}
            >
              <View style={styles.protectedCardHeader}>
                <Text style={styles.protectedEmoji}>📱</Text>
                <Text style={styles.protectedTitle}>Menor</Text>
              </View>
              <Text style={styles.protectedDesc}>
                Para niños y adolescentes. Recibe filtrado de red del tutor.
              </Text>
              <View style={styles.protectedBtn}>
                <Text style={styles.protectedBtnText}>Configurar Menor</Text>
              </View>
            </TouchableOpacity>

            {/* Tarjeta Adulto */}
            <TouchableOpacity
              style={[styles.protectedCard, styles.adultCard]}
              onPress={() => onSelectMode('ADULT')}
              activeOpacity={0.85}
            >
              <View style={styles.protectedCardHeader}>
                <Text style={styles.protectedEmoji}>💜</Text>
                <Text style={[styles.protectedTitle, styles.adultTitle]}>Adulto</Text>
              </View>
              <Text style={styles.protectedDesc}>
                Acompañamiento en ludopatía bajo tutela de un responsable.
              </Text>
              <View style={[styles.protectedBtn, styles.adultBtn]}>
                <Text style={[styles.protectedBtnText, styles.adultBtnText]}>Configurar Adulto</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* RODAPÉ (TUTORIALES Y LÍNEA DE ORIENTACIÓN)               */}
        {/* ======================================================== */}
        <View style={styles.footerContainer}>
          {onOpenOnboarding && (
            <TouchableOpacity
              style={styles.footerTutorialBtn}
              onPress={onOpenOnboarding}
              activeOpacity={0.85}
            >
              <Text style={styles.footerTutorialText}>Cómo funciona la app?</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.footerHelpText}>
            📞 Línea gratuita de orientación 24hs: <Text style={styles.boldText}>0800-444-5682</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 2,
  },
  mainTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  featuredCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 4,
  },
  featuredBadgeRow: {
    marginBottom: 6,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0056B3',
    letterSpacing: 0.5,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featuredEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 2,
  },
  featuredDesc: {
    fontSize: 12,
    color: '#1C1C1E',
    lineHeight: 16,
  },
  featuredBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  protectedContainerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    marginVertical: 4,
  },
  protectedBadgeRow: {
    marginBottom: 8,
  },
  protectedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0056B3',
    letterSpacing: 0.4,
  },
  protectedRow: {
    flexDirection: 'row',
    gap: 10,
  },
  protectedCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  adultCard: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  protectedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  protectedEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  protectedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  adultTitle: {
    color: '#7E22CE',
  },
  protectedDesc: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 15,
    marginBottom: 8,
  },
  protectedBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protectedBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  adultBtn: {
    backgroundColor: '#7E22CE',
  },
  adultBtnText: {
    color: '#FFFFFF',
  },
  footerContainer: {
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  footerTutorialBtn: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  footerTutorialText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3730A3',
  },
  footerHelpText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '700',
  },
});
