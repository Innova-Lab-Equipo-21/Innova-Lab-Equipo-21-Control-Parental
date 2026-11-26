// ==============================================================================
// Proyecto: BA Protege+
// Componente: BlockModal
// Archivo: src/components/dashboard/protected/adulto/BlockModal.tsx
// Descripción: Modal desplegado al pulsar el FAB (+) en Sitios y apps (Modo Adulto)
//              para bloquear un sitio web o aplicación.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { apiService } from '../../../../services/api.service';
import { BOTI_ASSETS } from '../botAssets';
import { FeedbackModal } from '../../../FeedbackModal';
import { styles } from './BlockModal.styles';

interface BlockModalProps {
  visible: boolean;
  onClose: () => void;
  onBlockSuccess: (item: { domainOrApp: string; type: 'SITE' | 'APP' }) => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  visible,
  onClose,
  onBlockSuccess,
}) => {
  const [blockType, setBlockType] = useState<'SITE' | 'APP'>('SITE');
  const [inputValue, setInputValue] = useState<string>('');
  const [category, setCategory] = useState<string>('Personalizado');
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    imageSource?: any;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleSubmit = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.pensando,
        title: 'Campo requerido',
        message: `Por favor, ingresa el ${blockType === 'SITE' ? 'sitio web (ej: casino.com)' : 'nombre de la aplicación'}.`,
      });
      return;
    }

    setLoading(true);
    try {
      if (blockType === 'SITE') {
        await apiService.addCustomBlockedSite(trimmed, category, true, []);
      } else {
        await apiService.addCustomBlockedSite(`${trimmed.toLowerCase().replace(/\s+/g, '')}.app`, category, true, []);
      }

      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.feliz,
        title: 'Bloqueo registrado',
        message: `El ${blockType === 'SITE' ? 'sitio web' : 'aplicación'} "${trimmed}" ha sido agregado a tu lista de restricciones.\n\n⚠️ RECUERDA: Únicamente tu TUTOR RESPONSABLE podrá remover este bloqueo.`,
        onConfirm: () => {
          setFeedbackModal((prev) => ({ ...prev, visible: false }));
          handleCloseModal(true, trimmed);
        },
      });
    } catch (e: any) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.nervioso,
        title: 'Error al bloquear',
        message: e.message || 'No se pudo registrar el bloqueo.',
      });
      setLoading(false);
    }
  };

  const handleCloseModal = (isSuccess: boolean = false, valueBlocked: string = '') => {
    setInputValue('');
    setLoading(false);
    onClose();
    if (isSuccess && valueBlocked) {
      onBlockSuccess({ domainOrApp: valueBlocked, type: blockType });
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => handleCloseModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>🔒 Bloquear sitio o app</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => handleCloseModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.typeTab,
                blockType === 'SITE' && styles.activeTypeTab,
              ]}
              onPress={() => setBlockType('SITE')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeTabText,
                  blockType === 'SITE' && styles.activeTypeTabText,
                ]}
              >
                🌐 Sitio web
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeTab,
                blockType === 'APP' && styles.activeTypeTab,
              ]}
              onPress={() => setBlockType('APP')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeTabText,
                  blockType === 'APP' && styles.activeTypeTabText,
                ]}
              >
                📱 Aplicación
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {blockType === 'SITE' ? 'Dirección o dominio web:' : 'Nombre de la aplicación o paquete:'}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={blockType === 'SITE' ? 'ejemplo: apuestaspeligrosas.com' : 'ejemplo: Bet365 o TikTok'}
              placeholderTextColor="#94A3B8"
              value={inputValue}
              onChangeText={setInputValue}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Categoría de restricción:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Categoría (apuestas, redes, juegos, etc.)"
              placeholderTextColor="#94A3B8"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.restrictionWarningCard}>
            <Image
              source={BOTI_ASSETS.nervioso}
              style={styles.restrictionMascot}
              resizeMode="contain"
            />
            <View style={styles.restrictionTextCol}>
              <View style={styles.restrictionWarningHeader}>
                <Text style={{ fontSize: 16 }}>⚠️</Text>
                <Text style={styles.restrictionWarningTitle}>
                  Aviso de seguridad importante:
                </Text>
              </View>
              <Text style={styles.restrictionWarningText}>
                Una vez confirmado este bloqueo para tu dispositivo, <Text style={{ fontWeight: '800' }}>NO podrás revertirlo o desbloquearlo por tu cuenta</Text>. Solamente tu <Text style={{ fontWeight: '800' }}>TUTOR RESPONSABLE</Text> podrá autorizar la remoción ingresando su PIN oficial.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                🔒 Confirmar y bloquear permanentemente
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal estándar de retroalimentación */}
      <FeedbackModal
        visible={feedbackModal.visible}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onConfirm={feedbackModal.onConfirm}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </Modal>
  );
};
