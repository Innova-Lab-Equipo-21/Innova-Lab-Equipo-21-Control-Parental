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
import { SplashScreen } from './components/SplashScreen';
import { AppMode } from './types';
import { AuthViewMode } from './components/auth/LoginForm';
import {
  ResponsibleInitialAction,
  hasCompletedResponsibleFirstAccess,
  markResponsibleFirstAccessCompleted,
} from './utils/responsibleFirstAccess';

export function App(): React.JSX.Element {
  // Splash Screen inicial animado
  const [showSplash, setShowSplash] = useState<boolean>(true);

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
  const [responsibleActionType, setResponsibleActionType] = useState<ResponsibleInitialAction>('NONE');

  const [isDevicePaired, setIsDevicePaired] = useState<boolean>(false);
  const [deviceUuid, setDeviceUuid] = useState<string | null>(null);

  // Manejador de selección de modo
  const handleSelectMode = (mode: AppMode) => {
    setCurrentMode(mode);
    setIsParentLoggedIn(false);
    setIsDevicePaired(false);
    setHasGrantedPermissions(false);
    setHasSelectedResponsibleAction(false);
    setResponsibleActionType('NONE');
  };

  // Manejador de Login del Responsable
  const handleLoginSuccess = async (user: any, token: string) => {
    setParentUser(user);
    setParentToken(token);
    setIsParentLoggedIn(true);
    setHasGrantedPermissions(false);
    setResponsibleActionType('NONE');
    const alreadyCompleted = await hasCompletedResponsibleFirstAccess(user);
    setHasSelectedResponsibleAction(alreadyCompleted);
    // Inicia solicitando permisos primero
  };

  // Manejador de Emparejamiento del Dispositivo Protegido
  const handlePairingComplete = (_deviceId: string, uuid: string, pairedMode?: 'CHILD' | 'ADULT') => {
    setDeviceUuid(uuid);
    setIsDevicePaired(true);
    setHasGrantedPermissions(false);
    if (pairedMode) {
      setCurrentMode(pairedMode);
    }
  };

  // Manejador de confirmación de permisos
  const handlePermissionsComplete = async () => {
    if (currentMode === 'PARENT') {
      const alreadyCompleted = await hasCompletedResponsibleFirstAccess(parentUser);
      if (alreadyCompleted) {
        setResponsibleActionType('NONE');
        setHasSelectedResponsibleAction(true);
      }
    }
    setHasGrantedPermissions(true);
  };

  // Reiniciar flujo y volver a selección de modo
  const handleExitMode = () => {
    setCurrentMode('UNSET');
    setIsParentLoggedIn(false);
    setIsDevicePaired(false);
    setHasGrantedPermissions(false);
    setHasSelectedResponsibleAction(false);
    setResponsibleActionType('NONE');
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

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

      {/* MODO PROTEGIDO: Emparejamiento */}
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
            userId={parentUser?.id}
            onPermissionsComplete={handlePermissionsComplete}
            onBack={() => {
              setIsParentLoggedIn(false);
              setParentUser(null);
              setParentToken(null);
              setLoginInitialViewMode('LOGIN');
            }}
          />
        )}

      {/* 2. MODO RESPONSABLE: Pantalla "Elegir protección" (Solo en el primer acceso del Responsable) */}
      {!showOnboarding &&
        currentMode === 'PARENT' &&
        isParentLoggedIn &&
        hasGrantedPermissions &&
        !hasSelectedResponsibleAction && (
          <ResponsibleActionScreen
            userName={parentUser?.fullName || 'Tutor Responsable'}
            onSelectAction={async (actionType) => {
              await markResponsibleFirstAccessCompleted(parentUser);
              setResponsibleActionType(actionType);
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
            initialAction={responsibleActionType}
            onExitMode={handleExitMode}
          />
        )}

      {/* MODO PROTEGIDO: Permisos */}
      {!showOnboarding &&
        (currentMode === 'CHILD' || currentMode === 'ADULT') &&
        isDevicePaired &&
        !hasGrantedPermissions && (
          <PermissionsScreen
            flowSource="DEVICE_PAIRING"
            allowDisablePermissions={false}
            protectedProfile={currentMode}
            userId={deviceUuid || (currentMode === 'ADULT' ? 'dev-adult-default' : 'dev-local-default')}
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
            mode={currentMode}
            onExitMode={handleExitMode}
          />
        )}
    </>
  );
}

export default App;
