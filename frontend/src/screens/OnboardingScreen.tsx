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
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { AppMode } from '../types';
import { ONBOARDING_WIZARD_VIDEO } from '../data/tutorialVideos';

interface OnboardingScreenProps {
  onComplete: () => void;
  onSelectMode?: (mode: AppMode) => void;
  initialStep?: 1 | 2 | 3;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  initialStep = 1,
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
      >
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
            <Text style={styles.subtitleBold}>Con esta app vas a poder:</Text>

            <View style={styles.bulletList}>
              {/* Item 1 */}
              <View style={styles.bulletItem}>
                <View style={styles.bulletIconCircle}>
                  <Icon name="ojo" size={20} color="#007AFF" />
                </View>
                <Text style={styles.bulletText}>
                  Proteger lo que ven los menores de 18 años.
                </Text>
              </View>

              {/* Item 2 */}
              <View style={styles.bulletItem}>
                <View style={styles.bulletIconCircle}>
                  <Icon name="manos" size={20} color="#007AFF" />
                </View>
                <Text style={styles.bulletText}>
                  Acompañar y cuidar a adultos con ludopatía o uso problemático del celular.
                </Text>
              </View>

              {/* Item 3 */}
              <View style={styles.bulletItem}>
                <View style={styles.bulletIconCircle}>
                  <Icon name="reloj" size={20} color="#007AFF" />
                </View>
                <Text style={styles.bulletText}>
                  Autocontrolar tu propia navegación.
                </Text>
              </View>
            </View>

            {/* Botón de Acción Paso 1 */}
            <View style={styles.singleButtonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setWizardStep(2)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Continuar</Text>
              </TouchableOpacity>
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
                    <Icon name="check" size={20} color="#007AFF" style={styles.checkIconWrapper} />
                    <Text style={styles.checkText}>
                      Configurás las reglas desde tu dispositivo.
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Icon name="check" size={20} color="#007AFF" style={styles.checkIconWrapper} />
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
                    <Icon name="check" size={20} color="#007AFF" style={styles.checkIconWrapper} />
                    <Text style={styles.checkText}>
                      Tu dispositivo recibe la protección de un adulto responsable.
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Icon name="check" size={20} color="#007AFF" style={styles.checkIconWrapper} />
                    <Text style={styles.checkText}>
                      Recibís recomendaciones para un consumo digital más seguro.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Botonera Paso 2 */}
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
          </View>
        )}

        {/* ======================================================== */}
        {/* PASO 3: EXPLICACIÓN EN VIDEO                             */}
        {/* ======================================================== */}
        {wizardStep === 3 && (
          <View style={styles.contentCard}>
            <Text style={styles.mainTitle}>¿Todavía tenés dudas?</Text>
            <Text style={styles.subtitleBold}>
              Te explicamos el paso a paso en este video:
            </Text>

            {/* Reproductor de Video con Fondo Negro */}
            <View style={styles.videoContainer}>
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

            {/* Botonera Paso 3 */}
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
                <Text style={styles.primaryButtonText}>Elegir modo</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerLogoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepperWrapper: {
    alignItems: 'center',
    marginVertical: 12,
    marginBottom: 28,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 240,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#007AFF',
  },
  stepCircleInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepCircleNum: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepCircleNumActive: {
    color: '#FFFFFF',
  },
  stepCircleNumInactive: {
    color: '#9CA3AF',
  },
  stepConnectorLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 6,
  },
  stepConnectorLineActive: {
    backgroundColor: '#007AFF',
  },
  stepConnectorLineInactive: {
    backgroundColor: '#E5E7EB',
  },
  contentCard: {
    marginTop: 4,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 10,
    lineHeight: 28,
  },
  subtitleBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  bulletList: {
    gap: 18,
    marginBottom: 40,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bulletText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  singleButtonContainer: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 28,
  },
  modeCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  modeCardHeader: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modeCardHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modeCardBody: {
    backgroundColor: '#F0F7FF',
    padding: 14,
    gap: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIconWrapper: {
    marginRight: 10,
    marginTop: 1,
  },
  checkText: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  dualButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButtonHalf: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    backgroundColor: '#000000',
    borderRadius: 16,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  videoPlayCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 2,
  },
});
