// ==============================================================================
// Proyecto: BA Protege+
// Componente: SegmentedTabs (Control de pestañas segmentado reutilizable)
// Archivo: components/analytics/SegmentedTabs.tsx
// Descripción: Control de tabs con ancho equitativo y contador opcional por
//              pestaña. Usado para el modo de gráfico y la auditoría.
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './SegmentedTabs.styles';

export interface SegmentedTabItem {
  key: string;
  label: string;
  badgeCount?: number;
}

export interface SegmentedTabsProps {
  tabs: SegmentedTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  testID?: string;
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  tabs,
  activeKey,
  onChange,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        const hasBadge = tab.badgeCount != null && tab.badgeCount > 0;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
            {hasBadge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tab.badgeCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
