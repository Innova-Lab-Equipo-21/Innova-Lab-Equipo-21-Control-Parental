// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Onboarding - Flujo Wizard de 3 Pantallas)
// Archivo: src/screens/OnboardingScreen.tsx
// Descripción: Flujo guiado de 3 pantallas wizard:
//              1. Bienvenida institucional, propósito de protección y garantía total de privacidad.
//              2. Explicación detallada de los 3 perfiles de usuario (Responsable, Menor, Dispositivo Adulto).
//              3. Video resumen de 35 segundos optativo que sintetiza los 3 perfiles en formato audiovisual.
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
import { Header } from '../components/Header';
import { colors } from '../theme/colors';
import { AppMode } from '../types';
import {
  ONBOARDING_WIZARD_VIDEO,
  ONBOARDING_WIZARD_STEPS,
  WizardVideoStep,
} from '../data/tutorialVideos';

interface OnboardingScreenProps {
  onComplete: () => void;
  onSelectMode?: (mode: AppMode) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onSelectMode,
}) => {
  // Estado del Wizard: Pantalla 1, 2 o 3
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Estados del Video Resumen Optativo (Pantalla 3)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const totalDuration = ONBOARDING_WIZARD_VIDEO.durationSeconds; // 35 segundos

  // Simulación de reproducción interactiva del video optativo de 35 segundos
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

  const handleRestartVideo = () => {
    setPlaybackSeconds(0);
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Paso actual sincronizado con los segundos del video
  const activeVideoStep: WizardVideoStep =
    [...ONBOARDING_WIZARD_VIDEO.steps]
      .reverse()
      .find((step) => playbackSeconds >= step.second) || ONBOARDING_WIZARD_VIDEO.steps[0];

  const progressPercent = Math.min(
    100,
    Math.round((playbackSeconds / totalDuration) * 100)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="BA Protege+"
        subtitle="Onboarding y Tutoriales Oficiales"
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* ======================================================== */}
        {/* BARRA SUPERIOR DE ACCIONES Y STEPPER                     */}
        {/* ======================================================== */}
        <View style={styles.topActionBar}>
          <View style={styles.onboardingPill}>
            <Text style={styles.onboardingPillText}>
              WIZARD • PASO {wizardStep} DE 3
            </Text>
          </View>
          <TouchableOpacity onPress={onComplete} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Saltar introducción ✕</Text>
          </TouchableOpacity>
        </View>

        {/* Stepper horizontal con los 3 pasos */}
        <View style={styles.stepperContainer}>
          {[
            { num: 1, label: '1. Bienvenida' },
            { num: 2, label: '2. Perfiles' },
            { num: 3, label: '3. Video Optativo' },
          ].map((item) => {
            const isActive = wizardStep === item.num;
            const isDone = wizardStep > item.num;
            return (
              <TouchableOpacity
                key={item.num}
                style={[
                  styles.stepTab,
                  isActive && styles.stepTabActive,
                  isDone && styles.stepTabDone,
                ]}
                onPress={() => {
                  setIsPlaying(false);
                  setWizardStep(item.num as 1 | 2 | 3);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.stepTabText,
                    isActive && styles.stepTabTextActive,
                    isDone && styles.stepTabTextDone,
                  ]}
                >
                  {isDone ? '✓ ' : ''}
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ======================================================== */}
        {/* PANTALLA WIZARD 1: INTRODUCCIÓN Y PRIVACIDAD TOTAL       */}
        {/* ======================================================== */}
        {wizardStep === 1 && (
          <View>
            <View style={styles.heroSection}>
              <View style={styles.govBadge}>
                <Text style={styles.govBadgeIcon}>🏛️</Text>
                <Text style={styles.govBadgeText}>
                  Iniciativa Oficial • Lotería de la Ciudad de Buenos Aires (LOTBA)
                </Text>
              </View>

              <View style={styles.heroIconBadge}>
                <Text style={styles.heroEmoji}>🛡️</Text>
              </View>

              <Text style={styles.heroTitle}>
                Protección Integral y Cuidado Digital Familiar
              </Text>

              <Text style={styles.heroDescription}>
                Una herramienta diseñada para prevenir la exposición y el acceso de niños, niñas y
                adolescentes a plataformas de apuestas online y juego compulsivo no regulado.
              </Text>
            </View>

            {/* Banner de Garantía de Privacidad */}
            <View style={styles.trustBanner}>
              <View style={styles.trustHeader}>
                <Text style={styles.trustIcon}>🔒</Text>
                <Text style={styles.trustTitle}>Garantía de Confianza y Privacidad Total</Text>
              </View>
              <Text style={styles.trustText}>
                En <Text style={styles.boldText}>BA Protege+</Text> cuidamos a tu familia sin invadir su intimidad.
                La aplicación <Text style={styles.highlightText}>NO lee conversaciones de WhatsApp, NO accede a fotos, llamadas ni contraseñas</Text>.
                Funciona mediante un escudo de red local que analiza únicamente nombres de dominio contra el listado oficial de sitios de apuestas no autorizados.
              </Text>
              <View style={styles.trustPillRow}>
                <View style={styles.trustPill}>
                  <Text style={styles.trustPillIcon}>✓</Text>
                  <Text style={styles.trustPillText}>Sin espionaje de chats</Text>
                </View>
                <View style={styles.trustPill}>
                  <Text style={styles.trustPillIcon}>✓</Text>
                  <Text style={styles.trustPillText}>Listado oficial LOTBA</Text>
                </View>
                <View style={styles.trustPill}>
                  <Text style={styles.trustPillIcon}>✓</Text>
                  <Text style={styles.trustPillText}>Datos encriptados</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.mainStartBtn}
              onPress={() => setWizardStep(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.mainStartBtnText}>Siguiente: Conocer los 3 Perfiles ➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ======================================================== */}
        {/* PANTALLA WIZARD 2: EXPLICACIÓN DE LOS 3 PERFILES          */}
        {/* ======================================================== */}
        {wizardStep === 2 && (
          <View>
            <View style={styles.sectionHeaderCentered}>
              <Text style={styles.sectionTitle}>Los 3 Perfiles de Usuario</Text>
              <Text style={styles.sectionSubtitle}>
                Cada integrante de la familia cuenta con herramientas diseñadas a su medida:
              </Text>
            </View>

            <View style={styles.profilesList}>
              {/* Perfil 1: Responsable */}
              <View style={[styles.profileCard, { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}>
                <View style={styles.profileHeader}>
                  <Text style={[styles.profileTitle, { color: '#1D4ED8' }]}>
                    👨‍👩‍👧‍👦 Modo Responsable (Tutor)
                  </Text>
                  <View style={[styles.profileTag, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={[styles.profileTagText, { color: '#1E40AF' }]}>Hasta 5 disp.</Text>
                  </View>
                </View>
                <Text style={styles.profileBody}>
                  Para madres, padres o tutores legales. Vinculá hasta 5 dispositivos por QR o PIN en menos de 1 minuto, monitoreá el estado del escudo en vivo y recibí alertas inmediatas.
                </Text>
              </View>

              {/* Perfil 2: Dispositivo Menor */}
              <View style={[styles.profileCard, { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }]}>
                <View style={styles.profileHeader}>
                  <Text style={[styles.profileTitle, { color: '#B45309' }]}>
                    📱 Modo Dispositivo Menor
                  </Text>
                  <View style={[styles.profileTag, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.profileTagText, { color: '#92400E' }]}>Escudo LOTBA</Text>
                  </View>
                </View>
                <Text style={styles.profileBody}>
                  Para niños, niñas y adolescentes. Escudo local que bloquea más de 1.000 sitios de apuestas online ilegales sin ralentizar la red, con pantalla pedagógica preventiva y aviso antidesinstalación.
                </Text>
              </View>

              {/* Perfil 3: Dispositivo Adulto */}
              <View style={[styles.profileCard, { borderColor: '#E9D5FF', backgroundColor: '#FAF5FF' }]}>
                <View style={styles.profileHeader}>
                  <Text style={[styles.profileTitle, { color: '#7E22CE' }]}>
                    💜 Modo Dispositivo Adulto
                  </Text>
                  <View style={[styles.profileTag, { backgroundColor: '#F3E8FF' }]}>
                    <Text style={[styles.profileTagText, { color: '#6B21A8' }]}>Voluntario</Text>
                  </View>
                </View>
                <Text style={styles.profileBody}>
                  Para adultos que eligen blindar su propio teléfono de forma voluntaria. Bloqueo preventivo de sitios y apps de juego, pausas conscientes y acceso a la línea oficial y gratuita 0800.
                </Text>
              </View>
            </View>

            {/* Botonera de Navegación Wizard */}
            <View style={styles.wizardNavButtons}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setWizardStep(1)}
                activeOpacity={0.85}
              >
                <Text style={styles.backBtnText}>⬅ Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => setWizardStep(3)}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Siguiente: Video Optativo ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* PANTALLA WIZARD 3: VIDEO RESUMEN DE POCOS SEGUNDOS (OPTATIVO) */}
        {/* ======================================================== */}
        {wizardStep === 3 && (
          <View>
            <View style={styles.sectionHeaderCentered}>
              <View style={styles.optionalBadge}>
                <Text style={styles.optionalBadgeText}>🎬 REPRODUCCIÓN OPTATIVA • 35 SEGUNDOS</Text>
              </View>
              <Text style={styles.sectionTitle}>Resumen Audiovisual en Pocos Segundos</Text>
              <Text style={styles.sectionSubtitle}>
                Sintetiza en 35 segundos los tres perfiles explicados en las pantallas anteriores. Podés verlo o continuar directamente:
              </Text>
            </View>

            {/* Tarjeta del Reproductor de Video */}
            <View style={styles.videoPlayerCard}>
              <View
                style={[
                  styles.videoScreen,
                  { backgroundColor: activeVideoStep.badgeColor },
                ]}
              >
                <View style={styles.videoTopBar}>
                  <View style={styles.videoBadge}>
                    <Text style={styles.videoBadgeText}>
                      {activeVideoStep.profileLabel}
                    </Text>
                  </View>
                  <View style={styles.durationPill}>
                    <Text style={styles.durationText}>
                      {isPlaying
                        ? `${formatTime(playbackSeconds)} / ${ONBOARDING_WIZARD_VIDEO.duration}`
                        : ONBOARDING_WIZARD_VIDEO.duration}
                    </Text>
                  </View>
                </View>

                <View style={styles.videoCenterContent}>
                  <Text style={styles.videoBigEmoji}>{activeVideoStep.emoji}</Text>
                  <Text style={styles.videoScreenTitle} numberOfLines={2}>
                    {activeVideoStep.title}
                  </Text>

                  {/* Subtítulos sincronizados */}
                  <View style={styles.subtitleBox}>
                    <Text style={styles.subtitleDesc}>{activeVideoStep.description}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.playButtonCircle,
                      isPlaying && styles.playButtonCircleActive,
                    ]}
                    onPress={handleTogglePlay}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.playButtonIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.progressBarWrapper}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progressPercent}%`,
                          backgroundColor: '#FFFFFF',
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressInfoRow}>
                    <Text style={styles.progressTimeText}>
                      {formatTime(playbackSeconds)}
                    </Text>
                    {playbackSeconds > 0 && (
                      <TouchableOpacity
                        onPress={handleRestartVideo}
                        style={styles.restartBtn}
                      >
                        <Text style={styles.restartText}>↺ Reiniciar</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.progressTimeText}>
                      {ONBOARDING_WIZARD_VIDEO.duration}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.videoMetaContainer}>
                <Text style={styles.videoMetaDescription}>
                  {ONBOARDING_WIZARD_VIDEO.description}
                </Text>
                <Text style={styles.optionalNote}>
                  💡 Este video es optativo. Podés avanzar directamente al siguiente paso sin necesidad de reproducirlo.
                </Text>
              </View>
            </View>

            {/* Botonera de Acción Final */}
            <View style={styles.wizardNavButtons}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  setIsPlaying(false);
                  setWizardStep(2);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.backBtnText}>⬅ Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => {
                  setIsPlaying(false);
                  onComplete();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>¡Comenzar! Seleccionar Modo ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* PREGUNTAS FRECUENTES (FAQ) Y ASISTENCIA OFICIAL           */}
        {/* ======================================================== */}
        <View style={styles.faqSection}>
          <Text style={styles.faqSectionTitle}>Preguntas Frecuentes sobre la Protección</Text>

          {[
            {
              question: '¿La aplicación lee los mensajes privados o revisa fotos?',
              answer:
                'No. BA Protege+ fue concebida bajo principios de máxima privacidad. La aplicación opera a nivel de red (DNS) para contrastar direcciones web contra el registro de apuestas, sin inspeccionar mensajes de chat, galerías de fotos ni datos personales.',
            },
            {
              question: '¿Cómo se actualizan los sitios bloqueados?',
              answer:
                'La lista se actualiza automáticamente en segundo plano cuando el dispositivo tiene conexión a internet, sincronizándose con la base de datos oficial provista por LOTBA.',
            },
            {
              question: '¿Tiene algún costo de suscripción?',
              answer:
                'No. Es un servicio público y gratuito impulsado por el Gobierno de la Ciudad de Buenos Aires para la prevención del juego compulsivo en menores y familias.',
            },
          ].map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => setExpandedFaq(isOpen ? null : index)}
                activeOpacity={0.85}
              >
                <View style={styles.faqQuestionRow}>
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Text style={styles.faqToggleIcon}>{isOpen ? '▲' : '▼'}</Text>
                </View>
                {isOpen && <Text style={styles.faqAnswerText}>{faq.answer}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Banner de Línea Oficial de Ayuda */}
        <View style={styles.helpBanner}>
          <Text style={styles.helpEmoji}>📞</Text>
          <Text style={styles.helpTitle}>Línea de Orientación al Jugador Problemático</Text>
          <Text style={styles.helpPhone}>0800-444-5682</Text>
          <Text style={styles.helpText}>
            Llamada gratuita, anónima y confidencial disponible las 24 horas del día, los 365 días del año.
            Lotería de la Ciudad de Buenos Aires.
          </Text>
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  onboardingPill: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  onboardingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D6EFD',
  },
  stepperContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepTabActive: {
    backgroundColor: '#0D6EFD',
    borderColor: '#0D6EFD',
  },
  stepTabDone: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  stepTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A5568',
  },
  stepTabTextActive: {
    color: '#FFFFFF',
  },
  stepTabTextDone: {
    color: '#0284C7',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  govBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F1FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B6D4FE',
  },
  govBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  govBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A58CA',
    letterSpacing: 0.2,
  },
  heroIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E7F1FF',
  },
  heroEmoji: {
    fontSize: 34,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  heroDescription: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  trustBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#C3E6CB',
    shadowColor: '#198754',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trustIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#155724',
  },
  trustText: {
    fontSize: 12,
    color: '#2D3748',
    lineHeight: 18,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: '700',
  },
  highlightText: {
    fontWeight: '700',
    color: '#0F5132',
  },
  trustPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1E7DD',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  trustPillIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F5132',
    marginRight: 5,
  },
  trustPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F5132',
  },
  sectionHeaderCentered: {
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  profilesList: {
    gap: 10,
    marginBottom: 16,
  },
  profileCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  profileTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  profileTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  profileBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  wizardNavButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#0D6EFD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D6EFD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mainStartBtn: {
    backgroundColor: '#0D6EFD',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#0D6EFD',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  mainStartBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  optionalBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 8,
  },
  optionalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.4,
  },
  videoPlayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 14,
  },
  videoScreen: {
    padding: 16,
    minHeight: 230,
    justifyContent: 'space-between',
  },
  videoTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  durationPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  videoCenterContent: {
    alignItems: 'center',
    marginVertical: 6,
  },
  videoBigEmoji: {
    fontSize: 38,
    marginBottom: 4,
  },
  videoScreenTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  subtitleDesc: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  playButtonCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  playButtonCircleActive: {
    backgroundColor: '#EF4444',
  },
  playButtonIcon: {
    fontSize: 22,
    marginLeft: 2,
    color: '#1A202C',
  },
  progressBarWrapper: {
    marginTop: 6,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressTimeText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
  },
  restartBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  restartText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  videoMetaContainer: {
    padding: 14,
  },
  videoMetaDescription: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 17,
    marginBottom: 8,
  },
  optionalNote: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  faqSection: {
    marginTop: 10,
    marginBottom: 14,
  },
  faqSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 10,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
    paddingRight: 8,
  },
  faqToggleIcon: {
    fontSize: 10,
    color: '#A0AEC0',
  },
  faqAnswerText: {
    fontSize: 11,
    color: '#4A5568',
    lineHeight: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  helpBanner: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  helpEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3730A3',
    textAlign: 'center',
  },
  helpPhone: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4338CA',
    marginVertical: 4,
    letterSpacing: 1,
  },
  helpText: {
    fontSize: 11,
    color: '#4F46E5',
    textAlign: 'center',
    lineHeight: 15,
  },
  footerSpace: {
    height: 30,
  },
});
