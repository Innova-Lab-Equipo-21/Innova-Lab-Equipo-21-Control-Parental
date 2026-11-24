// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeleteBlockItemModal
// Archivo: src/components/dashboard/sitios/DeleteBlockItemModal.tsx
// Descripción: Modal estándar de confirmación de eliminación para sitios web y
//              aplicaciones bloqueadas. Cumple con el sistema de diseño del app:
//              - Título en Sentence case ("Eliminar sitio bloqueado" / "Eliminar aplicación bloqueada").
//              - Botón de cierre X superior derecho.
//              - Emoji centrado identificador.
//              - Cuadro de advertencia informativa.
//              - CTAs en la misma fila con igual tamaño (flex: 1) y sin emojis.
// ==============================================================================

import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { BOTITO_ASSETS } from '../protected/botAssets';
import { styles } from './DeleteBlockItemModal.styles';

export type DeleteItemType = 'site' | 'app';

interface DeleteBlockItemModalProps {
  visible: boolean;
  type: DeleteItemType | null;
  itemName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export const DeleteBlockItemModal: React.FC<DeleteBlockItemModalProps> = ({
  visible,
  type,
  itemName,
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!visible || !type) {
    return null;
  }

  const title = `¿Querés quitar ${itemName} de tu lista de bloqueos?`;

  const bodyText =
    type === 'site'
      ? 'Al eliminar este sitio de tu lista, dejará de estar bloqueado en los dispositivos seleccionados y todos podrán acceder a él.'
      : 'Al eliminar esta aplicación de tu lista, dejará de estar bloqueada en los dispositivos seleccionados y todos podrán acceder a ella.';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Botón de cierre X superior derecho */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Cerrar modal"
            disabled={loading}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Ilustración Botito pensando */}
          <Image
            source={BOTITO_ASSETS.pensando}
            style={styles.modalMascotImage}
            resizeMode="contain"
          />

          {/* Título en Sentence case */}
          <Text style={styles.modalTitle}>{title}</Text>

          {/* Cuerpo descriptivo */}
          <Text style={styles.modalBody}>{bodyText}</Text>

          {/* Fila de CTAs con igual tamaño */}
          <View style={styles.buttonsRow}>
            <View style={styles.buttonCol}>
              <ActionButton
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                disabled={loading}
              />
            </View>
            <View style={styles.buttonCol}>
              <ActionButton
                title="Eliminar"
                variant="danger"
                onPress={onConfirm}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
