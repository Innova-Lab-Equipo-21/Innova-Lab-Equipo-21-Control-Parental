// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Onboarding y Tutoriales en Video)
// Archivo: src/screens/OnboardingScreen.tsx
// Descripción: Pantalla de inducción inicial para generar confianza en los usuarios,
//              con explicaciones paso a paso de privacidad, garantías oficiales de LOTBA
//              y un carrusel interactivo con 3 videos explicativos (Responsable, Niños y Adultos).
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Header } from '../components/Header';
import { colors } from '../theme/colors';
import { AppMode } from '../types';

interface OnboardingScreenProps {
  onComplete: () => void;
  onSelectMode?: (mode: AppMode) => void;
}

import { TUTORIAL_VIDEOS, VideoTutorial } from '../data/tutorialVideos';

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onSelectMode,
}) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const activeVideo = TUTORIAL_VIDEOS[activeVideoIndex];

  // Simulación de reproducción interactiva del video
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= activeVideo.durationSeconds) {
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
  }, [isPlaying, activeVideo.durationSeconds]);

  const handleChangeVideo = (index: number) => {
    setIsPlaying(false);
    setPlaybackSeconds(0);
    setActiveVideoIndex(index);
  };

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

  const currentStep =
    [...activeVideo.steps]
      .reverse()
      .find((step) => playbackSeconds >= step.second) || activeVideo.steps[0];

  const progressPercent = Math.min(
    100,
    Math.round((playbackSeconds / activeVideo.durationSeconds) * 100)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="BA Protege+"
        subtitle="Onboarding y Tutoriales Oficiales"
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* ======================================================== */}
        {/* BARRA SUPERIOR DE ACCIONES                               */}
        {/* ======================================================== */}
        <View style={styles.topActionBar}>
          <View style={styles.onboardingPill}>
            <Text style={styles.onboardingPillText}>GUÍA DE INICIO • 3 MODOS</Text>
          </View>
          <TouchableOpacity onPress={onComplete} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Saltar introducción ✕</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* SECCIÓN 1: HERO & PROPÓSITO INSTITUCIONAL                */}
        {/* ======================================================== */}
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

        {/* ======================================================== */}
        {/* SECCIÓN 2: GARANTÍA DE PRIVACIDAD (PRIVACY-FIRST)        */}
        {/* ======================================================== */}
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

        {/* ======================================================== */}
        {/* SECCIÓN 3: CARRUSEL CON 3 VIDEOS EXPLICATIVOS            */}
        {/* ======================================================== */}
        <View style={styles.carouselContainer}>
          <View style={styles.carouselHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionEmoji}>🎬</Text>
              <View>
                <Text style={styles.sectionTitle}>Videos Explicativos Guiados</Text>
                <Text style={styles.sectionSubtitle}>
                  Seleccioná un modo para ver en video cómo funciona paso a paso
                </Text>
              </View>
            </View>
          </View>

          {/* Selector de pestañas de los 3 videos */}
          <View style={styles.tabSelector}>
            {TUTORIAL_VIDEOS.map((video, index) => {
              const isSelected = index === activeVideoIndex;
              return (
                <TouchableOpacity
                  key={video.id}
                  style={[
                    styles.tabButton,
                    isSelected && {
                      backgroundColor: video.badgeColor,
                      borderColor: video.badgeColor,
                    },
                  ]}
                  onPress={() => handleChangeVideo(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tabEmoji}>{video.thumbnailEmoji}</Text>
                  <Text
                    style={[
                      styles.tabText,
                      isSelected && styles.tabTextActive,
                    ]}
                  >
                    {video.mode === 'PARENT'
                      ? 'Responsable'
                      : video.mode === 'CHILD'
                      ? 'Niños'
                      : 'Adultos'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tarjeta del Reproductor de Video Interactivo */}
          <View style={styles.videoPlayerCard}>
            <View
              style={[
                styles.videoScreen,
                { backgroundColor: activeVideo.thumbnailBg },
              ]}
            >
              <View style={styles.videoTopBar}>
                <View
                  style={[
                    styles.videoBadge,
                    { backgroundColor: activeVideo.badgeColor },
                  ]}
                >
                  <Text style={styles.videoBadgeText}>{activeVideo.badge}</Text>
                </View>
                <View style={styles.durationPill}>
                  <Text style={styles.durationText}>
                    {isPlaying
                      ? `${formatTime(playbackSeconds)} / ${activeVideo.duration}`
                      : activeVideo.duration}
                  </Text>
                </View>
              </View>

              <View style={styles.videoCenterContent}>
                <Text style={styles.videoBigEmoji}>{activeVideo.thumbnailEmoji}</Text>
                <Text style={styles.videoScreenTitle} numberOfLines={2}>
                  {activeVideo.title}
                </Text>

                {isPlaying ? (
                  <View style={styles.subtitleBox}>
                    <Text style={styles.subtitleStep}>{currentStep.title}</Text>
                    <Text style={styles.subtitleDesc}>{currentStep.description}</Text>
                  </View>
                ) : (
                  <Text style={styles.videoScreenSubtitle}>
                    {playbackSeconds > 0
                      ? 'Video pausado. Tocá reproducir para continuar.'
                      : 'Tocá reproducir para ver la demostración interactiva.'}
                  </Text>
                )}

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
                        backgroundColor: activeVideo.badgeColor,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressInfoRow}>
                  <Text style={styles.progressTimeText}>
                    {formatTime(playbackSeconds)}
                  </Text>
                  <View style={styles.progressControls}>
                    {playbackSeconds > 0 && (
                      <TouchableOpacity
                        onPress={handleRestartVideo}
                        style={styles.restartBtn}
                      >
                        <Text style={styles.restartText}>↺ Reiniciar</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => setIsModalOpen(true)}
                      style={styles.detailsBtn}
                    >
                      <Text style={styles.detailsBtnText}>📖 Ver Guion</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.progressTimeText}>
                    {activeVideo.duration}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.videoMetaContainer}>
              <Text style={styles.videoMetaDescription}>
                {activeVideo.description}
              </Text>

              <Text style={styles.highlightsHeader}>Puntos Clave del Tutorial:</Text>
              <View style={styles.highlightsList}>
                {activeVideo.highlights.map((item, idx) => (
                  <View key={idx} style={styles.highlightItem}>
                    <Text style={styles.highlightBullet}>✓</Text>
                    <Text style={styles.highlightTextItem}>{item}</Text>
                  </View>
                ))}
              </View>

              {onSelectMode && (
                <TouchableOpacity
                  style={[
                    styles.directActionBtn,
                    { backgroundColor: activeVideo.badgeColor },
                  ]}
                  onPress={() => onSelectMode(activeVideo.mode)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.directActionText}>
                    {activeVideo.mode === 'PARENT'
                      ? 'Elegir Modo Responsable ➜'
                      : activeVideo.mode === 'CHILD'
                      ? 'Elegir Modo Niños ➜'
                      : 'Elegir Modo Adultos ➜'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.dotsContainer}>
            {TUTORIAL_VIDEOS.map((_, dotIdx) => (
              <TouchableOpacity
                key={dotIdx}
                onPress={() => handleChangeVideo(dotIdx)}
                style={[
                  styles.dot,
                  dotIdx === activeVideoIndex && {
                    backgroundColor: colors.primary,
                    width: 24,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ======================================================== */}
        {/* SECCIÓN 4: CÓMO FUNCIONA PASO A PASO                     */}
        {/* ======================================================== */}
        <View style={styles.howItWorksSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>👣</Text>
            <View>
              <Text style={styles.sectionTitle}>¿Cómo Funciona BA Protege+?</Text>
              <Text style={styles.sectionSubtitle}>
                Una puesta en marcha transparente y sencilla en 4 pasos
              </Text>
            </View>
          </View>

          <View style={styles.stepsTimeline}>
            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Seleccioná el Modo según tu Rol</Text>
                <Text style={styles.stepBody}>
                  Elegí <Text style={styles.boldText}>Modo Responsable</Text> si sos madre, padre o tutor;
                  o seleccioná <Text style={styles.boldText}>Modo Protegido</Text> en el celular que necesita
                  resguardo (menor de edad o autoprotección voluntaria de adulto).
                </Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Vinculación Inmediata y Segura</Text>
                <Text style={styles.stepBody}>
                  El responsable genera un <Text style={styles.boldText}>código QR o PIN de 6 dígitos</Text>.
                  El dispositivo protegido lo escanea o ingresa sin necesidad de que el menor cree contraseñas
                  ni exponga datos personales.
                </Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Activación del Escudo Oficial LOTBA</Text>
                <Text style={styles.stepBody}>
                  Al aceptar los permisos del sistema, se activa un motor de filtrado local basado en el
                  registro oficial de dominios de apuestas clandestinas. Si se intenta entrar a un sitio no
                  autorizado, se bloquea al instante.
                </Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Supervisión Saludable y Alertas</Text>
                <Text style={styles.stepBody}>
                  El tutor visualiza en su panel el estado de salud de la protección, recibe alertas si se
                  intenta vulnerar el bloqueo y puede acordar tiempos de pantalla saludables.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ======================================================== */}
        {/* SECCIÓN 5: BOTÓN PRINCIPAL PARA COMENZAR                 */}
        {/* ======================================================== */}
        <View style={styles.actionCardBottom}>
          <Text style={styles.actionCardTitle}>¿Listo para comenzar?</Text>
          <Text style={styles.actionCardDesc}>
            Continuá a la selección de modo para configurar este dispositivo.
          </Text>
          <TouchableOpacity
            style={styles.mainStartBtn}
            onPress={onComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.mainStartBtnText}>Comenzar / Seleccionar Modo ➜</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* SECCIÓN 6: PREGUNTAS FRECUENTES (FAQ)                   */}
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
              question: '¿Qué ocurre si se intenta desactivar el escudo?',
              answer:
                'El sistema detecta de forma automática cualquier intento de cierre forzado o desinstalación no autorizada y envía una notificación preventiva al teléfono del responsable.',
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

        {/* ======================================================== */}
        {/* SECCIÓN 7: LÍNEA DE AYUDA Y ASISTENCIA OFICIAL           */}
        {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* MODAL CON GUION DETALLADO DEL VIDEO TUTORIAL             */}
      {/* ======================================================== */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeVideo.thumbnailEmoji} Guion: {activeVideo.title}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSummary}>{activeVideo.description}</Text>

              <Text style={styles.modalStepsHeader}>Secuencia detallada del video:</Text>
              {activeVideo.steps.map((st, i) => (
                <View key={i} style={styles.modalStepItem}>
                  <View style={styles.modalStepTime}>
                    <Text style={styles.modalTimeText}>{formatTime(st.second)}</Text>
                  </View>
                  <View style={styles.modalStepTextCol}>
                    <Text style={styles.modalStepTitle}>{st.title}</Text>
                    <Text style={styles.modalStepDesc}>{st.description}</Text>
                  </View>
                </View>
              ))}

              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.modalActionBtn,
                { backgroundColor: activeVideo.badgeColor },
              ]}
              onPress={() => {
                setIsModalOpen(false);
                setIsPlaying(true);
              }}
            >
              <Text style={styles.modalActionBtnText}>▶ Reproducir Tutorial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
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
    width: 72,
    height: 72,
    borderRadius: 36,
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
    fontSize: 38,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  trustBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
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
    fontSize: 20,
    marginRight: 8,
  },
  trustTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#155724',
  },
  trustText: {
    fontSize: 13,
    color: '#2D3748',
    lineHeight: 19,
    marginBottom: 12,
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
    fontSize: 12,
    fontWeight: '900',
    color: '#0F5132',
    marginRight: 5,
  },
  trustPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F5132',
  },
  carouselContainer: {
    marginVertical: 16,
  },
  carouselHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  tabSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#EDF2F7',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tabEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  videoPlayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  videoScreen: {
    padding: 16,
    minHeight: 250,
    justifyContent: 'space-between',
  },
  videoTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  durationPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  videoCenterContent: {
    alignItems: 'center',
    marginVertical: 10,
  },
  videoBigEmoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  videoScreenTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoScreenSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  subtitleBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  subtitleStep: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '800',
  },
  subtitleDesc: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  playButtonCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonCircleActive: {
    backgroundColor: '#EF4444',
  },
  playButtonIcon: {
    fontSize: 26,
    marginLeft: 3,
    color: '#1A202C',
  },
  progressBarWrapper: {
    marginTop: 8,
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
    marginTop: 6,
  },
  progressTimeText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  progressControls: {
    flexDirection: 'row',
    gap: 8,
  },
  restartBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  restartText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  videoMetaContainer: {
    padding: 18,
  },
  videoMetaDescription: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 19,
    marginBottom: 14,
  },
  highlightsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  highlightsList: {
    gap: 6,
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  highlightBullet: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 12,
    marginRight: 6,
    marginTop: 2,
  },
  highlightTextItem: {
    fontSize: 12,
    color: '#4A5568',
    flex: 1,
    lineHeight: 17,
  },
  directActionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  directActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  howItWorksSection: {
    marginVertical: 16,
  },
  stepsTimeline: {
    marginTop: 14,
    gap: 12,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0D6EFD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  stepBody: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
  },
  actionCardBottom: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    shadowColor: '#0D6EFD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  actionCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 4,
  },
  actionCardDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  mainStartBtn: {
    backgroundColor: '#0D6EFD',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  mainStartBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  faqSection: {
    marginVertical: 14,
  },
  faqSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
    paddingRight: 10,
  },
  faqToggleIcon: {
    fontSize: 11,
    color: '#A0AEC0',
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 18,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  helpBanner: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  helpEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
    textAlign: 'center',
  },
  helpPhone: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4338CA',
    marginVertical: 4,
    letterSpacing: 1,
  },
  helpText: {
    fontSize: 11,
    color: '#4F46E5',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerSpace: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
    flex: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#A0AEC0',
    fontWeight: '700',
  },
  modalBody: {
    marginVertical: 8,
  },
  modalSummary: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 19,
    marginBottom: 14,
  },
  modalStepsHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 10,
  },
  modalStepItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modalStepTime: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  modalTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A5568',
  },
  modalStepTextCol: {
    flex: 1,
  },
  modalStepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 2,
  },
  modalStepDesc: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
  modalActionBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
