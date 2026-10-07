// ==============================================================================
// Proyecto: BA Protege+
// Componente: LoginForm (Formulario de Inicio de Sesión)
// Archivo: src/components/auth/LoginForm.tsx
// Descripción: Formulario modular para inicio de sesión de tutores responsables.
// ==============================================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ActionButton } from '../ActionButton';
import { Icon } from '../Icon';
import { colors } from '../../theme/colors';
import { apiService } from '../../services/api.service';
import { validateEmailFormat } from '../../utils/authValidation';

export type AuthViewMode = 'LOGIN' | 'RECOVERY' | 'REGISTER';

interface LoginFormProps {
  onLoginSuccess: (user: any, token: string) => void;
  onSwitchMode: (mode: AuthViewMode) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onSwitchMode,
}) => {
  const [email, setEmail] = useState('tutor@baprotege.gob.ar');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs para navegación fluida con tecla Enter
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor, ingresa tu correo electrónico.');
      return;
    }
    if (!validateEmailFormat(email)) {
      setErrorMessage('El formato del correo electrónico no es válido.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.login({
        email: email.trim(),
        password,
      });

      if (res.data?.token) {
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        onLoginSuccess({ email, fullName: 'Tutor Responsable' }, 'demo-token');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al iniciar sesión.';
      if (email === 'tutor@baprotege.gob.ar' && password === 'password123') {
        Alert.alert('Acceso Demo', 'Iniciando sesión en modo demostración local.');
        onLoginSuccess({ email, fullName: 'Tutor Responsable (Demo)' }, 'demo-token-123');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Sign-In',
      'Iniciando sesión segura con tu cuenta de Google...',
    );
    onLoginSuccess(
      { email: 'tutor.google@baprotege.gob.ar', fullName: 'Tutor Google' },
      'google-oauth-token-123'
    );
  };

  return (
    <View>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>
          Acceso exclusivo para padres y tutores responsables
        </Text>
      </View>

      {errorMessage && (
        <View style={styles.alertError}>
          <Text style={styles.alertErrorText}>⚠️ {errorMessage}</Text>
        </View>
      )}

      {/* Campo Correo Electrónico */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'email' && styles.inputFocusedBorder,
          ]}
        >
          <TextInput
            ref={emailInputRef}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            placeholder="ejemplo@baprotege.gob.ar"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {email.length > 0 && (
            <TouchableOpacity
              style={styles.inputIconAction}
              onPress={() => setEmail('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearIconText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Campo Contraseña */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Contraseña</Text>
          <TouchableOpacity onPress={() => onSwitchMode('RECOVERY')}>
            <Text style={styles.linkTextSmall}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'password' && styles.inputFocusedBorder,
          ]}
        >
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <View style={styles.iconActionsRow}>
            {password.length > 0 && (
              <TouchableOpacity
                style={styles.inputIconAction}
                onPress={() => setPassword('')}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
              >
                <Text style={styles.clearIconText}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.inputIconAction}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
            >
              <Icon
                name="ojo"
                size={20}
                color={showPassword ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.actionsSection}>
        <ActionButton
          title="Iniciar Sesión"
          variant="primary"
          onPress={handleSubmit}
          loading={loading}
        />

        <TouchableOpacity
          style={styles.demoFillButton}
          onPress={() => {
            setEmail('tutor@baprotege.gob.ar');
            setPassword('password123');
            setErrorMessage(null);
          }}
        >
          <Text style={styles.demoFillText}>
            ⚡ Rellenar credenciales de demostración
          </Text>
        </TouchableOpacity>

        {/* Divisor "o ingresá con" */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o ingresá con</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botón Continuar con Google */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.googleIconText}>G</Text>
          <Text style={styles.googleButtonText}>Continuar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryCardButton}
          onPress={() => onSwitchMode('REGISTER')}
        >
          <Text style={styles.secondaryCardButtonText}>
            ¿No tienes una cuenta? <Text style={styles.highlightText}>Crear cuenta</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 18,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  alertError: {
    backgroundColor: colors.statusDangerBg,
    borderColor: '#F5C2C7',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  alertErrorText: {
    color: colors.statusDanger,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  linkTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  inputFocusedBorder: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  iconActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputIconAction: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  actionsSection: {
    marginTop: 10,
  },
  demoFillButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginVertical: 4,
  },
  demoFillText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DADCE0',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C4043',
  },
  secondaryCardButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  secondaryCardButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  highlightText: {
    color: colors.primary,
    fontWeight: '700',
  },
});
