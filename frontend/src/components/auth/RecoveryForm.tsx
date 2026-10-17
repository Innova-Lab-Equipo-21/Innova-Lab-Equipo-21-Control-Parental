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
  ActivityIndicator,
} from 'react-native';
import { styles } from './RecoveryForm.styles';
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
        <Text style={styles.title}>Recuperar contraseña</Text>
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
          <Text style={styles.label}>Correo electrónico</Text>
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

      <View style={styles.dualButtonContainer}>
        <TouchableOpacity
          style={recoverySent ? styles.secondaryButtonFull : styles.secondaryButton}
          onPress={() => onSwitchMode('LOGIN')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </TouchableOpacity>

        {!recoverySent && (
          <TouchableOpacity
            style={styles.primaryButtonHalf}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                style={styles.primaryButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Recuperar contraseña
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

