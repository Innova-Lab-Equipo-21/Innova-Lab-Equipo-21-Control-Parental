// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - WelcomeStep (Paso 2)
// Archivo: src/web/components/WelcomeStep.tsx
// Descripción: Selección de modo compacta sin scroll en simulador web.
//              - Bloque 1: Modo Responsable destacado arriba.
//              - Bloque 2: Modo Protegido dentro de contenedor unificado con borde externo.
// ==============================================================================

import React from 'react';
import { Logo } from '../../components/Logo';

interface WelcomeStepProps {
  onSelectParentFlow: () => void;
  onSelectChildFlow: () => void;
  onOpenTutorials?: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  onSelectParentFlow,
  onSelectChildFlow,
  onOpenTutorials,
}) => {
  return (
    <div style={{ padding: '16px 18px', backgroundColor: '#FFFFFF', minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      {/* Encabezado Superior con Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 6px' }}>
        <Logo variant="complete" size="md" align="center" />
      </div>

      {/* Título de la Pantalla */}
      <div style={{ textAlign: 'center', margin: '2px 0 10px' }}>
        <h1 style={{ fontSize: '19px', fontWeight: '800', color: '#000000', margin: 0 }}>
          Seleccioná el modo de la app
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
          Elegí el rol correspondiente a este dispositivo:
        </p>
      </div>

      {/* ======================================================== */}
      {/* 1. MODO RESPONSABLE (BLOQUE CON BORDE DESTACADO)         */}
      {/* ======================================================== */}
      <div
        style={{
          backgroundColor: '#F0F7FF',
          borderRadius: '14px',
          padding: '14px',
          border: '1.5px solid #007AFF',
          boxShadow: '0 3px 8px rgba(0, 122, 255, 0.12)',
          margin: '2px 0 10px 0',
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: '800', color: '#0056B3', letterSpacing: '0.5px', marginBottom: '6px' }}>
          MODO RESPONSABLE
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '28px', marginRight: '10px' }}>👨‍👩‍👧‍👦</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#007AFF', margin: '0 0 2px 0' }}>
              Tutor
            </h2>
            <p style={{ fontSize: '12px', color: '#1C1C1E', margin: 0, lineHeight: '1.35' }}>
              Configurá reglas, supervisá el escudo en vivo y administrá tus dispositivos.
            </p>
          </div>
        </div>

        <button
          onClick={onSelectParentFlow}
          style={{
            width: '100%',
            padding: '10px',
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
          Configurar Tutor
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. MODO PROTEGIDO (BLOQUE UNIFICADO CON BORDE EXTERNO)    */}
      {/* ======================================================== */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '14px',
          padding: '12px',
          border: '1.5px solid #007AFF',
          margin: '2px 0 10px 0',
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: '800', color: '#0056B3', letterSpacing: '0.4px', marginBottom: '8px' }}>
          MODO PROTEGIDO (RECIBE REGLAS DE UN TUTOR)
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Tarjeta Menor */}
          <div
            onClick={onSelectChildFlow}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px' }}>📱</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#1C1C1E' }}>Menor</span>
              </div>
              <p style={{ fontSize: '11px', color: '#4B5563', margin: '0 0 8px 0', lineHeight: '1.35' }}>
                Para niños y adolescentes. Recibe filtrado de red del tutor.
              </p>
            </div>
            <button
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Configurar Menor
            </button>
          </div>

          {/* Tarjeta Adulto */}
          <div
            onClick={onSelectChildFlow}
            style={{
              flex: 1,
              backgroundColor: '#FAF5FF',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid #E9D5FF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px' }}>💜</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#7E22CE' }}>Adulto</span>
              </div>
              <p style={{ fontSize: '11px', color: '#4B5563', margin: '0 0 8px 0', lineHeight: '1.35' }}>
                Acompañamiento en ludopatía bajo tutela de un responsable.
              </p>
            </div>
            <button
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#7E22CE',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Configurar Adulto
            </button>
          </div>
        </div>
      </div>

      {/* RODAPÉ CON TUTORIALES Y LÍNEA OFICIAL */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
        {onOpenTutorials && (
          <button
            onClick={onOpenTutorials}
            style={{
              backgroundColor: '#EEF2FF',
              color: '#3730A3',
              border: '1px solid #C7D2FE',
              padding: '6px 16px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Cómo funciona la app?
          </button>
        )}

        <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
          📞 Línea gratuita de orientación 24hs: <strong>0800-444-5682</strong>
        </p>
      </div>
    </div>
  );
};
