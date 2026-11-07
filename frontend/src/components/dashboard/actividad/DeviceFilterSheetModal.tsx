// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeviceFilterSheetModal (Bottom Sheet de Filtro por Dispositivo)
// Archivo: src/components/dashboard/actividad/DeviceFilterSheetModal.tsx
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
import { ActivityDeviceFilterOption } from '../../../utils/activityMetrics';
import { getDeviceHighlight } from '../../../utils/deviceColors';
import { styles } from './ActivitySheetModal.styles';

export interface DeviceFilterSheetModalProps {
  visible: boolean;
  deviceOptions: ActivityDeviceFilterOption[];
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  onClose: () => void;
}

export const DeviceFilterSheetModal: React.FC<DeviceFilterSheetModalProps> = ({
  visible,
  deviceOptions,
  selectedDeviceId,
  onSelectDevice,
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
                <Text style={styles.sheetTitle}>Filtrar por dispositivo</Text>
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={onClose}
                >
                  <Text style={styles.sheetCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sheetSubtitle}>
                Elegí todos los dispositivos o uno en particular
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {deviceOptions.map((opt) => {
                  const isSelected = opt.id === selectedDeviceId;
                  const avatarColor = opt.isAll
                    ? '#007AFF'
                    : opt.isSelf
                      ? '#0056B3'
                      : getDeviceHighlight(
                          opt.id,
                          opt.label,
                          opt.label,
                          opt.colorIndex ?? 0
                        ).color;

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowActive,
                      ]}
                      onPress={() => {
                        onSelectDevice(opt.id);
                        onClose();
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={styles.optionLeft}>
                        <View
                          style={[
                            styles.optionAvatar,
                            { backgroundColor: avatarColor },
                          ]}
                        >
                          <Text style={styles.optionAvatarText}>
                            {opt.isAll
                              ? 'T'
                              : opt.label.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.optionTitle,
                              isSelected && styles.optionTitleActive,
                            ]}
                            numberOfLines={1}
                          >
                            {opt.label}
                          </Text>
                          <Text
                            style={styles.optionSubtitle}
                            numberOfLines={1}
                          >
                            {opt.subtitle}
                          </Text>
                        </View>
                      </View>

                      {isSelected && (
                        <View style={styles.optionCheckBadge}>
                          <Text style={styles.optionCheckText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
