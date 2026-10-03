// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - PermissionsStep (Paso 4)
// Archivo: src/web/components/PermissionsStep.tsx
// Descripción: Paso 4 del flujo para la solicitud y prueba interactiva de los 4 permisos de Android.
// ==============================================================================

import React from 'react';

export interface WebPermissionsState {
  vpn: boolean;
  accessibility: boolean;
  notifications: boolean;
  batteryOptimization: boolean;
}

interface PermissionsStepProps {
  targetFlow: 'PARENT' | 'CHILD';
  webPermissions: WebPermissionsState;
  grantedPermsCount: number;
  onTogglePerm: (key: keyof WebPermissionsState) => void;
  onContinue: () => void;
}

export const PermissionsStep: React.FC<PermissionsStepProps> = ({
  targetFlow,
  webPermissions,
  grantedPermsCount,
  onTogglePerm,
  onContinue,
}) => {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#D1E7DD', color: '#0F5132', padding: '3px 8px', borderRadius: '6px' }}>
          PASO 4 • CONFIGURACIÓN DE PERMISOS
        </span>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '6px' }}>Permisos del Dispositivo</h2>
        <p style={{ fontSize: '12px', color: '#8E8E93' }}>
          {targetFlow === 'PARENT' ? 'Configuración inicial post-login del responsable' : 'Configuración requerida post-emparejamiento'}
        </p>
        <div style={{ display: 'inline-block', backgroundColor: grantedPermsCount === 4 ? '#D1E7DD' : '#FFF3CD', color: grantedPermsCount === 4 ? '#28A745' : '#856404', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '12px', marginTop: '6px' }}>
          {grantedPermsCount}/4 PERMISOS CONCEDIDOS
        </div>
      </div>

      {/* Permiso 1: VPN */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px', border: '1px solid #E9ECEF', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1E' }}>1. 🌐 Servicio VPN Local</span>
          <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: webPermissions.vpn ? '#D1E7DD' : '#E2E3E5', color: webPermissions.vpn ? '#28A745' : '#6C757D', padding: '2px 6px', borderRadius: '6px' }}>
            {webPermissions.vpn ? '✓ OK' : 'REQUERIDO'}
          </span>
        </div>
        <button
          style={{ width: '100%', height: '32px', borderRadius: '6px', backgroundColor: webPermissions.vpn ? '#D1E7DD' : '#007AFF', color: webPermissions.vpn ? '#28A745' : '#FFF', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
          onClick={() => onTogglePerm('vpn')}
        >
          {webPermissions.vpn ? '✓ Autorizado' : 'Autorizar Filtrado VPN'}
        </button>
      </div>

      {/* Permiso 2: Accesibilidad */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px', border: '1px solid #E9ECEF', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1E' }}>2. 🔒 Servicio Accesibilidad</span>
          <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: webPermissions.accessibility ? '#D1E7DD' : '#E2E3E5', color: webPermissions.accessibility ? '#28A745' : '#6C757D', padding: '2px 6px', borderRadius: '6px' }}>
            {webPermissions.accessibility ? '✓ OK' : 'REQUERIDO'}
          </span>
        </div>
        <button
          style={{ width: '100%', height: '32px', borderRadius: '6px', backgroundColor: webPermissions.accessibility ? '#D1E7DD' : '#007AFF', color: webPermissions.accessibility ? '#28A745' : '#FFF', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
          onClick={() => onTogglePerm('accessibility')}
        >
          {webPermissions.accessibility ? '✓ Activado' : 'Activar Accesibilidad'}
        </button>
      </div>

      {/* Permiso 3: Notificaciones */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px', border: '1px solid #E9ECEF', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1E' }}>3. 🔔 Notificaciones</span>
          <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: webPermissions.notifications ? '#D1E7DD' : '#E2E3E5', color: webPermissions.notifications ? '#28A745' : '#6C757D', padding: '2px 6px', borderRadius: '6px' }}>
            {webPermissions.notifications ? '✓ OK' : 'REQUERIDO'}
          </span>
        </div>
        <button
          style={{ width: '100%', height: '32px', borderRadius: '6px', backgroundColor: webPermissions.notifications ? '#D1E7DD' : '#007AFF', color: webPermissions.notifications ? '#28A745' : '#FFF', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
          onClick={() => onTogglePerm('notifications')}
        >
          {webPermissions.notifications ? '✓ Permitidas' : 'Permitir Notificaciones'}
        </button>
      </div>

      {/* Permiso 4: Batería */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px', border: '1px solid #E9ECEF', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1E' }}>4. 🔋 Exención Batería</span>
          <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: webPermissions.batteryOptimization ? '#D1E7DD' : '#E2E3E5', color: webPermissions.batteryOptimization ? '#28A745' : '#6C757D', padding: '2px 6px', borderRadius: '6px' }}>
            {webPermissions.batteryOptimization ? '✓ OK' : 'REQUERIDO'}
          </span>
        </div>
        <button
          style={{ width: '100%', height: '32px', borderRadius: '6px', backgroundColor: webPermissions.batteryOptimization ? '#D1E7DD' : '#007AFF', color: webPermissions.batteryOptimization ? '#28A745' : '#FFF', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
          onClick={() => onTogglePerm('batteryOptimization')}
        >
          {webPermissions.batteryOptimization ? '✓ Concedida' : 'Conceder Exención'}
        </button>
      </div>

      <button
        style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#28A745', color: '#FFF', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
        onClick={onContinue}
      >
        Paso 5: Ir a {targetFlow === 'PARENT' ? 'Dashboard Responsable' : 'Dispositivo Protegido'} ➔
      </button>
    </div>
  );
};
