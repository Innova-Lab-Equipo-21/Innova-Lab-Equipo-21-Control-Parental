// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - WelcomeStep (Paso 2)
// Archivo: src/web/components/WelcomeStep.tsx
// Descripción: Selección de modo (Modo responsable vs Modo protegido) alineada con OnboardingStep.
// ==============================================================================

import React from 'react';
import { Logo } from '../../components/Logo';
import { Icon } from '../../components/Icon';

interface WelcomeStepProps {
  onSelectParentFlow: () => void;
  onSelectChildFlow: () => void;
  onOpenTutorials?: (step?: 1 | 2 | 3) => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  onSelectParentFlow,
  onSelectChildFlow,
  onOpenTutorials,
}) => {
  return (
    <div style={{ padding: '20px 18px', backgroundColor: '#FFFFFF', minHeight: '100%', boxSizing: 'border-box' }}>
      {/* Encabezado Superior con Logo Centralizado (Mismo tamaño y posición que Onboarding) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <Logo variant="complete" size="md" align="center" />
      </div>

      {/* Títulos de la Pantalla */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          {onOpenTutorials && (
            <button
              onClick={() => onOpenTutorials(3)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                marginRight: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Volver al último paso de onboarding"
            >
              <Icon name="volver" size={24} color="#000000" />
            </button>
          )}
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#000000', margin: 0, lineHeight: 1.25 }}>
            Elegí cómo vas a usar la app
          </h1>
        </div>
        <p style={{ fontSize: '15px', color: '#1C1C1E', margin: 0, lineHeight: 1.35 }}>
          Seleccioná el modo que más se adecúa a tus necesidades.
        </p>
      </div>

      {/* CARD 1: MODO RESPONSABLE */}
      <div
        style={{
          backgroundColor: '#F0F7FF',
          borderRadius: '18px',
          padding: '18px',
          border: '2px solid #007AFF',
          marginBottom: '20px',
          boxSizing: 'border-box',
          boxShadow: '0 2px 8px rgba(0, 122, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Icon name="escudo" size={24} color="#007AFF" style={{ marginRight: '10px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#007AFF', margin: 0 }}>
            Modo responsable
          </h2>
        </div>

        <p style={{ fontSize: '13.5px', color: '#1C1C1E', margin: '0 0 14px 0', lineHeight: '1.4' }}>
          Ideal para quienes gestionan reglas, restricciones y bloqueos de sitios web y apps en este u otros dispositivos.
        </p>

        <div
          style={{
            backgroundColor: '#D0E2FF',
            borderRadius: '16px',
            padding: '6px 12px',
            display: 'inline-block',
            marginBottom: '16px',
            fontSize: '12.5px',
            fontWeight: '600',
            color: '#1C1C1E',
          }}
        >
          Basado en PIN y contraseña.
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onSelectParentFlow}
            style={{
              height: '44px',
              width: '160px',
              borderRadius: '12px',
              backgroundColor: '#007AFF',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)',
              transition: 'background-color 0.2s ease',
            }}
          >
            Empezar
          </button>
        </div>
      </div>

      {/* CARD 2: MODO PROTEGIDO */}
      <div
        style={{
          backgroundColor: '#F0F7FF',
          borderRadius: '18px',
          padding: '18px',
          border: '2px solid #007AFF',
          marginBottom: '20px',
          boxSizing: 'border-box',
          boxShadow: '0 2px 8px rgba(0, 122, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Icon name="corazon" size={24} color="#007AFF" style={{ marginRight: '10px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#007AFF', margin: 0 }}>
            Modo protegido
          </h2>
        </div>

        <p style={{ fontSize: '13.5px', color: '#1C1C1E', margin: '0 0 14px 0', lineHeight: '1.4' }}>
          Para dispositivos que reciben protección y navegación segura configurada por un adulto responsable.
        </p>

        <div
          style={{
            backgroundColor: '#D0E2FF',
            borderRadius: '16px',
            padding: '6px 12px',
            display: 'inline-block',
            marginBottom: '16px',
            fontSize: '12.5px',
            fontWeight: '600',
            color: '#1C1C1E',
          }}
        >
          Basado en supervisión externa.
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onSelectChildFlow}
            style={{
              height: '44px',
              width: '160px',
              borderRadius: '12px',
              backgroundColor: '#007AFF',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)',
              transition: 'background-color 0.2s ease',
            }}
          >
            Empezar
          </button>
        </div>
      </div>
    </div>
  );
};
