// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Autenticación y Registro)
// Archivo: src/screens/LoginScreen.tsx
// Descripción: Pantalla de inicio de sesión, recuperación de contraseña y creación
//              de cuenta para padres y tutores responsables, completamente en español.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Logo } from '../components/Logo';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme/colors';
import { apiService } from '../services/api.service';

type AuthViewMode = 'LOGIN' | 'RECOVERY' | 'REGISTER';
type GenderOption = 'Masculino' | 'Femenino' | 'Otro' | 'No informado';

interface LoginScreenProps {
  onLoginSuccess: (user: any, token: string) => void;
  onBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('tutor@baprotege.gob.ar');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Estados para Recuperación
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Estados para Registro
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [genero, setGenero] = useState<GenderOption>('No informado');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errores de validación de campos en registro
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // --------------------------------------------------------------------------
  // Validadores y formateadores
  // --------------------------------------------------------------------------
  const formatBirthDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    let formatted = cleaned;
    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    return formatted;
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    let formatted = cleaned;
    if (cleaned.length > 2 && cleaned.length <= 6) {
      formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    } else if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    }
    return formatted;
  };

  const validateLettersOnly = (text: string) => {
    const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return lettersRegex.test(text.trim());
  };

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // --------------------------------------------------------------------------
  // Manejador de Inicio de Sesión
  // --------------------------------------------------------------------------
  const handleLoginSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Por favor, ingresa tu correo electrónico.');
      return;
    }
    if (!validateEmailFormat(loginEmail)) {
      setErrorMessage('El formato del correo electrónico no es válido.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.login({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (res.data?.token) {
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        // Modo fallback demo
        onLoginSuccess({ email: loginEmail, fullName: 'Tutor Responsable' }, 'demo-token');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al iniciar sesión.';
      // Fallback amigable si el backend no está activo
      if (loginEmail === 'tutor@baprotege.gob.ar' && loginPassword === 'password123') {
        Alert.alert('Acceso Demo', 'Iniciando sesión en modo demostración local.');
        onLoginSuccess({ email: loginEmail, fullName: 'Tutor Responsable (Demo)' }, 'demo-token-123');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Manejador de Recuperación de Contraseña
  // --------------------------------------------------------------------------
  const handleRecoverySubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!recoveryEmail.trim()) {
      setErrorMessage('Por favor, ingresa tu correo electrónico registrado.');
      return;
    }
    if (!validateEmailFormat(recoveryEmail)) {
      setErrorMessage('Ingresa un correo electrónico con formato válido.');
      return;
    }

    setLoading(true);
    try {
      await apiService.recoverPassword(recoveryEmail.trim());
      setRecoverySent(true);
      setSuccessMessage(
        `Hemos enviado las instrucciones para restablecer tu contraseña a ${recoveryEmail.trim()}. Revisa tu bandeja de entrada o spam.`,
      );
    } catch (error: any) {
      // Incluso si la API no está en línea o devuelve mensaje genérico
      setRecoverySent(true);
      setSuccessMessage(
        `Hemos enviado las instrucciones de recuperación a ${recoveryEmail.trim()}.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Manejador de Registro de Cuenta
  // --------------------------------------------------------------------------
  const handleRegisterSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const errors: Record<string, string> = {};

    // 1. Validación de Nombre
    if (!nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio.';
    } else if (nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
    } else if (!validateLettersOnly(nombre)) {
      errors.nombre = 'El nombre solo debe contener letras.';
    }

    // 2. Validación de Apellido
    if (!apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio.';
    } else if (apellido.trim().length < 2) {
      errors.apellido = 'El apellido debe tener al menos 2 caracteres.';
    } else if (!validateLettersOnly(apellido)) {
      errors.apellido = 'El apellido solo debe contener letras.';
    }

    // 3. Validación de Fecha de Nacimiento
    if (fechaNacimiento.trim().length > 0 && fechaNacimiento.length !== 10) {
      errors.fechaNacimiento = 'Formato inválido. Debe ser DD/MM/AAAA.';
    }

    // 4. Validación de Teléfono
    if (telefono.trim().length > 0 && telefono.length < 11) {
      errors.telefono = 'Formato inválido. Debe ser XX XXXX-XXXX.';
    }

    // 5. Validación de Correo Electrónico
    if (!registerEmail.trim()) {
      errors.registerEmail = 'El correo electrónico es obligatorio.';
    } else if (!validateEmailFormat(registerEmail)) {
      errors.registerEmail = 'El correo electrónico no tiene un formato válido.';
    }

    // 6. Validación de Contraseña
    if (!registerPassword) {
      errors.registerPassword = 'La contraseña es obligatoria.';
    } else if (registerPassword.length < 6) {
      errors.registerPassword = 'La contraseña debe tener al menos 6 caracteres.';
    }

    // 7. Validación de Confirmación de Contraseña
    if (!confirmPassword) {
      errors.confirmPassword = 'Debes confirmar tu contraseña.';
    } else if (registerPassword !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMessage('Por favor, corrige los campos marcados en rojo.');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${nombre.trim()} ${apellido.trim()}`;
      const res = await apiService.register({
        email: registerEmail.trim(),
        password: registerPassword,
        fullName,
        firstName: nombre.trim(),
        lastName: apellido.trim(),
        gender: genero,
        birthDate: fechaNacimiento,
        phone: telefono,
      });

      Alert.alert(
        '¡Cuenta Creada Exitosamente!',
        `Bienvenido/a, ${fullName}. Tu cuenta ha sido activada en BA Protege+.`,
      );

      if (res.data?.token) {
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        // Iniciar sesión inmediatamente
        const loginRes = await apiService.login({
          email: registerEmail.trim(),
          password: registerPassword,
        });
        onLoginSuccess(loginRes.data.user, loginRes.data.token);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al registrar la cuenta.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear mensajes al cambiar de vista
  const switchMode = (mode: AuthViewMode) => {
    setViewMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});
    if (mode === 'RECOVERY') {
      setRecoverySent(false);
      setRecoveryEmail(loginEmail || '');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado con Botón de Regreso y Logo */}
        <View style={styles.topBar}>
          {onBack ? (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonIcon}>‹</Text>
              <Text style={styles.backButtonText}>Inicio</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ height: 24 }} />
          )}
        </View>

        {/* Logotipo Genérico Oficial */}
        <View style={styles.logoWrapper}>
          <Logo size="lg" showSubtitle={true} align="center" />
        </View>

        {/* Contenedor Principal de la Tarjeta del Formulario */}
        <View style={styles.card}>
          {/* ============================================================== */}
          {/* VISTA 1: INICIO DE SESIÓN                                       */}
          {/* ============================================================== */}
          {viewMode === 'LOGIN' && (
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
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    placeholder="ejemplo@baprotege.gob.ar"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {loginEmail.length > 0 && (
                    <TouchableOpacity
                      style={styles.inputIconAction}
                      onPress={() => setLoginEmail('')}
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
                  <TouchableOpacity onPress={() => switchMode('RECOVERY')}>
                    <Text style={styles.linkTextSmall}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showLoginPassword}
                    autoCapitalize="none"
                  />
                  <View style={styles.iconActionsRow}>
                    {/* Botón para borrar contraseña */}
                    {loginPassword.length > 0 && (
                      <TouchableOpacity
                        style={styles.inputIconAction}
                        onPress={() => setLoginPassword('')}
                        hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                      >
                        <Text style={styles.clearIconText}>✕</Text>
                      </TouchableOpacity>
                    )}
                    {/* Botón para mostrar / ocultar contraseña */}
                    <TouchableOpacity
                      style={styles.inputIconAction}
                      onPress={() => setShowLoginPassword(!showLoginPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                    >
                      <Text style={styles.eyeIconText}>
                        {showLoginPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Botón Principal Iniciar Sesión */}
              <View style={styles.actionsSection}>
                <ActionButton
                  title="Iniciar Sesión"
                  variant="primary"
                  onPress={handleLoginSubmit}
                  loading={loading}
                />

                {/* Acceso rápido con credenciales de prueba */}
                <TouchableOpacity
                  style={styles.demoFillButton}
                  onPress={() => {
                    setLoginEmail('tutor@baprotege.gob.ar');
                    setLoginPassword('password123');
                    setErrorMessage(null);
                  }}
                >
                  <Text style={styles.demoFillText}>
                    ⚡ Rellenar credenciales de demostración
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>o</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Botón para crear cuenta */}
                <TouchableOpacity
                  style={styles.secondaryCardButton}
                  onPress={() => switchMode('REGISTER')}
                >
                  <Text style={styles.secondaryCardButtonText}>
                    ¿No tienes una cuenta? <Text style={styles.highlightText}>Crear cuenta</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ============================================================== */}
          {/* VISTA 2: RECUPERACIÓN DE CONTRASEÑA                            */}
          {/* ============================================================== */}
          {viewMode === 'RECOVERY' && (
            <View>
              <View style={styles.headerSection}>
                <Text style={styles.title}>Recuperar Contraseña</Text>
                <Text style={styles.subtitle}>
                  Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para restablecer tu acceso.
                </Text>
              </View>

              {errorMessage && (
                <View style={styles.alertError}>
                  <Text style={styles.alertErrorText}>⚠️ {errorMessage}</Text>
                </View>
              )}

              {successMessage ? (
                <View style={styles.alertSuccess}>
                  <Text style={styles.alertSuccessTitle}>✅ Correo enviado</Text>
                  <Text style={styles.alertSuccessText}>{successMessage}</Text>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Correo Electrónico Registrado</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={recoveryEmail}
                      onChangeText={setRecoveryEmail}
                      placeholder="ejemplo@baprotege.gob.ar"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {recoveryEmail.length > 0 && (
                      <TouchableOpacity
                        style={styles.inputIconAction}
                        onPress={() => setRecoveryEmail('')}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.clearIconText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.actionsSection}>
                {!recoverySent && (
                  <ActionButton
                    title="Enviar Instrucciones de Recuperación"
                    variant="primary"
                    onPress={handleRecoverySubmit}
                    loading={loading}
                  />
                )}

                <ActionButton
                  title="Volver a Iniciar Sesión"
                  variant="secondary"
                  onPress={() => switchMode('LOGIN')}
                />
              </View>
            </View>
          )}

          {/* ============================================================== */}
          {/* VISTA 3: CREAR CUENTA / REGISTRO COMPLETO                      */}
          {/* ============================================================== */}
          {viewMode === 'REGISTER' && (
            <View>
              <View style={styles.headerSection}>
                <Text style={styles.title}>Crear Cuenta Responsable</Text>
                <Text style={styles.subtitle}>
                  Registra tus datos personales para administrar la protección digital de tus hijos.
                </Text>
              </View>

              {errorMessage && (
                <View style={styles.alertError}>
                  <Text style={styles.alertErrorText}>⚠️ {errorMessage}</Text>
                </View>
              )}

              {/* Campo 1: Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldErrors.nombre ? styles.inputErrorBorder : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={nombre}
                    onChangeText={(t) => {
                      setNombre(t);
                      if (fieldErrors.nombre) {
                        setFieldErrors((prev) => ({ ...prev, nombre: '' }));
                      }
                    }}
                    placeholder="Ej. Juan"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                  />
                  {nombre.length > 0 && (
                    <TouchableOpacity
                      style={styles.inputIconAction}
                      onPress={() => setNombre('')}
                    >
                      <Text style={styles.clearIconText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {fieldErrors.nombre ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.nombre}</Text>
                ) : null}
              </View>

              {/* Campo 2: Apellido */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apellido *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldErrors.apellido ? styles.inputErrorBorder : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={apellido}
                    onChangeText={(t) => {
                      setApellido(t);
                      if (fieldErrors.apellido) {
                        setFieldErrors((prev) => ({ ...prev, apellido: '' }));
                      }
                    }}
                    placeholder="Ej. Pérez"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                  />
                  {apellido.length > 0 && (
                    <TouchableOpacity
                      style={styles.inputIconAction}
                      onPress={() => setApellido('')}
                    >
                      <Text style={styles.clearIconText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {fieldErrors.apellido ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.apellido}</Text>
                ) : null}
              </View>

              {/* Campo 3: Género en Carrusel Horizontal */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Género</Text>
                  <Text style={styles.carouselHint}>Desliza para elegir ▸</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.genderCarouselContainer}
                >
                  {(
                    [
                      { id: 'Masculino', label: '👨 Masculino' },
                      { id: 'Femenino', label: '👩 Femenino' },
                      { id: 'Otro', label: '🧑 Otro' },
                      { id: 'No informado', label: '⚪ No informado' },
                    ] as { id: GenderOption; label: string }[]
                  ).map((item) => {
                    const isSelected = genero === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.genderCarouselCard,
                          isSelected && styles.genderCarouselCardSelected,
                        ]}
                        onPress={() => setGenero(item.id)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.genderCarouselText,
                            isSelected && styles.genderCarouselTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {/* Indicadores de carrusel */}
                <View style={styles.carouselDotsRow}>
                  {(['Masculino', 'Femenino', 'Otro', 'No informado'] as GenderOption[]).map((opt) => (
                    <View
                      key={opt}
                      style={[
                        styles.carouselDot,
                        genero === opt && styles.carouselDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Campo 4: Fecha de Nacimiento */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha de Nacimiento</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldErrors.fechaNacimiento ? styles.inputErrorBorder : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={fechaNacimiento}
                    onChangeText={(t) => {
                      setFechaNacimiento(formatBirthDate(t));
                      if (fieldErrors.fechaNacimiento) {
                        setFieldErrors((prev) => ({ ...prev, fechaNacimiento: '' }));
                      }
                    }}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {fechaNacimiento.length > 0 && (
                    <TouchableOpacity
                      style={styles.inputIconAction}
                      onPress={() => setFechaNacimiento('')}
                    >
                      <Text style={styles.clearIconText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {fieldErrors.fechaNacimiento ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.fechaNacimiento}</Text>
                ) : null}
              </View>

              {/* Campo 5: Teléfono */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldErrors.telefono ? styles.inputErrorBorder : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={telefono}
                    onChangeText={(t) => {
                      setTelefono(formatPhone(t));
                      if (fieldErrors.telefono) {
                        setFieldErrors((prev) => ({ ...prev, telefono: '' }));
                      }
                    }}
                    placeholder="11 2345-6789"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                  {telefono.length > 0 && (
                    <TouchableOpacity
                      style={styles.inputIconAction}
                      onPress={() => setTelefono('')}
                    >
                      <Text style={styles.clearIconText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {fieldErrors.telefono ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.telefono}</Text>
                ) : null}
              </View>

              {/* Campo Correo Electrónico */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo Electrónico *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldErrors.registerEmail ? styles.inputErrorBorder : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={registerEmail}
                    onChangeText={(t) => {
                      setRegisterEmail(t);
                      if (fieldErrors.registerEmail) {
                        setFieldErrors((prev) => ({ ...prev, registerEmail: '' }));
                      }
                    }}
                    placeholder="tutor@ejemplo.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {registerEmail.length > 0 && (
                    <TouchableOpacity
                      style={styles.inputIconAction}
                      onPress={() => setRegisterEmail('')}
                    >
                      <Text style={styles.clearIconText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {fieldErrors.registerEmail ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.registerEmail}</Text>
                ) : null}
              </View>

              {/* Campo Contraseña (mínimo 6 caracteres) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña (mínimo 6 caracteres) *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldErrors.registerPassword ? styles.inputErrorBorder : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={registerPassword}
                    onChangeText={(t) => {
                      setRegisterPassword(t);
                      if (fieldErrors.registerPassword) {
                        setFieldErrors((prev) => ({ ...prev, registerPassword: '' }));
                      }
                    }}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showRegisterPassword}
                    autoCapitalize="none"
                  />
                  <View style={styles.iconActionsRow}>
                    {registerPassword.length > 0 && (
                      <TouchableOpacity
                        style={styles.inputIconAction}
                        onPress={() => setRegisterPassword('')}
                      >
                        <Text style={styles.clearIconText}>✕</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.inputIconAction}
                      onPress={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      <Text style={styles.eyeIconText}>
                        {showRegisterPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {fieldErrors.registerPassword ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.registerPassword}</Text>
                ) : null}
              </View>

              {/* Campo Confirmar Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Contraseña *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    fieldErrors.confirmPassword ? styles.inputErrorBorder : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <View style={styles.iconActionsRow}>
                    {confirmPassword.length > 0 && (
                      <TouchableOpacity
                        style={styles.inputIconAction}
                        onPress={() => setConfirmPassword('')}
                      >
                        <Text style={styles.clearIconText}>✕</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.inputIconAction}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Text style={styles.eyeIconText}>
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {fieldErrors.confirmPassword ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
                ) : null}
              </View>

              {/* Botón de Creación */}
              <View style={styles.actionsSection}>
                <ActionButton
                  title="Crear Cuenta e Ingresar"
                  variant="primary"
                  onPress={handleRegisterSubmit}
                  loading={loading}
                />

                <TouchableOpacity
                  style={styles.secondaryCardButton}
                  onPress={() => switchMode('LOGIN')}
                >
                  <Text style={styles.secondaryCardButtonText}>
                    ¿Ya tienes una cuenta? <Text style={styles.highlightText}>Iniciar Sesión</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Pie de página institucional */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            🔒 Sistema de Protección Oficial contra el Juego Ilegal
          </Text>
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
    paddingBottom: 40,
  },
  topBar: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: 4,
    lineHeight: 24,
  },
  backButtonText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 4,
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
  alertSuccess: {
    backgroundColor: colors.statusActiveBg,
    borderColor: '#BADBCC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  alertSuccessTitle: {
    color: colors.statusActive,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertSuccessText: {
    color: '#0F5132',
    fontSize: 13,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
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
  inputErrorBorder: {
    borderColor: colors.statusDanger,
    backgroundColor: '#FFF8F8',
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
  eyeIconText: {
    fontSize: 16,
  },
  fieldErrorText: {
    fontSize: 11,
    color: colors.statusDanger,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 2,
  },
  carouselHint: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  genderCarouselContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  genderCarouselCard: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  genderCarouselCardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  genderCarouselText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  genderCarouselTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  carouselDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  carouselDotActive: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
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
  footerNote: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
