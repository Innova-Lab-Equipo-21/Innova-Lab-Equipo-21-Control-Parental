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

      {/* Títulos de la Pantalla (Misma escala y posición que Onboarding) */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#000000', margin: '0 0 6px 0', lineHeight: 1.25 }}>
          Elegí cómo vas a usar la app
        </h1>
        <p style={{ fontSize: '15px', color: '#1C1C1E', margin: 0, lineHeight: 1.35 }}>
          Seleccioná el modo que más se adecúa a tus necesidades.
        </p>
      </div>

      {/* CARD 1: MODO RESPONSABLE */}
      <div
        style={{
          backgroundColor: '#F0F7FF',
          borderRadius: '16px',
          padding: '14px',
          border: '1.5px solid #007AFF',
          marginBottom: '14px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <Icon name="escudo" size={22} color="#007AFF" style={{ marginRight: '8px' }} />
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#007AFF', margin: 0 }}>
            Modo responsable
          </h2>
        </div>

        <p style={{ fontSize: '12.5px', color: '#1C1C1E', margin: '0 0 10px 0', lineHeight: '1.35' }}>
          Ideal para quienes gestionan reglas, restricciones y bloqueos de sitios web y apps en este u otros dispositivos.
        </p>

        <div
          style={{
            backgroundColor: '#D0E2FF',
            borderRadius: '14px',
            padding: '5px 10px',
            display: 'inline-block',
            marginBottom: '10px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#1C1C1E',
          }}
        >
          Basado en PIN y contraseña.
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onSelectParentFlow}
            style={{
              padding: '8px 0',
              width: '145px',
              borderRadius: '10px',
              backgroundColor: '#007AFF',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)',
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
          borderRadius: '16px',
          padding: '14px',
          border: '1.5px solid #007AFF',
          marginBottom: '10px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <Icon name="corazon" size={22} color="#007AFF" style={{ marginRight: '8px' }} />
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#007AFF', margin: 0 }}>
            Modo protegido
          </h2>
        </div>

        <p style={{ fontSize: '12.5px', color: '#1C1C1E', margin: '0 0 10px 0', lineHeight: '1.35' }}>
          Para dispositivos que reciben protección y navegación segura configurada por un adulto responsable.
        </p>

        <div
          style={{
            backgroundColor: '#D0E2FF',
            borderRadius: '14px',
            padding: '5px 10px',
            display: 'inline-block',
            marginBottom: '10px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#1C1C1E',
          }}
        >
          Basado en supervisión externa.
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onSelectChildFlow}
            style={{
              padding: '8px 0',
              width: '145px',
              borderRadius: '10px',
              backgroundColor: '#007AFF',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)',
            }}
          >
            Empezar
          </button>
        </div>
      </div>

      {/* Botón de Ayuda (Alineado abajo a la derecha del cuadro Modo protegido) */}
      {onOpenTutorials && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
          <button
            onClick={() => onOpenTutorials(3)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '19px',
              backgroundColor: '#007AFF',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 122, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ?
          </button>
        </div>
      )}
    </div>
  );
};
