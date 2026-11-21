// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Selección de Modo)
// Archivo: src/screens/WelcomeScreen.tsx
// Descripción: Pantalla alineada con OnboardingScreen en posición de logo, títulos y márgenes.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { FeedbackModal } from '../components/FeedbackModal';
import { AnimatedBotMascot } from '../components/AnimatedBotMascot';
import { colors } from '../theme/colors';
import { AppMode } from '../types';
import { styles } from './WelcomeScreen.styles';

interface WelcomeScreenProps {
  onSelectMode: (mode: AppMode) => void;
  onOpenOnboarding?: (step?: 1 | 2 | 3) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectMode,
  onOpenOnboarding,
}) => {
  const [showResponsibleAlertModal, setShowResponsibleAlertModal] = useState<boolean>(false);

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
            Para personalizar los bloqueos de sitios y apps, y promover la navegación segura en este u otros dispositivos.
          </Text>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setShowResponsibleAlertModal(true)}
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
            Para dispositivos que reciben la protección de una persona responsable para prevenir los riesgos que se derivan de sitios de juegos y apuestas ilegales.
          </Text>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onSelectMode('CHILD')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Empezar</Text>
          </TouchableOpacity>
        </View>

        {/* Botito pensando animado centrado en el área inferior */}
        <View style={styles.botitoContainer} pointerEvents="none">
          <AnimatedBotMascot
            mood="pensando"
            size={120}
            accessibilityLabel="Botito pensando en qué modo elegir"
          />
        </View>
      </ScrollView>

      {/* Modal estándar de alerta sobre decisión de Modo Responsable */}
      <FeedbackModal
        visible={showResponsibleAlertModal}
        icon="⚠️"
        title="¿Confirmás tu decisión?"
        message={
          'Al actuar como persona responsable, vas a poder personalizar los bloqueos de sitios y apps.\n\nSi más adelante necesitás cambiar al otro modo, vas a tener que borrar los datos de la app desde los ajustes de tu celular.'
        }
        buttonText="Continuar"
        secondaryButtonText="Cancelar"
        onConfirm={() => {
          setShowResponsibleAlertModal(false);
          onSelectMode('PARENT');
        }}
        onSecondaryPress={() => setShowResponsibleAlertModal(false)}
        onClose={() => setShowResponsibleAlertModal(false)}
      />
    </SafeAreaView>
  );
};
