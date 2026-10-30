// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Web Simulator (Simulador Interactivo de Pruebas - Refactorizado)
// Archivo: src/web/WebSimulator.tsx
// Descripción: Componente principal del simulador web compuesto por sub-módulos
//              estructurados en src/web/components/ (Sidebar, Onboarding, Welcome,
//              Auth, Pairing, Permissions, ParentDashboard y ProtectedDevice).
// ==============================================================================

import React, { useState, useEffect } from 'react';
import './simulator.css';
import { StudioSidebar, LogEntry, SimulatorAppMode } from './components/StudioSidebar';
import { OnboardingStep, OnboardingVideo } from './components/OnboardingStep';
import { WelcomeStep } from './components/WelcomeStep';
import { AuthStep } from './components/AuthStep';
import { PairingStep } from './components/PairingStep';
import { PermissionsStep, WebPermissionsState } from './components/PermissionsStep';
import { ParentDashboardStep } from './components/ParentDashboardStep';
import { ProtectedDeviceStep } from './components/ProtectedDeviceStep';
import { calculateAge } from '../utils/age';
import { CustomBlockedDomain } from '../types';
import { apiService } from '../services/api.service';

const API_BASE = 'http://localhost:3000/api';
const MAX_PARENT_DEVICES = 5;

type AuthTab = 'LOGIN' | 'RECOVERY' | 'REGISTER';
type GenderOption = 'Masculino' | 'Femenino' | 'Otro' | 'No informado';

export const WebSimulator: React.FC = () => {
  // 1) Paso 1 por defecto: ONBOARDING
  const [appMode, setAppMode] = useState<SimulatorAppMode>('ONBOARDING');
  const [targetFlow, setTargetFlow] = useState<'PARENT' | 'CHILD'>('PARENT');
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiConnected, setApiConnected] = useState(false);

  // Estados de Permisos del Dispositivo
  const [webPermissions, setWebPermissions] = useState<WebPermissionsState>({
    vpn: false,
    accessibility: false,
    notifications: true,
    batteryOptimization: false,
    location: false,
  });

  // Estados de Onboarding y Videos Explicativos
  const [onbIndex, setOnbIndex] = useState(0);
  const [onbPlaying, setOnbPlaying] = useState(false);
  const [onbSeconds, setOnbSeconds] = useState(0);

  // Estados de Autenticación
  const [authTab, setAuthTab] = useState<AuthTab>('LOGIN');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Campos Login
  const [loginEmail, setLoginEmail] = useState('tutor@baprotege.gob.ar');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Campos Recuperación
  const [recoveryEmail, setRecoveryEmail] = useState('');

  // Campos Registro
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regGenero, setRegGenero] = useState<GenderOption>('No informado');
  const [regFechaNacimiento, setRegFechaNacimiento] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Campos Emparejamiento
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [pairedChildName] = useState('Mateo');

  // Estados del Modo Responsable
  const [parentUser, setParentUser] = useState<any>(null);
  const [parentToken, setParentToken] = useState<string | null>(null);
  const [devices] = useState<any[]>([
    {
      id: 'dev-1',
      deviceName: 'Samsung Galaxy A54 (Mateo)',
      childName: 'Mateo',
      status: { effectiveStatus: 'ACTIVE' },
      permissions: { vpn: true, accessibility: true, notifications: true, batteryOptimization: true, grantedCount: 4 },
    },
    {
      id: 'dev-2',
      deviceName: 'Xiaomi Redmi Note 12 (Sofía)',
      childName: 'Sofía',
      status: { effectiveStatus: 'ACTIVE' },
      permissions: { vpn: true, accessibility: false, notifications: true, batteryOptimization: true, grantedCount: 3 },
    },
  ]);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  // Estados de Sitios Bloqueados Personalizados (CRUD)
  const [customSites, setCustomSites] = useState<CustomBlockedDomain[]>([
    {
      id: 'site-1',
      domain: 'casino-clandestino.net',
      category: 'Apuestas',
      isActive: true,
      applyToAll: true,
      deviceIds: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'site-2',
      domain: 'red-social-peligrosa.org',
      category: 'Redes Sociales',
      isActive: true,
      applyToAll: true,
      deviceIds: [],
      createdAt: new Date().toISOString(),
    },
  ]);

  // Estados de Autocontrol / Autoprotección del Tutor
  const [selfControlActive, setSelfControlActive] = useState(false);
  const [selfControlDeactivationAvailableAt, setSelfControlDeactivationAvailableAt] = useState<number | null>(null);
  const [selfControlUnlockedAt, setSelfControlUnlockedAt] = useState<number | null>(null);
  const [selfControlAutoRelockAt, setSelfControlAutoRelockAt] = useState<number | null>(null);
  const [showSelfControlModal, setShowSelfControlModal] = useState(false);
  const [selfControlStep, setSelfControlStep] = useState<1 | 2>(1);

  // Estados del Modo Dispositivo Protegido
  const [isVpnActive, setIsVpnActive] = useState(true);
  const [lotbaDomains, setLotbaDomains] = useState<string[]>([]);
  const [lotbaVersion, setLotbaVersion] = useState(4);
  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);
  const [testDomain, setTestDomain] = useState('apuestas-online-ilegal.bet');

  // Teclado PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');

  const grantedPermsCount = [
    webPermissions.vpn,
    webPermissions.accessibility,
    webPermissions.notifications,
    webPermissions.batteryOptimization,
    webPermissions.location,
  ].filter(Boolean).length;

  // Registrar entrada en consola de telemetría
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

  // Health check e inicialización
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
        const sample = [
          'apuestas-online-ilegal.bet',
          'casino-clandestino-ba.com',
          'ruleta-sin-control.bet',
          'poker-no-regulado.net',
          'slots-clandestinas.xyz',
        ];
        setLotbaDomains(sample);
      });

    // Cargar lista personalizada de sitios bloqueados
    apiService.getCustomBlocklist()
      .then((res) => {
        if (res.data?.domains && res.data.domains.length > 0) {
          setCustomSites(res.data.domains);
          addLog('GET', `Lista personalizada cargada: ${res.data.domains.length} sitios`);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddCustomSite = async (domain: string, category: string) => {
    try {
      const res = await apiService.addCustomBlockedSite(domain, category);
      setCustomSites((prev) => [res.data, ...prev.filter((d) => d.id !== res.data.id)]);
      addLog('POST', `Sitio agregado a lista personalizada: ${res.data.domain} (${res.data.category || category})`);
    } catch (e: any) {
      alert(e.message || 'No se pudo agregar el dominio');
    }
  };

  const handleUpdateCustomSite = async (id: string, data: { domain?: string; category?: string; isActive?: boolean }) => {
    try {
      const res = await apiService.updateCustomBlockedSite(id, data);
      setCustomSites((prev) => prev.map((s) => (s.id === id ? res.data : s)));
      addLog('POST', `Sitio personalizado actualizado: ${res.data.domain}`);
    } catch (e: any) {
      alert(e.message || 'No se pudo actualizar el dominio');
    }
  };

  const handleDeleteCustomSite = async (id: string) => {
    try {
      const site = customSites.find((s) => s.id === id);
      await apiService.deleteCustomBlockedSite(id);
      setCustomSites((prev) => prev.filter((s) => s.id !== id));
      addLog('INFO', `Sitio eliminado de lista personalizada: ${site?.domain || id}`);
    } catch (e: any) {
      alert(e.message || 'No se pudo eliminar el dominio');
    }
  };

  // Simulación reproductor video tutorial
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

  // Manejo de Login del Responsable -> Avanza a Permisos (Paso 4)
  const handleWebLogin = async () => {
    setAuthError(null);
    if (!loginEmail.trim() || !loginPassword) {
      setAuthError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

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
        addLog('POST', `Autenticación exitosa como ${data.data.user.fullName}`);
        setTargetFlow('PARENT');
        setAppMode('PERMISSIONS');
      } else {
        throw new Error(data.message || 'Credenciales inválidas.');
      }
    } catch (e: any) {
      const mockUser = { fullName: 'Tutor Responsable', email: loginEmail };
      setParentToken('mock-jwt-token');
      setParentUser(mockUser);
      addLog('POST', `Autenticación exitosa en modo DEMO como ${mockUser.fullName}`);
      setTargetFlow('PARENT');
      setAppMode('PERMISSIONS');
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

    try {
      await fetch(`${API_BASE}/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim() }),
      });
      setAuthSuccess(`Hemos enviado las instrucciones para restablecer tu contraseña a ${recoveryEmail.trim()}.`);
      addLog('POST', `Solicitud de recuperación procesada para ${recoveryEmail.trim()}`);
    } catch (e: any) {
      setAuthSuccess(`Hemos enviado las instrucciones para restablecer tu contraseña a ${recoveryEmail.trim()}.`);
      addLog('POST', `Solicitud de recuperación procesada para ${recoveryEmail.trim()}`);
    }
  };

  // Manejo de Registro
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
      errors.password = 'Mínimo 6 caracteres.';
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña.';
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!regFechaNacimiento.trim()) {
      errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria para verificar mayoría de edad (+18).';
    } else if (regFechaNacimiento.length !== 10) {
      errors.fechaNacimiento = 'Formato inválido. Debe ser DD/MM/AAAA.';
    } else {
      const age = calculateAge(regFechaNacimiento);
      if (age === null) {
        errors.fechaNacimiento = 'Fecha de nacimiento inválida.';
      } else if (age < 18) {
        errors.fechaNacimiento = 'Solo personas adultas (+18) pueden registrarse en el Modo Responsable.';
      }
    }

    setRegErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

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
        setTargetFlow('PARENT');
        setAppMode('PERMISSIONS');
      } else {
        throw new Error(data.message || 'Error al registrar usuario.');
      }
    } catch (e: any) {
      const fullName = `${regNombre.trim()} ${regApellido.trim()}`;
      setParentToken('mock-jwt-token-registered');
      setParentUser({ fullName, email: regEmail.trim() });
      addLog('POST', `Usuario registrado en modo DEMO: ${fullName}`);
      setTargetFlow('PARENT');
      setAppMode('PERMISSIONS');
    }
  };

  // Manejo de Emparejamiento por Código -> Avanza a Permisos (Paso 4)
  const handleWebPairing = (overrideCode?: string) => {
    const codeToUse = (overrideCode || pairingCodeInput).trim();
    if (codeToUse.length !== 6) {
      alert('Ingresa el código numérico de 6 dígitos (123456 para Menor o 654321 para Adulto).');
      return;
    }

    const flowMode: 'CHILD' | 'ADULT' = codeToUse === '654321' ? 'ADULT' : 'CHILD';
    setTargetFlow(flowMode);
    setAppMode('PERMISSIONS');
    addLog('POST', `Emparejamiento exitoso con código ${codeToUse} en modo ${flowMode === 'ADULT' ? 'ADULTO' : 'MENOR'}`);
  };

  const handleGeneratePairing = async () => {
    if (devices.length >= MAX_PARENT_DEVICES) {
      addLog('INFO', `Límite alcanzado: Máximo de ${MAX_PARENT_DEVICES} dispositivos permitidos.`);
      alert(`Límite alcanzado: Un responsable solo puede vincular un máximo de ${MAX_PARENT_DEVICES} dispositivos.`);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/devices/pair/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${parentToken}` },
      });
      const data = await res.json();
      setPairingCode(data.data.pairingCode);
      addLog('POST', `Código generado: ${data.data.pairingCode} (${devices.length + 1}/${MAX_PARENT_DEVICES})`);
    } catch (e) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setPairingCode(code);
      addLog('POST', `Código local generado: ${code} (${devices.length + 1}/${MAX_PARENT_DEVICES})`);
    }
  };

  // Autocontrol / Autoprotección del Tutor
  const handleConfirmEnableSelfControl = () => {
    setSelfControlActive(true);
    setSelfControlDeactivationAvailableAt(null);
    setSelfControlUnlockedAt(null);
    setSelfControlAutoRelockAt(null);
    setShowSelfControlModal(false);
    addLog('POST', '🔒 Autoprotección activada en tu perfil.');
  };

  const handleAttemptDisableSelfControl = () => {
    if (!selfControlActive) return;
    const currentTime = Date.now();

    // 1er Clic: Se muestra el botón "Desactivar autoprotección". Al hacer clic, NO se desactiva.
    // Se inicia un temporizador de 24 horas y la UI avisa que "La desactivación se habilitará en 24 horas".
    if (!selfControlDeactivationAvailableAt) {
      const availableAt = currentTime + 24 * 60 * 60 * 1000;
      setSelfControlDeactivationAvailableAt(availableAt);
      alert('⚠️ La desactivación se habilitará en 24 horas.');
      addLog('INFO', '⏳ Solicitud iniciada: La desactivación se habilitará en 24 horas.');
      return;
    }

    // Aún esperando que pasen las 24 horas
    if (currentTime < selfControlDeactivationAvailableAt) {
      const remainingMs = selfControlDeactivationAvailableAt - currentTime;
      const totalMinutes = Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      const minsPadded = mins.toString().padStart(2, '0');
      alert(`⚠️ La desactivación se habilitará en 24 horas.\nTiempo restante: ${hours}h ${minsPadded}m.`);
      addLog('INFO', `Intento de desactivación denegado. La desactivación se habilitará en ${hours}h ${minsPadded}m.`);
      return;
    }

    // 2do Clic: Pasaron las 24 horas -> Se desbloquea inmediatamente por un pase temporal de 24 horas.
    // Cumplido ese plazo, la autoprotección se vuelve a activar automáticamente.
    const autoRelock = currentTime + 24 * 60 * 60 * 1000;
    setSelfControlActive(false);
    setSelfControlDeactivationAvailableAt(null);
    setSelfControlUnlockedAt(currentTime);
    setSelfControlAutoRelockAt(autoRelock);
    alert('🔓 Autoprotección Desbloqueada: Has confirmado el desbloqueo real. Se otorga un pase temporal de 24 horas. Cumplido ese plazo, la autoprotección se volverá a activar automáticamente.');
    addLog('POST', `🔓 Autoprotección desbloqueada inmediatamente por 24hs (Reactivación automática: ${new Date(autoRelock).toLocaleTimeString()}).`);
  };

  const handleSimulateFastForward24h = () => {
    const currentTime = Date.now();
    if (selfControlActive && selfControlDeactivationAvailableAt) {
      // Simular que pasaron las 24 horas de espera -> Habilita el segundo clic
      setSelfControlDeactivationAvailableAt(currentTime - 1000);
      addLog('INFO', '⏩ [SIMULACIÓN] Pasaron las 24 horas. El botón ahora permite el desbloqueo real con un segundo clic.');
    } else if (selfControlUnlockedAt && selfControlAutoRelockAt) {
      // Simular que pasaron las 24 horas del pase temporal -> Se reactiva automáticamente
      setSelfControlActive(true);
      setSelfControlDeactivationAvailableAt(null);
      setSelfControlUnlockedAt(null);
      setSelfControlAutoRelockAt(null);
      addLog('POST', '🔒 [SIMULACIÓN] Cumplido el plazo de 24 horas del pase temporal. Autoprotección re-activada automáticamente.');
    }
  };

  // Simulación de acceso
  const handleSimulateAccess = () => {
    setBlockedAlert(null);
    const domainToCheck = testDomain.toLowerCase().trim();
    const customSiteMatch = customSites.find((s) => s.isActive && s.domain.toLowerCase() === domainToCheck);
    const isBlocked = !!customSiteMatch || lotbaDomains.includes(domainToCheck) || domainToCheck.includes('apuestas') || domainToCheck.includes('casino');

    if (isVpnActive && isBlocked) {
      setBlockedAlert(domainToCheck);
      const reason = customSiteMatch ? `Lista Personalizada: ${customSiteMatch.category || 'Bloqueado'}` : 'Coincidencia LOTBA';
      addLog('BLOCK', `🛑 [VPN LOCAL] Acceso denegado a: ${domainToCheck} (${reason})`);
    } else {
      addLog('INFO', `🌐 Solicitud permitida para: ${domainToCheck}`);
    }
  };

  // Teclado PIN
  const handlePinInput = (key: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + key;
      setEnteredPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234') {
          setIsVpnActive(!isVpnActive);
          setShowPinModal(false);
          setEnteredPin('');
          addLog('INFO', `PIN 1234 verificado. Estado VPN cambiado a: ${!isVpnActive ? 'ACTIVO' : 'PAUSADO'}`);
        } else {
          alert('PIN incorrecto (Demo: 1234)');
          setEnteredPin('');
        }
      }
    }
  };

  // Datos de los 3 Videos Tutoriales de Onboarding
  const ONB_VIDEOS: OnboardingVideo[] = [
    {
      mode: 'PARENT',
      badge: 'MODO RESPONSABLE',
      badgeColor: '#007AFF',
      title: 'Guía para Familias y Tutores',
      duration: '01:45',
      totalSec: 105,
      emoji: '👨‍👩‍👧‍👦',
      bg: '#0A3871',
      desc: 'Aprendé a registrar tu cuenta, vincular celulares con QR/PIN en 1 minuto, monitorear hasta 5 dispositivos y activar tu Autocontrol de 24hs.',
      highlights: ['Vinculación QR/PIN en 1 minuto', 'Límite de hasta 5 dispositivos', 'Autocontrol con bloqueo de 24hs', 'Privacidad: no lee chats ni fotos'],
      steps: [
        { sec: 0, title: '1. Creación de cuenta del tutor', desc: 'Registro seguro con email y datos.' },
        { sec: 25, title: '2. Código de pareamiento (hasta 5)', desc: 'Generá un PIN temporal de 6 dígitos.' },
        { sec: 55, title: '3. Panel del Responsable', desc: 'Supervisá intentos bloqueados en vivo.' },
        { sec: 85, title: '4. Autocontrol de 24 horas', desc: 'Protección personal con doble confirmación.' },
      ],
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
      desc: 'Activación del escudo silencioso con lista oficial LOTBA y validación de PIN para pausar.',
      highlights: ['Bloqueo contra 1.000+ sitios de apuestas', 'Sin ralentizar la conexión', 'Protección antidesinstalación', 'Validación por PIN del tutor'],
      steps: [
        { sec: 0, title: '1. Vinculación con PIN', desc: 'Ingreso rápido del código de 6 dígitos.' },
        { sec: 22, title: '2. Activación escudo LOTBA', desc: 'Filtro local VPN sin intermediarios.' },
        { sec: 50, title: '3. Pantalla pedagógica', desc: 'Aviso reflexivo al detectar casinos.' },
        { sec: 72, title: '4. Telemetría segura', desc: 'Reporte preventivo al responsable.' },
      ],
    },
    {
      mode: 'ADULT',
      badge: 'MODO DISPOSITIVO ADULTO',
      badgeColor: '#8B5CF6',
      title: 'Prevención en Dispositivo Adulto',
      duration: '02:00',
      totalSec: 120,
      emoji: '💜',
      bg: '#4C1D95',
      desc: 'Herramientas de prevención voluntaria con bloqueo estricto de 24hs y acceso a ayuda confidencial.',
      highlights: ['Bloqueo voluntario de apuestas', 'Doble confirmación obligatoria', 'Bloqueo inflexible por 24 horas', 'Línea oficial gratuita 0800-444-5682'],
      steps: [
        { sec: 0, title: '1. Activación voluntaria', desc: 'Blindaje personal preventivo.' },
        { sec: 30, title: '2. Doble confirmación', desc: 'Validación transparente de 2 pasos.' },
        { sec: 65, title: '3. Bloqueo de 24 horas', desc: 'Inflexible para evitar impulsos.' },
        { sec: 95, title: '4. Ayuda confidencial 24/7', desc: 'Orientación especializada oficial.' },
      ],
    },
  ];

  return (
    <div className="studio-container">
      {/* 1. Sub-componente Lateral: StudioSidebar */}
      <StudioSidebar
        apiConnected={apiConnected}
        apiBase={API_BASE}
        appMode={appMode}
        targetFlow={targetFlow}
        grantedPermsCount={grantedPermsCount}
        devicesCount={devices.length}
        maxDevices={MAX_PARENT_DEVICES}
        selfControlActive={selfControlActive}
        logs={logs}
        onSelectMode={(mode, flow) => {
          setAppMode(mode);
          if (flow) setTargetFlow(flow);
        }}
        onClearLogs={() => setLogs([])}
      />

      {/* Escenario Central: Marco de Teléfono */}
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
              {/* PASO 1: ONBOARDING */}
              {appMode === 'ONBOARDING' && (
                <OnboardingStep
                  initialStep={onboardingStep}
                  onbVideos={ONB_VIDEOS}
                  onbIndex={onbIndex}
                  onbPlaying={onbPlaying}
                  onbSeconds={onbSeconds}
                  onChangeVideoIndex={(idx) => {
                    setOnbIndex(idx);
                    setOnbPlaying(false);
                    setOnbSeconds(0);
                  }}
                  onTogglePlay={() => setOnbPlaying(!onbPlaying)}
                  onNextStep={() => {
                    setOnboardingStep(1);
                    setAppMode('WELCOME');
                  }}
                />
              )}

              {/* PASO 2: SELECCIONAR MODO */}
              {appMode === 'WELCOME' && (
                <WelcomeStep
                  onSelectParentFlow={() => {
                    setTargetFlow('PARENT');
                    setAuthTab('REGISTER');
                    setAppMode('LOGIN');
                  }}
                  onSelectChildFlow={() => {
                    setTargetFlow('CHILD');
                    setAppMode('PAIRING');
                  }}
                  onOpenTutorials={(step = 3) => {
                    setOnboardingStep(step);
                    setAppMode('ONBOARDING');
                  }}
                />
              )}

              {/* PASO 3A: LOGIN / RECOVERY / REGISTER */}
              {appMode === 'LOGIN' && (
                <AuthStep
                  authTab={authTab}
                  authError={authError}
                  authSuccess={authSuccess}
                  onBack={() => setAppMode('WELCOME')}
                  loginEmail={loginEmail}
                  loginPassword={loginPassword}
                  recoveryEmail={recoveryEmail}
                  regNombre={regNombre}
                  regApellido={regApellido}
                  regGenero={regGenero}
                  regFechaNacimiento={regFechaNacimiento}
                  regTelefono={regTelefono}
                  regEmail={regEmail}
                  regPassword={regPassword}
                  regConfirmPassword={regConfirmPassword}
                  regErrors={regErrors}
                  onTabChange={setAuthTab}
                  onLoginEmailChange={setLoginEmail}
                  onLoginPasswordChange={setLoginPassword}
                  onRecoveryEmailChange={setRecoveryEmail}
                  onRegNombreChange={setRegNombre}
                  onRegApellidoChange={setRegApellido}
                  onRegGeneroChange={setRegGenero}
                  onRegFechaNacimientoChange={(v) => {
                    const formatted = formatBirthDate(v);
                    setRegFechaNacimiento(formatted);
                    if (formatted.length === 10) {
                      const age = calculateAge(formatted);
                      if (age !== null && age < 18) {
                        setRegErrors((prev) => ({
                          ...prev,
                          fechaNacimiento:
                            'Solo personas adultas (+18) pueden registrarse en el Modo Responsable.',
                        }));
                      } else if (age === null) {
                        setRegErrors((prev) => ({
                          ...prev,
                          fechaNacimiento: 'Fecha de nacimiento inválida.',
                        }));
                      } else {
                        setRegErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.fechaNacimiento;
                          return copy;
                        });
                      }
                    } else if (regErrors.fechaNacimiento) {
                      setRegErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.fechaNacimiento;
                        return copy;
                      });
                    }
                  }}
                  onRegTelefonoChange={(v) => setRegTelefono(formatPhone(v))}
                  onRegEmailChange={setRegEmail}
                  onRegPasswordChange={setRegPassword}
                  onRegConfirmPasswordChange={setRegConfirmPassword}
                  onLoginSubmit={handleWebLogin}
                  onRecoverySubmit={handleWebRecovery}
                  onRegisterSubmit={handleWebRegister}
                  onFillDemo={() => {
                    setLoginEmail('tutor@baprotege.gob.ar');
                    setLoginPassword('password123');
                    handleWebLogin();
                  }}
                />
              )}

              {/* PASO 3B: EMPAREJAMIENTO */}
              {appMode === 'PAIRING' && (
                <PairingStep
                  pairingCodeInput={pairingCodeInput}
                  onCodeChange={setPairingCodeInput}
                  onPairingSubmit={handleWebPairing}
                  onSimulateCode={(code = '123456') => {
                    setPairingCodeInput(code);
                    handleWebPairing(code);
                  }}
                />
              )}

              {/* PASO 4: PERMISOS DEL DISPOSITIVO */}
              {appMode === 'PERMISSIONS' && (
                <PermissionsStep
                  targetFlow={targetFlow}
                  webPermissions={webPermissions}
                  grantedPermsCount={grantedPermsCount}
                  onTogglePerm={(key) =>
                    setWebPermissions((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  onContinue={() => {
                    if (targetFlow === 'PARENT') setAppMode('PARENT');
                    else setAppMode('CHILD');
                  }}
                  onBack={() => setAppMode('LOGIN')}
                />
              )}

              {/* PASO 5A: DASHBOARD DEL RESPONSABLE */}
              {appMode === 'PARENT' && (() => {
                const currentTime = Date.now();
                let currentSelfControlStatus: 'INACTIVE' | 'ACTIVE_LOCKED' | 'DEACTIVATION_PENDING' | 'DEACTIVATION_READY' | 'TEMPORARILY_UNLOCKED' = 'INACTIVE';
                let currentSelfControlCanDisable = false;
                let currentSelfControlRemainingText = '';

                if (selfControlUnlockedAt && selfControlAutoRelockAt && !selfControlActive) {
                  if (currentTime >= selfControlAutoRelockAt) {
                    currentSelfControlStatus = 'ACTIVE_LOCKED';
                    currentSelfControlCanDisable = false;
                  } else {
                    currentSelfControlStatus = 'TEMPORARILY_UNLOCKED';
                    const remainingMs = selfControlAutoRelockAt - currentTime;
                    const totalMinutes = Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
                    const hours = Math.floor(totalMinutes / 60);
                    const mins = totalMinutes % 60;
                    currentSelfControlRemainingText = `${hours}h ${mins.toString().padStart(2, '0')}m`;
                  }
                } else if (selfControlActive) {
                  if (selfControlDeactivationAvailableAt) {
                    if (currentTime >= selfControlDeactivationAvailableAt) {
                      currentSelfControlStatus = 'DEACTIVATION_READY';
                      currentSelfControlCanDisable = true;
                    } else {
                      currentSelfControlStatus = 'DEACTIVATION_PENDING';
                      currentSelfControlCanDisable = false;
                      const remainingMs = selfControlDeactivationAvailableAt - currentTime;
                      const totalMinutes = Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
                      const hours = Math.floor(totalMinutes / 60);
                      const mins = totalMinutes % 60;
                      currentSelfControlRemainingText = `${hours}h ${mins.toString().padStart(2, '0')}m`;
                    }
                  } else {
                    currentSelfControlStatus = 'ACTIVE_LOCKED';
                    currentSelfControlCanDisable = false;
                  }
                }

                return (
                  <ParentDashboardStep
                    parentUser={parentUser}
                    webPermissions={webPermissions}
                    selfControlActive={selfControlActive}
                    selfControlCanDisable={currentSelfControlCanDisable}
                    selfControlStatus={currentSelfControlStatus}
                    selfControlRemainingText={currentSelfControlRemainingText}
                    onSimulateFastForward24h={handleSimulateFastForward24h}
                    devices={devices}
                    maxDevices={MAX_PARENT_DEVICES}
                    pairingCode={pairingCode}
                    onExit={() => setAppMode('WELCOME')}
                    onOpenPermissions={() => setAppMode('PERMISSIONS')}
                    onAttemptDisableSelfControl={handleAttemptDisableSelfControl}
                    onStartSelfControlFlow={() => {
                      setSelfControlStep(1);
                      setShowSelfControlModal(true);
                    }}
                    onGeneratePairing={handleGeneratePairing}
                    customSites={customSites}
                    onAddCustomSite={handleAddCustomSite}
                    onUpdateCustomSite={handleUpdateCustomSite}
                    onDeleteCustomSite={handleDeleteCustomSite}
                  />
                );
              })()}

              {/* PASO 5B: DISPOSITIVO PROTEGIDO */}
              {appMode === 'CHILD' && (
                <ProtectedDeviceStep
                  mode={targetFlow === 'ADULT' ? 'ADULT' : 'CHILD'}
                  webPermissions={webPermissions}
                  isVpnActive={isVpnActive}
                  testDomain={testDomain}
                  blockedAlert={blockedAlert}
                  onExit={() => setAppMode('WELCOME')}
                  onOpenPermissions={() => setAppMode('PERMISSIONS')}
                  onOpenPinModal={() => setShowPinModal(true)}
                  onTestDomainChange={setTestDomain}
                  onSimulateAccess={handleSimulateAccess}
                />
              )}
            </div>
          </div>
        </div>

        {/* MODAL DOBLE CONFIRMACIÓN DE AUTOCONTROL */}
        {showSelfControlModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
            <div style={{ backgroundColor: '#FFF', width: '90%', maxWidth: '380px', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
              {selfControlStep === 1 ? (
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔒</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1C1C1E', marginBottom: '8px' }}>Confirmación 1 de 2: Autocontrol del Tutor</h3>
                  <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '14px', lineHeight: '1.4' }}>
                    Al activar el autocontrol, se aplicarán restricciones de acceso a sitios de apuestas en tu perfil.
                  </p>
                  <div style={{ backgroundColor: '#FFF3CD', border: '1px solid #FFC107', borderRadius: '10px', padding: '10px', color: '#856404', fontSize: '11px', fontWeight: '600', marginBottom: '16px' }}>
                    ⚠️ IMPORTANTE: El bloqueo se queda permanente y deberás esperar 24 hs obligatorias para desactivar.
                  </div>
                  <button
                    style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#007AFF', color: '#FFF', border: 'none', fontWeight: '700', marginBottom: '8px', cursor: 'pointer' }}
                    onClick={() => setSelfControlStep(2)}
                  >
                    Entiendo las condiciones, Continuar ➔
                  </button>
                  <button
                    style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#E2E3E5', color: '#6C757D', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                    onClick={() => setShowSelfControlModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚠️</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1C1C1E', marginBottom: '8px' }}>Confirmación 2 de 2: Activar Bloqueo Permanente</h3>
                  <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '16px', lineHeight: '1.4' }}>
                    ¿Confirmas activar la autoprotección? El bloqueo quedará permanente. Pasadas las 24 hs, podrás tocar el botón para desbloquear inmediatamente por 24 hs.
                  </p>
                  <button
                    style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#DC3545', color: '#FFF', border: 'none', fontWeight: '700', marginBottom: '8px', cursor: 'pointer' }}
                    onClick={handleConfirmEnableSelfControl}
                  >
                    🔒 Confirmar y Activar Autocontrol
                  </button>
                  <button
                    style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: '#E2E3E5', color: '#6C757D', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                    onClick={() => setSelfControlStep(1)}
                  >
                    Volver Atrás
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL TECLADO PIN */}
        {showPinModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
            <div style={{ backgroundColor: '#FFF', width: '90%', maxWidth: '340px', borderRadius: '20px', padding: '20px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1C1C1E', marginBottom: '4px' }}>PIN del Tutor Requerido</h3>
              <p style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '12px' }}>Ingresa el PIN de 4 dígitos (Demo: 1234)</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '7px',
                      border: '2px solid #007AFF',
                      backgroundColor: enteredPin.length > i ? '#007AFF' : 'transparent',
                    }}
                  />
                ))}
              </div>

              {/* Grid de Teclado */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    style={{ height: '48px', borderRadius: '10px', backgroundColor: '#F8F9FA', border: '1px solid #DEE2E6', fontSize: '16px', fontWeight: '700', color: '#1C1C1E', cursor: 'pointer' }}
                    onClick={() => {
                      if (k === 'C') setEnteredPin('');
                      else if (k === '⌫') setEnteredPin((prev) => prev.slice(0, -1));
                      else handlePinInput(k);
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button
                style={{ width: '100%', height: '40px', borderRadius: '10px', backgroundColor: '#E2E3E5', color: '#6C757D', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                onClick={() => {
                  setShowPinModal(false);
                  setEnteredPin('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
