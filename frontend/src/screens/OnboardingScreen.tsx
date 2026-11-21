// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Onboarding - Flujo Wizard de 3 Pantallas)
// Archivo: src/screens/OnboardingScreen.tsx
// Descripción: Flujo guiado de 3 pantallas wizard exactamente alineado al diseño oficial:
//              Paso 1: Bienvenida, propósito de protección y capacidades clave.
//              Paso 2: Explicación de los 2 modos operativos (Modo Responsable y Modo Protegido).
//              Paso 3: Video explicativo paso a paso con reproductor integrado.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { AnimatedBotMascot } from '../components/AnimatedBotMascot';
import {
  YouTubePlayerView,
  hasNativeYouTubePlayer,
} from '../components/YouTubePlayerView';
import { AppMode } from '../types';
import { styles } from './OnboardingScreen.styles';

const ONBOARDING_YOUTUBE_VIDEO_ID = 'TiF6zxlt5fU';
const ONBOARDING_YOUTUBE_URL = `https://www.youtube.com/shorts/${ONBOARDING_YOUTUBE_VIDEO_ID}`;

interface OnboardingScreenProps {
  onComplete: () => void;
  onSelectMode?: (mode: AppMode) => void;
  initialStep?: 1 | 2 | 3;
  completeButtonText?: string;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  initialStep = 1,
  completeButtonText,
}) => {
  // Estado del Wizard: Paso 1, 2 o 3
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(initialStep);

  useEffect(() => {
    if (initialStep) {
      setWizardStep(initialStep);
    }
  }, [initialStep]);

  // Estado del Video (Paso 3)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePlayVideo = () => {
    if (hasNativeYouTubePlayer()) {
      setIsPlaying(true);
      return;
    }
    Linking.openURL(ONBOARDING_YOUTUBE_URL).catch(() => {});
  };

  const handleVideoError = () => {
    setIsPlaying(false);
    Linking.openURL(ONBOARDING_YOUTUBE_URL).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.mainContent}>
          {/* Encabezado con Logotipo Oficial Completo Centrado */}
          <View style={styles.headerLogoContainer}>
            <Logo variant="complete" size="md" align="center" />
          </View>

          {/* Stepper Progress Bar con 3 Pasos */}
          <View style={styles.stepperWrapper}>
            <View style={styles.stepperRow}>
              {[1, 2, 3].map((stepNum, idx) => {
                const isCompleted = wizardStep > stepNum;
                const isCurrent = wizardStep === stepNum;
                const isActive = isCurrent || isCompleted;

                return (
                  <React.Fragment key={stepNum}>
                    <TouchableOpacity
                      style={[
                        styles.stepCircle,
                        isActive ? styles.stepCircleActive : styles.stepCircleInactive,
                      ]}
                      onPress={() => {
                        setIsPlaying(false);
                        setWizardStep(stepNum as 1 | 2 | 3);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.stepCircleNum,
                          isActive
                            ? styles.stepCircleNumActive
                            : styles.stepCircleNumInactive,
                        ]}
                      >
                        {stepNum}
                      </Text>
                    </TouchableOpacity>

                    {idx < 2 && (
                      <View
                        style={[
                          styles.stepConnectorLine,
                          wizardStep > stepNum
                            ? styles.stepConnectorLineActive
                            : styles.stepConnectorLineInactive,
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* ======================================================== */}
          {/* PASO 1: BIENVENIDA Y PROPÓSITO DE PROTECCIÓN             */}
          {/* ======================================================== */}
          {wizardStep === 1 && (
            <View style={styles.contentCard}>
              <Text style={styles.mainTitle}>¡Te damos la bienvenida a BA Protege +!</Text>
              <Text style={styles.subtitleBold}>
                Una herramienta pensada para acompañar a quienes más lo necesitan.
              </Text>

              <View style={styles.highlightsList}>
                <View style={styles.highlightCard}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="escudo" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.highlightText}>
                    Bloqueamos sitios de juegos y apuestas ilegales no autorizados por la Lotería de la Ciudad de Buenos Aires (LOTBA) para que ningún dispositivo con esta app pueda acceder a ellos.
                  </Text>
                </View>

                <View style={styles.highlightCard}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="manos" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.highlightText}>
                    Buscamos prevenir el consumo digital problemático y contamos con material interactivo para hablar en casa sobre hábitos de navegación saludables.
                  </Text>
                </View>

                <View style={styles.highlightCard}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="corazon" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.highlightText}>
                    En BA Protege + te cuidamos a vos y a los tuyos.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* PASO 2: CÓMO FUNCIONA LA APP Y LOS 2 MODOS              */}
          {/* ======================================================== */}
          {wizardStep === 2 && (
            <View style={styles.contentCard}>
              <Text style={styles.mainTitle}>¿Cómo funciona la app?</Text>
              <Text style={styles.subtitleBold}>
                Podés usarla de dos formas distintas:
              </Text>

              <View style={styles.cardsContainer}>
                {/* Tarjeta 1: Modo Responsable */}
                <View style={styles.modeCard}>
                  <View style={styles.modeCardHeader}>
                    <Text style={styles.modeCardHeaderTitle}>Modo responsable</Text>
                  </View>
                  <View style={styles.modeCardBody}>
                    <View style={styles.checkItem}>
                      <Icon name="check" size={24} color="#007AFF" style={styles.checkIconWrapper} />
                      <Text style={styles.checkText}>
                        Podés agregar sitios y apps personalizados para proteger a personas de tu entorno desde tu dispositivo.
                      </Text>
                    </View>
                    <View style={styles.checkItem}>
                      <Icon name="check" size={24} color="#007AFF" style={styles.checkIconWrapper} />
                      <Text style={styles.checkText}>
                        Acompañás el bienestar digital y definís los límites de uso del celular tanto para vos como para quienes te importan.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Tarjeta 2: Modo Protegido */}
                <View style={styles.modeCard}>
                  <View style={styles.modeCardHeader}>
                    <Text style={styles.modeCardHeaderTitle}>Modo protegido</Text>
                  </View>
                  <View style={styles.modeCardBody}>
                    <View style={styles.checkItem}>
                      <Icon name="check" size={24} color="#007AFF" style={styles.checkIconWrapper} />
                      <Text style={styles.checkText}>
                        Tu dispositivo recibe la protección de una persona responsable.
                      </Text>
                    </View>
                    <View style={styles.checkItem}>
                      <Icon name="check" size={24} color="#007AFF" style={styles.checkIconWrapper} />
                      <Text style={styles.checkText}>
                        Accedés a material interactivo para charlar en casa sobre hábitos digitales saludables.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* PASO 3: EXPLICACIÓN EN VIDEO                             */}
          {/* ======================================================== */}
          {wizardStep === 3 && (
            <View style={styles.contentCardStep3}>
              <Text style={styles.mainTitle}>¿Tenés dudas?</Text>
              <Text style={styles.subtitleBold}>
                Te explicamos el paso a paso en este video:
              </Text>

              {/* Reproductor de Video Vertical maximizando espacio */}
              <View style={styles.videoWrapperVertical}>
                <View style={styles.videoContainerVertical}>
                  {isPlaying ? (
                    <YouTubePlayerView
                      videoId={ONBOARDING_YOUTUBE_VIDEO_ID}
                      style={styles.videoNativePlayer}
                      onVideoEnd={() => setIsPlaying(false)}
                      onVideoError={handleVideoError}
                    />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.videoPlayCircle}
                        onPress={handlePlayVideo}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.videoPlayIcon}>▶</Text>
                      </TouchableOpacity>

                      <View style={styles.videoBotitoContainer} pointerEvents="none">
                        <AnimatedBotMascot
                          mood="feliz"
                          size={112}
                          restartKey={wizardStep}
                          accessibilityLabel="Botito feliz invitándote a ver el video"
                        />
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* RODAPÉ DE LA TELA (FOOTER) - BOTONES DE ACCIÓN DEL APP   */}
      {/* ======================================================== */}
      <View style={styles.footerContainer}>
        {wizardStep === 1 && (
          <View style={styles.dualButtonContainer}>
            <View style={styles.buttonSpacerStep1}>
              <View style={styles.botitoFloatingBottomLeft} pointerEvents="none">
                <AnimatedBotMascot
                  mood="feliz"
                  size={112}
                  restartKey={wizardStep}
                  accessibilityLabel="Botito feliz dándote la bienvenida"
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryButtonHalf}
              onPress={() => setWizardStep(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        )}

        {wizardStep === 2 && (
          <View style={styles.dualButtonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setWizardStep(1)}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButtonHalf}
              onPress={() => setWizardStep(3)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        )}

        {wizardStep === 3 && (
          <View style={styles.dualButtonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setIsPlaying(false);
                setWizardStep(2);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButtonHalf}
              onPress={() => {
                setIsPlaying(false);
                onComplete();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>{completeButtonText || 'Elegir modo'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

