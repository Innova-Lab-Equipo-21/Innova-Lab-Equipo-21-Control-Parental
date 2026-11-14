// ==============================================================================
// Proyecto: BA Protege+
// Componente: PeriodSelector (Selector de período reutilizable)
// Archivo: src/components/dashboard/actividad/blocks/PeriodSelector.tsx
// Descripción: Dropdown liviano (botón + menú en modal) para elegir el período
//              de análisis. Sustituye el <select> del prototipo HTML.
// ==============================================================================

import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { styles } from './PeriodSelector.styles';

export interface PeriodOption {
  value: string;
  label: string;
}

export interface PeriodSelectorProps {
  options: PeriodOption[];
  value: string;
  onChange: (value: string) => void;
  testID?: string;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  options,
  value,
  onChange,
  testID,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const handleSelect = (nextValue: string) => {
    setOpen(false);
    onChange(nextValue);
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>{selected?.label ?? value}</Text>
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
                {options.map((opt) => {
                  const active = opt.value === value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(opt.value)}
                      accessibilityRole="menuitem"
                      style={[styles.menuItem, active && styles.menuItemActive]}
                    >
                      <Text
                        style={[
                          styles.menuItemText,
                          active && styles.menuItemTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {active && (
                        <Text style={[styles.menuItemTextActive, { fontSize: 13 }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
