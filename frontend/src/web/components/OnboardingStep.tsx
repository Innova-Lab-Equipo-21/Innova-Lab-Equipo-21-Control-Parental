// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - OnboardingStep (Wizard de 3 Pantallas)
// Archivo: src/web/components/OnboardingStep.tsx
// Descripción: Flujo wizard de 3 pantallas en simulador web alineado al diseño oficial:
//              Paso 1: Bienvenida, propósito de protección y capacidades clave.
//              Paso 2: Explicación de los 2 modos operativos (Modo Responsable y Modo Protegido).
//              Paso 3: Video explicativo paso a paso con reproductor integrado.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Logo } from '../../components/Logo';
import { Icon } from '../../components/Icon';
import { ONBOARDING_WIZARD_VIDEO } from '../../data/tutorialVideos';

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
  initialStep?: 1 | 2 | 3;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  onNextStep,
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
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [videoSeconds, setVideoSeconds] = useState<number>(0);
  const totalVideoSec = ONBOARDING_WIZARD_VIDEO.durationSeconds || 35;

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

  const handleTogglePlay = () => {
    setVideoPlaying((prev) => !prev);
  };

  return (
    <div
      style={{
        padding: '20px 18px',
        backgroundColor: '#FFFFFF',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* Contenido Principal (Header + Stepper + Paso Actual) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Logotipo Oficial Completo Centrado no topo */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 16px' }}>
          <Logo variant="complete" size="md" align="center" />
        </div>

        {/* Stepper Progress Bar con Círculos y Líneas */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '14px 0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '220px' }}>
            {[1, 2, 3].map((stepNum, idx) => {
              const isCompleted = wizardStep > stepNum;
              const isCurrent = wizardStep === stepNum;
              const isActive = isCurrent || isCompleted;

              return (
                <React.Fragment key={stepNum}>
                  <button
                    onClick={() => {
                      setVideoPlaying(false);
                      setWizardStep(stepNum as 1 | 2 | 3);
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? '#007AFF' : '#E5E7EB',
                      color: isActive ? '#FFFFFF' : '#9CA3AF',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                    aria-label={`Ir al Paso ${stepNum}`}
                  >
                    {stepNum}
                  </button>

                  {idx < 2 && (
                    <div
                      style={{
                        flex: 1,
                        height: '3px',
                        backgroundColor: wizardStep > stepNum ? '#007AFF' : '#E5E7EB',
                        margin: '0 6px',
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
        {/* PASO 1: BIENVENIDA Y PROPÓSITO DE PROTECCIÓN             */}
        {/* ======================================================== */}
        {wizardStep === 1 && (
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#000000', marginBottom: '12px', lineHeight: '1.25' }}>
              ¡Te damos la bienvenida a BA Protege +!
            </h1>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E', marginBottom: '20px', lineHeight: '1.35' }}>
              Bloqueamos sitios de juego y apuestas ilegales para que ningún dispositivo con esta app pueda acceder a ellos.
            </p>

            {/* Sección 1: Adulto responsable */}
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1C1C1E', margin: '0 0 14px' }}>
              Si sos un adulto responsable podrás:
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {/* Item 1 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <Icon name="ojo" size={24} color="#007AFF" />
                </div>
                <span style={{ fontSize: '13.5px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Proteger lo que ven los menores de 18 años.
                </span>
              </div>

              {/* Item 2 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <Icon name="manos" size={24} color="#007AFF" />
                </div>
                <span style={{ fontSize: '13.5px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Acompañar y cuidar a adultos con ludopatía o uso problemático del celular.
                </span>
              </div>

              {/* Item 3 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <Icon name="reloj" size={24} color="#007AFF" />
                </div>
                <span style={{ fontSize: '13.5px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Autocontrolar tu propia navegación.
                </span>
              </div>

              {/* Item 4 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <Icon name="sitios" size={24} color="#007AFF" />
                </div>
                <span style={{ fontSize: '13.5px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Bloquear sitios y apps personalizados para mejorar la protección.
                </span>
              </div>
            </div>

            {/* Sección 2: Alguien que necesita protección */}
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1C1C1E', margin: '0 0 14px' }}>
              Si sos alguien que necesita protección:
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {/* Item 1 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <Icon name="usuario" size={24} color="#007AFF" />
                </div>
                <span style={{ fontSize: '13.5px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Recibirás el acompañamiento de un adulto responsable para navegar en entornos digitales seguros.
                </span>
              </div>

              {/* Item 2 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <Icon name="escudo" size={24} color="#007AFF" />
                </div>
                <span style={{ fontSize: '13.5px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Podrás acceder a material interactivo que te ayudará a identificar sitios y apps no seguros.
                </span>
              </div>

              {/* Item 3 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <Icon name="sitios" size={24} color="#007AFF" />
                </div>
                <span style={{ fontSize: '13.5px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Si sos mayor de edad, podrás bloquear sitios y apps personalizados.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 2: CÓMO FUNCIONA LA APP Y LOS 2 MODOS              */}
        {/* ======================================================== */}
        {wizardStep === 2 && (
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#000000', marginBottom: '8px' }}>
              ¿Cómo funciona la app?
            </h1>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E', marginBottom: '18px' }}>
              Podés usarla de dos formas distintas:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginTop: '8px', marginBottom: '24px' }}>
              {/* Tarjeta 1: Modo responsable */}
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid #007AFF',
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.12)',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    padding: '14px 16px',
                    fontSize: '16.5px',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  Modo responsable
                </div>
                <div
                  style={{
                    backgroundColor: '#F0F7FF',
                    padding: '20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon name="check" size={24} color="#007AFF" style={{ marginRight: '12px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                      Configurás las reglas desde tu dispositivo.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon name="check" size={24} color="#007AFF" style={{ marginRight: '12px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                      Controlás el bloqueo de sitios web y apps.
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Modo protegido */}
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid #007AFF',
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.12)',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    padding: '14px 16px',
                    fontSize: '16.5px',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  Modo protegido
                </div>
                <div
                  style={{
                    backgroundColor: '#F0F7FF',
                    padding: '20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon name="check" size={24} color="#007AFF" style={{ marginRight: '12px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                      Tu dispositivo recibe la protección de un adulto responsable.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon name="check" size={24} color="#007AFF" style={{ marginRight: '12px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                      Accedés a material interactivo para aprender hábitos saludables en internet.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 3: EXPLICACIÓN EN VIDEO                             */}
        {/* ======================================================== */}
        {wizardStep === 3 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#000000', marginBottom: '8px' }}>
              ¿Todavía tenés dudas?
            </h1>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E', marginBottom: '16px' }}>
              Te explicamos el paso a paso en este video:
            </p>

            {/* Reproductor de Video Vertical maximizando espacio */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '10px 0 20px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#000000',
                  borderRadius: '24px',
                  width: '100%',
                  maxWidth: '290px',
                  height: '460px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={handleTogglePlay}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '32px',
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0, 122, 255, 0.45)',
                    transition: 'transform 0.2s ease, background-color 0.2s ease',
                  }}
                  aria-label={videoPlaying ? 'Pausar video' : 'Reproducir video'}
                >
                  <span style={{ marginLeft: videoPlaying ? '0' : '3px' }}>
                    {videoPlaying ? '⏸' : '▶'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RODAPÉ DE LA TELA (FOOTER) - BOTONES DE ACCIÓN DEL APP */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        {wizardStep === 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button
              onClick={() => setWizardStep(2)}
              style={{
                width: '170px',
                height: '48px',
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease',
              }}
            >
              Continuar
            </button>
          </div>
        )}

        {wizardStep === 2 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setWizardStep(1)}
              style={{
                flex: 1,
                height: '50px',
                backgroundColor: '#FFFFFF',
                color: '#007AFF',
                border: '1.5px solid #007AFF',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}
            >
              Volver
            </button>
            <button
              onClick={() => setWizardStep(3)}
              style={{
                flex: 1,
                height: '50px',
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease',
              }}
            >
              Continuar
            </button>
          </div>
        )}

        {wizardStep === 3 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setVideoPlaying(false);
                setWizardStep(2);
              }}
              style={{
                flex: 1,
                height: '50px',
                backgroundColor: '#FFFFFF',
                color: '#007AFF',
                border: '1.5px solid #007AFF',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}
            >
              Volver
            </button>
            <button
              onClick={() => {
                setVideoPlaying(false);
                onNextStep();
              }}
              style={{
                flex: 1,
                height: '50px',
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease',
              }}
            >
              Elegir modo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
