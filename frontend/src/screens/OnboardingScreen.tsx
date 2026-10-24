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
} from 'react-native';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { AppMode } from '../types';
import { ONBOARDING_WIZARD_VIDEO } from '../data/tutorialVideos';
import { styles } from './OnboardingScreen.styles';

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

  // Estados del Video (Paso 3)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const totalDuration = ONBOARDING_WIZARD_VIDEO.durationSeconds || 35;

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalDuration]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
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
                Bloqueamos sitios de juego y apuestas ilegales para que ningún dispositivo con esta app pueda acceder a ellos.
              </Text>

              {/* Sección 1: Adulto responsable */}
              <Text style={styles.sectionHeaderTitle}>Si sos un adulto responsable podrás:</Text>
              <View style={styles.bulletList}>
                {/* Item 1 */}
                <View style={styles.bulletItem}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="ojo" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.bulletText}>
                    Proteger lo que ven los menores de 18 años.
                  </Text>
                </View>

                {/* Item 2 */}
                <View style={styles.bulletItem}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="manos" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.bulletText}>
                    Acompañar y cuidar a adultos con ludopatía o uso problemático del celular.
                  </Text>
                </View>

                {/* Item 3 */}
                <View style={styles.bulletItem}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="reloj" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.bulletText}>
                    Autocontrolar tu propia navegación.
                  </Text>
                </View>

                {/* Item 4 */}
                <View style={styles.bulletItem}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="sitios" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.bulletText}>
                    Bloquear sitios y apps personalizados para mejorar la protección.
                  </Text>
                </View>
              </View>

              {/* Sección 2: Alguien que necesita protección */}
              <Text style={styles.sectionHeaderTitle}>Si sos alguien que necesita protección:</Text>
              <View style={styles.bulletList}>
                {/* Item 1 */}
                <View style={styles.bulletItem}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="usuario" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.bulletText}>
                    Recibirás el acompañamiento de un adulto responsable para navegar en entornos digitales seguros.
                  </Text>
                </View>

                {/* Item 2 */}
                <View style={styles.bulletItem}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="escudo" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.bulletText}>
                    Podrás acceder a material interactivo que te ayudará a identificar sitios y apps no seguros.
                  </Text>
                </View>

                {/* Item 3 */}
                <View style={styles.bulletItem}>
                  <View style={styles.bulletIconWrapper}>
                    <Icon name="sitios" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.bulletText}>
                    Si sos mayor de edad, podrás bloquear sitios y apps personalizados.
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
                        Configurás las reglas desde tu dispositivo.
                      </Text>
                    </View>
                    <View style={styles.checkItem}>
                      <Icon name="check" size={24} color="#007AFF" style={styles.checkIconWrapper} />
                      <Text style={styles.checkText}>
                        Controlás el bloqueo de sitios web y apps.
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
                        Tu dispositivo recibe la protección de un adulto responsable.
                      </Text>
                    </View>
                    <View style={styles.checkItem}>
                      <Icon name="check" size={24} color="#007AFF" style={styles.checkIconWrapper} />
                      <Text style={styles.checkText}>
                        Accedés a material interactivo para aprender hábitos saludables en internet.
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
              <Text style={styles.mainTitle}>¿Todavía tenés dudas?</Text>
              <Text style={styles.subtitleBold}>
                Te explicamos el paso a paso en este video:
              </Text>

              {/* Reproductor de Video Vertical maximizando espacio */}
              <View style={styles.videoWrapperVertical}>
                <View style={styles.videoContainerVertical}>
                  <TouchableOpacity
                    style={styles.videoPlayCircle}
                    onPress={handleTogglePlay}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.videoPlayIcon}>
                      {isPlaying ? '⏸' : '▶'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ======================================================== */}
        {/* RODAPÉ DE LA TELA (FOOTER) - BOTONES DE ACCIÓN DEL APP   */}
        {/* ======================================================== */}
        <View style={styles.footerContainer}>
          {wizardStep === 1 && (
            <View style={styles.dualButtonContainer}>
              <View style={styles.buttonSpacer} />
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
      </ScrollView>
    </SafeAreaView>
  );
};

