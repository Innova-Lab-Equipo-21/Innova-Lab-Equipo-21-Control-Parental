// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Selección de Modo)
// Archivo: src/screens/WelcomeScreen.tsx
// Descripción: Vista inicial para elegir entre Modo Responsable o Modo Dispositivo Protegido.
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme/colors';
import { AppMode } from '../types';

interface WelcomeScreenProps {
  onSelectMode: (mode: AppMode) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectMode }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="BA Protege+"
        subtitle="Control Parental y Protección Digital Oficial"
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoSection}>
          <Text style={styles.heroEmoji}>🛡️</Text>
          <Text style={styles.heroTitle}>Protección Integral contra Apuestas Online</Text>
          <Text style={styles.heroDescription}>
            Selecciona el modo de operación para este dispositivo móvil según tu rol.
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.optionCard}>
            <Text style={styles.cardEmoji}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.cardTitle}>Modo Responsable (Padre / Tutor)</Text>
            <Text style={styles.cardText}>
              Gestiona dispositivos vinculados, consulta el estado efectivo de protección en tiempo real y administra listas personalizadas.
            </Text>
            <ActionButton
              title="Continuar como Responsable"
              variant="primary"
              onPress={() => onSelectMode('PARENT')}
            />
          </View>

          <View style={styles.optionCard}>
            <Text style={styles.cardEmoji}>📱</Text>
            <Text style={styles.cardTitle}>Modo Dispositivo Protegido (Hijo / Menor)</Text>
            <Text style={styles.cardText}>
              Activa el motor de filtrado local VPN con la lista oficial de LOTBA y reporta telemetría segura.
            </Text>
            <ActionButton
              title="Configurar este Dispositivo"
              variant="secondary"
              onPress={() => onSelectMode('CHILD')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
  },
  infoSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
});
