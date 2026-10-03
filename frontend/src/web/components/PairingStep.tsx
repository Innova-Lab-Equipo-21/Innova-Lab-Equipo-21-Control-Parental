// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - PairingStep (Paso 3B)
// Archivo: src/web/components/PairingStep.tsx
// Descripción: Paso 3B del flujo para ingresar el código numérico de vinculación de 6 dígitos.
// ==============================================================================

import React from 'react';

interface PairingStepProps {
  pairingCodeInput: string;
  onCodeChange: (val: string) => void;
  onPairingSubmit: () => void;
  onSimulateCode: () => void;
}

export const PairingStep: React.FC<PairingStepProps> = ({
  pairingCodeInput,
  onCodeChange,
  onPairingSubmit,
  onSimulateCode,
}) => {
  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px' }}>
          PASO 3B • EMPAREJAMIENTO
        </span>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '6px' }}>Vincular Dispositivo</h2>
        <p style={{ fontSize: '12px', color: '#8E8E93' }}>Ingresa el código numérico de 6 dígitos enviado por el tutor</p>
      </div>

      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF' }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1E', display: 'block', marginBottom: '6px', textAlign: 'center' }}>
            Código de 6 dígitos
          </label>
          <input
            style={{ width: '100%', height: '52px', borderRadius: '12px', border: '2px solid #007AFF', textAlign: 'center', fontSize: '24px', fontWeight: '800', letterSpacing: '6px', color: '#1C1C1E' }}
            value={pairingCodeInput}
            onChange={(e) => onCodeChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
          />
        </div>

        <button
          style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#28A745', color: '#FFF', border: 'none', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}
          onClick={onPairingSubmit}
        >
          Confirmar Código ➔ Paso 4: Permisos
        </button>

        <button
          style={{ width: '100%', height: '36px', borderRadius: '8px', backgroundColor: '#E7F1FF', color: '#0056B3', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
          onClick={onSimulateCode}
        >
          ⚡ Simular Código 123456 ➔ Paso 4
        </button>
      </div>
    </div>
  );
};
