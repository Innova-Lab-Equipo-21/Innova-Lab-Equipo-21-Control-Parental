// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Web Simulator (Simulador Interactivo de Pruebas)
// Archivo: src/web/WebSimulator.tsx
// Descripción: Interfaz web de simulación interactiva para probar los flujos de
//              Autenticación (Login, Registro, Recuperación), Responsable y Dispositivo.
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

type AuthTab = 'LOGIN' | 'RECOVERY' | 'REGISTER';
type GenderOption = 'Masculino' | 'Femenino' | 'Otro' | 'No informado';

export const WebSimulator: React.FC = () => {
  // Estado global del simulador
  const [appMode, setAppMode] = useState<'ONBOARDING' | 'WELCOME' | 'LOGIN' | 'PARENT' | 'CHILD'>('WELCOME');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiConnected, setApiConnected] = useState(false);

  // Estados de Onboarding y Videos
  const [onbIndex, setOnbIndex] = useState(0);
  const [onbPlaying, setOnbPlaying] = useState(false);
  const [onbSeconds, setOnbSeconds] = useState(0);
  const [onbFaq, setOnbFaq] = useState<number | null>(null);

  // Estados de Autenticación
  const [authTab, setAuthTab] = useState<AuthTab>('LOGIN');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Campos Login
  const [loginEmail, setLoginEmail] = useState('tutor@baprotege.gob.ar');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Campos Recuperación
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Campos Registro
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regGenero, setRegGenero] = useState<GenderOption>('No informado');
  const [regFechaNacimiento, setRegFechaNacimiento] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Estados del Modo Responsable
  const [parentUser, setParentUser] = useState<any>(null);
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

  // Formateadores
  const formatBirthDate = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 8);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const formatPhone = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Verificar conexión inicial con el Backend
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then((data) => {
        setApiConnected(true);
        addLog('GET', `Health Check OK: ${data.project} (Estado: ${data.status})`);
      })
      .catch(() => {
        setApiConnected(false);
        addLog('INFO', `Backend en modo local simulado (sin conexión en ${API_BASE})`);
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
      .catch(() => {
        // Fallback offline
        const sample = [
          'apuestas-online-ilegal.bet',
          'casino-clandestino-ba.com',
          'ruleta-sin-control.bet',
          'poker-no-regulado.net',
          'slots-clandestinas.xyz',
        ];
        setLotbaDomains(sample);
      });
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

  // Simulación de reproducción del video tutorial de Onboarding
  useEffect(() => {
    let interval: any = null;
    const durations = [105, 90, 120];
    if (onbPlaying) {
      interval = setInterval(() => {
        setOnbSeconds((prev) => {
          if (prev >= durations[onbIndex]) {
            setOnbPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onbPlaying, onbIndex]);

  // Manejo de Login en Simulador
  const handleWebLogin = async () => {
    setAuthError(null);
    setAuthSuccess(null);

    if (!loginEmail.trim()) {
      setAuthError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    if (!loginPassword) {
      setAuthError('Por favor, ingresa tu contraseña.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setParentToken(data.data.token);
        setParentUser(data.data.user);
        addLog('POST', `Autenticación exitosa como ${data.data.user.fullName} (${data.data.user.email})`);
        loadParentDevices(data.data.token);
        loadCustomList(data.data.token);
        setAppMode('PARENT');
      } else {
        throw new Error(data.message || 'Credenciales inválidas.');
      }
    } catch (e: any) {
      // Fallback demo
      if (loginEmail === 'tutor@baprotege.gob.ar' && loginPassword === 'password123') {
        const mockUser = { fullName: 'Tutor Responsable', email: loginEmail };
        setParentToken('mock-jwt-token');
        setParentUser(mockUser);
        addLog('POST', `Autenticación exitosa en modo DEMO como ${mockUser.fullName}`);
        setAppMode('PARENT');
        setDevices([
          {
            id: 'dev-1',
            deviceName: 'Samsung Galaxy A54 (Mateo)',
            childName: 'Mateo',
            status: { effectiveStatus: 'ACTIVE', batteryLevel: 85, blocklistVersion: 4 },
          },
        ]);
      } else {
        setAuthError(e.message || 'Error al iniciar sesión.');
        addLog('INFO', `Falla de autenticación: ${e.message}`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Manejo de Recuperación de Contraseña
  const handleWebRecovery = async () => {
    setAuthError(null);
    setAuthSuccess(null);

    if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) {
      setAuthError('Ingresa un correo electrónico con formato válido.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      });
      const data = await res.json();
      setRecoverySent(true);
      setAuthSuccess(
        `Hemos enviado las instrucciones para restablecer tu contraseña a ${recoveryEmail.trim()}.`,
      );
      addLog('POST', `Solicitud de recuperación procesada para ${recoveryEmail.trim()}`);
    } catch (e: any) {
      setRecoverySent(true);
      setAuthSuccess(
        `Hemos enviado las instrucciones para restablecer tu contraseña a ${recoveryEmail.trim()}.`,
      );
      addLog('POST', `Solicitud de recuperación procesada para ${recoveryEmail.trim()}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // Manejo de Registro en Simulador
  const handleWebRegister = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    const errors: Record<string, string> = {};

    const lettersOnly = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!regNombre.trim()) {
      errors.nombre = 'El nombre es obligatorio.';
    } else if (regNombre.trim().length < 2) {
      errors.nombre = 'Mínimo 2 caracteres.';
    } else if (!lettersOnly.test(regNombre)) {
      errors.nombre = 'Solo debe contener letras.';
    }

    if (!regApellido.trim()) {
      errors.apellido = 'El apellido es obligatorio.';
    } else if (regApellido.trim().length < 2) {
      errors.apellido = 'Mínimo 2 caracteres.';
    } else if (!lettersOnly.test(regApellido)) {
      errors.apellido = 'Solo debe contener letras.';
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      errors.email = 'Correo electrónico inválido.';
    }

    if (!regPassword || regPassword.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña.';
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setRegErrors(errors);
    if (Object.keys(errors).length > 0) {
      setAuthError('Por favor, completa correctamente los campos obligatorios.');
      return;
    }

    setAuthLoading(true);
    try {
      const fullName = `${regNombre.trim()} ${regApellido.trim()}`;
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          password: regPassword,
          fullName,
          firstName: regNombre.trim(),
          lastName: regApellido.trim(),
          gender: regGenero,
          birthDate: regFechaNacimiento,
          phone: regTelefono,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setParentToken(data.data.token);
        setParentUser(data.data.user);
        addLog('POST', `Usuario registrado exitosamente: ${fullName}`);
        setAppMode('PARENT');
      } else {
        throw new Error(data.message || 'Error al registrar usuario.');
      }
    } catch (e: any) {
      setAuthError(e.message || 'Error al crear la cuenta.');
      addLog('INFO', `Falla en registro: ${e.message}`);
    } finally {
      setAuthLoading(false);
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
    } catch (e) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setPairingCode(code);
      addLog('POST', `Código de pareamiento local generado: ${code}`);
    }
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
              className={`scenario-btn ${appMode === 'ONBOARDING' ? 'active' : ''}`}
              onClick={() => {
                setAppMode('ONBOARDING');
                setOnbPlaying(false);
              }}
            >
              <span>🌟 Onboarding & Videos</span>
              <span>→</span>
            </button>
            <button
              className={`scenario-btn ${appMode === 'WELCOME' ? 'active' : ''}`}
              onClick={() => setAppMode('WELCOME')}
            >
              <span>🚪 Selección de Modo</span>
              <span>→</span>
            </button>
            <button
              className={`scenario-btn ${appMode === 'LOGIN' ? 'active' : ''}`}
              onClick={() => {
                setAppMode('LOGIN');
                setAuthTab('LOGIN');
                setAuthError(null);
                setAuthSuccess(null);
              }}
            >
              <span>🔐 Pantalla de Login / Auth</span>
              <span>→</span>
            </button>
            <button
              className={`scenario-btn ${appMode === 'PARENT' ? 'active' : ''}`}
              onClick={() => {
                if (!parentToken) {
                  setAppMode('LOGIN');
                  setAuthTab('LOGIN');
                } else {
                  setAppMode('PARENT');
                }
              }}
            >
              <span>👨‍👩‍👧‍👦 Panel Responsable {parentToken ? '✓' : '(Requiere Login)'}</span>
              <span>→</span>
            </button>
            <button
              className={`scenario-btn ${appMode === 'CHILD' ? 'active' : ''}`}
              onClick={() => setAppMode('CHILD')}
            >
              <span>📱 Dispositivo Protegido</span>
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
            {parentUser && (
              <div>• <strong>Usuario:</strong> <code>{parentUser.fullName}</code></div>
            )}
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

            <div className="phone-content" style={{ overflowY: 'auto' }}>
              {/* ======================================================== */}
              {/* PANTALLA 0: ONBOARDING & VIDEOS EXPLICATIVOS             */}
              {/* ======================================================== */}
              {appMode === 'ONBOARDING' && (() => {
                const ONB_VIDEOS = [
                  {
                    mode: 'PARENT',
                    badge: 'MODO RESPONSABLE',
                    badgeColor: '#0D6EFD',
                    title: 'Guía para Familias y Tutores',
                    duration: '01:45',
                    totalSec: 105,
                    emoji: '👨‍👩‍👧‍👦',
                    bg: '#0A3871',
                    desc: 'Aprendé a registrar tu cuenta, vincular celulares con QR/PIN en 1 minuto, monitorear en tiempo real y recibir alertas.',
                    highlights: ['Vinculación QR/PIN en 1 minuto', 'Alertas en tiempo real', 'Límites de tiempo de pantalla', 'Privacidad: no lee chats ni fotos'],
                    steps: [
                      { sec: 0, title: '1. Creación de cuenta del tutor', desc: 'Registro seguro con email.' },
                      { sec: 25, title: '2. Código de vinculación', desc: 'Generá un QR o PIN de 6 dígitos.' },
                      { sec: 55, title: '3. Panel de control en vivo', desc: 'Supervisá intentos bloqueados.' },
                      { sec: 85, title: '4. Límites de horarios', desc: 'Fomentá el descanso escolar.' }
                    ]
                  },
                  {
                    mode: 'CHILD',
                    badge: 'MODO DISPOSITIVO MENOR',
                    badgeColor: '#F59E0B',
                    title: 'Protección en el Celular del Menor',
                    duration: '01:30',
                    totalSec: 90,
                    emoji: '📱',
                    bg: '#78350F',
                    desc: 'Activación del escudo silencioso con lista oficial LOTBA y pantalla pedagógica de advertencia.',
                    highlights: ['Bloqueo contra 1.000+ sitios de apuestas', 'Sin ralentizar la conexión', 'Pantalla educativa: "Sos menor"', 'Anti-desinstalación con aviso al tutor'],
                    steps: [
                      { sec: 0, title: '1. Vinculación con PIN', desc: 'Ingreso rápido del código de 6 dígitos.' },
                      { sec: 22, title: '2. Activación escudo LOTBA', desc: 'Filtro local VPN sin intermediarios.' },
                      { sec: 50, title: '3. Pantalla pedagógica', desc: 'Aviso reflexivo al detectar casinos.' },
                      { sec: 72, title: '4. Telemetría segura', desc: 'Reporte preventivo al responsable.' }
                    ]
                  },
                  {
                    mode: 'CHILD',
                    badge: 'MODO ADULTO (AUTOCONTROL)',
                    badgeColor: '#8B5CF6',
                    title: 'Autoprotección y Prevención Adultos',
                    duration: '02:00',
                    totalSec: 120,
                    emoji: '💜',
                    bg: '#4C1D95',
                    desc: 'Herramientas de autoprotección voluntaria, barreras contra el juego compulsivo y acceso a líneas confidenciales 0800.',
                    highlights: ['Bloqueo voluntario de apuestas', 'Límites estrictos de uso nocturno', 'Pantalla de contención y pausa', 'Línea oficial gratuita 0800-444-5682'],
                    steps: [
                      { sec: 0, title: '1. Activación voluntaria', desc: 'Blindaje personal preventivo.' },
                      { sec: 30, title: '2. Configuración de límites', desc: 'Restricción en horarios de riesgo.' },
                      { sec: 65, title: '3. Pausa reflexiva', desc: 'Toma de conciencia y contención.' },
                      { sec: 95, title: '4. Ayuda confidencial 24/7', desc: 'Orientación especializada oficial.' }
                    ]
                  }
                ];
                const active = ONB_VIDEOS[onbIndex];
                const curStep = [...active.steps].reverse().find((s) => onbSeconds >= s.sec) || active.steps[0];
                const pct = Math.min(100, Math.round((onbSeconds / active.totalSec) * 100));
                const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

                return (
                  <div style={{ padding: '16px 14px' }}>
                    {/* Barra superior */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#E2E8F0', padding: '3px 8px', borderRadius: '6px', color: '#475569' }}>
                        GUÍA DE INICIO • 3 MODOS
                      </span>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        onClick={() => setAppMode('WELCOME')}
                      >
                        Saltar a Modos ✕
                      </button>
                    </div>

                    {/* Hero Onboarding */}
                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                      <div style={{ display: 'inline-block', backgroundColor: '#E7F1FF', border: '1px solid #B6D4FE', padding: '4px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: '700', color: '#0A58CA', marginBottom: '8px' }}>
                        🏛️ Oficial • LOTBA / GCBA
                      </div>
                      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--phone-text)', lineHeight: '1.3' }}>
                        Protección Integral y Cuidado Familiar
                      </h2>
                      <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', marginTop: '4px', lineHeight: '1.4' }}>
                        Prevení el acceso a plataformas de apuestas y construí un entorno digital seguro y confiable.
                      </p>
                    </div>

                    {/* Banner de Privacidad */}
                    <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '12px', marginBottom: '14px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px' }}>🔒</span>
                        <strong style={{ fontSize: '13px', color: '#166534' }}>Garantía de Privacidad Total</strong>
                      </div>
                      <p style={{ fontSize: '11px', color: '#15803D', lineHeight: '1.4', margin: '4px 0 8px' }}>
                        <strong>No leemos tus chats de WhatsApp, ni fotos ni llamadas.</strong> Funciona mediante filtrado local de red (DNS) contra sitios no autorizados de LOTBA.
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>✓ Sin espionaje de chats</span>
                        <span style={{ fontSize: '10px', backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>✓ Base oficial LOTBA</span>
                        <span style={{ fontSize: '10px', backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>✓ Encriptación segura</span>
                      </div>
                    </div>

                    {/* Carrusel Selector */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--phone-text)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🎬</span> Videos Explicativos Guiados
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--phone-subtext)', marginBottom: '8px' }}>
                        Mirá cómo funciona paso a paso según cada modo
                      </div>

                      {/* Tabs */}
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                        {ONB_VIDEOS.map((v, i) => (
                          <button
                            key={i}
                            style={{
                              flex: 1,
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: i === onbIndex ? `2px solid ${v.badgeColor}` : '1px solid #E2E8F0',
                              backgroundColor: i === onbIndex ? v.badgeColor : '#F1F5F9',
                              color: i === onbIndex ? '#FFFFFF' : '#475569',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onClick={() => {
                              setOnbIndex(i);
                              setOnbPlaying(false);
                              setOnbSeconds(0);
                            }}
                          >
                            <span>{v.emoji}</span>
                            <span>{i === 0 ? 'Responsable' : i === 1 ? 'Niños' : 'Adultos'}</span>
                          </button>
                        ))}
                      </div>

                      {/* Video Player Card */}
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                        <div style={{ backgroundColor: active.bg, padding: '14px', color: '#FFFFFF', minHeight: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ backgroundColor: active.badgeColor, color: '#FFFFFF', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                              {active.badge}
                            </span>
                            <span style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', fontSize: '10px', padding: '3px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              {onbPlaying ? `${fmt(onbSeconds)} / ${active.duration}` : active.duration}
                            </span>
                          </div>

                          <div style={{ textAlign: 'center', margin: '10px 0' }}>
                            <div style={{ fontSize: '36px' }}>{active.emoji}</div>
                            <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>{active.title}</div>

                            {onbPlaying ? (
                              <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '6px', padding: '4px 8px', marginTop: '6px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D' }}>{curStep.title}</div>
                                <div style={{ fontSize: '10px', color: '#FFFFFF' }}>{curStep.desc}</div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', marginTop: '4px' }}>
                                {onbSeconds > 0 ? 'Pausado. Presioná play para continuar.' : 'Tocá reproducir para ver la demostración.'}
                              </div>
                            )}

                            <button
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '24px',
                                backgroundColor: onbPlaying ? '#EF4444' : '#FFFFFF',
                                color: onbPlaying ? '#FFFFFF' : '#0F172A',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                marginTop: '10px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                              }}
                              onClick={() => setOnbPlaying(!onbPlaying)}
                            >
                              {onbPlaying ? '⏸' : '▶'}
                            </button>
                          </div>

                          {/* Progress bar */}
                          <div>
                            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: active.badgeColor, transition: 'width 0.3s' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '4px', color: 'rgba(255,255,255,0.8)' }}>
                              <span>{fmt(onbSeconds)}</span>
                              {onbSeconds > 0 && (
                                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setOnbSeconds(0); setOnbPlaying(true); }}>
                                  ↺ Reiniciar
                                </span>
                              )}
                              <span>{active.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* Video metadata */}
                        <div style={{ padding: '12px' }}>
                          <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.4', marginBottom: '8px' }}>
                            {active.desc}
                          </p>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>Puntos clave:</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '10px' }}>
                            {active.highlights.map((h, hi) => (
                              <div key={hi} style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: '#10B981', fontWeight: '800' }}>✓</span>
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso a paso */}
                    <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--phone-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>👣</span> ¿Cómo Funciona Paso a Paso?
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px', display: 'flex', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '12px', backgroundColor: '#0D6EFD', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>1</div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>Seleccioná el Modo según tu Rol</div>
                            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.3' }}>Modo Responsable en tu teléfono, o Modo Protegido en el dispositivo a blindar.</div>
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px', display: 'flex', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '12px', backgroundColor: '#0D6EFD', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>2</div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>Vinculación Rápida y Segura</div>
                            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.3' }}>Escaneá el código QR o ingresá el PIN de 6 dígitos sin exponer cuentas de los chicos.</div>
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px', display: 'flex', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '12px', backgroundColor: '#0D6EFD', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>3</div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>Escudo Oficial LOTBA Activo</div>
                            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.3' }}>Se activa el filtro local que bloquea silenciosamente más de 1.000 sitios de juego clandestino.</div>
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px', display: 'flex', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '12px', backgroundColor: '#0D6EFD', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>4</div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>Supervisión Saludable y Alertas</div>
                            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.3' }}>El tutor recibe alertas ante intentos de ingreso y pacta límites diarios.</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón Comenzar */}
                    <div style={{ textAlign: 'center', margin: '16px 0' }}>
                      <button
                        className="btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: '800' }}
                        onClick={() => setAppMode('WELCOME')}
                      >
                        Comenzar / Seleccionar Modo ➜
                      </button>
                    </div>

                    {/* FAQ */}
                    <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>Preguntas Frecuentes</div>
                      {[
                        { q: '¿La app lee chats de WhatsApp o fotos?', a: 'No. BA Protege+ opera a nivel de red (DNS) y no tiene acceso a mensajes ni multimedia.' },
                        { q: '¿Qué pasa si se intenta desactivar?', a: 'El sistema notifica inmediatamente al teléfono del tutor responsable.' },
                        { q: '¿Tiene algún costo de uso?', a: 'Es un servicio 100% gratuito impulsado por LOTBA y el Gobierno de la Ciudad.' }
                      ].map((faq, fi) => (
                        <div
                          key={fi}
                          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px', marginBottom: '6px', cursor: 'pointer' }}
                          onClick={() => setOnbFaq(onbFaq === fi ? null : fi)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                            <span>{faq.q}</span>
                            <span style={{ fontSize: '10px', color: '#94A3B8' }}>{onbFaq === fi ? '▲' : '▼'}</span>
                          </div>
                          {onbFaq === fi && (
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #F1F5F9', lineHeight: '1.4' }}>
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Ayuda 0800 */}
                    <div style={{ backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#3730A3' }}>Línea de Ayuda al Jugador Problemático</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#4338CA', margin: '2px 0' }}>0800-444-5682</div>
                      <div style={{ fontSize: '10px', color: '#6366F1' }}>Gratuita, anónima y disponible 24hs (LOTBA)</div>
                    </div>
                  </div>
                );
              })()}

              {/* ======================================================== */}
              {/* PANTALLA 1: SELECCIÓN DE MODO (BIENVENIDA)               */}
              {/* ======================================================== */}
              {appMode === 'WELCOME' && (
                <>
                  <div className="app-header">
                    <h1>BA Protege+</h1>
                    <p>Protección Digital contra Apuestas Clandestinas</p>
                  </div>
                  <div className="app-body">
                    {/* Banner para abrir Onboarding y Videos */}
                    <div
                      style={{
                        backgroundColor: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        marginBottom: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => {
                        setAppMode('ONBOARDING');
                        setOnbPlaying(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🎬</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#3730A3' }}>
                            ¿Primera vez? Mirá el Onboarding
                          </div>
                          <div style={{ fontSize: '11px', color: '#6366F1' }}>
                            3 videos explicativos para cada modo
                          </div>
                        </div>
                      </div>
                      <span style={{ color: '#4F46E5', fontWeight: '700' }}>➔</span>
                    </div>
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div className="auth-logo-badge">
                        <div className="auth-lock-icon">
                          <div className="auth-lock-shackle"></div>
                          <div className="auth-lock-keyhole"></div>
                        </div>
                      </div>
                      <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--phone-text)' }}>
                        Selecciona el Modo de Operación
                      </h2>
                      <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', marginTop: '4px' }}>
                        Control Parental Oficial y Protección Digital
                      </p>
                    </div>

                    <div className="app-card" style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>👨‍👩‍👧‍👦</div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--phone-text)' }}>
                        Modo Responsable
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', margin: '6px 0 14px' }}>
                        Supervisa el estado de protección de los celulares de tus hijos y administra alertas.
                      </p>
                      <button
                        className="btn-primary"
                        onClick={() => {
                          if (parentToken) {
                            setAppMode('PARENT');
                          } else {
                            setAppMode('LOGIN');
                            setAuthTab('LOGIN');
                          }
                        }}
                      >
                        Continuar como Responsable
                      </button>
                    </div>

                    <div className="app-card">
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>📱</div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--phone-text)' }}>
                        Modo Dispositivo Protegido (Menor)
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', margin: '6px 0 14px' }}>
                        Activa el motor de filtrado local VPN con la lista oficial LOTBA y reporta telemetría.
                      </p>
                      <button className="btn-secondary" onClick={() => setAppMode('CHILD')}>
                        Configurar este Dispositivo
                      </button>
                    </div>

                    <div className="app-card" style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>💜</div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--phone-text)' }}>
                        Modo Adulto (Autoprotección)
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', margin: '6px 0 14px' }}>
                        Protección voluntaria para mayores de edad contra plataformas de apuestas y acceso a ayuda.
                      </p>
                      <button
                        className="btn-secondary"
                        style={{ borderColor: '#8B5CF6', color: '#6D28D9' }}
                        onClick={() => setAppMode('CHILD')}
                      >
                        Activar Autoprotección
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ======================================================== */}
              {/* PANTALLA 2: LOGIN / REGISTRO / RECUPERACIÓN              */}
              {/* ======================================================== */}
              {appMode === 'LOGIN' && (
                <div style={{ padding: '16px 14px' }}>
                  {/* Botón Volver */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                      onClick={() => setAppMode('WELCOME')}
                    >
                      ‹ Inicio
                    </button>
                  </div>

                  {/* Logo Genérico con Candado Abierto */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div className="auth-logo-badge">
                      <div className="auth-lock-icon">
                        <div className="auth-lock-shackle"></div>
                        <div className="auth-lock-keyhole"></div>
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--phone-text)' }}>
                      BA Protege<span style={{ color: 'var(--primary)' }}>+</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--phone-subtext)', marginTop: '2px' }}>
                      Control Parental y Protección Digital
                    </div>
                  </div>

                  {/* Tarjeta de Formulario */}
                  <div className="app-card">
                    {/* Alertas */}
                    {authError && <div className="auth-alert-box error">⚠️ {authError}</div>}
                    {authSuccess && <div className="auth-alert-box success">✅ {authSuccess}</div>}

                    {/* VISTA A: INICIAR SESIÓN */}
                    {authTab === 'LOGIN' && (
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--phone-text)', marginBottom: '4px', textAlign: 'center' }}>
                          Iniciar Sesión
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', textAlign: 'center', marginBottom: '16px' }}>
                          Acceso para padres y tutores responsables
                        </p>

                        <div className="auth-input-group">
                          <label className="auth-label">Correo Electrónico</label>
                          <div className="auth-input-wrapper">
                            <input
                              type="email"
                              className="auth-input-field"
                              placeholder="ejemplo@baprotege.gob.ar"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                            />
                            {loginEmail.length > 0 && (
                              <button
                                type="button"
                                className="auth-btn-icon"
                                onClick={() => setLoginEmail('')}
                                title="Borrar correo"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="auth-input-group">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label className="auth-label" style={{ margin: 0 }}>Contraseña</label>
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                              onClick={() => {
                                setAuthTab('RECOVERY');
                                setRecoverySent(false);
                                setRecoveryEmail(loginEmail);
                                setAuthError(null);
                                setAuthSuccess(null);
                              }}
                            >
                              ¿Olvidaste tu contraseña?
                            </button>
                          </div>
                          <div className="auth-input-wrapper">
                            <input
                              type={showLoginPassword ? 'text' : 'password'}
                              className="auth-input-field"
                              placeholder="••••••••"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                            />
                            <div className="auth-input-actions">
                              {loginPassword.length > 0 && (
                                <button
                                  type="button"
                                  className="auth-btn-icon"
                                  onClick={() => setLoginPassword('')}
                                  title="Borrar contraseña"
                                >
                                  ✕
                                </button>
                              )}
                              <button
                                type="button"
                                className="auth-btn-icon"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                              >
                                {showLoginPassword ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn-primary"
                          style={{ marginTop: '12px' }}
                          onClick={handleWebLogin}
                          disabled={authLoading}
                        >
                          {authLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>

                        <button
                          type="button"
                          style={{
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '11px',
                            fontWeight: '600',
                            marginTop: '10px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setLoginEmail('tutor@baprotege.gob.ar');
                            setLoginPassword('password123');
                          }}
                        >
                          ⚡ Rellenar credenciales demo
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 10px' }}>
                          <div style={{ flex: 1, height: '1px', background: 'var(--phone-border)' }}></div>
                          <span style={{ padding: '0 8px', fontSize: '11px', color: 'var(--phone-subtext)' }}>o</span>
                          <div style={{ flex: 1, height: '1px', background: 'var(--phone-border)' }}></div>
                        </div>

                        <button
                          type="button"
                          style={{
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            fontSize: '12px',
                            color: 'var(--phone-subtext)',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                          onClick={() => {
                            setAuthTab('REGISTER');
                            setAuthError(null);
                            setAuthSuccess(null);
                            setRegErrors({});
                          }}
                        >
                          ¿No tienes una cuenta? <strong style={{ color: 'var(--primary)' }}>Crear cuenta</strong>
                        </button>
                      </div>
                    )}

                    {/* VISTA B: RECUPERAR CONTRASEÑA */}
                    {authTab === 'RECOVERY' && (
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--phone-text)', marginBottom: '4px', textAlign: 'center' }}>
                          Recuperar Contraseña
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--phone-subtext)', textAlign: 'center', marginBottom: '16px' }}>
                          Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para restablecer tu acceso.
                        </p>

                        {!recoverySent && (
                          <div className="auth-input-group">
                            <label className="auth-label">Correo Electrónico Registrado</label>
                            <div className="auth-input-wrapper">
                              <input
                                type="email"
                                className="auth-input-field"
                                placeholder="ejemplo@baprotege.gob.ar"
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                              />
                              {recoveryEmail.length > 0 && (
                                <button
                                  type="button"
                                  className="auth-btn-icon"
                                  onClick={() => setRecoveryEmail('')}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {!recoverySent && (
                          <button
                            className="btn-primary"
                            style={{ marginTop: '10px' }}
                            onClick={handleWebRecovery}
                            disabled={authLoading}
                          >
                            {authLoading ? 'Enviando...' : 'Enviar Instrucciones de Recuperación'}
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ marginTop: '10px' }}
                          onClick={() => {
                            setAuthTab('LOGIN');
                            setAuthError(null);
                            setAuthSuccess(null);
                          }}
                        >
                          Volver a Iniciar Sesión
                        </button>
                      </div>
                    )}

                    {/* VISTA C: CREAR CUENTA / REGISTRO */}
                    {authTab === 'REGISTER' && (
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--phone-text)', marginBottom: '4px', textAlign: 'center' }}>
                          Crear Cuenta Responsable
                        </h2>
                        <p style={{ fontSize: '11px', color: 'var(--phone-subtext)', textAlign: 'center', marginBottom: '14px' }}>
                          Registra tus datos personales para administrar la protección de tus hijos.
                        </p>

                        {/* Campo 1: Nombre */}
                        <div className="auth-input-group">
                          <label className="auth-label">Nombre *</label>
                          <div className={`auth-input-wrapper ${regErrors.nombre ? 'error' : ''}`}>
                            <input
                              type="text"
                              className="auth-input-field"
                              placeholder="Ej. Juan"
                              value={regNombre}
                              onChange={(e) => setRegNombre(e.target.value)}
                            />
                            {regNombre.length > 0 && (
                              <button
                                type="button"
                                className="auth-btn-icon"
                                onClick={() => setRegNombre('')}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          {regErrors.nombre && <div className="auth-error-hint">{regErrors.nombre}</div>}
                        </div>

                        {/* Campo 2: Apellido */}
                        <div className="auth-input-group">
                          <label className="auth-label">Apellido *</label>
                          <div className={`auth-input-wrapper ${regErrors.apellido ? 'error' : ''}`}>
                            <input
                              type="text"
                              className="auth-input-field"
                              placeholder="Ej. Pérez"
                              value={regApellido}
                              onChange={(e) => setRegApellido(e.target.value)}
                            />
                            {regApellido.length > 0 && (
                              <button
                                type="button"
                                className="auth-btn-icon"
                                onClick={() => setRegApellido('')}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          {regErrors.apellido && <div className="auth-error-hint">{regErrors.apellido}</div>}
                        </div>

                        {/* Campo 3: Género en Carrusel */}
                        <div className="auth-input-group">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label className="auth-label" style={{ margin: 0 }}>Género</label>
                            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>Desliza para elegir ▸</span>
                          </div>
                          <div className="auth-carousel-track">
                            {(
                              [
                                { id: 'Masculino', label: '👨 Masculino' },
                                { id: 'Femenino', label: '👩 Femenino' },
                                { id: 'Otro', label: '🧑 Otro' },
                                { id: 'No informado', label: '⚪ No informado' },
                              ] as { id: GenderOption; label: string }[]
                            ).map((item) => (
                              <button
                                type="button"
                                key={item.id}
                                className={`auth-carousel-card ${regGenero === item.id ? 'active' : ''}`}
                                onClick={() => setRegGenero(item.id)}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                          <div className="auth-carousel-dots">
                            {(['Masculino', 'Femenino', 'Otro', 'No informado'] as GenderOption[]).map((opt) => (
                              <div
                                key={opt}
                                className={`auth-dot ${regGenero === opt ? 'active' : ''}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Campo 4: Fecha de Nacimiento */}
                        <div className="auth-input-group">
                          <label className="auth-label">Fecha de Nacimiento</label>
                          <div className="auth-input-wrapper">
                            <input
                              type="text"
                              className="auth-input-field"
                              placeholder="DD/MM/AAAA"
                              maxLength={10}
                              value={regFechaNacimiento}
                              onChange={(e) => setRegFechaNacimiento(formatBirthDate(e.target.value))}
                            />
                            {regFechaNacimiento.length > 0 && (
                              <button
                                type="button"
                                className="auth-btn-icon"
                                onClick={() => setRegFechaNacimiento('')}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Campo 5: Teléfono */}
                        <div className="auth-input-group">
                          <label className="auth-label">Teléfono</label>
                          <div className="auth-input-wrapper">
                            <input
                              type="tel"
                              className="auth-input-field"
                              placeholder="11 2345-6789"
                              maxLength={13}
                              value={regTelefono}
                              onChange={(e) => setRegTelefono(formatPhone(e.target.value))}
                            />
                            {regTelefono.length > 0 && (
                              <button
                                type="button"
                                className="auth-btn-icon"
                                onClick={() => setRegTelefono('')}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Correo Electrónico */}
                        <div className="auth-input-group">
                          <label className="auth-label">Correo Electrónico *</label>
                          <div className={`auth-input-wrapper ${regErrors.email ? 'error' : ''}`}>
                            <input
                              type="email"
                              className="auth-input-field"
                              placeholder="tutor@ejemplo.com"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                            />
                            {regEmail.length > 0 && (
                              <button
                                type="button"
                                className="auth-btn-icon"
                                onClick={() => setRegEmail('')}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          {regErrors.email && <div className="auth-error-hint">{regErrors.email}</div>}
                        </div>

                        {/* Contraseña */}
                        <div className="auth-input-group">
                          <label className="auth-label">Contraseña (mínimo 6 caracteres) *</label>
                          <div className={`auth-input-wrapper ${regErrors.password ? 'error' : ''}`}>
                            <input
                              type={showRegPassword ? 'text' : 'password'}
                              className="auth-input-field"
                              placeholder="Mínimo 6 caracteres"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                            />
                            <div className="auth-input-actions">
                              {regPassword.length > 0 && (
                                <button
                                  type="button"
                                  className="auth-btn-icon"
                                  onClick={() => setRegPassword('')}
                                  title="Borrar contraseña"
                                >
                                  ✕
                                </button>
                              )}
                              <button
                                type="button"
                                className="auth-btn-icon"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                              >
                                {showRegPassword ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </div>
                          {regErrors.password && <div className="auth-error-hint">{regErrors.password}</div>}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="auth-input-group">
                          <label className="auth-label">Confirmar Contraseña *</label>
                          <div className={`auth-input-wrapper ${regErrors.confirmPassword ? 'error' : ''}`}>
                            <input
                              type={showRegConfirmPassword ? 'text' : 'password'}
                              className="auth-input-field"
                              placeholder="Repite tu contraseña"
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                            />
                            <div className="auth-input-actions">
                              {regConfirmPassword.length > 0 && (
                                <button
                                  type="button"
                                  className="auth-btn-icon"
                                  onClick={() => setRegConfirmPassword('')}
                                  title="Borrar contraseña"
                                >
                                  ✕
                                </button>
                              )}
                              <button
                                type="button"
                                className="auth-btn-icon"
                                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                              >
                                {showRegConfirmPassword ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </div>
                          {regErrors.confirmPassword && <div className="auth-error-hint">{regErrors.confirmPassword}</div>}
                        </div>

                        <button
                          className="btn-primary"
                          style={{ marginTop: '12px' }}
                          onClick={handleWebRegister}
                          disabled={authLoading}
                        >
                          {authLoading ? 'Creando cuenta...' : 'Crear Cuenta e Ingresar'}
                        </button>

                        <button
                          type="button"
                          style={{
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            fontSize: '12px',
                            color: 'var(--phone-subtext)',
                            marginTop: '12px',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                          onClick={() => {
                            setAuthTab('LOGIN');
                            setAuthError(null);
                            setAuthSuccess(null);
                          }}
                        >
                          ¿Ya tienes una cuenta? <strong style={{ color: 'var(--primary)' }}>Iniciar Sesión</strong>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* PANTALLA 3: MODO RESPONSABLE (DASHBOARD)                 */}
              {/* ======================================================== */}
              {appMode === 'PARENT' && (
                <>
                  <div className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h1>Panel Responsable</h1>
                      <p>{parentUser?.fullName || 'Tutor Responsable'}</p>
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      onClick={() => {
                        setParentToken(null);
                        setParentUser(null);
                        setAppMode('WELCOME');
                      }}
                    >
                      Cerrar Sesión
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
                                  {isActive ? '🟢 PROTEGIDO' : '⚠️ ATENCIÓN'}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--phone-subtext)', marginTop: '4px' }}>
                                Asignado a: {dev.childName || 'Menor'} • Batería: {dev.status?.batteryLevel || 85}%
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
              {/* PANTALLA 4: MODO DISPOSITIVO PROTEGIDO                  */}
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
