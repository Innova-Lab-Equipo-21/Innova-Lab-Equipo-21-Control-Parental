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
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { ActionButton } from '../../ActionButton';
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

  const title =
    type === 'site'
      ? 'Eliminar sitio bloqueado'
      : 'Eliminar aplicación bloqueada';

  const bodyText = `¿Deseas desbloquear y eliminar permanentemente "${itemName}" de tu lista?`;

  const warningText =
    type === 'site'
      ? '⚠️ Esta acción deshabilitará el bloqueo del sitio en todos los dispositivos asignados y no se puede deshacer.'
      : '⚠️ Esta acción deshabilitará el bloqueo de la aplicación en todos los dispositivos asignados y no se puede deshacer.';

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

          {/* Emoji centrado identificador */}
          <Text style={styles.modalEmoji}>🗑️</Text>

          {/* Título en Sentence case */}
          <Text style={styles.modalTitle}>{title}</Text>

          {/* Cuerpo descriptivo */}
          <Text style={styles.modalBody}>{bodyText}</Text>

          {/* Caja de advertencia */}
          <View style={styles.warningBox}>
            <Text style={styles.warningBoxText}>{warningText}</Text>
          </View>

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
