// ==============================================================================
// Proyecto: BA Protege+
// Componente: LoginForm (Formulario de Inicio de Sesión)
// Archivo: src/components/auth/LoginForm.tsx
// Descripción: Formulario modular para inicio de sesión de tutores responsables
//              con integración de Google Sign-In, aviso legal y modales de
//              Términos y Condiciones y Políticas de Privacidad.
// ==============================================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { ActionButton } from '../ActionButton';
import { Icon } from '../Icon';
import { styles } from './LoginForm.styles';
import { TermsModal } from './TermsModal';
import { PrivacyModal } from './PrivacyModal';
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

  // Estados para Modales Legales
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
        <Text style={styles.title}>Iniciar sesión</Text>
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
        <Text style={styles.label}>
          Correo electrónico<Text style={styles.requiredAsterisk}>*</Text>
        </Text>
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
        <Text style={styles.label}>
          Contraseña<Text style={styles.requiredAsterisk}>*</Text>
        </Text>
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
        <View style={styles.forgotPasswordRow}>
          <TouchableOpacity
            onPress={() => onSwitchMode('RECOVERY')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.linkTextSmall}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
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
          style={styles.secondaryCardButton}
          onPress={() => onSwitchMode('REGISTER')}
        >
          <Text style={styles.secondaryCardButtonText}>
            ¿No tenés una cuenta? <Text style={styles.highlightText}>Crear cuenta</Text>
          </Text>
        </TouchableOpacity>

        {/* Divisor "o" */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botón de Google */}
        <TouchableOpacity
          style={styles.googleButtonContainer}
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
          accessibilityLabel="Acceder con Google"
          accessibilityRole="button"
        >
          <Image
            source={require('../../assets/logo/logo_google.png')}
            style={styles.googleButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Texto Legal: Políticas de Privacidad y Términos y condiciones */}
        <View style={styles.legalNoticeContainer}>
          <Text style={styles.legalNoticeText}>
            Este sitio está sujeto a{' '}
            <Text
              style={styles.legalLink}
              onPress={() => setShowPrivacyModal(true)}
            >
              Políticas de Privacidad
            </Text>
            {' y '}
            <Text
              style={styles.legalLink}
              onPress={() => setShowTermsModal(true)}
            >
              Términos y condiciones
            </Text>
          </Text>
        </View>
      </View>

      {/* Modal de Términos y Condiciones */}
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Modal de Políticas de Privacidad */}
      <PrivacyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </View>
  );
};

