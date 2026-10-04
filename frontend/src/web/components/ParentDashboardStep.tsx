// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - ParentDashboardStep (Paso 5A)
// Archivo: src/web/components/ParentDashboardStep.tsx
// Descripción: Paso 5A del flujo con panel del responsable, alerta de permisos del tutor,
//              autocontrol de 24hs, generador de código de pareamiento (hasta 5) y auditoría de permisos.
// ==============================================================================

import React, { useState } from 'react';
import { WebPermissionsState } from './PermissionsStep';
import { CustomBlockedDomain } from '../../types';

interface ParentDashboardStepProps {
  parentUser: any;
  webPermissions: WebPermissionsState;
  selfControlActive: boolean;
  selfControlCanDisable?: boolean;
  selfControlStatus?: 'INACTIVE' | 'ACTIVE_LOCKED' | 'DEACTIVATION_PENDING' | 'DEACTIVATION_READY' | 'TEMPORARILY_UNLOCKED' | 'LOCKED_WAITING' | 'LOCKED_CAN_DISABLE';
  selfControlRemainingText?: string;
  onSimulateFastForward24h?: () => void;
  devices: any[];
  maxDevices: number;
  pairingCode: string | null;
  onExit: () => void;
  onOpenPermissions: () => void;
  onAttemptDisableSelfControl: () => void;
  onStartSelfControlFlow: () => void;
  onGeneratePairing: () => void;
  customSites?: CustomBlockedDomain[];
  onAddCustomSite?: (domain: string, category: string) => void;
  onUpdateCustomSite?: (id: string, data: { domain?: string; category?: string; isActive?: boolean }) => void;
  onDeleteCustomSite?: (id: string) => void;
}

export const ParentDashboardStep: React.FC<ParentDashboardStepProps> = ({
  parentUser,
  webPermissions,
  selfControlActive,
  selfControlCanDisable = false,
  selfControlStatus = 'INACTIVE',
  selfControlRemainingText = '',
  onSimulateFastForward24h,
  devices,
  maxDevices,
  pairingCode,
  onExit,
  onOpenPermissions,
  onAttemptDisableSelfControl,
  onStartSelfControlFlow,
  onGeneratePairing,
  customSites = [],
  onAddCustomSite,
  onUpdateCustomSite,
  onDeleteCustomSite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newCategory, setNewCategory] = useState('Apuestas');
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editDomain, setEditDomain] = useState('');
  const [editCategory, setEditCategory] = useState('Apuestas');
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

      {/* AUTOCONTROL DEL TUTOR */}
      <div
        style={{
          backgroundColor: '#FFF',
          borderRadius: '16px',
          padding: '16px',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor:
            selfControlStatus === 'TEMPORARILY_UNLOCKED'
              ? '#007AFF'
              : selfControlStatus === 'DEACTIVATION_READY'
              ? '#28A745'
              : selfControlStatus === 'DEACTIVATION_PENDING'
              ? '#FFC107'
              : selfControlActive
              ? '#28A745'
              : '#E9ECEF',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E' }}>Autocontrol del Tutor</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor:
                selfControlStatus === 'TEMPORARILY_UNLOCKED'
                  ? '#E7F1FF'
                  : selfControlStatus === 'DEACTIVATION_READY'
                  ? '#D1E7DD'
                  : selfControlStatus === 'DEACTIVATION_PENDING'
                  ? '#FFF3CD'
                  : selfControlActive
                  ? '#D1E7DD'
                  : '#E2E3E5',
              color:
                selfControlStatus === 'TEMPORARILY_UNLOCKED'
                  ? '#0056B3'
                  : selfControlStatus === 'DEACTIVATION_READY'
                  ? '#0F5132'
                  : selfControlStatus === 'DEACTIVATION_PENDING'
                  ? '#856404'
                  : selfControlActive
                  ? '#0F5132'
                  : '#6C757D',
              padding: '3px 8px',
              borderRadius: '10px',
            }}
          >
            {selfControlStatus === 'TEMPORARILY_UNLOCKED'
              ? '🔓 DESBLOQUEADO (PASE 24H)'
              : selfControlStatus === 'DEACTIVATION_READY'
              ? '🔓 DESACTIVACIÓN HABILITADA'
              : selfControlStatus === 'DEACTIVATION_PENDING'
              ? '⏳ ESPERA 24H'
              : selfControlActive
              ? '🔒 ACTIVA'
              : 'INACTIVO'}
          </span>
        </div>

        {/* 1. Paso: Temporizador de 24hs activo tras el primer clic */}
        {selfControlStatus === 'DEACTIVATION_PENDING' && (
          <div
            style={{
              backgroundColor: '#FFF3CD',
              border: '1px solid #FFC107',
              borderRadius: '10px',
              padding: '10px',
              color: '#856404',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '12px',
            }}
          >
            ⚠️ La desactivación se habilitará en 24 horas.
            <div style={{ fontSize: '11px', fontWeight: '500', marginTop: '3px' }}>
              Tiempo restante para habilitar el botón: {selfControlRemainingText || '24h 00m'}
            </div>
          </div>
        )}

        {/* 2. Paso: Cumplidas las 24hs de espera */}
        {selfControlStatus === 'DEACTIVATION_READY' && (
          <div
            style={{
              backgroundColor: '#D1E7DD',
              border: '1px solid #BADBCC',
              borderRadius: '10px',
              padding: '10px',
              color: '#0F5132',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '12px',
            }}
          >
            ✅ Pasaron las 24 horas requeridas.
            <div style={{ fontSize: '11px', fontWeight: '500', marginTop: '3px' }}>
              Haz clic nuevamente en el botón para confirmar el desbloqueo real de autoprotección.
            </div>
          </div>
        )}

        <p style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '12px', lineHeight: '1.4' }}>
          {selfControlStatus === 'TEMPORARILY_UNLOCKED'
            ? `Autoprotección desbloqueada inmediatamente. Pase temporal de 24 horas activo (${selfControlRemainingText || '24h 00m restantes'}). Cumplido ese plazo, la autoprotección se volverá a activar automáticamente.`
            : selfControlStatus === 'DEACTIVATION_READY'
            ? 'La desactivación está habilitada. Toca el botón para confirmar el desbloqueo real. Se otorgará un pase temporal de 24 horas.'
            : selfControlStatus === 'DEACTIVATION_PENDING'
            ? 'Se inició la solicitud de desactivación. La autoprotección permanece activa durante las 24 horas de espera.'
            : selfControlActive
            ? 'La autoprotección está activa en tu dispositivo para bloquear casas de apuestas en tu perfil.'
            : 'Activa la autoprotección en tu cuenta mediante doble confirmación.'}
        </p>

        {/* BOTONERA SEGÚN ESTADO */}
        {selfControlStatus === 'TEMPORARILY_UNLOCKED' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#007AFF',
                color: '#FFF',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
              }}
              onClick={onStartSelfControlFlow}
            >
              🔒 Volver a Activar Ahora
            </button>
            {onSimulateFastForward24h && (
              <button
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#F8F9FA',
                  border: '1px solid #DEE2E6',
                  color: '#495057',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '0 12px',
                  cursor: 'pointer',
                }}
                onClick={onSimulateFastForward24h}
                title="Simular que pasaron las 24 horas para ver la reactivación automática"
              >
                ⏩ Simular +24h
              </button>
            )}
          </div>
        ) : selfControlStatus === 'DEACTIVATION_READY' ? (
          <button
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#28A745',
              color: '#FFF',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
            }}
            onClick={onAttemptDisableSelfControl}
          >
            🔓 Confirmar Desactivación (Desbloqueo Inmediato)
          </button>
        ) : selfControlStatus === 'DEACTIVATION_PENDING' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#E2E3E5',
                color: '#6C757D',
                border: 'none',
                fontWeight: '700',
                cursor: 'not-allowed',
              }}
              disabled
            >
              🔒 La desactivación se habilitará en 24 horas
            </button>
            {onSimulateFastForward24h && (
              <button
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#F8F9FA',
                  border: '1px solid #DEE2E6',
                  color: '#495057',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '0 12px',
                  cursor: 'pointer',
                }}
                onClick={onSimulateFastForward24h}
                title="Simular que transcurrieron las 24hs para habilitar el botón"
              >
                ⏩ Simular +24h
              </button>
            )}
          </div>
        ) : selfControlActive ? (
          <button
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#DC3545',
              color: '#FFF',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
            }}
            onClick={onAttemptDisableSelfControl}
          >
            Desactivar autoprotección
          </button>
        ) : (
          <button
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#007AFF',
              color: '#FFF',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
            }}
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

      {/* SECCIÓN DE BLOQUEO DE SITIOS PERSONALIZADOS (CRUD) */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E' }}>Sitios Web Bloqueados</span>
          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '3px 8px', borderRadius: '10px' }}>
            {customSites.length} Sitios
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '12px' }}>
          Lista personalizada de dominios bloqueados adicionalmente a la lista oficial LOTBA.
        </p>

        {/* Buscador de sitios */}
        <input
          type="text"
          placeholder="🔍 Buscar dominio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: '40px',
            padding: '0 12px',
            borderRadius: '10px',
            border: '1px solid #CED4DA',
            fontSize: '13px',
            marginBottom: '10px',
          }}
        />

        {/* Botón para agregar con espaciado consistente y ancho alineado a las tarjetas */}
        <button
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: isAddingSite ? '#6C757D' : '#007AFF',
            color: '#FFF',
            border: 'none',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(0, 122, 255, 0.15)',
            transition: 'all 0.2s ease',
          }}
          onClick={() => setIsAddingSite(!isAddingSite)}
        >
          {isAddingSite ? '✕ Cancelar' : '+ Bloquear Sitio'}
        </button>

        {/* Formulario para agregar nuevo sitio */}
        {isAddingSite && (
          <div style={{ backgroundColor: '#F8F9FA', borderRadius: '10px', padding: '12px', border: '1px solid #DEE2E6', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1E', marginBottom: '8px' }}>
              Bloquear Nuevo Dominio Web
            </div>
            <input
              type="text"
              placeholder="ejemplo: casino-ilegal.bet"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                height: '36px',
                padding: '0 10px',
                borderRadius: '8px',
                border: '1px solid #CED4DA',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            />
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#6C757D', fontWeight: '600' }}>Categoría:</span>
              {['Apuestas', 'Redes Sociales', 'Juegos', 'Adultos', 'Personalizado'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #CED4DA',
                    backgroundColor: newCategory === cat ? '#007AFF' : '#FFF',
                    color: newCategory === cat ? '#FFF' : '#495057',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                  onClick={() => setNewCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              style={{
                width: '100%',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#28A745',
                color: '#FFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (!newDomain.trim()) return;
                onAddCustomSite?.(newDomain, newCategory);
                setNewDomain('');
                setIsAddingSite(false);
              }}
            >
              Guardar y Bloquear Dominio
            </button>
          </div>
        )}

        {/* Lista de sitios */}
        {customSites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#8E8E93', fontSize: '12px' }}>
            No tienes sitios bloqueados en tu lista personalizada.
          </div>
        ) : (
          customSites
            .filter((s) => s.domain.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((site) => {
              const isEditingThis = editingSiteId === site.id;
              if (isEditingThis) {
                return (
                  <div key={site.id} style={{ backgroundColor: '#F8F9FA', borderRadius: '10px', padding: '10px', border: '1px solid #007AFF', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#007AFF', marginBottom: '6px' }}>
                      Editar Dominio Bloqueado
                    </div>
                    <input
                      type="text"
                      value={editDomain}
                      onChange={(e) => setEditDomain(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        height: '34px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid #CED4DA',
                        fontSize: '12px',
                        marginBottom: '8px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {['Apuestas', 'Redes Sociales', 'Juegos', 'Adultos', 'Personalizado'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #CED4DA',
                            backgroundColor: editCategory === cat ? '#007AFF' : '#FFF',
                            color: editCategory === cat ? '#FFF' : '#495057',
                            fontSize: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                          onClick={() => setEditCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        style={{
                          flex: 1,
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#007AFF',
                          color: '#FFF',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          if (!editDomain.trim()) return;
                          onUpdateCustomSite?.(site.id, { domain: editDomain, category: editCategory });
                          setEditingSiteId(null);
                        }}
                      >
                        Guardar Cambios
                      </button>
                      <button
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          borderRadius: '6px',
                          backgroundColor: '#E2E3E5',
                          color: '#495057',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                        onClick={() => setEditingSiteId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={site.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: '10px', padding: '10px 12px', border: '1px solid #DEE2E6', marginBottom: '8px' }}>
                  <div style={{ flex: 1, marginRight: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1E' }}>
                      🌐 {site.domain}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '2px 6px', borderRadius: '6px' }}>
                        {site.category || 'Personalizado'}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: site.isActive ? '#D1E7DD' : '#E2E3E5', color: site.isActive ? '#0F5132' : '#6C757D', padding: '2px 6px', borderRadius: '6px' }}>
                        {site.isActive ? 'BLOQUEADO' : 'PAUSADO'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #CED4DA',
                        backgroundColor: '#FFF',
                        color: '#495057',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                      onClick={() => onUpdateCustomSite?.(site.id, { isActive: !site.isActive })}
                      title={site.isActive ? 'Pausar bloqueo' : 'Reanudar bloqueo'}
                    >
                      {site.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #CED4DA',
                        backgroundColor: '#FFF',
                        color: '#495057',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                      onClick={() => {
                        setEditingSiteId(site.id);
                        setEditDomain(site.domain);
                        setEditCategory(site.category || 'Apuestas');
                      }}
                      title="Editar dominio"
                    >
                      ✏️
                    </button>
                    <button
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #F8D7DA',
                        backgroundColor: '#FFF5F5',
                        color: '#DC3545',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                      onClick={() => {
                        if (confirm(`¿Deseas eliminar "${site.domain}" de tu lista de bloqueo?`)) {
                          onDeleteCustomSite?.(site.id);
                        }
                      }}
                      title="Eliminar dominio"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
        )}
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
