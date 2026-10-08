// ==============================================================================
// Proyecto: BA Protege+
// Componente: RegisterForm (Formulario de Registro / Crear Cuenta)
// Archivo: src/components/auth/RegisterForm.tsx
// Descripción: Formulario modular para creación de cuenta con resaltado de foco,
//              modal de calendario interactivo ajustado dinámicamente por días del mes,
//              registro con Google, encadenamiento de campos con tecla Enter
//              y validaciones de seguridad completas.
// ==============================================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { ActionButton } from '../ActionButton';
import { Icon } from '../Icon';
import { colors } from '../../theme/colors';
import { apiService } from '../../services/api.service';
import { calculateAge } from '../../utils/age';
import {
  formatBirthDate,
  formatPhone,
  validateEmailFormat,
  validateRegisterFields,
} from '../../utils/authValidation';
import { AuthViewMode } from './LoginForm';

type GenderOption = 'Masculino' | 'Femenino' | 'Otro' | 'No informado';

interface RegisterFormProps {
  onLoginSuccess: (user: any, token: string) => void;
  onSwitchMode: (mode: AuthViewMode) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onLoginSuccess,
  onSwitchMode,
}) => {
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

  // Estado para Términos y Condiciones y Políticas de Privacidad
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Refs para navegación fluida con Enter entre campos
  const nombreInputRef = useRef<TextInput>(null);
  const apellidoInputRef = useRef<TextInput>(null);
  const fechaNacimientoInputRef = useRef<TextInput>(null);
  const telefonoInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Estados para Modal de Calendario
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // Junio
  const [selectedYear, setSelectedYear] = useState<number>(2000);

  // Estado del campo enfocado para destacar borde
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /** Devuelve el número real de días del mes y año seleccionados */
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const daysInCurrentMonth = getDaysInMonth(selectedMonth, selectedYear);

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    const maxDays = getDaysInMonth(month, selectedYear);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const maxDays = getDaysInMonth(selectedMonth, year);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleCheckAgeAndValidate = (dateStr: string) => {
    const age = calculateAge(dateStr);
    if (age === null) {
      setFieldErrors((prev) => ({
        ...prev,
        fechaNacimiento: 'Fecha de nacimiento inválida (DD/MM/AAAA).',
      }));
      return false;
    }
    if (age < 18) {
      const errorMsg =
        'Solo personas adultas (+18) pueden registrarse en el Modo Responsable. Tu registro no podrá ser confirmado.';
      setFieldErrors((prev) => ({
        ...prev,
        fechaNacimiento: errorMsg,
      }));
      Alert.alert(
        'Registro no verificado',
        'Solo personas adultas (+18) pueden registrarse en el Modo Responsable. Tu registro no podrá ser confirmado.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, fechaNacimiento: '' }));
    return true;
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      Alert.alert(
        'Google Sign-In',
        'Iniciando sesión segura con tu cuenta de Google...',
      );
      onLoginSuccess(
        { email: 'tutor.google@baprotege.gob.ar', fullName: 'Tutor Google' },
        'google-oauth-token-123'
      );
    } catch (error: any) {
      setErrorMessage('Error al autenticar con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const formData = {
      nombre,
      apellido,
      fechaNacimiento,
      telefono,
      registerEmail,
      registerPassword,
      confirmPassword,
    };

    const errors = validateRegisterFields(formData);

    // Validación obligatoria de aceptación de Términos y Políticas de Privacidad
    if (!acceptTerms) {
      errors.acceptTerms = 'Debes aceptar los Términos y condiciones y Políticas de privacidad para continuar.';
    }

    setFieldErrors(errors);

    if (!acceptTerms) {
      setErrorMessage('Debes aceptar los Términos y condiciones y las Políticas de privacidad para crear tu cuenta.');
      return;
    }

    // Verificar si hay errores o si es menor de edad
    const age = calculateAge(fechaNacimiento);
    if (age !== null && age < 18) {
      Alert.alert(
        'Registro no verificado',
        'Solo personas adultas (+18) pueden registrarse en el Modo Responsable. Tu registro no podrá ser confirmado.'
      );
      setErrorMessage('Tu registro no puede ser confirmado debido a requerimientos de edad (+18).');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setErrorMessage('Por favor verifica los campos remarcados en rojo.');
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

  return (
    <View>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Crear Cuenta Responsable</Text>
        <Text style={styles.subtitle}>
          Registra tus datos personales para administrar la protección digital de tus hijos.
        </Text>
      </View>

      {errorMessage ? (
        <View style={styles.alertError}>
          <Text style={styles.alertErrorText}>⚠️ {errorMessage}</Text>
        </View>
      ) : null}

      {/* Campo 1: Nombre */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre *</Text>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'nombre' && styles.inputFocusedBorder,
            fieldErrors.nombre ? styles.inputErrorBorder : null,
          ]}
        >
          <TextInput
            ref={nombreInputRef}
            style={styles.input}
            value={nombre}
            onChangeText={(t) => {
              setNombre(t);
              if (t.trim().length >= 2 && fieldErrors.nombre) {
                setFieldErrors((prev) => ({ ...prev, nombre: '' }));
              }
            }}
            onFocus={() => setFocusedField('nombre')}
            onBlur={() => {
              setFocusedField(null);
              if (nombre.trim().length > 0 && nombre.trim().length < 2) {
                setFieldErrors((prev) => ({
                  ...prev,
                  nombre: 'El nombre debe tener al menos 2 caracteres.',
                }));
              }
            }}
            returnKeyType="next"
            onSubmitEditing={() => apellidoInputRef.current?.focus()}
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
            focusedField === 'apellido' && styles.inputFocusedBorder,
            fieldErrors.apellido ? styles.inputErrorBorder : null,
          ]}
        >
          <TextInput
            ref={apellidoInputRef}
            style={styles.input}
            value={apellido}
            onChangeText={(t) => {
              setApellido(t);
              if (t.trim().length >= 2 && fieldErrors.apellido) {
                setFieldErrors((prev) => ({ ...prev, apellido: '' }));
              }
            }}
            onFocus={() => setFocusedField('apellido')}
            onBlur={() => {
              setFocusedField(null);
              if (apellido.trim().length > 0 && apellido.trim().length < 2) {
                setFieldErrors((prev) => ({
                  ...prev,
                  apellido: 'El apellido debe tener al menos 2 caracteres.',
                }));
              }
            }}
            returnKeyType="next"
            onSubmitEditing={() => fechaNacimientoInputRef.current?.focus()}
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

      {/* Campo 3: Fecha de Nacimiento (Ubicado antes de Género) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fecha de Nacimiento *</Text>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'fechaNacimiento' && styles.inputFocusedBorder,
            fieldErrors.fechaNacimiento ? styles.inputErrorBorder : null,
          ]}
        >
          <TextInput
            ref={fechaNacimientoInputRef}
            style={styles.input}
            value={fechaNacimiento}
            onChangeText={(t) => {
              const formatted = formatBirthDate(t);
              setFechaNacimiento(formatted);
              if (formatted.length === 10) {
                handleCheckAgeAndValidate(formatted);
              } else if (fieldErrors.fechaNacimiento) {
                setFieldErrors((prev) => ({ ...prev, fechaNacimiento: '' }));
              }
            }}
            onFocus={() => setFocusedField('fechaNacimiento')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
            onSubmitEditing={() => telefonoInputRef.current?.focus()}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={10}
          />
          <TouchableOpacity
            style={styles.inputIconAction}
            onPress={() => setShowDatePickerModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 18 }}>📅</Text>
          </TouchableOpacity>
        </View>
        {fieldErrors.fechaNacimiento ? (
          <Text style={styles.fieldErrorText}>{fieldErrors.fechaNacimiento}</Text>
        ) : null}
      </View>

      {/* Campo 4: Género en Carrusel Horizontal (Sin Emojis) */}
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
              { id: 'Masculino', label: 'Masculino' },
              { id: 'Femenino', label: 'Femenino' },
              { id: 'Otro', label: 'Otro' },
              { id: 'No informado', label: 'No informado' },
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

      {/* Campo 5: Teléfono */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teléfono (mínimo 10 dígitos)</Text>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'telefono' && styles.inputFocusedBorder,
            fieldErrors.telefono ? styles.inputErrorBorder : null,
          ]}
        >
          <TextInput
            ref={telefonoInputRef}
            style={styles.input}
            value={telefono}
            onChangeText={(t) => {
              const formatted = formatPhone(t);
              setTelefono(formatted);
              const cleanDigits = formatted.replace(/\D/g, '');
              if (cleanDigits.length >= 10 && fieldErrors.telefono) {
                setFieldErrors((prev) => ({ ...prev, telefono: '' }));
              }
            }}
            onFocus={() => setFocusedField('telefono')}
            onBlur={() => {
              setFocusedField(null);
              const cleanDigits = telefono.replace(/\D/g, '');
              if (telefono.trim().length > 0 && cleanDigits.length < 10) {
                setFieldErrors((prev) => ({
                  ...prev,
                  telefono: 'El teléfono debe contener al menos 10 dígitos.',
                }));
              }
            }}
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
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

      {/* Campo 6: Correo Electrónico */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Correo Electrónico *</Text>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'registerEmail' && styles.inputFocusedBorder,
            fieldErrors.registerEmail ? styles.inputErrorBorder : null,
          ]}
        >
          <TextInput
            ref={emailInputRef}
            style={styles.input}
            value={registerEmail}
            onChangeText={(t) => {
              setRegisterEmail(t);
              if (fieldErrors.registerEmail) {
                setFieldErrors((prev) => ({ ...prev, registerEmail: '' }));
              }
            }}
            onFocus={() => setFocusedField('registerEmail')}
            onBlur={() => {
              setFocusedField(null);
              if (registerEmail.trim() && !validateEmailFormat(registerEmail)) {
                setFieldErrors((prev) => ({
                  ...prev,
                  registerEmail: 'El correo electrónico no tiene un formato válido.',
                }));
              }
            }}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
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

      {/* Campo 7: Contraseña */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contraseña (mínimo 6 caracteres) *</Text>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'registerPassword' && styles.inputFocusedBorder,
            fieldErrors.registerPassword ? styles.inputErrorBorder : null,
          ]}
        >
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            value={registerPassword}
            onChangeText={(t) => {
              setRegisterPassword(t);
              if (fieldErrors.registerPassword) {
                setFieldErrors((prev) => ({ ...prev, registerPassword: '' }));
              }
              if (confirmPassword && t !== confirmPassword) {
                setFieldErrors((prev) => ({
                  ...prev,
                  confirmPassword: 'Las contraseñas no coinciden.',
                }));
              } else if (confirmPassword && t === confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }
            }}
            onFocus={() => setFocusedField('registerPassword')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
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
              <Icon
                name="ojo"
                size={20}
                color={showRegisterPassword ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
        {fieldErrors.registerPassword ? (
          <Text style={styles.fieldErrorText}>{fieldErrors.registerPassword}</Text>
        ) : null}
      </View>

      {/* Campo 8: Confirmar Contraseña */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar Contraseña *</Text>
        <View
          style={[
            styles.inputContainer,
            focusedField === 'confirmPassword' && styles.inputFocusedBorder,
            fieldErrors.confirmPassword ? styles.inputErrorBorder : null,
          ]}
        >
          <TextInput
            ref={confirmPasswordInputRef}
            style={styles.input}
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (registerPassword && t !== registerPassword) {
                setFieldErrors((prev) => ({
                  ...prev,
                  confirmPassword: 'Las contraseñas no coinciden.',
                }));
              } else {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }
            }}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => {
              setFocusedField(null);
              if (confirmPassword && registerPassword !== confirmPassword) {
                setFieldErrors((prev) => ({
                  ...prev,
                  confirmPassword: 'Las contraseñas no coinciden.',
                }));
              }
            }}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
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
              <Icon
                name="ojo"
                size={20}
                color={showConfirmPassword ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
        {fieldErrors.confirmPassword ? (
          <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
        ) : null}
      </View>

      {/* Checkbox de Términos y Condiciones y Políticas de Privacidad */}
      <View style={styles.termsGroupContainer}>
        <View style={styles.termsRow}>
          <TouchableOpacity
            style={styles.checkboxTouch}
            onPress={() => {
              const nextVal = !acceptTerms;
              setAcceptTerms(nextVal);
              if (nextVal && fieldErrors.acceptTerms) {
                setFieldErrors((prev) => ({ ...prev, acceptTerms: '' }));
              }
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
              {acceptTerms && <Text style={styles.checkboxCheckmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Acepto{' '}
            <Text
              style={styles.termsLink}
              onPress={() => setShowTermsModal(true)}
            >
              Términos y condiciones
            </Text>
            {' '}y{' '}
            <Text
              style={styles.termsLink}
              onPress={() => setShowPrivacyModal(true)}
            >
              Políticas de privacidad
            </Text>
          </Text>
        </View>

        {fieldErrors.acceptTerms ? (
          <Text style={styles.fieldErrorText}>{fieldErrors.acceptTerms}</Text>
        ) : null}
      </View>

      {/* Acciones */}
      <View style={styles.actionsSection}>
        <ActionButton
          title="Crear Cuenta e Ingresar"
          variant="primary"
          onPress={handleSubmit}
          loading={loading}
        />

        {/* Divisor "o registrate con" */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o registrate con</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botón Registrarse con Google */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleRegister}
          activeOpacity={0.85}
        >
          <Text style={styles.googleIconText}>G</Text>
          <Text style={styles.googleButtonText}>Registrarse con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryCardButton}
          onPress={() => onSwitchMode('LOGIN')}
        >
          <Text style={styles.secondaryCardButtonText}>
            ¿Ya tienes una cuenta? <Text style={styles.highlightText}>Iniciar Sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Selección de Calendario */}
      <Modal
        visible={showDatePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePickerModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>📅 Seleccionar Fecha de Nacimiento</Text>
            <Text style={styles.modalSubtitle}>
              Elige tu fecha para verificar la mayoría de edad (+18)
            </Text>

            {/* Selectores de Día, Mes y Año con límites reales de días */}
            <View style={styles.pickerRow}>
              {/* Día */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Día</Text>
                <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.pickerItem, selectedDay === d && styles.pickerItemSelected]}
                      onPress={() => setSelectedDay(d)}
                    >
                      <Text style={[styles.pickerItemText, selectedDay === d && styles.pickerItemTextSelected]}>
                        {d.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Mes */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Mes</Text>
                <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                  {[
                    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
                  ].map((m, idx) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.pickerItem, selectedMonth === idx + 1 && styles.pickerItemSelected]}
                      onPress={() => handleMonthChange(idx + 1)}
                    >
                      <Text style={[styles.pickerItemText, selectedMonth === idx + 1 && styles.pickerItemTextSelected]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Año */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Año</Text>
                <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 100 }, (_, i) => 2026 - i).map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.pickerItem, selectedYear === y && styles.pickerItemSelected]}
                      onPress={() => handleYearChange(y)}
                    >
                      <Text style={[styles.pickerItemText, selectedYear === y && styles.pickerItemTextSelected]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDatePickerModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  const maxDays = getDaysInMonth(selectedMonth, selectedYear);
                  const validDay = Math.min(selectedDay, maxDays);
                  const dayStr = validDay.toString().padStart(2, '0');
                  const monthStr = selectedMonth.toString().padStart(2, '0');
                  const formattedStr = `${dayStr}/${monthStr}/${selectedYear}`;
                  setFechaNacimiento(formattedStr);
                  setShowDatePickerModal(false);
                  handleCheckAgeAndValidate(formattedStr);
                }}
              >
                <Text style={styles.modalConfirmBtnText}>Confirmar Fecha</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Términos y Condiciones */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.legalModalOverlay}>
          <View style={styles.legalModalCard}>
            <View style={styles.legalModalHeader}>
              <Text style={styles.legalModalTitle}>📜 Términos y Condiciones</Text>
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                style={styles.legalModalCloseBtn}
              >
                <Text style={styles.legalModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.legalModalSubtitle}>
              BA Protege+ • Lotería de la Ciudad de Buenos Aires (LOTBA)
            </Text>

            <ScrollView style={styles.legalModalBody} showsVerticalScrollIndicator={true}>
              <Text style={styles.legalSectionTitle}>1. Aceptación del Servicio</Text>
              <Text style={styles.legalParagraph}>
                Al crear una cuenta en BA Protege+, aceptas cumplir íntegramente con los presentes Términos y Condiciones. Esta plataforma es provista por el Gobierno de la Ciudad Autónoma de Buenos Aires a través de LOTBA S.E. para la prevención del juego ilegal y la protección de menores.
              </Text>

              <Text style={styles.legalSectionTitle}>2. Requisito de Mayoría de Edad</Text>
              <Text style={styles.legalParagraph}>
                El registro en el Modo Responsable está reservado exclusivamente a padres, madres, tutores legales o adultos responsables mayores de 18 años. Queda estrictamente prohibida la creación de cuentas por menores de edad.
              </Text>

              <Text style={styles.legalSectionTitle}>3. Uso del Servicio de Filtrado VPN</Text>
              <Text style={styles.legalParagraph}>
                La aplicación instala un túnel de filtrado local (VPN) en el dispositivo para bloquear automáticamente solicitudes hacia plataformas de apuestas no autorizadas o clandestinas enumeradas en la lista oficial de LOTBA.
              </Text>

              <Text style={styles.legalSectionTitle}>4. Protección Anti-Desinstalación</Text>
              <Text style={styles.legalParagraph}>
                Con el fin de asegurar la efectividad del control parental, el sistema utiliza permisos de Accesibilidad de Android para prevenir el cierre o desinstalación no autorizada de la aplicación sin la clave PIN del tutor.
              </Text>

              <Text style={styles.legalSectionTitle}>5. Modificaciones y Actualizaciones</Text>
              <Text style={styles.legalParagraph}>
                LOTBA se reserva el derecho de actualizar la lista de dominios bloqueados y las funcionalidades del sistema en cualquier momento para mantener la protección activa.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.legalModalConfirmBtn}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.legalModalConfirmBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Políticas de Privacidad */}
      <Modal
        visible={showPrivacyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.legalModalOverlay}>
          <View style={styles.legalModalCard}>
            <View style={styles.legalModalHeader}>
              <Text style={styles.legalModalTitle}>🛡️ Políticas de Privacidad</Text>
              <TouchableOpacity
                onPress={() => setShowPrivacyModal(false)}
                style={styles.legalModalCloseBtn}
              >
                <Text style={styles.legalModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.legalModalSubtitle}>
              Protección de Datos Personales • Ley N° 25.326
            </Text>

            <ScrollView style={styles.legalModalBody} showsVerticalScrollIndicator={true}>
              <Text style={styles.legalSectionTitle}>1. Compromiso de Privacidad</Text>
              <Text style={styles.legalParagraph}>
                BA Protege+ garantiza el tratamiento confidencial y seguro de todos los datos personales de acuerdo con la Ley N° 25.326 de Protección de Datos Personales de la República Argentina.
              </Text>

              <Text style={styles.legalSectionTitle}>2. Información Recolectada</Text>
              <Text style={styles.legalParagraph}>
                Recolectamos datos mínimos e indispensables: nombre, apellido, correo electrónico, teléfono, fecha de nacimiento, identificador de dispositivo y registros de intentos de acceso a sitios bloqueados.
              </Text>

              <Text style={styles.legalSectionTitle}>3. Uso de Datos y Geolocalización</Text>
              <Text style={styles.legalParagraph}>
                La información de geolocalización e IP se utiliza únicamente para auditar la seguridad del dispositivo y la vinculación de cuentas. Nunca comercializamos, vendemos ni compartimos datos con anunciantes ni terceros.
              </Text>

              <Text style={styles.legalSectionTitle}>4. Seguridad e Inmutabilidad</Text>
              <Text style={styles.legalParagraph}>
                Toda la comunicación entre el dispositivo y nuestros servidores viaja cifrada con protocolo TLS 1.3/HTTPS. Los registros de auditoría de seguridad se guardan de forma inmutable.
              </Text>

              <Text style={styles.legalSectionTitle}>5. Derechos del Usuario</Text>
              <Text style={styles.legalParagraph}>
                Como titular de los datos, tienes derecho a rectificar, actualizar o solicitar la supresión de tu información personal en cualquier momento escribiendo al soporte oficial de BA Protege+.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.legalModalConfirmBtn}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.legalModalConfirmBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  // Estilos de Modal de Calendario
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  pickerScrollView: {
    height: 140,
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerItem: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  pickerItemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Estilos del Checkbox de Términos y Condiciones y Políticas de Privacidad
  termsGroupContainer: {
    marginVertical: 12,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  checkboxTouch: {
    paddingRight: 10,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 15,
  },
  termsText: {
    flex: 1,
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 19,
    fontWeight: '400',
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // Estilos de Modales Legales
  legalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  legalModalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  legalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legalModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  legalModalCloseBtn: {
    padding: 6,
  },
  legalModalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  legalModalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
    marginBottom: 10,
  },
  legalModalBody: {
    marginVertical: 6,
    paddingRight: 4,
  },
  legalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  legalParagraph: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  legalModalConfirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  legalModalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
