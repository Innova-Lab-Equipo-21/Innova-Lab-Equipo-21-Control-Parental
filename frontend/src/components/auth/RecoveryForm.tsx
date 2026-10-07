// ==============================================================================
// Proyecto: BA Protege+
// Componente: RecoveryForm (Formulario de Recuperación de Contraseña)
// Archivo: src/components/auth/RecoveryForm.tsx
// Descripción: Formulario modular para solicitar instrucciones de restablecimiento.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ActionButton } from '../ActionButton';
import { colors } from '../../theme/colors';
import { apiService } from '../../services/api.service';
import { validateEmailFormat } from '../../utils/authValidation';
import { AuthViewMode } from './LoginForm';

interface RecoveryFormProps {
  onSwitchMode: (mode: AuthViewMode) => void;
  initialEmail?: string;
}

export const RecoveryForm: React.FC<RecoveryFormProps> = ({
  onSwitchMode,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor, ingresa tu correo electrónico registrado.');
      return;
    }
    if (!validateEmailFormat(email)) {
      setErrorMessage('Ingresa un correo electrónico con formato válido.');
      return;
    }

    setLoading(true);
    try {
      await apiService.recoverPassword(email.trim());
      setRecoverySent(true);
      setSuccessMessage(
        `Hemos enviado las instrucciones para restablecer tu contraseña a ${email.trim()}. Revisa tu bandeja de entrada o spam.`,
      );
    } catch (error: any) {
      setRecoverySent(true);
      setSuccessMessage(
        `Hemos enviado las instrucciones de recuperación a ${email.trim()}.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <View
            style={[
              styles.inputContainer,
              focusedField === 'email' && styles.inputFocusedBorder,
            ]}
          >
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
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
      )}

      <View style={styles.actionsSection}>
        {!recoverySent && (
          <ActionButton
            title="Enviar Instrucciones de Recuperación"
            variant="primary"
            onPress={handleSubmit}
            loading={loading}
          />
        )}

        <ActionButton
          title="Volver a Iniciar Sesión"
          variant="secondary"
          onPress={() => onSwitchMode('LOGIN')}
        />
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
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
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
});
