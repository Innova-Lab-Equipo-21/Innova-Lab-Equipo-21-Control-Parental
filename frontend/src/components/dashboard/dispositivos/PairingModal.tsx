// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingModal (Modal para Vinculación de Nuevo Dispositivo)
// Archivo: src/components/dashboard/dispositivos/PairingModal.tsx
// Descripción: Modal activado por el FAB + para registrar y vincular un nuevo dispositivo.
//              Permite ingresar los datos y presionar Guardar, tras lo cual se persiste
//              en la base de datos y se abre el modal con el código de 6 dígitos y QR.
// ==============================================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PairingSection, PairingFormData, PairingSectionRef } from './PairingSection';
import { DevicePairingCodeModal } from './DevicePairingCodeModal';
import { ActionButton } from '../../ActionButton';
import { FeedbackModal } from '../../FeedbackModal';
import { BOTITO_ASSETS } from '../protected/botAssets';
import { apiService } from '../../../services/api.service';
import { MAX_PROTECTED_DEVICES, DeviceInfo } from '../../../types';
import { styles } from './PairingModal.styles';

interface PairingModalProps {
  visible: boolean;
  deviceCount: number;
  onClose: () => void;
  onDeviceAdded: (deviceName?: string) => void;
  onDeviceCreated?: (device: DeviceInfo) => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  visible,
  deviceCount,
  onClose,
  onDeviceAdded,
  onDeviceCreated,
}) => {
  const [saving, setSaving] = useState(false);
  const [createdDevice, setCreatedDevice] = useState<DeviceInfo | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    imageSource?: any;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });
  const pairingSectionRef = useRef<PairingSectionRef>(null);

  const handleClose = () => {
    setCreatedDevice(null);
    setShowCodeModal(false);
    pairingSectionRef.current?.reset();
    onClose();
  };

  const handleSave = async () => {
    try {
      const dataToSave: PairingFormData | null = pairingSectionRef.current?.submit() ?? null;

      if (!dataToSave) {
        setFeedbackModal({
          visible: true,
          imageSource: BOTITO_ASSETS.pensando,
          title: 'Atención',
          message: 'Por favor completa todos los datos requeridos del protegido.',
        });
        return;
      }

      setSaving(true);
      const res = await apiService.addDevice({
        childName: dataToSave.protectedName,
        birthDate: dataToSave.birthDate,
        profileType: dataToSave.protectedType,
        gender: dataToSave.genero,
        phone: dataToSave.protectedPhone,
        deviceModel: dataToSave.deviceModel || 'Android',
        status: 'INACTIVE',
        isProtected: false,
      });

      const savedDevice = res.data;
      setCreatedDevice(savedDevice);
      // Notificar inmediatamente para actualización instantánea (0ms) en Inicio y Dispositivos
      onDeviceCreated?.(savedDevice);
      setShowCodeModal(true);
    } catch (e: any) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Error',
        message: e.message || 'No se pudo guardar el dispositivo.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCodeModalClose = () => {
    const savedName = createdDevice?.childName || 'nuevo protegido';
    setShowCodeModal(false);
    setCreatedDevice(null);
    handleClose();
    onDeviceAdded(savedName);
  };

  return (
    <>
      <Modal
        visible={visible && !showCodeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vincular nuevo dispositivo</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Cerrar modal"
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {deviceCount >= MAX_PROTECTED_DEVICES ? (
                <View style={styles.limitWarningCard}>
                  <Text style={styles.limitWarningText}>
                    ⚠️ Has alcanzado el límite máximo permitido de {MAX_PROTECTED_DEVICES} dispositivos protegidos vinculados a esta cuenta.
                  </Text>
                </View>
              ) : (
                <PairingSection
                  ref={pairingSectionRef}
                  deviceCount={deviceCount}
                />
              )}
            </ScrollView>

            {/* Rodapé con los CTAs Cancelar y Guardar en la misma línea (mismo tamaño, estilo oficial del app) */}
            <View style={styles.buttonsRow}>
              <View style={{ flex: 1 }}>
                <ActionButton
                  title="Cancelar"
                  variant="secondary"
                  disabled={saving}
                  onPress={handleClose}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ActionButton
                  title="Guardar"
                  variant="primary"
                  loading={saving}
                  disabled={deviceCount >= MAX_PROTECTED_DEVICES}
                  onPress={handleSave}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Modal estándar de retroalimentación */}
        <FeedbackModal
          visible={feedbackModal.visible}
          imageSource={feedbackModal.imageSource}
          title={feedbackModal.title}
          message={feedbackModal.message}
          asOverlay={true}
          onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
        />
      </Modal>

      {/* Modal que muestra el código generado y el QR tras presionar Guardar */}
      <DevicePairingCodeModal
        visible={showCodeModal}
        device={createdDevice}
        pairingCode={createdDevice?.pairingCode || null}
        onClose={handleCodeModalClose}
        onCodeRegenerated={(newCode) => {
          if (createdDevice) {
            setCreatedDevice({ ...createdDevice, pairingCode: newCode });
          }
        }}
      />
    </>
  );
};
