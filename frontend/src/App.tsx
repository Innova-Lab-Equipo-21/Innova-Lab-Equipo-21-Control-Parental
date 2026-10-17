// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Entrada de React Native)
// Archivo: src/App.tsx
// Descripción: Componente raíz con enrutamiento del flujo ordenado de 5 pasos:
//              1) Onboarding para todos
//              2) Seleccionar Modo (Responsable vs Protegido)
//              3) Login (Responsable) o Emparejamiento (Protegido)
//              4) Permisos del Dispositivo (Post-Login / Post-Emparejamiento)
//              5) Dashboard del Responsable o Pantalla del Dispositivo Protegido
// ==============================================================================

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PairingScreen } from './screens/PairingScreen';
import { PermissionsScreen } from './screens/PermissionsScreen';
import { ProtectedDeviceScreen } from './screens/ProtectedDeviceScreen';
import { ParentDashboardScreen } from './screens/ParentDashboardScreen';
import { ResponsibleActionScreen } from './screens/ResponsibleActionScreen';
import { AppMode } from './types';
import { AuthViewMode } from './components/auth/LoginForm';

export function App(): React.JSX.Element {
  // 1) Onboarding inicial
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [onboardingInitialStep, setOnboardingInitialStep] = useState<1 | 2 | 3>(1);

  // 2) Modo Operativo elegido
  const [currentMode, setCurrentMode] = useState<AppMode>('UNSET');

  // 3) Estados de autenticación (Responsable) y emparejamiento (Protegido)
  const [isParentLoggedIn, setIsParentLoggedIn] = useState<boolean>(false);
  const [parentUser, setParentUser] = useState<any>(null);
  const [parentToken, setParentToken] = useState<string | null>(null);
  const [loginInitialViewMode, setLoginInitialViewMode] = useState<AuthViewMode>('REGISTER');
  const [hasGrantedPermissions, setHasGrantedPermissions] = useState<boolean>(false);
  const [hasSelectedResponsibleAction, setHasSelectedResponsibleAction] = useState<boolean>(false);

  const [isDevicePaired, setIsDevicePaired] = useState<boolean>(false);
  const [deviceUuid, setDeviceUuid] = useState<string | null>(null);

  // Manejador de selección de modo
  const handleSelectMode = (mode: AppMode) => {
    setCurrentMode(mode);
    setIsParentLoggedIn(false);
    setIsDevicePaired(false);
    setHasGrantedPermissions(false);
    setHasSelectedResponsibleAction(false);
  };

  // Manejador de Login del Responsable
  const handleLoginSuccess = (user: any, token: string) => {
    setParentUser(user);
    setParentToken(token);
    setIsParentLoggedIn(true);
    setHasGrantedPermissions(false);
    setHasSelectedResponsibleAction(false);
    // Inicia solicitando permisos primero
  };

  // Manejador de Emparejamiento del Dispositivo Protegido
  const handlePairingComplete = (_deviceId: string, uuid: string) => {
    setDeviceUuid(uuid);
    setIsDevicePaired(true);
    setHasGrantedPermissions(false);
  };

  // Manejador de confirmación de permisos
  const handlePermissionsComplete = () => {
    setHasGrantedPermissions(true);
  };

  // Reiniciar flujo y volver a selección de modo
  const handleExitMode = () => {
    setCurrentMode('UNSET');
    setIsParentLoggedIn(false);
    setIsDevicePaired(false);
    setHasGrantedPermissions(false);
    setHasSelectedResponsibleAction(false);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* PASO 1: Onboarding para todos los usuarios */}
      {showOnboarding && (
        <OnboardingScreen
          initialStep={onboardingInitialStep}
          onComplete={() => {
            setShowOnboarding(false);
            setOnboardingInitialStep(1);
          }}
          onSelectMode={(mode) => {
            setShowOnboarding(false);
            setOnboardingInitialStep(1);
            handleSelectMode(mode);
          }}
        />
      )}

      {/* PASO 2: Seleccionar Modo Operativo */}
      {!showOnboarding && currentMode === 'UNSET' && (
        <WelcomeScreen
          onSelectMode={handleSelectMode}
          onOpenOnboarding={(step = 3) => {
            setOnboardingInitialStep(step);
            setShowOnboarding(true);
          }}
        />
      )}

      {/* PASO 3A: Modo Responsable -> Pantalla de Crear Cuenta / Autenticación */}
      {!showOnboarding && currentMode === 'PARENT' && !isParentLoggedIn && (
        <LoginScreen
          initialViewMode={loginInitialViewMode}
          onLoginSuccess={handleLoginSuccess}
          onBack={handleExitMode}
        />
      )}

      {/* PASO 3B: Modo Protegido (Menor / Adulto) -> Pantalla de Emparejamiento por Código */}
      {!showOnboarding && (currentMode === 'CHILD' || currentMode === 'ADULT') && !isDevicePaired && (
        <PairingScreen
          onPairingComplete={handlePairingComplete}
          onBack={handleExitMode}
        />
      )}

      {/* 1. MODO RESPONSABLE: Pantalla de Permisos Post-Login (Se muestra primero) */}
      {!showOnboarding &&
        currentMode === 'PARENT' &&
        isParentLoggedIn &&
        !hasGrantedPermissions && (
          <PermissionsScreen
            flowSource="PARENT_LOGIN"
            onPermissionsComplete={handlePermissionsComplete}
            onBack={() => {
              setIsParentLoggedIn(false);
              setParentUser(null);
              setParentToken(null);
              setLoginInitialViewMode('LOGIN');
            }}
          />
        )}

      {/* 2. MODO RESPONSABLE: Pantalla de Acción Inicial (Se muestra después de habilitar permisos) */}
      {!showOnboarding &&
        currentMode === 'PARENT' &&
        isParentLoggedIn &&
        hasGrantedPermissions &&
        !hasSelectedResponsibleAction && (
          <ResponsibleActionScreen
            userName={parentUser?.fullName || 'Tutor Responsable'}
            onSelectAction={(actionType) => {
              setHasSelectedResponsibleAction(true);
            }}
            onBack={() => {
              setHasGrantedPermissions(false);
            }}
          />
        )}

      {/* 3. MODO RESPONSABLE: Dashboard del Responsable (Post-Acción) */}
      {!showOnboarding &&
        currentMode === 'PARENT' &&
        isParentLoggedIn &&
        hasGrantedPermissions &&
        hasSelectedResponsibleAction && (
          <ParentDashboardScreen
            initialUser={parentUser}
            initialToken={parentToken}
            onExitMode={handleExitMode}
          />
        )}

      {/* MODO PROTEGIDO: Emparejamiento */}
      {!showOnboarding && (currentMode === 'CHILD' || currentMode === 'ADULT') && !isDevicePaired && (
        <PairingScreen
          onPairingComplete={handlePairingComplete}
          onBack={handleExitMode}
        />
      )}

      {/* MODO PROTEGIDO: Permisos */}
      {!showOnboarding &&
        (currentMode === 'CHILD' || currentMode === 'ADULT') &&
        isDevicePaired &&
        !hasGrantedPermissions && (
          <PermissionsScreen
            flowSource="DEVICE_PAIRING"
            onPermissionsComplete={handlePermissionsComplete}
            onBack={() => setIsDevicePaired(false)}
          />
        )}

      {/* MODO PROTEGIDO: Pantalla del Dispositivo Protegido */}
      {!showOnboarding &&
        (currentMode === 'CHILD' || currentMode === 'ADULT') &&
        isDevicePaired &&
        hasGrantedPermissions && (
          <ProtectedDeviceScreen
            deviceUuid={deviceUuid || (currentMode === 'ADULT' ? 'dev-adult-default' : 'dev-local-default')}
            onExitMode={handleExitMode}
          />
        )}
    </>
  );
}

export default App;
