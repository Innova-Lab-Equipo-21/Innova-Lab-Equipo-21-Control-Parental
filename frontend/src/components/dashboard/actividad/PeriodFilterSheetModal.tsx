// ==============================================================================
// Proyecto: BA Protege+
// Componente: PeriodFilterSheetModal (Bottom Sheet de Período: Semana/Mes/Año/Total)
// Archivo: src/components/dashboard/actividad/PeriodFilterSheetModal.tsx
// ==============================================================================

import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  ACTIVITY_PERIOD_OPTIONS,
  ActivityPeriod,
} from '../../../utils/activityMetrics';
import { styles } from './ActivitySheetModal.styles';

export interface PeriodFilterSheetModalProps {
  visible: boolean;
  selectedPeriod: ActivityPeriod;
  onSelectPeriod: (period: ActivityPeriod) => void;
  onClose: () => void;
}

export const PeriodFilterSheetModal: React.FC<PeriodFilterSheetModalProps> = ({
  visible,
  selectedPeriod,
  onSelectPeriod,
  onClose,
}) => {
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
                <Text style={styles.sheetTitle}>Seleccionar período</Text>
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={onClose}
                >
                  <Text style={styles.sheetCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sheetSubtitle}>
                Las métricas se recalculan al instante según el rango elegido
              </Text>

              {ACTIVITY_PERIOD_OPTIONS.map((opt) => {
                const isSelected = opt.key === selectedPeriod;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowActive,
                    ]}
                    onPress={() => {
                      onSelectPeriod(opt.key);
                      onClose();
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text
                        style={[
                          styles.optionTitle,
                          isSelected && styles.optionTitleActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={styles.optionSubtitle}>
                        {opt.description}
                      </Text>
                    </View>

                    {isSelected && (
                      <View style={styles.optionCheckBadge}>
                        <Text style={styles.optionCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
