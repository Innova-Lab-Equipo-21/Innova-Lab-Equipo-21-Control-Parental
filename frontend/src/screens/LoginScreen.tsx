// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Autenticación y Registro)
// Archivo: src/screens/LoginScreen.tsx
// Descripción: Pantalla contenedora orquestadora para inicio de sesión,
//              creación de cuenta y recuperación de contraseña.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Logo } from '../components/Logo';
import { LoginForm, AuthViewMode } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { RecoveryForm } from '../components/auth/RecoveryForm';
import { styles } from './LoginScreen.styles';

interface LoginScreenProps {
  onLoginSuccess: (user: any, token: string) => void;
  onBack?: () => void;
  initialViewMode?: AuthViewMode;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onBack,
  initialViewMode = 'REGISTER',
}) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>(initialViewMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logotipo Oficial Completo Centrado */}
        <View style={styles.logoWrapper}>
          <Logo variant="complete" size="md" align="center" />
        </View>

        {/* Contenedor Principal de la Tarjeta del Formulario */}
        <View style={styles.card}>
          {viewMode === 'LOGIN' && (
            <LoginForm
              onLoginSuccess={onLoginSuccess}
              onSwitchMode={(mode) => setViewMode(mode)}
            />
          )}

          {viewMode === 'RECOVERY' && (
            <RecoveryForm
              onSwitchMode={(mode) => setViewMode(mode)}
            />
          )}

          {viewMode === 'REGISTER' && (
            <RegisterForm
              onLoginSuccess={onLoginSuccess}
              onSwitchMode={(mode) => setViewMode(mode)}
              onBack={onBack || (() => setViewMode('LOGIN'))}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
