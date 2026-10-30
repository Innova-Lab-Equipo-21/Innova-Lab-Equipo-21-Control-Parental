// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - PairingStep (Paso 3B)
// Archivo: src/web/components/PairingStep.tsx
// Descripción: Paso 3B del flujo para ingresar el código numérico de vinculación o escanear QR,
//              soporte para 123456 (Menor) y 654321 (Adulto).
// ==============================================================================

import React, { useState } from 'react';
import { Logo } from '../../components/Logo';

interface PairingStepProps {
  pairingCodeInput: string;
  onCodeChange: (val: string) => void;
  onPairingSubmit: (modeOverride?: 'CHILD' | 'ADULT') => void;
  onSimulateCode: (code?: string) => void;
}

export const PairingStep: React.FC<PairingStepProps> = ({
  pairingCodeInput,
  onCodeChange,
  onPairingSubmit,
  onSimulateCode,
}) => {
  const [method, setMethod] = useState<'CODE' | 'QR'>('CODE');
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateQR = () => {
    setIsScanning(true);
    setTimeout(() => {
      onCodeChange('123456');
      setIsScanning(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <Logo variant="complete" size="md" align="center" />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px' }}>
          PASO 3B • EMPAREJAMIENTO
        </span>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '6px' }}>Vincular dispositivo</h2>
        <p style={{ fontSize: '12px', color: '#8E8E93' }}>Ingresa el código numérico o escanea el QR generado por el tutor</p>
      </div>

      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF' }}>
        {/* Pestañas de Selección de Método */}
        <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '10px', padding: '4px', marginBottom: '14px' }}>
          <button
            onClick={() => setMethod('CODE')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: method === 'CODE' ? '#FFFFFF' : 'transparent',
              color: method === 'CODE' ? '#007AFF' : '#64748B',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: method === 'CODE' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Código 6 dígitos
          </button>
          <button
            onClick={() => setMethod('QR')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: method === 'QR' ? '#FFFFFF' : 'transparent',
              color: method === 'QR' ? '#007AFF' : '#64748B',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: method === 'QR' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Escanear QR
          </button>
        </div>

        {/* METODO 1: CÓDIGO DE 6 DÍGITOS */}
        {method === 'CODE' && (
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
        )}

        {/* METODO 2: ESCANEAR QR */}
        {method === 'QR' && (
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{ border: '2px dashed #C7D2FE', backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 0 0' }}>
                {isScanning ? 'Analizando QR...' : pairingCodeInput ? `QR Detectado: ${pairingCodeInput}` : 'Apunta la cámara al QR en la app del tutor'}
              </p>
            </div>
            <button
              onClick={handleSimulateQR}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#E7F1FF', color: '#0056B3', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
            >
              {isScanning ? 'Procesando...' : 'Abrir cámara / Escanear QR'}
            </button>
          </div>
        )}

        <button
          style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}
          onClick={() => onPairingSubmit()}
        >
          Confirmar y activar protección
        </button>

        {/* Botones de demostración rápida */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button
            style={{ flex: 1, height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            onClick={() => onSimulateCode('123456')}
          >
            Menor (123456)
          </button>
          <button
            style={{ flex: 1, height: '36px', borderRadius: '8px', backgroundColor: '#FAF5FF', color: '#7E22CE', border: '1px solid #E9D5FF', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            onClick={() => onSimulateCode('654321')}
          >
            Adulto (654321)
          </button>
        </div>
      </div>
    </div>
  );
};
