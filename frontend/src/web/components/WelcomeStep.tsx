// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - WelcomeStep (Paso 2)
// Archivo: src/web/components/WelcomeStep.tsx
// Descripción: Paso 2 del flujo para seleccionar el modo de operación (Responsable vs Protegido).
// ==============================================================================

import React from 'react';

interface WelcomeStepProps {
  onSelectParentFlow: () => void;
  onSelectChildFlow: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  onSelectParentFlow,
  onSelectChildFlow,
}) => {
  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', margin: '10px 0 20px' }}>
        <div style={{ fontSize: '42px', marginBottom: '8px' }}>🔒</div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1C1C1E' }}>BA Protege+</h2>
        <p style={{ fontSize: '13px', color: '#8E8E93', marginTop: '4px' }}>
          PASO 2 • Selección del Modo de Operación
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Opción Responsable -> Pasa a LOGIN */}
        <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF' }}>
          <div style={{ fontSize: '24px', marginBottom: '6px' }}>👨‍👩‍👧‍👦</div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1C1C1E' }}>Modo Responsable</h3>
          <p style={{ fontSize: '12px', color: '#8E8E93', marginTop: '4px', marginBottom: '12px' }}>
            Supervisa hasta 5 dispositivos, audita permisos y activa tu Autocontrol de 24 horas.
          </p>
          <button
            style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            onClick={onSelectParentFlow}
          >
            Ingresar a Login (Paso 3A) ➔
          </button>
        </div>

        {/* Opción Dispositivo Protegido -> Pasa a EMPAREJAMIENTO */}
        <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF' }}>
          <div style={{ fontSize: '24px', marginBottom: '6px' }}>📱</div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1C1C1E' }}>Modo Dispositivo Protegido</h3>
          <p style={{ fontSize: '12px', color: '#8E8E93', marginTop: '4px', marginBottom: '12px' }}>
            Protección local con lista oficial LOTBA, permisos de Android y validación de PIN.
          </p>
          <button
            style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#E7F1FF', color: '#0056B3', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            onClick={onSelectChildFlow}
          >
            Ingresar Código de Pareamiento (Paso 3B) ➔
          </button>
        </div>
      </div>
    </div>
  );
};
