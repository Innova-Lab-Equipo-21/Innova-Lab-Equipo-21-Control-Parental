// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingModal (Modal para Vinculación de Nuevo Dispositivo)
// Archivo: src/components/dashboard/dispositivos/PairingModal.tsx
// Descripción: Modal activado por el FAB + para registrar y vincular un nuevo dispositivo.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { PairingSection, PairingFormData } from './PairingSection';
import { apiService } from '../../../services/api.service';
import { MAX_PROTECTED_DEVICES } from '../../../types';
import { styles } from './PairingModal.styles';

interface PairingModalProps {
  visible: boolean;
  deviceCount: number;
  onClose: () => void;
  onDeviceAdded: () => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  visible,
  deviceCount,
  onClose,
  onDeviceAdded,
}) => {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFormData, setLastFormData] = useState<PairingFormData | null>(null);

  const handleGenerateCode = async (data?: PairingFormData) => {
    if (data) {
      setLastFormData(data);
    }
    setLoading(true);
    try {
      const res = await apiService.generatePairingCode(data);
      const code = res.data?.code || res.data?.pairingCode || Math.floor(100000 + Math.random() * 900000).toString();
      setPairingCode(code);
      onDeviceAdded();
    } catch (e: any) {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setPairingCode(fallbackCode);
      onDeviceAdded();
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePairing = async () => {
    if (!lastFormData) {
      Alert.alert('Atención', 'Primero genera el código de vinculación con los datos del protegido.');
      return;
    }

    try {
      await apiService.addDevice({
        childName: lastFormData.protectedName,
        birthDate: lastFormData.birthDate,
        profileType: lastFormData.protectedType,
        gender: lastFormData.genero,
        phone: lastFormData.protectedPhone,
        deviceModel: lastFormData.deviceModel || 'Android',
      });

      Alert.alert(
        '✅ Dispositivo vinculado',
        `El celular de ${lastFormData.protectedName} fue vinculado exitosamente.`
      );
      setPairingCode(null);
      setLastFormData(null);
      onDeviceAdded();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo vincular el dispositivo.');
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
            <Text style={styles.modalTitle}>Vincular nuevo dispositivo</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {deviceCount >= MAX_PROTECTED_DEVICES ? (
              <View style={styles.limitWarningCard}>
                <Text style={styles.limitWarningText}>
                  ⚠️ Has alcanzado el límite máximo permitido de {MAX_PROTECTED_DEVICES} dispositivos protegidos vinculados a esta cuenta.
                </Text>
              </View>
            ) : (
              <>
                <PairingSection
                  pairingCode={pairingCode}
                  deviceCount={deviceCount}
                  loading={loading}
                  onGenerateCode={handleGenerateCode}
                />

                {pairingCode && lastFormData && (
                  <TouchableOpacity
                    style={styles.confirmPairingBtn}
                    onPress={handleCompletePairing}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmPairingBtnText}>
                      ✓ Confirmar y activar dispositivo
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
