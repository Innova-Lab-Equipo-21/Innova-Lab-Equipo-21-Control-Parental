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
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#000000', marginBottom: '10px', lineHeight: '1.25' }}>
              ¡Te damos la bienvenida a BA Protege +!
            </h1>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E', marginBottom: '20px' }}>
              Con esta app vas a poder:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
              {/* Item 1 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '18px',
                    backgroundColor: '#EBF5FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '14px',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="ojo" size={20} color="#007AFF" />
                </div>
                <span style={{ fontSize: '14px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Proteger lo que ven los menores de 18 años.
                </span>
              </div>

              {/* Item 2 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '18px',
                    backgroundColor: '#EBF5FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '14px',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="manos" size={20} color="#007AFF" />
                </div>
                <span style={{ fontSize: '14px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Acompañar y cuidar a adultos con ludopatía o uso problemático del celular.
                </span>
              </div>

              {/* Item 3 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '18px',
                    backgroundColor: '#EBF5FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '14px',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="reloj" size={20} color="#007AFF" />
                </div>
                <span style={{ fontSize: '14px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                  Autocontrolar tu propia navegación.
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {/* Tarjeta 1: Modo responsable */}
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1.5px solid #007AFF',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    padding: '10px 14px',
                    fontSize: '15px',
                    fontWeight: '800',
                  }}
                >
                  Modo responsable
                </div>
                <div
                  style={{
                    backgroundColor: '#F0F7FF',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Icon name="check" size={20} color="#007AFF" style={{ marginRight: '10px', marginTop: '1px' }} />
                    <span style={{ fontSize: '13px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                      Configurás las reglas desde tu dispositivo.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Icon name="check" size={20} color="#007AFF" style={{ marginRight: '10px', marginTop: '1px' }} />
                    <span style={{ fontSize: '13px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                      Controlás el bloqueo de sitios web y apps.
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Modo protegido */}
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1.5px solid #007AFF',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    padding: '10px 14px',
                    fontSize: '15px',
                    fontWeight: '800',
                  }}
                >
                  Modo protegido
                </div>
                <div
                  style={{
                    backgroundColor: '#F0F7FF',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Icon name="check" size={20} color="#007AFF" style={{ marginRight: '10px', marginTop: '1px' }} />
                    <span style={{ fontSize: '13px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                      Tu dispositivo recibe la protección de un adulto responsable.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Icon name="check" size={20} color="#007AFF" style={{ marginRight: '10px', marginTop: '1px' }} />
                    <span style={{ fontSize: '13px', color: '#1C1C1E', fontWeight: '500', lineHeight: '1.35' }}>
                      Recibís recomendaciones para un consumo digital más seguro.
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
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#000000', marginBottom: '8px' }}>
              ¿Todavía tenés dudas?
            </h1>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E', marginBottom: '18px' }}>
              Te explicamos el paso a paso en este video:
            </p>

            {/* Reproductor de Video con Fondo Negro */}
            <div
              style={{
                backgroundColor: '#000000',
                borderRadius: '16px',
                height: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <button
                onClick={handleTogglePlay}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '28px',
                  backgroundColor: '#007AFF',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 122, 255, 0.4)',
                }}
              >
                {videoPlaying ? '⏸' : '▶'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RODAPÉ DE LA TELA (FOOTER) - BOTONES DE ACCIÓN DEL APP */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        {wizardStep === 1 && (
          <div style={{ display: 'flex', width: '100%' }}>
            <button
              onClick={() => setWizardStep(2)}
              style={{
                flex: 1,
                width: '100%',
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
