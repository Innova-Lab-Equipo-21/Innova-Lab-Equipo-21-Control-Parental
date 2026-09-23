// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Pareamiento)
// Archivo: src/screens/PairingScreen.tsx
// Descripción: Flujo de vinculación segura mediante código numérico de 6 dígitos.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme/colors';
import { apiService } from '../services/api.service';

interface PairingScreenProps {
  onPairingComplete: (deviceId: string, deviceUuid: string) => void;
  onBack: () => void;
}

export const PairingScreen: React.FC<PairingScreenProps> = ({
  onPairingComplete,
  onBack,
}) => {
  const [code, setCode] = useState('');
  const [deviceName, setDeviceName] = useState('Samsung Galaxy A54');
  const [childName, setChildName] = useState('Mateo');
  const [loading, setLoading] = useState(false);

  const handlePairing = async () => {
    if (code.trim().length !== 6) {
      Alert.alert('Código incompleto', 'Por favor ingresa el código numérico de 6 dígitos provisto por el responsable.');
      return;
    }

    setLoading(true);
    try {
      // Generar UUID único local para este dispositivo si no existe
      const deviceUuid = 'dev-uuid-' + Math.random().toString(36).substring(2, 9);

      const result = await apiService.confirmPairing({
        pairingCode: code.trim(),
        deviceUuid,
        deviceName: deviceName.trim(),
        childName: childName.trim(),
        osVersion: 'Android 14 / SDK 35',
        appVersion: '1.0.0',
      });

      Alert.alert('¡Vinculación Exitosa!', 'El dispositivo ha quedado vinculado al perfil del responsable.');
      onPairingComplete(result.data.deviceId, result.data.deviceUuid);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Código de pareamiento inválido o expirado';
      Alert.alert('Error de Vinculación', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Vincular Dispositivo"
        subtitle="Ingresa el código generado desde la app del responsable"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.formContainer}>
          <Text style={styles.label}>Código de Vinculación (6 dígitos)</Text>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <Text style={styles.label}>Nombre para este dispositivo</Text>
          <TextInput
            style={styles.textInput}
            value={deviceName}
            onChangeText={setDeviceName}
            placeholder="Ej: Tablet de Sofía"
          />

          <Text style={styles.label}>Nombre del menor (opcional)</Text>
          <TextInput
            style={styles.textInput}
            value={childName}
            onChangeText={setChildName}
            placeholder="Ej: Sofía"
          />

          <View style={styles.buttonGroup}>
            <ActionButton
              title="Confirmar y Activar Protección"
              onPress={handlePairing}
              loading={loading}
            />
            <ActionButton
              title="Volver"
              variant="secondary"
              onPress={onBack}
              disabled={loading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 12,
  },
  codeInput: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    height: 64,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: colors.textPrimary,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  buttonGroup: {
    marginTop: 24,
  },
});
