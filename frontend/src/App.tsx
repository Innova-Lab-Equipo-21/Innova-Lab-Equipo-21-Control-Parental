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

  const [isDevicePaired, setIsDevicePaired] = useState<boolean>(false);
  const [deviceUuid, setDeviceUuid] = useState<string | null>(null);

  // 4) Estado de Solicitud de Permisos
  const [hasGrantedPermissions, setHasGrantedPermissions] = useState<boolean>(false);

  // Manejador de selección de modo
  const handleSelectMode = (mode: AppMode) => {
    setCurrentMode(mode);
    setIsParentLoggedIn(false);
    setIsDevicePaired(false);
    setHasGrantedPermissions(false);
  };

  // Manejador de Login del Responsable
  const handleLoginSuccess = (user: any, token: string) => {
    setParentUser(user);
    setParentToken(token);
    setIsParentLoggedIn(true);
    // Avanza a Paso 4: Pantalla de Permisos Post-Login
  };

  // Manejador de Emparejamiento del Dispositivo Protegido
  const handlePairingComplete = (_deviceId: string, uuid: string) => {
    setDeviceUuid(uuid);
    setIsDevicePaired(true);
    // Avanza a Paso 4: Pantalla de Permisos Post-Emparejamiento
  };

  // Manejador de confirmación de permisos
  const handlePermissionsComplete = () => {
    setHasGrantedPermissions(true);
    // Avanza a Paso 5: Pantalla de Destino
  };

  // Reiniciar flujo y volver a selección de modo
  const handleExitMode = () => {
    setCurrentMode('UNSET');
    setIsParentLoggedIn(false);
    setIsDevicePaired(false);
    setHasGrantedPermissions(false);
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

      {/* PASO 4: Pantalla de Permisos Post-Login o Post-Emparejamiento */}
      {!showOnboarding &&
        ((currentMode === 'PARENT' && isParentLoggedIn) ||
          ((currentMode === 'CHILD' || currentMode === 'ADULT') && isDevicePaired)) &&
        !hasGrantedPermissions && (
          <PermissionsScreen
            flowSource={currentMode === 'PARENT' ? 'PARENT_LOGIN' : 'DEVICE_PAIRING'}
            onPermissionsComplete={handlePermissionsComplete}
            onBack={() => {
              if (currentMode === 'PARENT') {
                setIsParentLoggedIn(false);
                setParentUser(null);
                setParentToken(null);
                setLoginInitialViewMode('LOGIN');
              } else {
                setIsDevicePaired(false);
              }
            }}
          />
        )}

      {/* PASO 5A: Perfil del Responsable -> Dashboard del Responsable */}
      {!showOnboarding && currentMode === 'PARENT' && isParentLoggedIn && hasGrantedPermissions && (
        <ParentDashboardScreen
          initialUser={parentUser}
          initialToken={parentToken}
          onExitMode={handleExitMode}
        />
      )}

      {/* PASO 5B: Perfil Dispositivo Protegido -> Pantalla del Dispositivo Protegido */}
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
