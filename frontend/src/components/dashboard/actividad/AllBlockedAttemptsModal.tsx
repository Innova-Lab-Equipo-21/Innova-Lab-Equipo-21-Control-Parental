// ==============================================================================
// Proyecto: BA Protege+
// Componente: AllBlockedAttemptsModal (Bottom Sheet "Ver todo" de intentos)
// Archivo: src/components/dashboard/actividad/AllBlockedAttemptsModal.tsx
// ==============================================================================

import React from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  ActivityPeriod,
  FormattedBlockedAttempt,
  getActivityPeriodLabel,
} from '../../../utils/activityMetrics';
import { BlockedAttemptRow } from './BlockedAttemptRow';
import { styles } from './ActivitySheetModal.styles';

const MAX_VISIBLE_ATTEMPTS = 40;

export interface AllBlockedAttemptsModalProps {
  visible: boolean;
  deviceLabel: string;
  selectedPeriod: ActivityPeriod;
  formattedTotalBlocks: string;
  attempts: FormattedBlockedAttempt[];
  onClose: () => void;
}

export const AllBlockedAttemptsModal: React.FC<AllBlockedAttemptsModalProps> = ({
  visible,
  deviceLabel,
  selectedPeriod,
  formattedTotalBlocks,
  attempts,
  onClose,
}) => {
  const visibleAttempts = attempts.slice(0, MAX_VISIBLE_ATTEMPTS);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetCard}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>Intentos bloqueados</Text>
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={onClose}
                >
                  <Text style={styles.sheetCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sheetSubtitle}>
                {deviceLabel} · Período:{' '}
                {getActivityPeriodLabel(selectedPeriod)} ({formattedTotalBlocks}{' '}
                bloqueos)
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {visibleAttempts.map((attempt, idx) => (
                  <BlockedAttemptRow
                    key={`full-${attempt.id}`}
                    attempt={attempt}
                    isLast={idx === visibleAttempts.length - 1}
                  />
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.sheetDoneBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.sheetDoneBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
