// ==============================================================================
// Proyecto: BA Protege+
// Componente: AutocontrolConfirmationModal (Modal de Gestión y Doble Confirmación de Autoprotección)
// Archivo: src/components/dashboard/dispositivos/AutocontrolConfirmationModal.tsx
// Descripción: Modal unificado para el flujo de Autoprotección del Responsable:
//              - Doble confirmación para activación (Paso 1 y Paso 2).
//              - Aviso durante las 24 horas de protección obligatoria (desactivación no permitida).
//              - Confirmación de desactivación una vez cumplidas las 24 horas.
//              Cumple con el estilo de UnbindConfirmationModal.styles.ts:
//              botones en la misma fila con igual tamaño (flex: 1), botón X de cierre
//              y sin emojis en los CTAs.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { FeedbackModal } from '../../FeedbackModal';
import { BOTITO_ASSETS } from '../protected/botAssets';
import { SelfControlState } from '../../../types';
import { styles } from './AutocontrolConfirmationModal.styles';

export type AutocontrolModalMode =
  | 'ACTIVATE'
  | 'ACTIVE_LOCKED'
  | 'WAIT_IN_PROGRESS'
  | 'DEACTIVATION_READY'
  | 'REQUEST_DEACTIVATION'
  | 'TEMPORARILY_UNLOCKED';

interface AutocontrolConfirmationModalProps {
  visible: boolean;
  mode: AutocontrolModalMode | null;
  selfControl: SelfControlState;
  onClose: () => void;
  onActivate: () => Promise<void> | void;
  onRequestDeactivation: () => Promise<void> | void;
  onConfirmDeactivation: () => Promise<void> | void;
  onReactivate: () => Promise<void> | void;
}

export const AutocontrolConfirmationModal: React.FC<AutocontrolConfirmationModalProps> = ({
  visible,
  mode,
  selfControl,
  onClose,
  onActivate,
  onRequestDeactivation: _onRequestDeactivation,
  onConfirmDeactivation,
  onReactivate: _onReactivate,
}) => {
  const [activateStep, setActivateStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setActivateStep(1);
      setLoading(false);
      setErrorFeedback(null);
    }
  }, [visible, mode]);

  if (!visible || !mode) {
    return null;
  }

  const formatRemainingTime = (h?: number, m?: number, s?: number) => {
    const hours = h ?? 0;
    const mins = (m ?? 0).toString().padStart(2, '0');
    const secs = (s ?? 0).toString().padStart(2, '0');
    return `${hours}h ${mins}m ${secs}s`;
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      await onActivate();
    } catch (e: any) {
      setErrorFeedback(e.message || 'No se pudo activar la autoprotección.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeactivation = async () => {
    setLoading(true);
    try {
      await onConfirmDeactivation();
    } catch (e: any) {
      setErrorFeedback(e.message || 'No se pudo desactivar la autoprotección.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'ACTIVATE':
        if (activateStep === 1) {
          return (
            <View>
              <Image
                source={BOTITO_ASSETS.pensando}
                style={styles.modalMascotImage}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>Confirmación 1 de 2: Autoprotección</Text>
              <Text style={styles.modalBody}>
                La función de autoprotección bloquea deshabilitar, editar o eliminar sitios y aplicaciones en tu propio dispositivo.
              </Text>
              <View style={styles.warningBox}>
                <Text style={styles.warningBoxText}>
                  ⚠️ Al activarse, se iniciará un período de 24 horas durante el cual la función no podrá desactivarse.
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
                    onPress={() => setActivateStep(2)}
                  />
                </View>
              </View>
            </View>
          );
        }

        return (
          <View>
            <Image
              source={BOTITO_ASSETS.nervioso}
              style={styles.modalMascotImage}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Confirmación 2 de 2: Activar autoprotección</Text>
            <Text style={styles.modalBody}>
              ¿Confirmas activar la autoprotección en tu celular? No podrás desproteger sitios o apps bloqueadas en este dispositivo.
            </Text>
            <View style={styles.warningBox}>
              <Text style={styles.warningBoxText}>
                ⚠️ Una vez activada, deberás esperar 24 horas completas para poder desactivarla.
              </Text>
            </View>

            <View style={styles.buttonsRow}>
              <View style={styles.buttonCol}>
                <ActionButton
                  title="Volver"
                  variant="secondary"
                  disabled={loading}
                  onPress={() => setActivateStep(1)}
                />
              </View>
              <View style={styles.buttonCol}>
                <ActionButton
                  title="Activar"
                  variant="primary"
                  loading={loading}
                  onPress={handleActivate}
                />
              </View>
            </View>
          </View>
        );

      case 'ACTIVE_LOCKED':
      case 'WAIT_IN_PROGRESS': {
        const timeText = formatRemainingTime(
          selfControl.remainingWaitHours ?? selfControl.remainingHours,
          selfControl.remainingWaitMinutes ?? selfControl.remainingMinutes,
          selfControl.remainingWaitSeconds ?? selfControl.remainingSeconds
        );
        return (
          <View>
            <Image
              source={BOTITO_ASSETS.nervioso}
              style={styles.modalMascotImage}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Autoprotección activa (bloqueada)</Text>
            <Text style={styles.modalBody}>
              La función de autoprotección está activa. Restan {timeText} de protección obligatoria antes de poder desactivarla.
            </Text>
            <View style={styles.warningBox}>
              <Text style={styles.warningBoxText}>
                ⚠️ Durante este período de 24 horas no es posible desactivar la protección ni modificar sitios o apps bloqueadas.
              </Text>
            </View>

            <View style={styles.buttonsRow}>
              <View style={styles.buttonCol}>
                <ActionButton
                  title="Entendido"
                  variant="primary"
                  onPress={onClose}
                />
              </View>
            </View>
          </View>
        );
      }

      case 'DEACTIVATION_READY':
      case 'REQUEST_DEACTIVATION':
      case 'TEMPORARILY_UNLOCKED':
        return (
          <View>
            <Image
              source={BOTITO_ASSETS.pensando}
              style={styles.modalMascotImage}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Desactivar autoprotección</Text>
            <Text style={styles.modalBody}>
              Pasaron las 24 horas requeridas de protección obligatoria. ¿Deseas desactivar la función de autoprotección ahora?
            </Text>
            <View style={styles.warningBox}>
              <Text style={styles.warningBoxText}>
                ⚠️ Al desactivar, podrás volver a habilitar, editar o eliminar sitios y aplicaciones en tu propio dispositivo.
              </Text>
            </View>

            <View style={styles.buttonsRow}>
              <View style={styles.buttonCol}>
                <ActionButton
                  title="Cancelar"
                  variant="secondary"
                  disabled={loading}
                  onPress={onClose}
                />
              </View>
              <View style={styles.buttonCol}>
                <ActionButton
                  title="Desactivar"
                  variant="danger"
                  loading={loading}
                  onPress={handleConfirmDeactivation}
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
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

          {renderContent()}
        </View>
      </View>

      {/* Modal estándar de error */}
      <FeedbackModal
        visible={!!errorFeedback}
        imageSource={BOTITO_ASSETS.nervioso}
        title="Error"
        message={errorFeedback || ''}
        onClose={() => setErrorFeedback(null)}
      />
    </Modal>
  );
};
