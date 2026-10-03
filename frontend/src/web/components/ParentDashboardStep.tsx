// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - ParentDashboardStep (Paso 5A)
// Archivo: src/web/components/ParentDashboardStep.tsx
// Descripción: Paso 5A del flujo con panel del responsable, alerta de permisos del tutor,
//              autocontrol de 24hs, generador de código de pareamiento (hasta 5) y auditoría de permisos.
// ==============================================================================

import React from 'react';
import { WebPermissionsState } from './PermissionsStep';

interface ParentDashboardStepProps {
  parentUser: any;
  webPermissions: WebPermissionsState;
  selfControlActive: boolean;
  devices: any[];
  maxDevices: number;
  pairingCode: string | null;
  onExit: () => void;
  onOpenPermissions: () => void;
  onAttemptDisableSelfControl: () => void;
  onStartSelfControlFlow: () => void;
  onGeneratePairing: () => void;
}

export const ParentDashboardStep: React.FC<ParentDashboardStepProps> = ({
  parentUser,
  webPermissions,
  selfControlActive,
  devices,
  maxDevices,
  pairingCode,
  onExit,
  onOpenPermissions,
  onAttemptDisableSelfControl,
  onStartSelfControlFlow,
  onGeneratePairing,
}) => {
  const missingParentPerms: string[] = [];
  if (!webPermissions.vpn) missingParentPerms.push('Servicio VPN Local (Filtrado LOTBA)');
  if (!webPermissions.accessibility) missingParentPerms.push('Servicio de Accesibilidad (Antidesinstalación)');
  if (!webPermissions.notifications) missingParentPerms.push('Notificaciones en Primer Plano');
  if (!webPermissions.batteryOptimization) missingParentPerms.push('Exención de Batería (Segundo Plano)');

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '2px 6px', borderRadius: '4px' }}>
            PASO 5A • DASHBOARD
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '2px' }}>Panel Responsable</h2>
          <p style={{ fontSize: '12px', color: '#8E8E93' }}>
            Bienvenido/a, {parentUser?.fullName || 'Tutor Responsable'}
          </p>
        </div>
        <button
          style={{ background: 'none', border: 'none', color: '#DC3545', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
          onClick={onExit}
        >
          Salir
        </button>
      </div>

      {/* CAJA DE ALERTA DE PERMISOS FALTANTES DEL TUTOR */}
      {missingParentPerms.length > 0 ? (
        <div style={{ backgroundColor: '#FFF3CD', border: '1.5px solid #FFC107', borderRadius: '16px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#856404' }}>
              ⚠️ Permisos Pendientes del Tutor ({4 - missingParentPerms.length}/4 Concedidos)
            </span>
            <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FFC107', color: '#FFF', padding: '2px 8px', borderRadius: '6px' }}>
              ALERTA
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#856404', marginBottom: '8px', lineHeight: '1.4' }}>
            Tu dispositivo de responsable no cuenta con todos los permisos habilitados. Faltan autorizar:
          </p>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '8px 10px', marginBottom: '12px' }}>
            {missingParentPerms.map((pText, idx) => (
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
      ) : (
        <div style={{ backgroundColor: '#E7F1FF', borderRadius: '12px', padding: '12px', border: '1px solid #B6D4FE', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0056B3' }}>Permisos del Tutor</div>
            <div style={{ fontSize: '11px', color: '#0A58CA' }}>Todos los permisos activos (4/4 OK)</div>
          </div>
          <button
            style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            onClick={onOpenPermissions}
          >
            Auditar ⚙️
          </button>
        </div>
      )}

      {/* AUTOCONTROL DEL RESPONSABLE (24H) */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', borderWidth: '2px', borderStyle: 'solid', borderColor: selfControlActive ? '#FFC107' : '#E9ECEF', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E' }}>Autocontrol del Tutor</span>
          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: selfControlActive ? '#FFF3CD' : '#E2E3E5', color: selfControlActive ? '#856404' : '#6C757D', padding: '3px 8px', borderRadius: '10px' }}>
            {selfControlActive ? '🔒 BLOQUEADO 24H' : 'INACTIVO'}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '12px', lineHeight: '1.4' }}>
          {selfControlActive
            ? 'Protección personal activa. La desactivación está bloqueada obligatoriamente durante 24 horas.'
            : 'Activa el autocontrol preventivo en tu cuenta mediante doble confirmación.'}
        </p>

        {selfControlActive ? (
          <button
            style={{ width: '100%', height: '42px', borderRadius: '10px', backgroundColor: '#E2E3E5', color: '#6C757D', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            onClick={onAttemptDisableSelfControl}
          >
            🔒 Desactivación Bloqueada (24h)
          </button>
        ) : (
          <button
            style={{ width: '100%', height: '42px', borderRadius: '10px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            onClick={onStartSelfControlFlow}
          >
            Activar Autocontrol con Doble Confirmación
          </button>
        )}
      </div>

      {/* VINCULACIÓN (LÍMITE 5 DISPOSITIVOS) */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E' }}>Vincular Nuevo Dispositivo</span>
          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '3px 8px', borderRadius: '10px' }}>
            {devices.length}/{maxDevices} Dispositivos
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '12px' }}>
          Límite de hasta {maxDevices} dispositivos por responsable.
        </p>

        {pairingCode && (
          <div style={{ backgroundColor: '#E7F1FF', borderRadius: '12px', padding: '12px', textAlign: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '4px', color: '#0056B3' }}>
              {pairingCode}
            </div>
            <div style={{ fontSize: '11px', color: '#0056B3', marginTop: '2px' }}>Válido por 15 minutos</div>
          </div>
        )}

        <button
          style={{
            width: '100%',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: devices.length >= maxDevices ? '#E2E3E5' : '#28A745',
            color: devices.length >= maxDevices ? '#6C757D' : '#FFF',
            border: 'none',
            fontWeight: '700',
            cursor: devices.length >= maxDevices ? 'not-allowed' : 'pointer',
          }}
          onClick={onGeneratePairing}
          disabled={devices.length >= maxDevices}
        >
          {devices.length >= maxDevices ? 'Límite de 5 Dispositivos Alcanzado' : 'Generar Código de Pareamiento'}
        </button>
      </div>

      {/* DISPOSITIVOS VINCULADOS CON AUDITORÍA DE PERMISOS */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1E', marginBottom: '8px' }}>
          Auditoría de Dispositivos Protegidos ({devices.length}/{maxDevices})
        </h3>
        {devices.map((dev) => {
          const perms = dev.permissions || {
            vpn: true,
            accessibility: true,
            notifications: true,
            batteryOptimization: true,
            grantedCount: 4,
          };
          return (
            <div key={dev.id || dev.deviceId} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px', border: '1px solid #E9ECEF', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1E' }}>{dev.deviceName}</div>
                  <div style={{ fontSize: '11px', color: '#8E8E93' }}>Asignado a: {dev.childName || 'Menor'}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#D1E7DD', color: '#28A745', padding: '4px 8px', borderRadius: '8px' }}>
                  PROTEGIDO
                </span>
              </div>

              <div style={{ backgroundColor: '#F8F9FA', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', border: '1px solid #DEE2E6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#1C1C1E' }}>Permisos Android:</span>
                  <span style={{ fontWeight: '800', color: perms.grantedCount === 4 ? '#28A745' : '#D97706' }}>
                    {perms.grantedCount}/4 CONCEDIDOS
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: '#6C757D', fontSize: '10px', marginTop: '4px' }}>
                  <div>🌐 VPN: <strong style={{ color: perms.vpn ? '#28A745' : '#DC3545' }}>{perms.vpn ? '✓ OK' : '✕ Pendiente'}</strong></div>
                  <div>🔒 Antidesinstalación: <strong style={{ color: perms.accessibility ? '#28A745' : '#DC3545' }}>{perms.accessibility ? '✓ OK' : '✕ Pendiente'}</strong></div>
                  <div>🔔 Notificaciones: <strong style={{ color: perms.notifications ? '#28A745' : '#DC3545' }}>{perms.notifications ? '✓ OK' : '✕ Pendiente'}</strong></div>
                  <div>🔋 Batería: <strong style={{ color: perms.batteryOptimization ? '#28A745' : '#DC3545' }}>{perms.batteryOptimization ? '✓ OK' : '✕ Pendiente'}</strong></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
