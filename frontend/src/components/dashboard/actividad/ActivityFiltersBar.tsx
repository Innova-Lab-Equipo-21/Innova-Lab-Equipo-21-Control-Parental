// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivityFiltersBar (Bloque 1: Filtros de Dispositivo y Período)
// Archivo: src/components/dashboard/actividad/ActivityFiltersBar.tsx
// ==============================================================================

import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import {
  ActivityDeviceFilterOption,
  ActivityPeriod,
  getActivityPeriodLabel,
} from '../../../utils/activityMetrics';
import { styles } from './ActivityFiltersBar.styles';

export interface ActivityFiltersBarProps {
  activeDeviceOption: ActivityDeviceFilterOption;
  activeDeviceColor: string;
  selectedPeriod: ActivityPeriod;
  onOpenDeviceModal: () => void;
  onOpenPeriodModal: () => void;
}

export const ActivityFiltersBar: React.FC<ActivityFiltersBarProps> = ({
  activeDeviceOption,
  activeDeviceColor,
  selectedPeriod,
  onOpenDeviceModal,
  onOpenPeriodModal,
}) => {
  return (
    <View style={styles.filterCard}>
      <TouchableOpacity
        style={styles.deviceSelectorBtn}
        onPress={onOpenDeviceModal}
        activeOpacity={0.75}
        accessibilityLabel="Seleccionar dispositivo"
      >
        <View
          style={[
            styles.deviceIconBox,
            { backgroundColor: activeDeviceColor },
          ]}
        >
          <Image
            source={
              activeDeviceOption.isAll
                ? require('../../../assets/icons/navbar/dispositivos.png')
                : require('../../../assets/icons/celular.png')
            }
            style={styles.deviceIconImg}
          />
        </View>

        <View style={styles.deviceTextCol}>
          <View style={styles.deviceTitleRow}>
            <Text style={styles.deviceSelectorLabel} numberOfLines={1}>
              {activeDeviceOption.label}
            </Text>
            <Text style={styles.selectorChevron}>▾</Text>
          </View>
          <Text style={styles.deviceSelectorSubtitle} numberOfLines={1}>
            {activeDeviceOption.subtitle}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.periodSelectorBtn}
        onPress={onOpenPeriodModal}
        activeOpacity={0.75}
        accessibilityLabel="Seleccionar período"
      >
        <Text style={styles.periodSelectorText}>
          {getActivityPeriodLabel(selectedPeriod)}
        </Text>
        <Text style={styles.periodChevron}>▾</Text>
      </TouchableOpacity>
    </View>
  );
};
