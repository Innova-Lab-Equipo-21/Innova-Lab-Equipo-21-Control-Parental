// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - OnboardingStep (Wizard de 3 Pantallas)
// Archivo: src/web/components/OnboardingStep.tsx
// Descripción: Flujo wizard de 3 pantallas:
//              1. Bienvenida, Propósito Institucional y Privacidad Total (Garantía LOTBA).
//              2. Explicación de los 3 Perfiles (Responsable, Menor y Dispositivo Adulto).
//              3. Video resumen de 35 segundos optativo que sintetiza los 3 perfiles.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { colors } from '../../theme/colors';
import { ONBOARDING_WIZARD_VIDEO, WizardVideoStep } from '../../data/tutorialVideos';

export interface OnboardingVideo {
  mode: string;
  badge: string;
  badgeColor: string;
  title: string;
  duration: string;
  totalSec: number;
  emoji: string;
  bg: string;
  desc: string;
  highlights: string[];
  steps: { sec: number; title: string; desc: string }[];
}

interface OnboardingStepProps {
  onbVideos?: OnboardingVideo[];
  onbIndex?: number;
  onbPlaying?: boolean;
  onbSeconds?: number;
  onChangeVideoIndex?: (index: number) => void;
  onTogglePlay?: () => void;
  onNextStep: () => void;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  onNextStep,
}) => {
  // Estado del Wizard: Pantalla 1, 2 o 3
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Estados del Video Resumen Optativo (Pantalla 3)
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [videoSeconds, setVideoSeconds] = useState<number>(0);

  const totalVideoSec = ONBOARDING_WIZARD_VIDEO.durationSeconds; // 35 segundos

  // Temporizador para la reproducción simulada del video optativo
  useEffect(() => {
    let timer: any = null;
    if (videoPlaying) {
      timer = setInterval(() => {
        setVideoSeconds((prev) => {
          if (prev >= totalVideoSec) {
            setVideoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [videoPlaying, totalVideoSec]);

  // Paso actual sincronizado con los segundos del video
  const activeVideoStep: WizardVideoStep =
    [...ONBOARDING_WIZARD_VIDEO.steps]
      .reverse()
      .find((step) => videoSeconds >= step.second) || ONBOARDING_WIZARD_VIDEO.steps[0];

  const videoPercent = Math.min(100, Math.round((videoSeconds / totalVideoSec) * 100));

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleTogglePlay = () => {
    setVideoPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setVideoSeconds(0);
    setVideoPlaying(true);
  };

  return (
    <div style={{ padding: '16px 14px' }}>
      {/* ======================================================== */}
      {/* BARRA SUPERIOR Y STEPPER PROGRESS BAR                    */}
      {/* ======================================================== */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: colors.primary,
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
          onClick={onNextStep}
        >
          Saltar a Selección ✕
        </button>
      </div>

      {/* Stepper Progress Bar con Círculos Numerados y Líneas Conectoras (Colores Oficiales del UI Kit) */}
      <div style={{ margin: '4px 0 18px 0', padding: '0 8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '300px',
            margin: '0 auto',
          }}
        >
          {[1, 2, 3].map((stepNum, idx) => {
            const isCompleted = wizardStep > stepNum;
            const isCurrent = wizardStep === stepNum;
            const isActive = isCurrent || isCompleted;

            return (
              <React.Fragment key={stepNum}>
                {/* Círculo + Label inferior */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                  <button
                    onClick={() => {
                      setVideoPlaying(false);
                      setWizardStep(stepNum as 1 | 2 | 3);
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      border: isActive ? `2px solid ${colors.primary}` : `2px solid ${colors.border}`,
                      color: isActive ? colors.textLight : colors.textSecondary,
                      fontSize: '15px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(0, 122, 255, 0.18)' : 'none',
                    }}
                    aria-label={`Ir al Paso ${stepNum}`}
                  >
                    {stepNum}
                  </button>
                  <span
                    style={{
                      marginTop: '6px',
                      fontSize: '12px',
                      fontWeight: isActive ? '700' : '600',
                      color: isActive ? colors.primary : colors.textSecondary,
                      letterSpacing: '0.2px',
                    }}
                  >
                    Paso {stepNum}
                  </span>
                </div>

                {/* Línea conectora entre círculos */}
                {idx < 2 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2.5px',
                      backgroundColor: wizardStep > stepNum ? colors.primary : colors.border,
                      margin: '0 8px',
                      marginBottom: '20px',
                      transition: 'background-color 0.3s ease',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* PANTALLA WIZARD 1: INTRODUCCIÓN Y PRIVACIDAD TOTAL       */}
      {/* ======================================================== */}
      {wizardStep === 1 && (
        <div>
          {/* Badge Oficial */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#1D4ED8',
              marginBottom: '10px',
            }}
          >
            <span style={{ marginRight: '6px' }}>🏛️</span>
            Iniciativa Oficial • LOTBA
          </div>

          <div style={{ textAlign: 'center', margin: '8px 0 14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 8px',
                borderRadius: '28px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                border: '2px solid #DBEAFE',
              }}
            >
              🛡️
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', lineHeight: '1.25' }}>
              Protección Integral y Cuidado Digital Familiar
            </h2>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', margin: 0 }}>
              Herramienta diseñada para prevenir la exposición de niños, niñas y adolescentes a plataformas de apuestas online y juego clandestino.
            </p>
          </div>

          {/* Tarjeta de Garantía de Privacidad */}
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🔒</span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#166534' }}>
                Garantía de Confianza y Privacidad Total
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#15803D', lineHeight: '1.35', margin: '0 0 10px 0' }}>
              La aplicación <strong>NO lee conversaciones de WhatsApp ni mensajes</strong>, <strong>NO accede a fotos, llamadas ni contraseñas</strong>. Opera mediante un escudo local de red (DNS) que solo bloquea dominios no autorizados por LOTBA.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                'Sin espionaje de chats, fotos ni datos personales',
                'Listado oficial y verificado por LOTBA',
                'Filtrado seguro y encriptado en el dispositivo',
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: '#166534', fontWeight: '600' }}>
                  <span style={{ marginRight: '6px', color: '#16A34A', fontWeight: '900' }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Botón Siguiente al Paso 2 */}
          <button
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#007AFF',
              color: '#FFF',
              border: 'none',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
            }}
            onClick={() => setWizardStep(2)}
          >
            Siguiente: Conocer los 3 Perfiles ➔
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* PANTALLA WIZARD 2: EXPLICACIÓN DE LOS 3 PERFILES          */}
      {/* ======================================================== */}
      {wizardStep === 2 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
              Los 3 Perfiles de Usuario
            </h2>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.35', margin: 0 }}>
              Cada integrante de la familia cuenta con herramientas y funciones adaptadas a su rol:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {/* Perfil 1: Responsable */}
            <div
              style={{
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: '12px',
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#1D4ED8' }}>
                  👨‍👩‍👧‍👦 Modo Responsable (Tutor)
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    backgroundColor: '#DBEAFE',
                    color: '#1E40AF',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  Hasta 5 disp.
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#334155', margin: 0, lineHeight: '1.35' }}>
                Vinculá celulares mediante QR o PIN de 6 dígitos en 1 minuto. Supervisá el escudo en vivo, recibí alertas de intentos bloqueados y fijá pausas saludables.
              </p>
            </div>

            {/* Perfil 2: Dispositivo Menor */}
            <div
              style={{
                backgroundColor: '#FFFBEB',
                border: '1.5px solid #FDE68A',
                borderRadius: '12px',
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#B45309' }}>
                  📱 Modo Dispositivo Menor
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  Escudo LOTBA
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#334155', margin: 0, lineHeight: '1.35' }}>
                Escudo local que bloquea silenciosamente más de 1.000 sitios de apuestas ilegales sin ralentizar la red, con pantalla pedagógica preventiva y aviso antidesinstalación.
              </p>
            </div>

            {/* Perfil 3: Dispositivo Adulto */}
            <div
              style={{
                backgroundColor: '#FAF5FF',
                border: '1.5px solid #E9D5FF',
                borderRadius: '12px',
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#7E22CE' }}>
                  💜 Modo Dispositivo Adulto
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    backgroundColor: '#F3E8FF',
                    color: '#6B21A8',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  Voluntario
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#334155', margin: 0, lineHeight: '1.35' }}>
                Prevención voluntaria para adultos que desean blindar su propio teléfono contra el juego online, con pausas conscientes y acceso a la línea gratuita y confidencial 0800.
              </p>
            </div>
          </div>

          {/* Botonera de Navegación */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
              }}
              onClick={() => setWizardStep(1)}
            >
              ⬅ Volver
            </button>
            <button
              style={{
                flex: 2,
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#007AFF',
                color: '#FFF',
                border: 'none',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
              }}
              onClick={() => setWizardStep(3)}
            >
              Siguiente: Video Optativo ➔
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PANTALLA WIZARD 3: VIDEO RESUMEN DE POCOS SEGUNDOS (OPTATIVO) */}
      {/* ======================================================== */}
      {wizardStep === 3 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FCD34D',
                borderRadius: '20px',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: '800',
                color: '#92400E',
                marginBottom: '6px',
              }}
            >
              🎬 REPRODUCCIÓN OPTATIVA • 35 SEGUNDOS
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
              Resumen Audiovisual en Pocos Segundos
            </h2>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.35', margin: 0 }}>
              Sintetiza en 35 segundos los tres perfiles explicados en las pantallas anteriores. Podés verlo o comenzar directamente:
            </p>
          </div>

          {/* Reproductor de Video Simulado Dinámico */}
          <div
            style={{
              backgroundColor: activeVideoStep.badgeColor,
              borderRadius: '16px',
              padding: '14px',
              color: '#FFF',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'background-color 0.4s ease',
            }}
          >
            {/* Header del Reproductor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.4px',
                }}
              >
                {activeVideoStep.profileLabel}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700' }}>
                ⏱️ {formatTime(videoSeconds)} / {ONBOARDING_WIZARD_VIDEO.duration}
              </span>
            </div>

            {/* Centro del Video: Emoji dinámico según el perfil actual */}
            <div style={{ fontSize: '36px', textAlign: 'center', margin: '4px 0' }}>
              {activeVideoStep.emoji}
            </div>

            <h3
              style={{
                fontSize: '15px',
                fontWeight: '800',
                textAlign: 'center',
                marginBottom: '4px',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {activeVideoStep.title}
            </h3>

            {/* Subtítulos sincronizados */}
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                borderRadius: '8px',
                padding: '6px 10px',
                marginBottom: '10px',
                minHeight: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: '1.3',
                  opacity: 0.95,
                }}
              >
                {activeVideoStep.description}
              </p>
            </div>

            {/* Barra de Progreso del Video */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                height: '6px',
                borderRadius: '3px',
                marginBottom: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  backgroundColor: '#FFF',
                  height: '100%',
                  width: `${videoPercent}%`,
                  transition: 'width 0.2s',
                }}
              />
            </div>

            {/* Controles de Reproducción */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                style={{
                  padding: '7px 14px',
                  borderRadius: '18px',
                  backgroundColor: '#FFF',
                  color: activeVideoStep.badgeColor,
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
                onClick={handleTogglePlay}
              >
                {videoPlaying ? '⏸ Pausar' : '▶ Ver Video Optativo (35s)'}
              </button>

              {videoSeconds > 0 && (
                <button
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '12px',
                    color: '#FFF',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                  onClick={handleRestart}
                >
                  ↺ Reiniciar
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '11px',
              color: '#64748B',
              textAlign: 'center',
              marginBottom: '14px',
            }}
          >
            💡 <em>Podes reproducir el video o avanzar directamente sin verlo.</em>
          </div>

          {/* Botonera de Acción Final */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setVideoPlaying(false);
                setWizardStep(2);
              }}
            >
              ⬅ Volver
            </button>
            <button
              style={{
                flex: 2,
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#007AFF',
                color: '#FFF',
                border: 'none',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
              }}
              onClick={() => {
                setVideoPlaying(false);
                onNextStep();
              }}
            >
              ¡Comenzar! Seleccionar Modo ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
