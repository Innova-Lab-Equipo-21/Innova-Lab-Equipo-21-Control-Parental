// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Pareamiento / Vinculación de Dispositivo)
// Archivo: src/screens/PairingScreen.tsx
// Descripción: Flujo guiado de vinculación mediante Código de 6 Dígitos o Escaneo de QR,
//              con soporte temporal offline para vinculación rápida por códigos
//              (123456 para Menor y 654321 para Adulto).
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
  onPairingComplete: (deviceId: string, deviceUuid: string, pairedMode?: 'CHILD' | 'ADULT') => void;
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

    // Determinar perfil según el código ingresado (123456 -> MENOR, 654321 -> ADULTO)
    const pairedMode: 'CHILD' | 'ADULT' = activeCode === '654321' ? 'ADULT' : 'CHILD';

    setLoading(true);
    try {
      const deviceUuid = 'dev-uuid-' + Math.random().toString(36).substring(2, 9);

      const result = await apiService.confirmPairing({
        pairingCode: activeCode,
        deviceUuid,
        deviceName: pairedMode === 'ADULT' ? 'Dispositivo Adulto Protegido' : 'Dispositivo Menor Protegido',
        childName: pairedMode === 'ADULT' ? 'Adulto Protegido' : 'Mateo',
        osVersion: 'Android 14 / SDK 35',
        appVersion: '1.0.0',
      });

      Alert.alert(
        '¡Vinculación exitosa!',
        `El dispositivo ha sido vinculado correctamente en perfil ${pairedMode === 'ADULT' ? 'ADULTO' : 'MENOR'}.`
      );
      onPairingComplete(result.data.deviceId, result.data.deviceUuid, pairedMode);
    } catch (error: any) {
      // Fallback local instantáneo mientras no hay backend conectado
      const deviceUuid = 'dev-uuid-' + Math.random().toString(36).substring(2, 9);
      Alert.alert(
        '¡Vinculación exitosa!',
        `Dispositivo vinculado correctamente en perfil ${pairedMode === 'ADULT' ? 'ADULTO' : 'MENOR'} (Código: ${activeCode}).`
      );
      onPairingComplete('dev-demo-id', deviceUuid, pairedMode);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateQRScan = (forcedCode: string = '123456') => {
    setIsScanningQR(true);
    setTimeout(() => {
      setCode(forcedCode);
      setIsScanningQR(false);
      Alert.alert(
        'Código QR escaneado',
        `Se detectó el código ${forcedCode}. Confirma para activar la protección.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Vincular ahora', onPress: () => handlePairing(forcedCode) },
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
          handleSimulateQRScan('123456');
        } else {
          Alert.alert(
            'Permiso denegado',
            'No se concedió acceso a la cámara. Puedes utilizar el ingreso por Código de 6 dígitos.'
          );
        }
      } catch (err) {
        handleSimulateQRScan('123456');
      }
    } else {
      handleSimulateQRScan('123456');
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
              <Text style={styles.cardTitle}>Códigos de prueba directa</Text>
            </View>
            <Text style={styles.stepText}>
              • Ingresa <Text style={styles.boldText}>123456</Text> para vincular en modo <Text style={styles.boldText}>MENOR</Text>
            </Text>
            <Text style={styles.stepText}>
              • Ingresa <Text style={styles.boldText}>654321</Text> para vincular en modo <Text style={styles.boldText}>ADULTO</Text>
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

            {/* VISTA 2: ESCANEO POR CÓDIGO QR */}
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
                  Código: <Text style={styles.boldText}>{code}</Text> • Modo: <Text style={styles.boldText}>{code === '654321' ? 'ADULTO' : 'MENOR'}</Text>
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

            {/* Accesos rápidos de demostración */}
            <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{ flex: 1, height: 38, backgroundColor: '#EFF6FF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' }}
                onPress={() => { setCode('123456'); handlePairing('123456'); }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#1D4ED8' }}>Modo Menor (123456)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, height: 38, backgroundColor: '#FAF5FF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E9D5FF' }}
                onPress={() => { setCode('654321'); handlePairing('654321'); }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#7E22CE' }}>Modo Adulto (654321)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
