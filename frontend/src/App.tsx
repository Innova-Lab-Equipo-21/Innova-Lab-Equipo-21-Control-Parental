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
//              Soporta persistencia de sesión para que el app no se reinicie
//              al volver desde Ajustes de Android tras modificar permisos.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
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
import {
  ActiveScreenType,
  getNavigationState,
  saveNavigationState,
  clearNavigationSession,
} from './utils/navigationSession';
import { checkRealDevicePermissions } from './utils/permissionChecker';
import { safeStorage } from './services/api/client';

export function App(): React.JSX.Element {
  // Splash Screen inicial animado
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

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

  // Pantalla activa persistida
  const [activeScreen, setActiveScreen] = useState<ActiveScreenType>('ONBOARDING');

  // Hidratar estado de sesión persistido al iniciar la aplicación
  useEffect(() => {
    getNavigationState().then(async (session) => {
      if (session.onboardingCompleted) {
        setShowOnboarding(false);
      }
      if (session.currentMode && session.currentMode !== 'UNSET') {
        setCurrentMode(session.currentMode);
      }
      if (session.isParentLoggedIn && session.parentUser) {
        setIsParentLoggedIn(true);
        setParentUser(session.parentUser);
        setParentToken(session.parentToken);
        if (session.parentToken) {
          safeStorage.setItem('@ba_protege_jwt_token', session.parentToken).catch(() => {});
        }
      }

      // Auditar permisos reales en el hardware
      const userIdForCheck = session.parentUser?.id || session.deviceUuid;
      const real = await checkRealDevicePermissions(userIdForCheck);
      const allGranted = real.grantedCount === 6;
      setHasGrantedPermissions(allGranted);

      setHasSelectedResponsibleAction(session.hasSelectedResponsibleAction);
      setResponsibleActionType(session.responsibleActionType);
      setIsDevicePaired(session.isDevicePaired);
      setDeviceUuid(session.deviceUuid);

      // Si todos los permisos están concedidos, no forzar la pantalla de Permisos
      let effectiveScreen = session.activeScreen;
      if (allGranted && effectiveScreen === 'PERMISSIONS') {
        effectiveScreen = session.currentMode === 'PARENT' ? 'DASHBOARD' : 'PROTECTED_DEVICE';
      }
      setActiveScreen(effectiveScreen);

      // Si la sesión ya estaba activa o se encontraba en Permisos, omitir Splash para reingreso fluido
      if (
        session.onboardingCompleted ||
        session.isParentLoggedIn ||
        session.activeScreen === 'PERMISSIONS'
      ) {
        setShowSplash(false);
      }
      setIsHydrated(true);
    });
  }, []);

  // Manejador de selección de modo
  const handleSelectMode = (mode: AppMode) => {
    const nextScreen: ActiveScreenType = mode === 'PARENT' ? 'LOGIN' : 'PAIRING';
    setCurrentMode(mode);
    setIsParentLoggedIn(false);
    setIsDevicePaired(false);
    setHasGrantedPermissions(false);
    setHasSelectedResponsibleAction(false);
    setResponsibleActionType('NONE');
    setActiveScreen(nextScreen);
    saveNavigationState({
      onboardingCompleted: true,
      currentMode: mode,
      isParentLoggedIn: false,
      isDevicePaired: false,
      hasGrantedPermissions: false,
      activeScreen: nextScreen,
    }).catch(() => {});
  };

  // Manejador de Login del Responsable
  const handleLoginSuccess = async (user: any, token: string) => {
    setParentUser(user);
    setParentToken(token);
    setIsParentLoggedIn(true);
    setResponsibleActionType('NONE');
    const alreadyCompleted = await hasCompletedResponsibleFirstAccess(user);
    setHasSelectedResponsibleAction(alreadyCompleted);

    // Verificar si ya tiene todos los 6 permisos habilitados
    const realPerms = await checkRealDevicePermissions(user?.id);
    const allGranted = realPerms.grantedCount === 6;
    setHasGrantedPermissions(allGranted);

    // Si faltan permisos, se muestra por primera vez la pantalla de permisos. Si están todos, pasa al inicio.
    const targetScreen: ActiveScreenType = allGranted
      ? (alreadyCompleted ? 'DASHBOARD' : 'RESPONSIBLE_ACTION')
      : 'PERMISSIONS';

    setActiveScreen(targetScreen);
    await saveNavigationState({
      onboardingCompleted: true,
      currentMode: 'PARENT',
      isParentLoggedIn: true,
      parentUser: user,
      parentToken: token,
      hasGrantedPermissions: allGranted,
      hasSelectedResponsibleAction: alreadyCompleted,
      responsibleActionType: 'NONE',
      activeScreen: targetScreen,
    });
  };

  // Manejador de Emparejamiento del Dispositivo Protegido
  const handlePairingComplete = async (_deviceId: string, uuid: string, pairedMode?: 'CHILD' | 'ADULT') => {
    const targetMode = pairedMode || currentMode;
    setDeviceUuid(uuid);
    setIsDevicePaired(true);
    if (pairedMode) {
      setCurrentMode(pairedMode);
    }

    // Verificar si ya tiene todos los 6 permisos habilitados
    const realPerms = await checkRealDevicePermissions(uuid);
    const allGranted = realPerms.grantedCount === 6;
    setHasGrantedPermissions(allGranted);

    // Si faltan permisos, se muestra por primera vez la pantalla de permisos. Si están todos, pasa a la pantalla del protegido.
    const targetScreen: ActiveScreenType = allGranted ? 'PROTECTED_DEVICE' : 'PERMISSIONS';
    setActiveScreen(targetScreen);
    await saveNavigationState({
      onboardingCompleted: true,
      currentMode: targetMode,
      isDevicePaired: true,
      deviceUuid: uuid,
      hasGrantedPermissions: allGranted,
      activeScreen: targetScreen,
    });
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
    const nextScreen: ActiveScreenType =
      currentMode === 'PARENT' ? 'DASHBOARD' : 'PROTECTED_DEVICE';
    setActiveScreen(nextScreen);
    await saveNavigationState({
      hasGrantedPermissions: true,
      activeScreen: nextScreen,
    });
  };

  // Reiniciar flujo y volver a selección de modo
  const handleExitMode = async () => {
    setCurrentMode('UNSET');
    setIsParentLoggedIn(false);
    setIsDevicePaired(false);
    setHasGrantedPermissions(false);
    setHasSelectedResponsibleAction(false);
    setResponsibleActionType('NONE');
    setActiveScreen('WELCOME');
    await clearNavigationSession();
  };

  if (!isHydrated) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

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
          onComplete={async () => {
            setShowOnboarding(false);
            setOnboardingInitialStep(1);
            setActiveScreen('WELCOME');
            await saveNavigationState({ onboardingCompleted: true, activeScreen: 'WELCOME' });
          }}
          onSelectMode={async (mode) => {
            setShowOnboarding(false);
            setOnboardingInitialStep(1);
            handleSelectMode(mode);
            await saveNavigationState({ onboardingCompleted: true });
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
      {!showOnboarding &&
        (currentMode === 'CHILD' || currentMode === 'ADULT') &&
        !isDevicePaired && (
          <PairingScreen
            onPairingComplete={handlePairingComplete}
            onBack={handleExitMode}
          />
        )}

      {/* 1. MODO RESPONSABLE: Pantalla de Permisos Post-Login / Reingreso desde Ajustes */}
      {!showOnboarding &&
        currentMode === 'PARENT' &&
        isParentLoggedIn &&
        (activeScreen === 'PERMISSIONS' || !hasGrantedPermissions) && (
          <PermissionsScreen
            flowSource="PARENT_LOGIN"
            userId={parentUser?.id}
            onPermissionsComplete={async () => {
              setActiveScreen('DASHBOARD');
              await saveNavigationState({ activeScreen: 'DASHBOARD' });
              handlePermissionsComplete();
            }}
            onBack={async () => {
              if (hasGrantedPermissions || hasSelectedResponsibleAction) {
                setActiveScreen('DASHBOARD');
                await saveNavigationState({ activeScreen: 'DASHBOARD' });
              } else {
                setIsParentLoggedIn(false);
                setParentUser(null);
                setParentToken(null);
                setLoginInitialViewMode('LOGIN');
                setActiveScreen('LOGIN');
                await saveNavigationState({
                  isParentLoggedIn: false,
                  parentUser: null,
                  parentToken: null,
                  activeScreen: 'LOGIN',
                });
              }
            }}
          />
        )}

      {/* 2. MODO RESPONSABLE: Pantalla "Elegir protección" (Solo en el primer acceso del Responsable) */}
      {!showOnboarding &&
        currentMode === 'PARENT' &&
        isParentLoggedIn &&
        hasGrantedPermissions &&
        !hasSelectedResponsibleAction &&
        activeScreen !== 'PERMISSIONS' && (
          <ResponsibleActionScreen
            userName={parentUser?.fullName || 'Tutor Responsable'}
            onSelectAction={async (actionType) => {
              await markResponsibleFirstAccessCompleted(parentUser);
              setResponsibleActionType(actionType);
              setHasSelectedResponsibleAction(true);
              setActiveScreen('DASHBOARD');
              await saveNavigationState({
                hasSelectedResponsibleAction: true,
                responsibleActionType: actionType,
                activeScreen: 'DASHBOARD',
              });
            }}
            onBack={async () => {
              setHasGrantedPermissions(false);
              setActiveScreen('PERMISSIONS');
              await saveNavigationState({
                hasGrantedPermissions: false,
                activeScreen: 'PERMISSIONS',
              });
            }}
          />
        )}

      {/* 3. MODO RESPONSABLE: Dashboard del Responsable (Post-Acción) */}
      {!showOnboarding &&
        currentMode === 'PARENT' &&
        isParentLoggedIn &&
        hasGrantedPermissions &&
        hasSelectedResponsibleAction &&
        activeScreen !== 'PERMISSIONS' && (
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
        (activeScreen === 'PERMISSIONS' || !hasGrantedPermissions) && (
          <PermissionsScreen
            flowSource="DEVICE_PAIRING"
            allowDisablePermissions={false}
            protectedProfile={currentMode}
            userId={
              deviceUuid ||
              (currentMode === 'ADULT' ? 'dev-adult-default' : 'dev-local-default')
            }
            onPermissionsComplete={async () => {
              setActiveScreen('PROTECTED_DEVICE');
              await saveNavigationState({ activeScreen: 'PROTECTED_DEVICE' });
              handlePermissionsComplete();
            }}
            onBack={async () => {
              if (hasGrantedPermissions) {
                setActiveScreen('PROTECTED_DEVICE');
                await saveNavigationState({ activeScreen: 'PROTECTED_DEVICE' });
              } else {
                setIsDevicePaired(false);
                setActiveScreen('PAIRING');
                await saveNavigationState({
                  isDevicePaired: false,
                  activeScreen: 'PAIRING',
                });
              }
            }}
          />
        )}

      {/* MODO PROTEGIDO: Pantalla del Dispositivo Protegido */}
      {!showOnboarding &&
        (currentMode === 'CHILD' || currentMode === 'ADULT') &&
        isDevicePaired &&
        hasGrantedPermissions &&
        activeScreen !== 'PERMISSIONS' && (
          <ProtectedDeviceScreen
            deviceUuid={
              deviceUuid ||
              (currentMode === 'ADULT' ? 'dev-adult-default' : 'dev-local-default')
            }
            mode={currentMode}
            onExitMode={handleExitMode}
          />
        )}
    </>
  );
}

export default App;
