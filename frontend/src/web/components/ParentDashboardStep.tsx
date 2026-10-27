// ==============================================================================
// Proyecto: BA Protege+
// Componente: Web Simulator - ParentDashboardStep (Paso 5A)
// Archivo: src/web/components/ParentDashboardStep.tsx
// Descripción: Paso 5A del flujo con panel del responsable, barra de navegación
//              inferior (Navbar 5 pestañas: Panel, Dispositivos, Sitios, Actividad,
//              Cuenta) con íconos PNG, resalte #E5F1FF y etiquetas de texto,
//              búsqueda y ordenamiento en dispositivos y desvinculación con doble confirmación.
// ==============================================================================

import React, { useState } from 'react';
import { WebPermissionsState } from './PermissionsStep';
import { CustomBlockedDomain } from '../../types';
import logoBaPng from '../../assets/logo/logo_ba.png';

type DashboardTab = 'inicio' | 'dispositivos' | 'sitios' | 'actividad' | 'cuenta';

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
  onUnbindDevice?: (deviceId: string) => void;
}

const navTabs: DashboardTab[] = ['inicio', 'dispositivos', 'sitios', 'actividad', 'cuenta'];

const webNavIcons: Record<DashboardTab, string> = {
  inicio: '/src/assets/icons/navbar/inicio.png',
  dispositivos: '/src/assets/icons/navbar/dispositivos.png',
  sitios: '/src/assets/icons/navbar/sitios.png',
  actividad: '/src/assets/icons/navbar/actividad.png',
  cuenta: '/src/assets/icons/navbar/cuenta.png',
};

const webNavLabels: Record<DashboardTab, string> = {
  inicio: 'Panel',
  dispositivos: 'Dispositivos',
  sitios: 'Sitios',
  actividad: 'Actividad',
  cuenta: 'Cuenta',
};

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
  onUnbindDevice,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('inicio');
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'BLOCK' | 'ALERT' | 'SYSTEM'>('ALL');

  // Filtros y orden de Dispositivos
  const [deviceSearch, setDeviceSearch] = useState('');
  const [deviceSort, setDeviceSort] = useState<'NAME' | 'DATE'>('NAME');
  const [unbindingDev, setUnbindingDev] = useState<any | null>(null);
  const [unbindStep, setUnbindStep] = useState<1 | 2>(1);

  // CRUD de Sitios
  const [newDomain, setNewDomain] = useState('');
  const [newCategory, setNewCategory] = useState('Apuestas');
  const [addError, setAddError] = useState('');
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editDomain, setEditDomain] = useState('');
  const [editCategory, setEditCategory] = useState('Apuestas');

  const handleAddSiteClick = () => {
    setAddError('');
    const trimmed = newDomain.trim();
    if (!trimmed) {
      setAddError('Por favor ingresa un dominio web (ej: tiktok.com o casino.bet)');
      return;
    }
    const cleanDomain = trimmed.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
      setAddError('Formato de dominio no válido (ejemplo: sitio.com)');
      return;
    }

    if (onAddCustomSite) {
      onAddCustomSite(cleanDomain, newCategory);
    }
    setNewDomain('');
  };

  // Filtrado y ordenamiento de dispositivos
  const filteredDevices = devices.filter((dev) => {
    const term = deviceSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      (dev.name && dev.name.toLowerCase().includes(term)) ||
      (dev.childName && dev.childName.toLowerCase().includes(term)) ||
      (dev.deviceId && dev.deviceId.toLowerCase().includes(term))
    );
  });

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (deviceSort === 'NAME') {
      const nameA = a.name || a.childName || '';
      const nameB = b.name || b.childName || '';
      return nameA.localeCompare(nameB);
    } else {
      const dateA = a.pairedAt || a.createdAt || '';
      const dateB = b.pairedAt || b.createdAt || '';
      return dateB.localeCompare(dateA);
    }
  });

  const handleConfirmUnbind = () => {
    if (unbindingDev && onUnbindDevice) {
      onUnbindDevice(unbindingDev.id || unbindingDev.deviceId);
    }
    setUnbindingDev(null);
    setUnbindStep(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#F8F9FA' }}>
      {/* CONTENIDO DE LA PESTAÑA SELECCIONADA */}
      <div style={{ flex: 1, padding: '16px 16px 24px 16px' }}>

        {/* VISTA 1: INICIO (PANEL) */}
        {activeTab === 'inicio' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#007AFF', color: '#FFF', padding: '3px 8px', borderRadius: '6px' }}>
                  MODO RESPONSABLE
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', marginTop: '4px', margin: 0 }}>
                  Panel del Responsable
                </h2>
                <p style={{ fontSize: '12px', color: '#8E8E93', margin: '2px 0 0 0' }}>
                  Monitoreo, Permisos de Dispositivos y Autocontrol
                </p>
              </div>
              <img src={logoBaPng} alt="BA Protege+" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            </div>

            {/* Tarjetas de Resumen General */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '12px', textAlign: 'center', border: '1px solid #E9ECEF' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#007AFF' }}>{devices.length}/{maxDevices}</div>
                <div style={{ fontSize: '11px', color: '#8E8E93', fontWeight: '600' }}>Dispositivos</div>
              </div>
              <div style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '12px', textAlign: 'center', border: '1px solid #E9ECEF' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#198754' }}>3/3</div>
                <div style={{ fontSize: '11px', color: '#8E8E93', fontWeight: '600' }}>Reglas</div>
              </div>
              <div style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '12px', textAlign: 'center', border: '1px solid #E9ECEF' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: selfControlActive ? '#DC3545' : '#6C757D' }}>
                  {selfControlActive ? '🔒' : 'Off'}
                </div>
                <div style={{ fontSize: '11px', color: '#8E8E93', fontWeight: '600' }}>Autocontrol</div>
              </div>
            </div>

            {/* SECCIÓN 1: VINCULAR DISPOSITIVO MENOR */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E' }}>📱 Vincular Dispositivo Menor</span>
                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '3px 8px', borderRadius: '10px' }}>
                  {devices.length}/{maxDevices} VINCULADOS
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '14px' }}>
                Genera un código numérico o QR para vincular el celular del menor de forma remota.
              </p>

              {pairingCode && (
                <div style={{ backgroundColor: '#E7F1FF', borderRadius: '12px', padding: '14px', textAlign: 'center', marginBottom: '14px', border: '1px solid #B6D4FE' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0056B3', marginBottom: '4px' }}>
                    CÓDIGO DE VINCULACIÓN GENERADO
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '6px', color: '#0056B3' }}>
                    {pairingCode}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0A58CA', marginTop: '4px' }}>
                    Válido por 15 minutos • Ingresar en el dispositivo del protegido
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${pairingCode}&color=007AFF&bgcolor=FFFFFF`}
                      alt="QR Vinculación"
                      style={{ width: '130px', height: '130px', borderRadius: '6px' }}
                    />
                  </div>
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
          </div>
        )}

        {/* VISTA 2: DISPOSITIVOS */}
        {activeTab === 'dispositivos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('inicio')}
                  style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Volver a Inicio"
                >
                  <img src="/src/assets/icons/volver.png" alt="Volver" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                </button>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', margin: 0 }}>Mis Dispositivos Protegidos</h2>
                  <p style={{ fontSize: '12px', color: '#8E8E93', margin: '2px 0 0 0' }}>
                    Administración de hasta {maxDevices} celulares vinculados
                  </p>
                </div>
              </div>
              <img src={logoBaPng} alt="BA Protege+" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            </div>

            {/* Buscador y Filtros */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="🔍 Buscar por dispositivo o protegido..."
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid #CED4DA',
                  padding: '0 12px',
                  fontSize: '13px',
                  marginBottom: '10px',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#6C757D' }}>Ordenar por:</span>
                <button
                  type="button"
                  onClick={() => setDeviceSort('NAME')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: deviceSort === 'NAME' ? '#007AFF' : '#F1F5F9',
                    color: deviceSort === 'NAME' ? '#FFF' : '#475569',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  🔤 Nombre
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceSort('DATE')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: deviceSort === 'DATE' ? '#007AFF' : '#F1F5F9',
                    color: deviceSort === 'DATE' ? '#FFF' : '#475569',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  📅 Fecha vinculación
                </button>
              </div>

              {sortedDevices.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#F8F9FA', borderRadius: '10px', color: '#8E8E93', fontSize: '12px', border: '1px dashed #CED4DA' }}>
                  No se encontraron dispositivos.
                </div>
              ) : (
                sortedDevices.map((dev: any, idx: number) => (
                  <div key={idx} style={{ backgroundColor: '#F8F9FA', borderRadius: '12px', padding: '12px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1E' }}>📱 {dev.name || dev.childName || `Dispositivo ${idx + 1}`}</span>
                      <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#D1E7DD', color: '#0F5132', padding: '2px 6px', borderRadius: '4px' }}>PROTEGIDO</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', marginBottom: '8px' }}>
                      Protegido: {dev.childName || 'Sofía'} • Sincronización: Activa
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUnbindingDev(dev);
                        setUnbindStep(1);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #F8D7DA',
                        backgroundColor: '#FFF5F5',
                        color: '#DC3545',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      🔗 Desvincular Dispositivo
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA 3: SITIOS */}
        {activeTab === 'sitios' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('inicio')}
                  style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Volver a Inicio"
                >
                  <img src="/src/assets/icons/volver.png" alt="Volver" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                </button>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', margin: 0 }}>Gestión de Sitios Web</h2>
                  <p style={{ fontSize: '12px', color: '#8E8E93', margin: '2px 0 0 0' }}>Filtro oficial LOTBA y dominios personalizados</p>
                </div>
              </div>
              <img src={logoBaPng} alt="BA Protege+" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            </div>

            {/* SECCIÓN DE BLOQUEO DE SITIOS PERSONALIZADOS (CRUD) */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1E' }}>Sitios Web Bloqueados</span>
                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#E7F1FF', color: '#0056B3', padding: '3px 8px', borderRadius: '10px' }}>
                  {customSites.length} {customSites.length === 1 ? 'Sitio' : 'Sitios'}
                </span>
              </div>

              {/* Formulario directo para agregar nuevo sitio */}
              <div style={{ backgroundColor: '#F8F9FA', borderRadius: '12px', padding: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#1C1C1E', marginBottom: '6px' }}>
                  Dominio o sitio web a bloquear:
                </label>
                <input
                  type="text"
                  placeholder="ejemplo: casino-ilegal.bet o tiktok.com"
                  value={newDomain}
                  onChange={(e) => {
                    setNewDomain(e.target.value);
                    if (addError) setAddError('');
                  }}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: addError ? '1.5px solid #DC3545' : '1px solid #CED4DA',
                    fontSize: '13px',
                    marginBottom: '8px',
                  }}
                />
                {addError && (
                  <div style={{ fontSize: '11px', color: '#DC3545', fontWeight: '600', marginBottom: '8px' }}>
                    ⚠️ {addError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddSiteClick}
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#007AFF',
                    color: '#FFF',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ➕ Agregar Sitio a Bloquear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 4: ACTIVIDAD */}
        {activeTab === 'actividad' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('inicio')}
                  style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Volver a Inicio"
                >
                  <img src="/src/assets/icons/volver.png" alt="Volver" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                </button>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', margin: 0 }}>Actividad del Sistema</h2>
                  <p style={{ fontSize: '12px', color: '#8E8E93', margin: '2px 0 0 0' }}>Auditoría de bloqueos, alertas y geolocalización</p>
                </div>
              </div>
              <img src={logoBaPng} alt="BA Protege+" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            </div>

            <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1E', marginBottom: '10px' }}>
                Registro de Bloqueos en Tiempo Real
              </div>
              <div style={{ backgroundColor: '#FFF3CD', color: '#856404', borderRadius: '10px', padding: '10px', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
                🚫 Intento de acceso bloqueado: <b>bet365-ilegal.net</b> (Sofía - Hace 10 min)
              </div>
            </div>
          </div>
        )}

        {/* VISTA 5: CUENTA */}
        {activeTab === 'cuenta' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('inicio')}
                  style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Volver a Inicio"
                >
                  <img src="/src/assets/icons/volver.png" alt="Volver" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                </button>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', margin: 0 }}>Perfil y Cuenta</h2>
                  <p style={{ fontSize: '12px', color: '#8E8E93', margin: '2px 0 0 0' }}>Ajustes del responsable y autoprotección</p>
                </div>
              </div>
              <img src={logoBaPng} alt="BA Protege+" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            </div>

            <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E9ECEF', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1C1C1E' }}>{parentUser?.fullName || 'Tutor Responsable'}</div>
              <div style={{ fontSize: '12px', color: '#8E8E93', marginTop: '2px' }}>{parentUser?.email || 'tutor@baprotege.gob.ar'}</div>
            </div>

            <button
              style={{ width: '100%', height: '42px', borderRadius: '10px', backgroundColor: '#F8D7DA', color: '#842029', border: '1px solid #F5C2C7', fontWeight: '700', cursor: 'pointer' }}
              onClick={onExit}
            >
              Cerrar Sesión del Panel
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE DESVINCULACIÓN EN SIMULADOR WEB */}
      {unbindingDev && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '20px', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔗</div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1C1C1E', margin: '0 0 8px 0' }}>
              {unbindStep === 1 ? 'Confirmación 1 de 2' : 'Confirmación Final'}
            </h3>
            <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 12px 0' }}>
              {unbindStep === 1
                ? `¿Deseas desvincular el dispositivo "${unbindingDev.name || 'Protegido'}"?`
                : '¿Estás seguro de eliminar permanentemente la vinculación?'}
            </p>

            {unbindStep === 1 ? (
              <div>
                <button
                  type="button"
                  onClick={() => setUnbindStep(2)}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', fontSize: '12px', marginBottom: '8px', cursor: 'pointer' }}
                >
                  Entiendo las consecuencias, Continuar ➔
                </button>
                <button
                  type="button"
                  onClick={() => setUnbindingDev(null)}
                  style={{ width: '100%', height: '36px', borderRadius: '8px', backgroundColor: '#E2E8F0', color: '#475569', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleConfirmUnbind}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', backgroundColor: '#DC3545', color: '#FFF', border: 'none', fontWeight: '700', fontSize: '12px', marginBottom: '8px', cursor: 'pointer' }}
                >
                  🔗 Confirmar y Desvincular
                </button>
                <button
                  type="button"
                  onClick={() => setUnbindStep(1)}
                  style={{ width: '100%', height: '36px', borderRadius: '8px', backgroundColor: '#E2E8F0', color: '#475569', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Volver Atrás
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGACIÓN INFERIOR (NAVBAR CON 5 OPCIONES, HIGHLIGHT #E5F1FF Y TEXTO) */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E9ECEF',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '6px 4px',
          height: '66px',
          boxSizing: 'border-box',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        {navTabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                maxWidth: '72px',
                padding: '5px 2px',
                borderRadius: '12px',
                backgroundColor: isActive ? '#E5F1FF' : 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              aria-label={`Navegar a ${webNavLabels[tab]}`}
            >
              <img
                src={webNavIcons[tab]}
                alt={tab}
                style={{ width: '22px', height: '22px', objectFit: 'contain', marginBottom: '2px' }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive ? '#0056B3' : '#64748B',
                  whiteSpace: 'nowrap',
                }}
              >
                {webNavLabels[tab]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
