// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - ProtectedDeviceStep (Paso 5B)
// Archivo: src/web/components/ProtectedDeviceStep.tsx
// Descripción: Paso 5B del flujo para la pantalla del dispositivo protegido diferenciado
//              para Menor y Adulto con recursos educativos y línea de ayuda.
// ==============================================================================

import React from 'react';
import { WebPermissionsState } from './PermissionsStep';

interface ProtectedDeviceStepProps {
  webPermissions: WebPermissionsState;
  isVpnActive: boolean;
  testDomain: string;
  blockedAlert: string | null;
  mode?: 'CHILD' | 'ADULT';
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
  mode = 'CHILD',
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
          <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: mode === 'ADULT' ? '#FAF5FF' : '#FEF3C7', color: mode === 'ADULT' ? '#7E22CE' : '#92400E', padding: '2px 6px', borderRadius: '4px' }}>
            {mode === 'ADULT' ? 'PASO 5B • ADULTO PROTEGIDO' : 'PASO 5B • MENOR PROTEGIDO'}
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '2px' }}>
            {mode === 'ADULT' ? 'Acompañamiento Adulto' : 'Dispositivo Protegido'}
          </h2>
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

      {/* CONTENIDO EDUCATIVO Y DE ASISTENCIA DIFERENCIADO */}
      {mode === 'ADULT' ? (
        <div style={{ backgroundColor: '#FAF5FF', borderRadius: '16px', padding: '16px', border: '1.5px solid #E9D5FF', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#7E22CE', margin: '0 0 4px 0' }}>
            💜 Asistencia y Manejo de Impulsos
          </h3>
          <p style={{ fontSize: '12px', color: '#4B5563', margin: '0 0 10px 0', lineHeight: '1.4' }}>
            Línea de Asistencia al Jugador Compulsivo disponible las 24hs para orientación confidencial.
          </p>

          <button
            style={{ width: '100%', height: '38px', borderRadius: '10px', backgroundColor: '#7E22CE', color: '#FFF', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
            onClick={() => alert('📞 Llamando a la Línea Gratuita de Asistencia 0800-444-5682 (24hs)...')}
          >
            📞 Llamar a Línea 0800-444-5682
          </button>
        </div>
      ) : (
        <div style={{ backgroundColor: '#F0F7FF', borderRadius: '16px', padding: '16px', border: '1.5px solid #C7D2FE', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0056B3', margin: '0 0 4px 0' }}>
            🚀 Aprende a Navegar Seguro
          </h3>
          <p style={{ fontSize: '12px', color: '#1C1C1E', margin: '0 0 6px 0', lineHeight: '1.4' }}>
            🎮 Las apuestas online están prohibidas para menores de 18 años por ley para proteger tu bienestar.
          </p>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
            📞 Si tienes dudas, consulta a tu tutor o llama gratis al <strong>0800-444-5682</strong>.
          </p>
        </div>
      )}

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
