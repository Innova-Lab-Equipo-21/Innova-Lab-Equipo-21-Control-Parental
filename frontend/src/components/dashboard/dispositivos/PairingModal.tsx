// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingModal (Modal para Vinculación de Nuevo Dispositivo)
// Archivo: src/components/dashboard/dispositivos/PairingModal.tsx
// Descripción: Modal activado por el FAB + para registrar y vincular un nuevo dispositivo.
//              Con rodapé que contiene los CTAs Cancelar y Guardar en la misma línea
//              siguiendo el estándar visual oficial del app.
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
import { ActionButton } from '../../ActionButton';
import { FeedbackModal } from '../../FeedbackModal';
import { apiService } from '../../../services/api.service';
import { MAX_PROTECTED_DEVICES } from '../../../types';
import { styles } from './PairingModal.styles';

interface PairingModalProps {
  visible: boolean;
  deviceCount: number;
  onClose: () => void;
  onDeviceAdded: (deviceName?: string) => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  visible,
  deviceCount,
  onClose,
  onDeviceAdded,
}) => {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastFormData, setLastFormData] = useState<PairingFormData | null>(null);
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
  const pairingSectionRef = useRef<PairingSectionRef>(null);

  const handleClose = () => {
    setPairingCode(null);
    setLastFormData(null);
    pairingSectionRef.current?.reset();
    onClose();
  };

  const handleGenerateCode = async (data?: PairingFormData) => {
    if (data) {
      setLastFormData(data);
    }
    setLoading(true);
    try {
      const res = await apiService.generatePairingCode(data);
      const code = res.data?.code || res.data?.pairingCode || Math.floor(100000 + Math.random() * 900000).toString();
      setPairingCode(code);
    } catch (e: any) {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setPairingCode(fallbackCode);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    let dataToSave = lastFormData;
    if (!dataToSave && pairingSectionRef.current) {
      dataToSave = pairingSectionRef.current.getFormData();
    }

    if (!dataToSave) {
      pairingSectionRef.current?.submit();
      setFeedbackModal({
        visible: true,
        icon: '⚠️',
        title: 'Atención',
        message: 'Por favor completa todos los datos requeridos del protegido.',
      });
      return;
    }

    if (!pairingCode) {
      const generatedData = pairingSectionRef.current?.submit();
      if (generatedData) {
        setFeedbackModal({
          visible: true,
          icon: '📱',
          title: 'Código generado',
          message: 'Se generó el código de vinculación. Puedes vincular el dispositivo y presionar Guardar.',
        });
      }
      return;
    }

    setSaving(true);
    try {
      await apiService.addDevice({
        childName: dataToSave.protectedName,
        birthDate: dataToSave.birthDate,
        profileType: dataToSave.protectedType,
        gender: dataToSave.genero,
        phone: dataToSave.protectedPhone,
        deviceModel: dataToSave.deviceModel || 'Android',
        status: 'INACTIVE',
        isProtected: false,
      });

      handleClose();
      onDeviceAdded(dataToSave.protectedName);
    } catch (e: any) {
      setFeedbackModal({
        visible: true,
        icon: '⚠️',
        title: 'Error',
        message: e.message || 'No se pudo guardar el dispositivo.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
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
                pairingCode={pairingCode}
                deviceCount={deviceCount}
                loading={loading}
                onGenerateCode={handleGenerateCode}
              />
            )}
          </ScrollView>

          {/* Rodapé con los CTAs Cancelar y Guardar en la misma línea (mismo tamaño, estilo oficial del app) */}
          <View style={styles.buttonsRow}>
            <View style={{ flex: 1 }}>
              <ActionButton
                title="Cancelar"
                variant="secondary"
                disabled={loading || saving}
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
        icon={feedbackModal.icon}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
};
