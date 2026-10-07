// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Pareamiento)
// Archivo: src/screens/PairingScreen.tsx
// Descripción: Flujo de vinculación mediante Código de 6 Dígitos o Escaneo de QR.
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
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';
import { Header } from '../components/Header';
import { Logo } from '../components/Logo';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme/colors';
import { apiService } from '../services/api.service';

type PairingMethod = 'CODE' | 'QR';

interface PairingScreenProps {
  onPairingComplete: (deviceId: string, deviceUuid: string) => void;
  onBack: () => void;
}

export const PairingScreen: React.FC<PairingScreenProps> = ({
  onPairingComplete,
  onBack,
}) => {
  const [method, setMethod] = useState<PairingMethod>('CODE');
  const [code, setCode] = useState('');
  const [deviceName, setDeviceName] = useState('Samsung Galaxy A54');
  const [childName, setChildName] = useState('Mateo');
  const [loading, setLoading] = useState(false);
  const [isScanningQR, setIsScanningQR] = useState(false);

  const handlePairing = async (pairingCodeOverride?: string) => {
    const activeCode = (pairingCodeOverride || code).trim();
    if (activeCode.length !== 6) {
      Alert.alert(
        'Código incompleto',
        'Por favor ingresa o escanea un código numérico de 6 dígitos provisto por el responsable.'
      );
      return;
    }

    setLoading(true);
    try {
      const deviceUuid = 'dev-uuid-' + Math.random().toString(36).substring(2, 9);

      const result = await apiService.confirmPairing({
        pairingCode: activeCode,
        deviceUuid,
        deviceName: deviceName.trim(),
        childName: childName.trim(),
        osVersion: 'Android 14 / SDK 35',
        appVersion: '1.0.0',
      });

      Alert.alert(
        '¡Vinculación Exitosa!',
        'El dispositivo ha quedado vinculado al perfil del responsable.'
      );
      onPairingComplete(result.data.deviceId, result.data.deviceUuid);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Código de pareamiento inválido o expirado';
      Alert.alert('Error de Vinculación', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateQRScan = () => {
    setIsScanningQR(true);
    setTimeout(() => {
      const simulatedCode = '123456';
      setCode(simulatedCode);
      setIsScanningQR(false);
      Alert.alert(
        '📷 Código QR Escaneado',
        `Se detectó el código ${simulatedCode}. Confirma para vincular.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Vincular Ahora', onPress: () => handlePairing(simulatedCode) },
        ]
      );
    }, 1200);
  };

  const handleOpenCameraScanner = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permiso de Cámara Requerido',
            message: 'BA Protege+ necesita acceso a la cámara para escanear el código QR del tutor.',
            buttonNeutral: 'Luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Permitir',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          handleSimulateQRScan();
        } else {
          Alert.alert(
            'Permiso Denegado',
            'No se concedió acceso a la cámara. Puedes utilizar el ingreso por Código de 6 Dígitos.'
          );
        }
      } catch (err) {
        handleSimulateQRScan();
      }
    } else {
      handleSimulateQRScan();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.logoWrapper}>
        <Logo variant="complete" size="md" align="center" />
      </View>
      <Header
        title="Vincular Dispositivo"
        subtitle="Ingresa el código numérico o escanea el QR generado por el tutor"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.formContainer}>
          {/* Segmented Tabs para seleccionar método de vinculación */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, method === 'CODE' && styles.tabButtonActive]}
              onPress={() => setMethod('CODE')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabButtonText, method === 'CODE' && styles.tabButtonTextActive]}>
                🔢 Código 6 Dígitos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, method === 'QR' && styles.tabButtonActive]}
              onPress={() => setMethod('QR')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabButtonText, method === 'QR' && styles.tabButtonTextActive]}>
                📷 Escanear QR
              </Text>
            </TouchableOpacity>
          </View>

          {/* VISTA 1: INGRESO POR CÓDIGO DE 6 DÍGITOS */}
          {method === 'CODE' && (
            <View>
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
            </View>
          )}

          {/* VISTA 2: ESCANEO POR CÓDIGO QR */}
          {method === 'QR' && (
            <View style={styles.qrSectionContainer}>
              <Text style={styles.label}>Escanear Código QR del Tutor</Text>
              <View style={styles.qrViewport}>
                <View style={styles.qrTargetBox}>
                  <Text style={styles.qrIconLarge}>📷</Text>
                  <Text style={styles.qrStatusText}>
                    {isScanningQR
                      ? 'Analizando código QR...'
                      : code
                      ? `Código QR detectado: ${code}`
                      : 'Apunta la cámara al QR generado en el celular del tutor'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.scanQrBtn}
                onPress={handleOpenCameraScanner}
                activeOpacity={0.85}
              >
                <Text style={styles.scanQrBtnText}>
                  {isScanningQR ? '⌛ Escaneando...' : '📷 Abrir Cámara / Escanear QR'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Campos comunes de identificación del dispositivo */}
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
              onPress={() => handlePairing()}
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
  logoWrapper: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  codeInput: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    height: 56,
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 6,
    color: colors.textPrimary,
  },
  qrSectionContainer: {
    alignItems: 'center',
  },
  qrViewport: {
    width: '100%',
    height: 140,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 12,
  },
  qrTargetBox: {
    alignItems: 'center',
  },
  qrIconLarge: {
    fontSize: 32,
    marginBottom: 6,
  },
  qrStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  scanQrBtn: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  scanQrBtnText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  buttonGroup: {
    marginTop: 18,
  },
});
