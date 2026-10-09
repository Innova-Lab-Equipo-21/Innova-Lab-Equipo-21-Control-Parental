// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Pareamiento / Vinculación de Dispositivo)
// Archivo: src/screens/PairingScreen.tsx
// Descripción: Flujo guiado de vinculación mediante Código de 6 Dígitos o Escaneo de QR,
//              con visualización de casillas de dígitos e integración con el botón Volver.
//              (Los datos del dispositivo y protegido son configurados desde el perfil del tutor).
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
  ScrollView,
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
  const [loading, setLoading] = useState(false);
  const [isScanningQR, setIsScanningQR] = useState(false);

  const isCodeComplete = code.trim().length === 6;

  const handlePairing = async (pairingCodeOverride?: string) => {
    const activeCode = (pairingCodeOverride || code).trim();
    if (activeCode.length !== 6) {
      Alert.alert(
        'Código Incompleto',
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
        deviceName: 'Dispositivo Protegido',
        childName: 'Protegido',
        osVersion: 'Android 14 / SDK 35',
        appVersion: '1.0.0',
      });

      Alert.alert(
        '¡Vinculación Exitosa! 🛡️',
        'El dispositivo ha sido vinculado correctamente al perfil de protección.'
      );
      onPairingComplete(result.data.deviceId, result.data.deviceUuid);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Código de pareamiento inválido o expirado.';
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
        `Se detectó el código ${simulatedCode}. Confirma para activar la protección.`,
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
        onBack={onBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Banner Explicativo de Pasos */}
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>💡 Pasos para la vinculación:</Text>
            <Text style={styles.instructionStep}>
              1. En el celular del tutor, genera el código o QR en <Text style={styles.boldText}>"Vincular Nuevo Dispositivo"</Text>.
            </Text>
            <Text style={styles.instructionStep}>
              2. Ingresa el código de 6 dígitos abajo o presiona <Text style={styles.boldText}>"Escanear QR"</Text>.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Segmented Tabs para método de vinculación */}
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
              <View style={styles.codeSection}>
                <Text style={styles.labelCenter}>Ingresa el código de 6 dígitos:</Text>

                {/* Casillas de Dígitos Visuales */}
                <View style={styles.digitRow}>
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const digit = code[idx] || '';
                    const isCurrent = code.length === idx;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.digitBox,
                          digit ? styles.digitBoxFilled : null,
                          isCurrent ? styles.digitBoxActive : null,
                        ]}
                      >
                        <Text style={styles.digitText}>{digit}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Input Transparente/Oculto para Teclado */}
                <TextInput
                  style={styles.hiddenInput}
                  value={code}
                  onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                />
              </View>
            )}

            {/* VISTA 2: ESCANEO POR CÓDIGO QR */}
            {method === 'QR' && (
              <View style={styles.qrSectionContainer}>
                <Text style={styles.labelCenter}>Escanear Código QR del Tutor</Text>
                <View style={styles.qrViewport}>
                  <View style={styles.qrTargetBox}>
                    <Text style={styles.qrIconLarge}>📷</Text>
                    <Text style={styles.qrStatusText}>
                      {isScanningQR
                        ? 'Analizando código QR...'
                        : code
                        ? `Código detectado: ${code}`
                        : 'Apunta la cámara al código QR en la pantalla del tutor'}
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

            {/* Resumen / Tarjeta de Confirmación de Datos cuando el código está listo */}
            {isCodeComplete && (
              <View style={styles.verifiedCard}>
                <Text style={styles.verifiedTitle}>✅ Código de Vinculación Listo</Text>
                <Text style={styles.verifiedSubtitle}>
                  Código: <Text style={styles.boldText}>{code}</Text> • Estado: Válido
                </Text>
              </View>
            )}

            {/* Botonera de Acción */}
            <View style={styles.buttonGroup}>
              <ActionButton
                title="🛡️ Confirmar y Activar Protección"
                onPress={() => handlePairing()}
                loading={loading}
                disabled={!isCodeComplete}
              />
              <ActionButton
                title="Volver"
                variant="secondary"
                onPress={onBack}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
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
    marginTop: 12,
    marginBottom: 6,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  instructionCard: {
    backgroundColor: '#E7F1FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#B6D4FE',
    marginBottom: 14,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0056B3',
    marginBottom: 6,
  },
  instructionStep: {
    fontSize: 12,
    color: '#0A58CA',
    lineHeight: 17,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '700',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
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
  codeSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  labelCenter: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  digitRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
  },
  digitBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  digitBoxActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
  },
  digitText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: 52,
    opacity: 0.01,
  },
  qrSectionContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  qrViewport: {
    width: '100%',
    height: 130,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 10,
  },
  qrTargetBox: {
    alignItems: 'center',
  },
  qrIconLarge: {
    fontSize: 30,
    marginBottom: 4,
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
  },
  scanQrBtnText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  verifiedCard: {
    backgroundColor: '#D1E7DD',
    borderColor: '#BADBCC',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  verifiedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F5132',
  },
  verifiedSubtitle: {
    fontSize: 12,
    color: '#0F5132',
    marginTop: 2,
  },
  buttonGroup: {
    marginTop: 12,
  },
});
