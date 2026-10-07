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
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Logo } from '../components/Logo';
import { LoginForm, AuthViewMode } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { RecoveryForm } from '../components/auth/RecoveryForm';
import { colors } from '../theme/colors';

interface LoginScreenProps {
  onLoginSuccess: (user: any, token: string) => void;
  onBack?: () => void;
  initialViewMode?: AuthViewMode;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
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
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});
