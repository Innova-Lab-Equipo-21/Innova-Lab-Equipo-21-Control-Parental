// ==============================================================================
// Proyecto: BA Protege+
// Componente: UnbindConfirmationModal (Modal de Doble Confirmación de Desvinculación)
// Archivo: src/components/dashboard/dispositivos/UnbindConfirmationModal.tsx
// Descripción: Modal de doble confirmación para desvincular un dispositivo protegido.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Alert } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { DeviceInfo } from '../../../types';
import { apiService } from '../../../services/api.service';
import { styles } from './ProtectedDevicesSection.styles';

interface UnbindConfirmationModalProps {
  visible: boolean;
  device: DeviceInfo | null;
  onClose: () => void;
  onSuccess: (deviceId: string) => void;
}

export const UnbindConfirmationModal: React.FC<UnbindConfirmationModalProps> = ({
  visible,
  device,
  onClose,
  onSuccess,
}) => {
  const [unbindStep, setUnbindStep] = useState<1 | 2>(1);
  const [loadingUnbind, setLoadingUnbind] = useState(false);

  useEffect(() => {
    if (visible) {
      setUnbindStep(1);
    }
  }, [visible]);

  const handleFinalUnbind = async () => {
    if (!device) return;

    setLoadingUnbind(true);
    try {
      await apiService.unbindDevice(device.deviceId);

      Alert.alert(
        '✅ Dispositivo Desvinculado',
        `El dispositivo "${device.deviceName}" fue desvinculado correctamente.`
      );
      onSuccess(device.deviceId);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo desvincular el dispositivo.');
    } finally {
      setLoadingUnbind(false);
    }
  };

  return (
    <Modal
      visible={visible && !!device}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {unbindStep === 1 ? (
            <View>
              <Text style={styles.modalEmoji}>🔗</Text>
              <Text style={styles.modalTitle}>
                Confirmación 1 de 2: Desvincular Dispositivo
              </Text>
              <Text style={styles.modalBody}>
                ¿Deseas desvincular el dispositivo "{device?.deviceName}" (Protegido: {device?.childName || 'Protegido'})?
              </Text>
              <View style={styles.warningBox}>
                <Text style={styles.warningBoxText}>
                  ⚠️ IMPORTANTE: Al desvincular el dispositivo, el motor de protección de red local se desactivará en dicho celular y dejará de recibir bloqueos LOTBA.
                </Text>
              </View>

              <ActionButton
                title="Entiendo las consecuencias, Continuar ➔"
                variant="primary"
                onPress={() => setUnbindStep(2)}
              />
              <ActionButton
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.modalEmoji}>⚠️</Text>
              <Text style={styles.modalTitle}>
                Confirmación 2 de 2: Confirmar Desvinculación
              </Text>
              <Text style={styles.modalBody}>
                ¿Estás completamente seguro de eliminar permanentemente la vinculación de "{device?.deviceName}"?
              </Text>

              <ActionButton
                title="Desvincular dispositivo"
                variant="danger"
                loading={loadingUnbind}
                onPress={handleFinalUnbind}
              />
              <ActionButton
                title="Volver Atrás"
                variant="secondary"
                disabled={loadingUnbind}
                onPress={() => setUnbindStep(1)}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
