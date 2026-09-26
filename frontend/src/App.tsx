// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Entrada de React Native)
// Archivo: src/App.tsx
// Descripción: Componente raíz de la aplicación con enrutamiento de vistas
//              (Onboarding con videos, Selección de Modo, Pareamiento,
//              Dispositivo Protegido y Responsable).
// ==============================================================================

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { PairingScreen } from './screens/PairingScreen';
import { ProtectedDeviceScreen } from './screens/ProtectedDeviceScreen';
import { ParentDashboardScreen } from './screens/ParentDashboardScreen';
import { AppMode } from './types';

export function App(): React.JSX.Element {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [currentMode, setCurrentMode] = useState<AppMode>('UNSET');
  const [deviceUuid, setDeviceUuid] = useState<string | null>(null);
  const [isPaired, setIsPaired] = useState<boolean>(false);

  const handleSelectMode = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handlePairingComplete = (_deviceId: string, uuid: string) => {
    setDeviceUuid(uuid);
    setIsPaired(true);
  };

  const handleExitMode = () => {
    setCurrentMode('UNSET');
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Pantalla de Onboarding y Videos */}
      {showOnboarding && (
        <OnboardingScreen
          onComplete={() => setShowOnboarding(false)}
          onSelectMode={(mode) => {
            setShowOnboarding(false);
            setCurrentMode(mode);
          }}
        />
      )}

      {/* Pantalla de Selección de Modo (Welcome) */}
      {!showOnboarding && currentMode === 'UNSET' && (
        <WelcomeScreen
          onSelectMode={handleSelectMode}
          onOpenOnboarding={() => setShowOnboarding(true)}
        />
      )}

      {/* Flujo Dispositivo Protegido (Menor o Adulto) */}
      {!showOnboarding && (currentMode === 'CHILD' || currentMode === 'ADULT') && !isPaired && (
        <PairingScreen
          onPairingComplete={handlePairingComplete}
          onBack={handleExitMode}
        />
      )}

      {!showOnboarding && (currentMode === 'CHILD' || currentMode === 'ADULT') && isPaired && (
        <ProtectedDeviceScreen
          deviceUuid={deviceUuid || (currentMode === 'ADULT' ? 'dev-adult-default' : 'dev-local-default')}
          onExitMode={handleExitMode}
        />
      )}

      {/* Flujo Responsable (Padre / Madre / Tutor) */}
      {!showOnboarding && currentMode === 'PARENT' && (
        <ParentDashboardScreen onExitMode={handleExitMode} />
      )}
    </>
  );
}

export default App;
