// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Pareamiento / Vinculación de Dispositivo)
// Archivo: src/screens/PairingScreen.tsx
// Descripción: Flujo real de vinculación de dispositivo protegido mediante código
//              de 6 dígitos o escaneo QR nativo (CameraX + ML Kit), validado contra
//              PostgreSQL y utilizando la información real del hardware Android.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { ActionButton } from '../components/ActionButton';
import { FeedbackModal } from '../components/FeedbackModal';
import { BOTITO_ASSETS } from '../components/dashboard/protected/botAssets';
import {
  BotitoWelcomeVideoModal,
  WelcomeVideoStatus,
  ensureMinimumWelcomeVideoTime,
} from '../components/BotitoWelcomeVideoModal';
import { apiService } from '../services/api.service';
import { safeStorage } from '../services/api/client';
import { protectionService } from '../services/protection.service';
import { styles } from './PairingScreen.styles';

type PairingMethod = 'CODE' | 'QR';

interface PairingScreenProps {
  onPairingComplete: (deviceId: string, deviceUuid: string, pairedMode?: 'CHILD' | 'ADULT') => void;
  onBack: () => void;
}

async function resolveRealDevicePayload() {
  const nativeInfo = await protectionService.getDeviceInfo();
  let deviceUuid = nativeInfo?.deviceUuid?.trim() || '';

  if (!deviceUuid) {
    const storedUuid = await safeStorage.getItem('@ba_protege_device_uuid');
    if (storedUuid && storedUuid.trim().length > 0) {
      deviceUuid = storedUuid.trim();
    } else {
      deviceUuid = `ba-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      await safeStorage.setItem('@ba_protege_device_uuid', deviceUuid);
    }
  } else {
    await safeStorage.setItem('@ba_protege_device_uuid', deviceUuid);
  }

  return {
    deviceUuid,
    deviceModel: nativeInfo?.deviceModel || 'Android',
    osVersion: nativeInfo?.osVersion || `Android ${Platform.Version}`,
    appVersion: nativeInfo?.appVersion || '1.0.0',
  };
}

export const PairingScreen: React.FC<PairingScreenProps> = ({
  onPairingComplete,
  onBack,
}) => {
  const [method, setMethod] = useState<PairingMethod>('CODE');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    imageSource?: any;
    title: string;
    message: string;
    buttonText?: string;
    secondaryButtonText?: string;
    onConfirm?: () => void;
    onSecondaryPress?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });
  const [welcomeVideoModal, setWelcomeVideoModal] = useState<{
    visible: boolean;
    status: WelcomeVideoStatus;
    successTitle: string;
    successMessage: string;
    onContinue?: () => void;
  }>({
    visible: false,
    status: 'loading',
    successTitle: '',
    successMessage: '',
  });

  const isCodeComplete = code.trim().length === 6;

  const handlePairing = async (pairingCodeOverride?: string) => {
    const activeCode = (pairingCodeOverride || code).trim();
    if (activeCode.length !== 6) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Código incompleto',
        message: 'Por favor ingresá un código numérico de 6 dígitos generado por la persona responsable.',
      });
      return;
    }

    setLoading(true);
    const startedAt = Date.now();
    setWelcomeVideoModal({
      visible: true,
      status: 'loading',
      successTitle: '',
      successMessage: '',
    });

    try {
      const hardware = await resolveRealDevicePayload();

      const result = await apiService.confirmPairing({
        pairingCode: activeCode,
        deviceUuid: hardware.deviceUuid,
        deviceName: hardware.deviceModel,
        model: hardware.deviceModel,
        osVersion: hardware.osVersion,
        appVersion: hardware.appVersion,
      });

      const pairedData = result?.data;
      if (!pairedData?.deviceId || !pairedData?.deviceUuid) {
        throw new Error('No se recibió una respuesta válida de vinculación del servidor.');
      }

      const rawPersonType = String(pairedData.personType || 'MENOR').toUpperCase();
      const pairedMode: 'CHILD' | 'ADULT' = rawPersonType === 'ADULTO' ? 'ADULT' : 'CHILD';

      // Guardar perfil real recibido del backend (nombre del protegido, teléfono, tipo y responsable)
      await safeStorage
        .setItem(
          '@ba_protege_paired_profile',
          JSON.stringify({
            deviceId: pairedData.deviceId,
            deviceUuid: pairedData.deviceUuid,
            childName: pairedData.childName || pairedData.deviceName || '',
            phone: pairedData.phone || '',
            tutorName: pairedData.tutorName || '',
            personType: rawPersonType,
          })
        )
        .catch(() => {});

      await protectionService.setUserMode(pairedMode).catch(() => {});

      // Registrar token FCM del dispositivo para notificaciones push
      try {
        // @ts-ignore
        const messagingModule: any = await import('@react-native-firebase/messaging');
        const messaging = messagingModule.default || messagingModule;
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          await apiService.registerFcmToken(fcmToken);
        }
      } catch {
        // FCM no disponible en este entorno; continuar normalmente
      }

      const successMessage =
        'Ya sos parte de mi aplicación y te voy a estar acompañando.';

      await ensureMinimumWelcomeVideoTime(startedAt);

      setWelcomeVideoModal({
        visible: true,
        status: 'success',
        successTitle: '¡Chocá esos cinco!',
        successMessage,
        onContinue: () => {
          setWelcomeVideoModal((prev) => ({ ...prev, visible: false }));
          onPairingComplete(pairedData.deviceId, pairedData.deviceUuid, pairedMode);
        },
      });
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const friendlyMessage =
        typeof apiMessage === 'string' && apiMessage.trim().length > 0
          ? apiMessage.trim()
          : 'No se pudo completar la vinculación en este momento. Verificá que el código sea correcto, no haya sido usado y que tengas conexión a internet.';

      setWelcomeVideoModal((prev) => ({ ...prev, visible: false }));
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'No pudimos vincular el dispositivo',
        message: friendlyMessage,
        buttonText: 'Entendido',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCameraScanner = async () => {
    if (Platform.OS !== 'android') {
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Cámara no disponible',
        message:
          'El escáner QR nativo solo está disponible en dispositivos Android. Podés ingresar el código de 6 dígitos manualmente.',
        buttonText: 'Entendido',
      });
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permiso de cámara requerido',
          message:
            'BA Protege+ necesita acceso a la cámara para escanear el código QR que generó la persona responsable.',
          buttonNeutral: 'Luego',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Permitir',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setFeedbackModal({
          visible: true,
          imageSource: BOTITO_ASSETS.nervioso,
          title: 'Acceso a cámara desactivado',
          message:
            'No pudimos abrir la cámara. Podés vincular el dispositivo ingresando el código de 6 dígitos que generó la persona responsable.',
          buttonText: 'Entendido',
        });
        return;
      }

      setIsScanningQR(true);
      const scanResult = await protectionService.openQrScanner();

      if (scanResult?.cancelled) {
        return;
      }

      const scannedCode = (scanResult?.code || '').replace(/\D/g, '').slice(0, 6);
      if (scannedCode.length !== 6) {
        setFeedbackModal({
          visible: true,
          imageSource: BOTITO_ASSETS.pensando,
          title: 'Código QR no válido',
          message:
            'El código QR escaneado no contiene un código de vinculación de 6 dígitos de BA Protege+. Intentá de nuevo o ingresá el código manualmente.',
          buttonText: 'Entendido',
        });
        return;
      }

      setCode(scannedCode);
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Código QR detectado',
        message: `Detectamos el código ${scannedCode}. Al avanzar, vas a vincular este dispositivo a la cuenta de la persona responsable y activar la protección contra sitios y aplicaciones de apuestas ilegales.\n\n¿Confirmás que querés continuar?`,
        buttonText: 'Confirmar',
        secondaryButtonText: 'Cancelar',
        onConfirm: () => {
          setFeedbackModal((prev) => ({ ...prev, visible: false }));
          handlePairing(scannedCode);
        },
        onSecondaryPress: () => {
          setFeedbackModal((prev) => ({ ...prev, visible: false }));
        },
      });
    } catch (err: any) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Acceso a cámara desactivado',
        message:
          err?.message ||
          'No pudimos abrir la cámara. Podés vincular el dispositivo ingresando el código de 6 dígitos que generó la persona responsable.',
        buttonText: 'Entendido',
      });
    } finally {
      setIsScanningQR(false);
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
              Ingresá el código de 6 dígitos o escaneá el QR que generó la persona responsable.
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
                  Código de 6 dígitos
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
                <Text style={styles.labelCenter}>
                  Ingresá el código de 6 dígitos que generó la persona responsable para activar la protección.
                </Text>

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
                <Text style={styles.labelCenter}>
                  Escaneá el código QR que generó la persona responsable para activar la protección.
                </Text>

                <TouchableOpacity
                  style={[
                    styles.qrInputButton,
                    isScanningQR && styles.qrInputButtonActive,
                  ]}
                  onPress={handleOpenCameraScanner}
                  disabled={isScanningQR || loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qrInputButtonText}>
                    {isScanningQR ? 'Abriendo cámara...' : 'Abrir cámara'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Resumen / Tarjeta de Confirmación de Datos cuando el código está listo */}
            {isCodeComplete && (
              <View style={styles.verifiedCard}>
                <Text style={styles.verifiedTitle}>Código de vinculación listo</Text>
                <Text style={styles.verifiedSubtitle}>
                  Código ingresado: <Text style={styles.boldText}>{code}</Text>
                </Text>
              </View>
            )}

            {/* Botonera de Acción Unificada */}
            <View style={styles.buttonGroup}>
              <ActionButton
                title="Confirmar"
                onPress={() => handlePairing()}
                loading={loading}
                disabled={!isCodeComplete}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FeedbackModal
        visible={feedbackModal.visible}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        buttonText={feedbackModal.buttonText || 'Entendido'}
        onConfirm={feedbackModal.onConfirm}
        secondaryButtonText={feedbackModal.secondaryButtonText}
        onSecondaryPress={feedbackModal.onSecondaryPress}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />

      {/* Modal con video de bienvenida de Botito durante la vinculación */}
      <BotitoWelcomeVideoModal
        visible={welcomeVideoModal.visible}
        status={welcomeVideoModal.status}
        loadingTitle="¡Hola! Soy Botito."
        loadingSubtitle={'Estoy vinculando tu cuenta...\n\n¿Me bancás un cachito?'}
        successBadge=""
        successTitle={welcomeVideoModal.successTitle}
        successMessage={welcomeVideoModal.successMessage}
        ctaText="¡Vamos!"
        onContinue={welcomeVideoModal.onContinue}
      />
    </SafeAreaView>
  );
};
