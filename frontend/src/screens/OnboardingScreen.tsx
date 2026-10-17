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
            <View style={styles.singleButtonContainer}>
              <TouchableOpacity
                style={styles.primaryButtonRight}
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
                <Text style={styles.primaryButtonText}>Elegir modo</Text>
              </TouchableOpacity>
            </View>
          )}
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
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
    lineHeight: 22,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 14,
  },
  bulletList: {
    gap: 14,
    marginBottom: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletIconWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bulletText: {
    fontSize: 13.5,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
  },
  cardsContainer: {
    gap: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  modeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeCardHeader: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCardHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  modeCardBody: {
    backgroundColor: '#F0F7FF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 18,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIconWrapper: {
    marginRight: 12,
  },
  checkText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
  },
  contentCardStep3: {
    marginTop: 4,
    flex: 1,
  },
  videoWrapperVertical: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    flex: 1,
  },
  videoContainerVertical: {
    backgroundColor: '#000000',
    borderRadius: 24,
    width: '100%',
    maxWidth: 290,
    height: 460,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  videoContainer: {
    backgroundColor: '#000000',
    borderRadius: 16,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  videoPlayCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  videoPlayIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginLeft: 3,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  singleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  primaryButtonRight: {
    width: 170,
    backgroundColor: '#007AFF',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonFull: {
    flex: 1,
    width: '100%',
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dualButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonHalf: {
    flex: 1,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
