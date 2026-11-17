// ==============================================================================
// Proyecto: BA Protege+
// Componente: DevicePairingCodeModal (Modal de Código y QR de Vinculación)
// Archivo: src/components/dashboard/dispositivos/DevicePairingCodeModal.tsx
// Descripción: Modal presentado tras guardar los datos del protegido. Muestra
//              el banner azul con el código de 6 dígitos generado y el card con QR
//              y acciones para recargar y compartir código.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  ActivityIndicator,
} from 'react-native';
import { ActionButton } from '../../ActionButton';
import { Icon } from '../../Icon';
import { FeedbackModal } from '../../FeedbackModal';
import { apiService } from '../../../services/api.service';
import { DeviceInfo } from '../../../types';
import { colors } from '../../../theme/colors';
import { styles } from './DevicePairingCodeModal.styles';

interface DevicePairingCodeModalProps {
  visible: boolean;
  device: DeviceInfo | null;
  pairingCode: string | null;
  onClose: () => void;
  onCodeRegenerated?: (newCode: string) => void;
}

export const DevicePairingCodeModal: React.FC<DevicePairingCodeModalProps> = ({
  visible,
  device,
  pairingCode,
  onClose,
  onCodeRegenerated,
}) => {
  const [currentCode, setCurrentCode] = useState<string | null>(pairingCode);
  const [loading, setLoading] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    icon?: string;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    if (visible) {
      setCurrentCode(pairingCode || device?.pairingCode || null);
    }
  }, [visible, pairingCode, device]);

  const protectedName = device?.childName || device?.deviceName || 'Protegido';
  const profileType = device?.profileType || 'Menor';

  const formatSpacedCode = (code: string | null): string => {
    if (!code) return '------';
    return code.replace(/\s+/g, '').split('').join(' ');
  };

  const handleRegenerateCode = async () => {
    if (!device) return;
    setLoading(true);
    try {
      const res = await apiService.generatePairingCode({
        deviceId: device.deviceId,
        protectedName,
        genero: device.gender,
        protectedType: profileType,
        birthDate: device.birthDate,
        protectedPhone: device.phone,
        deviceModel: device.deviceModel,
      });
      const newCode =
        res.data?.code ||
        res.data?.pairingCode ||
        Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentCode(newCode);
      onCodeRegenerated?.(newCode);
    } catch (e: any) {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentCode(fallbackCode);
      onCodeRegenerated?.(fallbackCode);
    } finally {
      setLoading(false);
    }
  };

  const handleShareCode = async () => {
    if (!currentCode) return;
    const message = `BA Protege+ • Código de vinculación para ${protectedName} (${profileType}): ${currentCode}.`;
    try {
      const result = await Share.share({
        title: 'Código de Vinculación BA Protege+',
        message,
      });
      if (result.action === Share.sharedAction) {
        setFeedbackModal({
          visible: true,
          icon: '✅',
          title: 'Código compartido',
          message: 'El código de vinculación ha sido enviado.',
        });
      }
    } catch (error: any) {
      setFeedbackModal({
        visible: true,
        icon: '📱',
        title: 'Código para compartir',
        message,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Vinculación de dispositivo</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Cerrar modal"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.codeDisplayCard}>
              {/* Banner azul superior con nombre, tipo y código de 6 dígitos espaciado */}
              <View style={styles.codeDisplay}>
                <Text style={styles.protectedSummaryText}>
                  Vinculando a: {protectedName} ({profileType})
                </Text>
                {loading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 6 }} />
                ) : (
                  <Text style={styles.codeNumber}>
                    {formatSpacedCode(currentCode)}
                  </Text>
                )}
              </View>

              {/* Card con borde discontinuo, QR centrado y acciones */}
              <View style={styles.qrCodeBox}>
                <Text style={styles.qrTitle}>Código QR de vinculación</Text>
                <Text style={styles.qrSubtitle}>
                  Apunta la cámara del celular de {protectedName} aquí para vincular
                </Text>

                <View style={styles.qrImageContainer}>
                  {currentCode ? (
                    <Image
                      source={{
                        uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentCode}&color=007AFF&bgcolor=FFFFFF`,
                      }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <ActivityIndicator size="large" color={colors.primary} style={{ width: 180, height: 180 }} />
                  )}
                </View>

                {/* Acciones circulares oficiales: Generar nuevo código y Compartir código */}
                <View style={styles.codeActionsRow}>
                  <TouchableOpacity
                    style={styles.actionIconButton}
                    onPress={handleRegenerateCode}
                    disabled={loading}
                    activeOpacity={0.7}
                    accessibilityLabel="Generar nuevo código"
                  >
                    <View style={styles.actionIconCircle}>
                      <Icon name="recargar" size={22} color={colors.primary} />
                    </View>
                    <Text style={styles.actionIconLabel}>Generar nuevo código</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconButton}
                    onPress={handleShareCode}
                    disabled={!currentCode}
                    activeOpacity={0.7}
                    accessibilityLabel="Compartir código"
                  >
                    <View style={styles.actionIconCircle}>
                      <Icon name="compartir" size={22} color={colors.primary} />
                    </View>
                    <Text style={styles.actionIconLabel}>Compartir código</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.footerButtonContainer}>
              <ActionButton
                title="Listo"
                variant="primary"
                onPress={onClose}
              />
            </View>
          </ScrollView>
        </View>
      </View>

      <FeedbackModal
        visible={feedbackModal.visible}
        icon={feedbackModal.icon}
        title={feedbackModal.title}
        message={feedbackModal.message}
        asOverlay={true}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
};
