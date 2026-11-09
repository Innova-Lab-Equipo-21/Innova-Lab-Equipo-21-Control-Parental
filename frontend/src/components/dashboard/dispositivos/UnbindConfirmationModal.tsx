// ==============================================================================
// Proyecto: BA Protege+
// Componente: UnbindConfirmationModal (Modal de Doble Confirmación de Desvinculación)
// Archivo: src/components/dashboard/dispositivos/UnbindConfirmationModal.tsx
// Descripción: Modal de doble confirmación para desvincular un dispositivo protegido.
//              Con CTAs en la misma fila y del mismo tamaño (1: Cancelar/Continuar,
//              2: Volver/Desvincular), botón X de cierre y altura idéntica entre pasos.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { FeedbackModal } from '../../FeedbackModal';
import { DeviceInfo } from '../../../types';
import { apiService } from '../../../services/api.service';
import { styles } from './UnbindConfirmationModal.styles';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setUnbindStep(1);
      setErrorMessage(null);
    }
  }, [visible]);

  const targetName = device?.childName || device?.deviceName || 'este dispositivo';

  const handleFinalUnbind = async () => {
    if (!device) return;

    setLoadingUnbind(true);
    try {
      await apiService.unbindDevice(device.deviceId);

      onSuccess(device.deviceId);
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || 'No se pudo desvincular el dispositivo.');
    } finally {
      setLoadingUnbind(false);
    }
  };

  return (
    <Modal
      visible={visible && !!device}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Botón X superior para cerrar modal */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Cerrar modal"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {unbindStep === 1 ? (
            <View>
              <Text style={styles.modalEmoji}>🔗</Text>
              <Text style={styles.modalTitle}>
                Confirmación 1 de 2: Desvincular
              </Text>
              <Text style={styles.modalBody}>
                ¿Deseas desvincular el celular de {targetName} de tu cuenta?
              </Text>
              <View style={styles.warningBox}>
                <Text style={styles.warningBoxText}>
                  ⚠️ El motor de protección de red local se desactivará en dicho celular y dejará de recibir bloqueos LOTBA.
                </Text>
              </View>

              <View style={styles.buttonsRow}>
                <View style={styles.buttonCol}>
                  <ActionButton
                    title="Cancelar"
                    variant="secondary"
                    onPress={onClose}
                  />
                </View>
                <View style={styles.buttonCol}>
                  <ActionButton
                    title="Continuar"
                    variant="primary"
                    onPress={() => setUnbindStep(2)}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.modalEmoji}>⚠️</Text>
              <Text style={styles.modalTitle}>
                Confirmación 2 de 2: Desvincular
              </Text>
              <Text style={styles.modalBody}>
                ¿Confirmas eliminar permanentemente el celular de {targetName}?
              </Text>
              <View style={styles.warningBox}>
                <Text style={styles.warningBoxText}>
                  ⚠️ Esta acción es permanente. Para supervisar este celular en el futuro, deberás vincularlo nuevamente.
                </Text>
              </View>

              <View style={styles.buttonsRow}>
                <View style={styles.buttonCol}>
                  <ActionButton
                    title="Volver"
                    variant="secondary"
                    disabled={loadingUnbind}
                    onPress={() => setUnbindStep(1)}
                  />
                </View>
                <View style={styles.buttonCol}>
                  <ActionButton
                    title="Desvincular"
                    variant="danger"
                    loading={loadingUnbind}
                    onPress={handleFinalUnbind}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Modal estándar de error */}
      <FeedbackModal
        visible={!!errorMessage}
        icon="⚠️"
        title="Error al desvincular"
        message={errorMessage || ''}
        onClose={() => setErrorMessage(null)}
      />
    </Modal>
  );
};
