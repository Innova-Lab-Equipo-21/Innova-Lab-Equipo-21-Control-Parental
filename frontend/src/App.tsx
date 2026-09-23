// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Entrada de React Native)
// Archivo: src/App.tsx
// Descripción: Componente raíz de la aplicación con enrutamiento de modos
//              (Bienvenida, Pareamiento, Dispositivo Protegido y Responsable).
// ==============================================================================

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { PairingScreen } from './screens/PairingScreen';
import { ProtectedDeviceScreen } from './screens/ProtectedDeviceScreen';
import { ParentDashboardScreen } from './screens/ParentDashboardScreen';
import { AppMode } from './types';

export function App(): React.JSX.Element {
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
      {currentMode === 'UNSET' && (
        <WelcomeScreen onSelectMode={handleSelectMode} />
      )}

      {currentMode === 'CHILD' && !isPaired && (
        <PairingScreen
          onPairingComplete={handlePairingComplete}
          onBack={handleExitMode}
        />
      )}

      {currentMode === 'CHILD' && isPaired && (
        <ProtectedDeviceScreen
          deviceUuid={deviceUuid || 'dev-local-default'}
          onExitMode={handleExitMode}
        />
      )}

      {currentMode === 'PARENT' && (
        <ParentDashboardScreen onExitMode={handleExitMode} />
      )}
    </>
  );
}

export default App;
