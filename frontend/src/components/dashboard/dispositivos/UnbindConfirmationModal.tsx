// ==============================================================================
// Proyecto: BA Protege+
// Componente: UnbindConfirmationModal (Modal de Doble Confirmación de Desvinculación)
// Archivo: src/components/dashboard/dispositivos/UnbindConfirmationModal.tsx
// Descripción: Modal de doble confirmación para desvincular un dispositivo protegido.
//              Con CTAs en la misma fila y del mismo tamaño (1: Cancelar/Continuar,
//              2: Volver/Desvincular), botón X de cierre y altura idéntica entre pasos.
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { FeedbackModal } from '../../FeedbackModal';
import { BOTITO_ASSETS } from '../protected/botAssets';
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
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    if (visible) {
      setUnbindStep(1);
      setErrorMessage(null);
      isSubmittingRef.current = false;
    }
  }, [visible]);

  const targetName = device?.childName || device?.deviceName || 'este dispositivo';

  const handleFinalUnbind = async () => {
    if (!device || isSubmittingRef.current || loadingUnbind) return;

    isSubmittingRef.current = true;
    setLoadingUnbind(true);
    try {
      await apiService.unbindDevice(device.deviceId);

      onSuccess(device.deviceId);
      onClose();
    } catch (error: any) {
      const rawMsg = error?.message || '';
      const isTechnicalOrNetwork =
        !rawMsg ||
        /application failed to respond|network error|timeout|status code|failed to fetch|econnrefused|enotfound|bad gateway/i.test(
          rawMsg
        );
      setErrorMessage(
        isTechnicalOrNetwork
          ? 'Tuvimos un inconveniente al desvincular el dispositivo. Por favor, comprobá tu conexión a internet e intentá nuevamente.'
          : rawMsg
      );
    } finally {
      isSubmittingRef.current = false;
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
              <Image
                source={BOTITO_ASSETS.pensando}
                style={styles.modalMascotImage}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>
                ¿Querés desvincular el celular de {targetName} de tu cuenta?
              </Text>
              <Text style={styles.modalBody}>
                Al desvincularlo, dejarán de estar activos los bloqueos aplicados en su dispositivo.
              </Text>

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
              <Image
                source={BOTITO_ASSETS.nervioso}
                style={styles.modalMascotImage}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>
                ¿Confirmás la desvinculación?
              </Text>
              <Text style={styles.modalBody}>
                Este dispositivo ya no estará en tu lista. Si más adelante necesitás vincularlo de nuevo, vas a poder hacerlo desde el botón +.
              </Text>

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
        imageSource={BOTITO_ASSETS.nervioso}
        title="Error al desvincular"
        message={errorMessage || ''}
        onClose={() => setErrorMessage(null)}
      />
    </Modal>
  );
};
