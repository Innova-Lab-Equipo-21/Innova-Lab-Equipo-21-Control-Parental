// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Pareamiento / Vinculación de Dispositivo)
// Archivo: src/screens/PairingScreen.tsx
// Descripción: Flujo guiado de vinculación mediante Código de 6 Dígitos o Escaneo de QR,
//              con estilo compacto unificado para ambos métodos.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { ActionButton } from '../components/ActionButton';
import { apiService } from '../services/api.service';
import { styles } from './PairingScreen.styles';

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
        deviceName: 'Dispositivo Protegido',
        childName: 'Protegido',
        osVersion: 'Android 14 / SDK 35',
        appVersion: '1.0.0',
      });

      Alert.alert(
        '¡Vinculación exitosa!',
        'El dispositivo ha sido vinculado correctamente al perfil de protección.'
      );
      onPairingComplete(result.data.deviceId, result.data.deviceUuid);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Código de pareamiento inválido o expirado.';
      Alert.alert('Error de vinculación', msg);
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
        'Código QR escaneado',
        `Se detectó el código ${simulatedCode}. Confirma para activar la protección.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Vincular ahora', onPress: () => handlePairing(simulatedCode) },
        ]
      );
    }, 1000);
  };

  const handleOpenCameraScanner = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permiso de cámara requerido',
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
            'Permiso denegado',
            'No se concedió acceso a la cámara. Puedes utilizar el ingreso por Código de 6 dígitos.'
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Encabezado con Logotipo Oficial Completo Centrado */}
          <View style={styles.headerLogoContainer}>
            <Logo variant="complete" size="md" align="center" />
          </View>

          {/* Sección de Títulos en Sentence Case */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              {onBack && (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={onBack}
                  activeOpacity={0.7}
                  accessibilityLabel="Volver a la pantalla anterior"
                >
                  <Icon name="volver" size={24} color="#000000" />
                </TouchableOpacity>
              )}
              <Text style={styles.mainTitle}>Vincular dispositivo</Text>
            </View>
            <Text style={styles.mainSubtitle}>
              Ingresa el código numérico o escanea el QR generado por el tutor
            </Text>
          </View>

          {/* Bloque de Pasos de Vinculación */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="pregunta" size={24} color="#007AFF" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Pasos para la vinculación</Text>
            </View>
            <Text style={styles.stepText}>
              1- Genera un código de 6 dígitos o un código QR en el dispositivo tutor en <Text style={styles.boldText}>"Vincular nuevo dispositivo"</Text>
            </Text>
            <Text style={styles.stepText}>
              2- Ingresa el código de 6 dígitos o presiona <Text style={styles.boldText}>"Escanear código QR"</Text>
            </Text>
          </View>

          {/* Formulario de Pareamiento */}
          <View style={styles.formContainer}>
            {/* Segmented Tabs para método de vinculación */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, method === 'CODE' && styles.tabButtonActive]}
                onPress={() => setMethod('CODE')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabButtonText, method === 'CODE' && styles.tabButtonTextActive]}>
                  Código 6 dígitos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, method === 'QR' && styles.tabButtonActive]}
                onPress={() => setMethod('QR')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabButtonText, method === 'QR' && styles.tabButtonTextActive]}>
                  Escanear QR
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

            {/* VISTA 2: ESCANEO POR CÓDIGO QR COMPACTO (MISMA ALTURA Y ESTILO QUE CÓDIGO DE 6 DÍGITOS) */}
            {method === 'QR' && (
              <View style={styles.qrSectionContainer}>
                <Text style={styles.labelCenter}>Escanear código QR del tutor:</Text>

                <TouchableOpacity
                  style={[
                    styles.qrInputButton,
                    isScanningQR && styles.qrInputButtonActive,
                  ]}
                  onPress={handleOpenCameraScanner}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qrInputButtonText}>
                    {isScanningQR ? 'Analizando código QR...' : 'Abrir cámara / Escanear QR'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Resumen / Tarjeta de Confirmación de Datos cuando el código está listo */}
            {isCodeComplete && (
              <View style={styles.verifiedCard}>
                <Text style={styles.verifiedTitle}>✅ Código de vinculación listo</Text>
                <Text style={styles.verifiedSubtitle}>
                  Código: <Text style={styles.boldText}>{code}</Text> • Estado: Válido
                </Text>
              </View>
            )}

            {/* Botonera de Acción Unificada */}
            <View style={styles.buttonGroup}>
              <ActionButton
                title="Confirmar y activar protección"
                onPress={() => handlePairing()}
                loading={loading}
                disabled={!isCodeComplete}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
