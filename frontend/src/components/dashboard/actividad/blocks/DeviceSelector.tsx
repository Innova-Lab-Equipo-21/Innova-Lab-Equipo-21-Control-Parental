// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeviceSelector (Dropdown selector de dispositivos en Actividad)
// Archivo: src/components/dashboard/actividad/blocks/DeviceSelector.tsx
// Descripción: Dropdown para filtrar métricas de actividad por dispositivo:
//              - "Todos"
//              - "Yo" (dispositivo del responsable, siempre primero)
//              - Dispositivos protegidos ordenados alfabéticamente (A-Z)
//                mostrando solo el primer nombre.
// ==============================================================================

import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AnalyticsDevice } from '../types';
import { styles } from './DeviceSelector.styles';

export interface DeviceSelectorOption {
  id: string;
  label: string;
  status?: AnalyticsDevice['status'];
}

export interface DeviceSelectorProps {
  options: DeviceSelectorOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  allLabel?: string;
  testID?: string;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  options,
  selectedId,
  onSelect,
  allLabel = 'Todos',
  testID,
}) => {
  const [open, setOpen] = useState(false);

  const fullOptions = useMemo(() => {
    return [
      { id: 'all', label: allLabel },
      ...options.filter((o) => o.id !== 'all'),
    ];
  }, [options, allLabel]);

  const selected =
    fullOptions.find((o) => o.id === selectedId) ?? fullOptions[0];

  const handleSelect = (id: string) => {
    setOpen(false);
    onSelect(id);
  };

  const renderStatusDot = (status?: AnalyticsDevice['status']) => {
    if (!status) return null;
    const dotStyle =
      status === 'online'
        ? styles.dotOnline
        : status === 'offline'
        ? styles.dotOffline
        : styles.dotWarning;
    return <View style={[styles.dot, dotStyle]} />;
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={styles.trigger}
      >
        <View style={styles.triggerLeft}>
          {selected?.id !== 'all' && renderStatusDot(selected?.status)}
          <Text
            style={styles.triggerText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selected?.label ?? allLabel}
          </Text>
        </View>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.menu}>
                <Text style={styles.menuHeader}>Filtrar por dispositivo</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {fullOptions.map((opt) => {
                    const active = opt.id === selectedId;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.7}
                        onPress={() => handleSelect(opt.id)}
                        accessibilityRole="menuitem"
                        style={[
                          styles.menuItem,
                          active && styles.menuItemActive,
                        ]}
                      >
                        <View style={styles.menuItemLeft}>
                          {opt.id !== 'all' && renderStatusDot(opt.status)}
                          <Text
                            style={[
                              styles.menuItemText,
                              active && styles.menuItemTextActive,
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {opt.label}
                          </Text>
                        </View>
                        {active && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
