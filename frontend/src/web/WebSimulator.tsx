// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Web Simulator (Simulador Interactivo de Pruebas)
// Archivo: src/web/WebSimulator.tsx
// Descripción: Interfaz web de simulación interactiva para probar los flujos de
//              Responsable y Dispositivo Protegido con conexión en vivo al Backend.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import './simulator.css';

const API_BASE = 'http://localhost:3000/api';

interface LogEntry {
  id: string;
  time: string;
  method: 'GET' | 'POST' | 'BLOCK' | 'INFO';
  message: string;
}

export const WebSimulator: React.FC = () => {
  // Estado global del simulador
  const [appMode, setAppMode] = useState<'WELCOME' | 'PARENT' | 'CHILD'>('WELCOME');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiConnected, setApiConnected] = useState(false);

  // Estados del Modo Responsable
  const [parentToken, setParentToken] = useState<string | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [customList, setCustomList] = useState<any>(null);

  // Estados del Modo Dispositivo Protegido
  const [isVpnActive, setIsVpnActive] = useState(true);
  const [deviceUuid] = useState('uuid-samsung-mateo-a54');
  const [lotbaDomains, setLotbaDomains] = useState<string[]>([]);
  const [lotbaVersion, setLotbaVersion] = useState(4);
  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);
  const [testDomain, setTestDomain] = useState('apuestas-online-ilegal.bet');
  const [childCodeInput, setChildCodeInput] = useState('');
  const [childPaired, setChildPaired] = useState(true);

  // Registrar entrada en el log
  const addLog = (method: 'GET' | 'POST' | 'BLOCK' | 'INFO', message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ id: Math.random().toString(), time, method, message }, ...prev.slice(0, 30)]);
  };

  // Verificar conexión inicial con el Backend
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then((data) => {
        setApiConnected(true);
        addLog('GET', `Health Check OK: ${data.project} (Estado: ${data.status})`);
      })
      .catch((e) => {
        setApiConnected(false);
        addLog('INFO', `Backend desconectado o no accesible en ${API_BASE}`);
      });

    // Cargar dominios oficiales de LOTBA
    fetch(`${API_BASE}/blocklist/official`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.domains) {
          const doms = res.data.domains.map((d: any) => d.domain);
          setLotbaDomains(doms);
          setLotbaVersion(res.data.version);
          addLog('GET', `Lista oficial LOTBA sincronizada: ${doms.length} dominios (v${res.data.version})`);
        }
      })
      .catch(() => {});
  }, []);

  // Bucle periódico de telemetría (Heartbeat) en Modo Dispositivo
  useEffect(() => {
    if (appMode !== 'CHILD' || !childPaired) return;

    const interval = setInterval(() => {
      fetch(`${API_BASE}/telemetry/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceUuid,
          vpnActive: isVpnActive,
          permissionsOk: true,
          batteryLevel: 84,
          blocklistVersion: lotbaVersion,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          addLog('POST', `Heartbeat enviado: vpnActive=${isVpnActive} -> Estado: ${data.data?.effectiveStatus}`);
        })
        .catch(() => {});
    }, 12000);

    return () => clearInterval(interval);
  }, [appMode, isVpnActive, childPaired, lotbaVersion, deviceUuid]);

  // Login automático / manual del responsable
  const handleParentLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'tutor@baprotege.gob.ar',
          password: 'password123',
        }),
      });
      const data = await res.json();
      if (data.data?.token) {
        setParentToken(data.data.token);
        addLog('POST', `Autenticación exitosa como ${data.data.user.fullName}`);
        loadParentDevices(data.data.token);
        loadCustomList(data.data.token);
      }
    } catch (e: any) {
      addLog('INFO', `Error al autenticar responsable: ${e.message}`);
    }
  };

  const loadParentDevices = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDevices(data.data || []);
      addLog('GET', `Dispositivos vinculados cargados: ${data.data?.length || 0} dispositivos`);
    } catch (e) {}
  };

  const loadCustomList = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/blocklist/custom`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomList(data.data);
    } catch (e) {}
  };

  const handleGeneratePairing = async () => {
    if (!parentToken) return;
    try {
      const res = await fetch(`${API_BASE}/devices/pair/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${parentToken}` },
      });
      const data = await res.json();
      setPairingCode(data.data.pairingCode);
      addLog('POST', `Código de pareamiento generado: ${data.data.pairingCode} (expira en 15m)`);
    } catch (e) {}
  };

  const handleAddCustomDomain = async () => {
    if (!parentToken || !customDomainInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/blocklist/custom/domains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${parentToken}`,
        },
        body: JSON.stringify({ domain: customDomainInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        addLog('POST', `Dominio agregado a lista personalizada: ${customDomainInput}`);
        setCustomDomainInput('');
        loadCustomList(parentToken);
      }
    } catch (e) {}
  };

  // Acción del menor: Intentar acceder a un dominio (Simulador de Bloqueo)
  const handleSimulateAccess = async () => {
    setBlockedAlert(null);
    const domainToCheck = testDomain.toLowerCase().trim();
    const isBlocked = lotbaDomains.includes(domainToCheck) || domainToCheck.includes('apuestas') || domainToCheck.includes('casino');

    if (isVpnActive && isBlocked) {
      setBlockedAlert(domainToCheck);
      addLog('BLOCK', `🛑 [VPN LOCAL] Acceso denegado a: ${domainToCheck} (Coincidencia en lista LOTBA)`);

      // Reportar evento al backend
      fetch(`${API_BASE}/telemetry/events/blocked`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceUuid,
          attemptedDomain: domainToCheck,
          sourceListType: 'LOTBA',
        }),
      })
        .then(() => {
          addLog('POST', `Evento de bloqueo registrado en servidor para telemetría`);
        })
        .catch(() => {});
    } else {
      addLog('INFO', `🌐 Solicitud permitida para: ${domainToCheck} (${isVpnActive ? 'Sin coincidencias' : 'VPN inactiva'})`);
    }
  };

  const toggleVpn = () => {
    const nextState = !isVpnActive;
    setIsVpnActive(nextState);
    addLog('INFO', `Motor VPN local ${nextState ? 'ACTIVADO' : 'DETENIDO'} en el dispositivo`);

    if (!nextState) {
      fetch(`${API_BASE}/telemetry/events/security`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceUuid,
          eventType: 'VPN_DISABLED',
          description: 'El usuario pausó manualmente la protección',
        }),
      }).catch(() => {});
    }
  };

  const handlePairFromChild = async () => {
    if (childCodeInput.length !== 6) return;
    try {
      const res = await fetch(`${API_BASE}/devices/pair/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingCode: childCodeInput,
          deviceUuid: 'uuid-samsung-mateo-a54',
          deviceName: 'Samsung Galaxy A54 (Mateo)',
          childName: 'Mateo',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChildPaired(true);
        addLog('POST', `Vinculación completada con código ${childCodeInput}`);
      }
    } catch (e: any) {
      addLog('INFO', `Falla en pareamiento: ${e.message}`);
    }
  };

  return (
    <div className="studio-container">
      {/* Panel Lateral de Control y Telemetría */}
      <aside className="studio-sidebar">
        <div className="studio-header">
          <div className="studio-badge">
            <span className="pulse-dot"></span>
            {apiConnected ? 'API BACKEND CONECTADA' : 'MODO STANDALONE'}
          </div>
          <div className="studio-title">
            <span>🛡️</span> BA Protege+ Studio
          </div>
          <div className="studio-subtitle">
            Simulador interactivo de pruebas para Frontend & Backend API
          </div>
        </div>

        <div className="section-box">
          <div className="section-title">Modo de Operación Móvil</div>
          <div className="scenario-btn-group">
            <button
              className={`scenario-btn ${appMode === 'WELCOME' ? 'active' : ''}`}
              onClick={() => setAppMode('WELCOME')}
            >
              <span>🚪 Pantalla de Bienvenida</span>
              <span>→</span>
            </button>
            <button
              className={`scenario-btn ${appMode === 'PARENT' ? 'active' : ''}`}
              onClick={() => {
                setAppMode('PARENT');
                if (!parentToken) handleParentLogin();
              }}
            >
              <span>👨‍👩‍👧‍👦 Modo Responsable (Padre)</span>
              <span>→</span>
            </button>
            <button
              className={`scenario-btn ${appMode === 'CHILD' ? 'active' : ''}`}
              onClick={() => setAppMode('CHILD')}
            >
              <span>📱 Modo Dispositivo Protegido</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <div className="section-box">
          <div className="section-title">Parámetros del Sistema</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <div>• <strong>API Host:</strong> <code>{API_BASE}</code></div>
            <div>• <strong>Reglas LOTBA:</strong> {lotbaDomains.length} dominios (v{lotbaVersion})</div>
            <div>• <strong>Heartbeat:</strong> Cada 12 segundos</div>
          </div>
        </div>

        {/* Consola de Registros en Tiempo Real */}
        <div className="network-log-container">
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Telemetría y Registro HTTP</span>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px' }}
              onClick={() => setLogs([])}
            >
              Limpiar
            </button>
          </div>
          <div className="network-log-box">
            {logs.length === 0 ? (
              <div style={{ color: '#4b5563', textAlign: 'center', marginTop: '40px' }}>
                Sin eventos de red registrados aún.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`log-entry ${log.method}`}>
                  <span style={{ color: '#6b7280' }}>[{log.time}]</span>{' '}
                  <strong>{log.method}</strong>: {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Escenario Central: Marco de Teléfono Inteligente */}
      <main className="studio-stage">
        <div className="device-frame">
          <div className="device-notch">
            <div className="notch-camera"></div>
          </div>

          <div className="device-screen">
            <div className="phone-status-bar">
              <span>09:41</span>
              <span>📶 5G 100% 🔋</span>
            </div>

            <div className="phone-content">
              {/* ======================================================== */}
              {/* PANTALLA 1: BIENVENIDA */}
              {/* ======================================================== */}
              {appMode === 'WELCOME' && (
                <>
                  <div className="app-header">
                    <h1>BA Protege+</h1>
                    <p>Protección Digital contra Apuestas Clandestinas</p>
                  </div>
                  <div className="app-body">
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ fontSize: '42px', marginBottom: '8px' }}>🛡️</div>
                      <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--phone-text)' }}>
                        Selecciona el Rol para este Dispositivo
                      </h2>
                      <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', marginTop: '4px' }}>
                        Gobierno de la Ciudad de Buenos Aires & LOTBA
                      </p>
                    </div>

                    <div className="app-card">
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>👨‍👩‍👧‍👦</div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--phone-text)' }}>
                        Modo Responsable
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', margin: '6px 0 14px' }}>
                        Supervisa el estado de protección, genera códigos de vinculación y administra alertas.
                      </p>
                      <button
                        className="btn-primary"
                        onClick={() => {
                          setAppMode('PARENT');
                          if (!parentToken) handleParentLogin();
                        }}
                      >
                        Ingresar como Responsable
                      </button>
                    </div>

                    <div className="app-card">
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>📱</div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--phone-text)' }}>
                        Modo Dispositivo Protegido
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', margin: '6px 0 14px' }}>
                        Activa el motor de filtrado local VPN con la lista oficial LOTBA y reporta telemetría.
                      </p>
                      <button className="btn-secondary" onClick={() => setAppMode('CHILD')}>
                        Configurar como Protegido
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ======================================================== */}
              {/* PANTALLA 2: MODO RESPONSABLE (DASHBOARD) */}
              {/* ======================================================== */}
              {appMode === 'PARENT' && (
                <>
                  <div className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h1>Panel Responsable</h1>
                      <p>Carlos Gutiérrez (Tutor)</p>
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      onClick={() => setAppMode('WELCOME')}
                    >
                      Salir
                    </button>
                  </div>

                  <div className="app-body">
                    {/* Generador de Pareamiento */}
                    <div className="app-card">
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--phone-text)' }}>
                        ➕ Vincular Nuevo Dispositivo
                      </h3>
                      <p style={{ fontSize: '11px', color: 'var(--phone-subtext)', margin: '4px 0 10px' }}>
                        Genera un código temporal para el celular del menor.
                      </p>
                      {pairingCode ? (
                        <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '10px', textAlign: 'center', margin: '8px 0' }}>
                          <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '4px', color: 'var(--primary)' }}>
                            {pairingCode}
                          </span>
                          <div style={{ fontSize: '10px', color: 'var(--phone-subtext)', marginTop: '2px' }}>
                            Código válido por 15 minutos
                          </div>
                        </div>
                      ) : null}
                      <button className="btn-primary" onClick={handleGeneratePairing} style={{ height: '40px', fontSize: '13px' }}>
                        {pairingCode ? 'Generar Otro Código' : 'Generar Código (6 dígitos)'}
                      </button>
                    </div>

                    {/* Dispositivos Vinculados */}
                    <div className="app-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--phone-text)' }}>
                          Dispositivos Vinculados ({devices.length})
                        </h3>
                        <button
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer' }}
                          onClick={() => parentToken && loadParentDevices(parentToken)}
                        >
                          ↻ Actualizar
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {devices.map((dev) => {
                          const isActive = dev.status?.effectiveStatus === 'ACTIVE';
                          return (
                            <div
                              key={dev.id}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '10px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--phone-text)' }}>
                                  {dev.deviceName}
                                </strong>
                                <span
                                  className={`status-indicator ${isActive ? 'active' : 'inactive'}`}
                                  style={{ margin: 0, padding: '2px 8px', fontSize: '10px' }}
                                >
                                  {isActive ? '🟢 ACTIVO' : '⚠️ ATENCIÓN'}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--phone-subtext)', marginTop: '4px' }}>
                                Batería: {dev.status?.batteryLevel || 85}% • Lista: v{dev.status?.blocklistVersion || 4}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lista Personalizada */}
                    <div className="app-card">
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--phone-text)' }}>
                        🔒 Dominios Personalizados
                      </h3>
                      <div style={{ display: 'flex', gap: '6px', margin: '8px 0' }}>
                        <input
                          type="text"
                          placeholder="sitio-a-bloquear.com"
                          value={customDomainInput}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomDomainInput(e.target.value)}
                          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <button
                          className="btn-primary"
                          onClick={handleAddCustomDomain}
                          style={{ width: '80px', height: '36px', fontSize: '12px' }}
                        >
                          Añadir
                        </button>
                      </div>
                      {customList?.domains?.map((d: any) => (
                        <div key={d.id} style={{ fontSize: '11px', padding: '4px 0', borderBottom: '1px solid #f1f5f9', color: 'var(--phone-text)' }}>
                          ⛔ {d.domain}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ======================================================== */}
              {/* PANTALLA 3: MODO DISPOSITIVO PROTEGIDO */}
              {/* ======================================================== */}
              {appMode === 'CHILD' && (
                <>
                  <div className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h1>Dispositivo Protegido</h1>
                      <p>Samsung Galaxy A54 (Mateo)</p>
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      onClick={() => setAppMode('WELCOME')}
                    >
                      Salir
                    </button>
                  </div>

                  <div className="app-body">
                    {/* Tarjeta de Estado de Protección VPN */}
                    <div className="app-card">
                      <div className={`status-indicator ${isVpnActive ? 'active' : 'inactive'}`}>
                        <span>{isVpnActive ? '●' : '○'}</span>
                        <span>{isVpnActive ? 'PROTECCIÓN ACTIVA' : 'PROTECCIÓN PAUSADA'}</span>
                      </div>

                      <h2 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--phone-text)', lineHeight: '1.4' }}>
                        {isVpnActive
                          ? 'El motor local VPN está bloqueando sitios de apuestas en tiempo real'
                          : 'Alerta: El dispositivo no está protegido frente a sitios no autorizados'}
                      </h2>

                      <div className="metric-grid">
                        <div className="metric-item">
                          <strong>{lotbaDomains.length}</strong>
                          <span>Dominios LOTBA</span>
                        </div>
                        <div className="metric-item">
                          <strong>v{lotbaVersion}</strong>
                          <span>Versión Lista</span>
                        </div>
                        <div className="metric-item">
                          <strong>En Vivo</strong>
                          <span>Telemetría</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '14px' }}>
                        <button
                          className={isVpnActive ? 'btn-danger' : 'btn-primary'}
                          onClick={toggleVpn}
                        >
                          {isVpnActive ? 'Pausar Motor VPN' : 'Reanudar Motor VPN'}
                        </button>
                      </div>
                    </div>

                    {/* Simulador de Navegación e Interceptación LOTBA */}
                    <div className="app-card sim-block-box">
                      <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b' }}>
                        🧪 Probar Interceptación de Sitios LOTBA
                      </h3>
                      <p style={{ fontSize: '11px', color: '#7f1d1d', margin: '2px 0 8px' }}>
                        Selecciona un dominio de apuestas ilegales para probar el bloqueo:
                      </p>

                      <select
                        value={testDomain}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTestDomain(e.target.value)}
                      >
                        {lotbaDomains.map((dom) => (
                          <option key={dom} value={dom}>
                            {dom}
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn-primary"
                        style={{ backgroundColor: '#be123c', height: '40px', fontSize: '13px', marginTop: '4px' }}
                        onClick={handleSimulateAccess}
                      >
                        Simular Intento de Navegación
                      </button>

                      {blockedAlert ? (
                        <div className="blocked-banner" style={{ marginTop: '10px' }}>
                          🚫 ACCESO BLOQUEADO POR BA PROTEGE+<br />
                          <span style={{ fontSize: '11px', fontWeight: 'normal' }}>
                            Dominio <code>{blockedAlert}</code> prohibido por LOTBA. Evento reportado al responsable.
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Simulación de Pareamiento */}
                    {!childPaired && (
                      <div className="app-card">
                        <h3 style={{ fontSize: '13px', fontWeight: '700' }}>Vincular con Código</h3>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="483921"
                          value={childCodeInput}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChildCodeInput(e.target.value)}
                          style={{ width: '100%', padding: '8px', textAlign: 'center', fontSize: '18px', letterSpacing: '4px', margin: '8px 0' }}
                        />
                        <button className="btn-primary" onClick={handlePairFromChild}>
                          Confirmar Pareamiento
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
