// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - ProtectedDeviceStep (Paso 5B)
// Archivo: src/web/components/ProtectedDeviceStep.tsx
// Descripción: Paso 5B del flujo para la pantalla del dispositivo protegido con alerta de permisos
//              faltantes, tarjeta de estado VPN, simulador de bloqueo LOTBA y teclado PIN.
// ==============================================================================

import React from 'react';
import { WebPermissionsState } from './PermissionsStep';

interface ProtectedDeviceStepProps {
  webPermissions: WebPermissionsState;
  isVpnActive: boolean;
  testDomain: string;
  blockedAlert: string | null;
  onExit: () => void;
  onOpenPermissions: () => void;
  onOpenPinModal: () => void;
  onTestDomainChange: (domain: string) => void;
  onSimulateAccess: () => void;
}

export const ProtectedDeviceStep: React.FC<ProtectedDeviceStepProps> = ({
  webPermissions,
  isVpnActive,
  testDomain,
  blockedAlert,
  onExit,
  onOpenPermissions,
  onOpenPinModal,
  onTestDomainChange,
  onSimulateAccess,
}) => {
  const missingPermsList: string[] = [];
  if (!webPermissions.vpn) missingPermsList.push('Servicio VPN Local (Filtrado LOTBA)');
  if (!webPermissions.accessibility) missingPermsList.push('Servicio de Accesibilidad (Antidesinstalación)');
  if (!webPermissions.notifications) missingPermsList.push('Notificaciones en Primer Plano');
  if (!webPermissions.batteryOptimization) missingPermsList.push('Exención de Batería (Segundo Plano)');

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px' }}>
            PASO 5B • DISPOSITIVO PROTEGIDO
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '2px' }}>Dispositivo Protegido</h2>
        </div>
        <button
          style={{ background: 'none', border: 'none', color: '#007AFF', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
          onClick={onExit}
        >
          Cambiar
        </button>
      </div>

      {/* CAJA DE ALERTA DE PERMISOS FALTANTES */}
      {missingPermsList.length > 0 && (
        <div style={{ backgroundColor: '#FFF3CD', border: '1.5px solid #FFC107', borderRadius: '16px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#856404' }}>
              ⚠️ Permisos Pendientes ({4 - missingPermsList.length}/4 Concedidos)
            </span>
            <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FFC107', color: '#FFF', padding: '2px 8px', borderRadius: '6px' }}>
              ALERTA
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#856404', marginBottom: '8px', lineHeight: '1.4' }}>
            El dispositivo no cuenta con la protección completa activa. Faltan autorizar los siguientes permisos:
          </p>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '8px 10px', marginBottom: '12px' }}>
            {missingPermsList.map((pText, idx) => (
              <div key={idx} style={{ fontSize: '11px', fontWeight: '700', color: '#856404', marginBottom: '3px' }}>
                • {pText}
              </div>
            ))}
          </div>
          <button
            style={{ width: '100%', height: '38px', borderRadius: '10px', backgroundColor: '#D97706', color: '#FFF', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
            onClick={onOpenPermissions}
          >
            Configurar Permisos Faltantes ⚙️
          </button>
        </div>
      )}

      {/* TARJETA DE ESTADO VPN */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: isVpnActive ? '#D1E7DD' : '#F8D7DA', color: isVpnActive ? '#28A745' : '#DC3545', padding: '4px 10px', borderRadius: '12px' }}>
          {isVpnActive ? 'PROTECCIÓN ACTIVA' : 'PROTECCIÓN PAUSADA'}
        </span>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#1C1C1E', marginTop: '10px', marginBottom: '12px' }}>
          {isVpnActive ? 'Filtrado de dominios LOTBA activo' : 'Atención: Filtrado en pausa'}
        </p>

        <button
          style={{ width: '100%', height: '42px', borderRadius: '10px', backgroundColor: isVpnActive ? '#DC3545' : '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', cursor: 'pointer' }}
          onClick={onOpenPinModal}
        >
          {isVpnActive ? 'Pausar Protección (Ingresar PIN)' : 'Reanudar Protección'}
        </button>
      </div>

      {/* SIMULADOR DE INTERCEPTACIÓN */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1E', marginBottom: '8px' }}>Probar Bloqueo de Dominio</h3>
        <input
          style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #DEE2E6', padding: '0 10px', fontSize: '13px', marginBottom: '8px' }}
          value={testDomain}
          onChange={(e) => onTestDomainChange(e.target.value)}
        />
        <button
          style={{ width: '100%', height: '40px', borderRadius: '8px', backgroundColor: '#E7F1FF', color: '#0056B3', border: 'none', fontWeight: '700', cursor: 'pointer' }}
          onClick={onSimulateAccess}
        >
          Simular Intento de Navegación
        </button>

        {blockedAlert && (
          <div style={{ backgroundColor: '#F8D7DA', border: '1px solid #F5C2C7', borderRadius: '10px', padding: '10px', marginTop: '10px', color: '#842029', fontSize: '12px' }}>
            🛑 <strong>[BLOQUEADO]</strong> Acceso denegado a <code>{blockedAlert}</code> según lista oficial LOTBA.
          </div>
        )}
      </div>
    </div>
  );
};
