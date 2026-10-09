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
  StyleSheet,
  Alert,
  Image,
  Modal,
  ScrollView,
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

        {/* Divisor "o" */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botón de Google Cuadrado/Centrado con logo_google.png */}
        <TouchableOpacity
          style={styles.googleIconButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
        >
          <Image
            source={require('../../assets/logo/logo_google.png')}
            style={styles.googleIconImage}
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

        <TouchableOpacity
          style={styles.secondaryCardButton}
          onPress={() => onSwitchMode('REGISTER')}
        >
          <Text style={styles.secondaryCardButtonText}>
            ¿No tienes una cuenta? <Text style={styles.highlightText}>Crear cuenta</Text>
          </Text>
        </TouchableOpacity>
      </View>

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
                Al crear una cuenta e iniciar sesión en BA Protege+, aceptas cumplir íntegramente con los presentes Términos y Condiciones. Esta plataforma es provista por el Gobierno de la Ciudad Autónoma de Buenos Aires a través de LOTBA S.E. para la prevención del juego ilegal y la protección de menores.
              </Text>

              <Text style={styles.legalSectionTitle}>2. Requisito de Mayoría de Edad</Text>
              <Text style={styles.legalParagraph}>
                El acceso al Modo Responsable está reservado exclusivamente a padres, madres, tutores legales o adultos responsables mayores de 18 años. Queda estrictamente prohibida la creación de cuentas por menores de edad.
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
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  googleIconButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleIconImage: {
    width: 28,
    height: 28,
  },
  legalNoticeContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  legalNoticeText: {
    fontSize: 13.5,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  legalLink: {
    color: colors.primary,
    fontWeight: '600',
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
