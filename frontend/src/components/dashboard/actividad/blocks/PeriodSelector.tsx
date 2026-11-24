// ==============================================================================
// Proyecto: BA Protege+
// Componente: PeriodSelector (Selector desplegable de período / fecha)
// Archivo: src/components/dashboard/actividad/blocks/PeriodSelector.tsx
// Descripción: Dropdown inline (patrón oficial del app, sin modal) para elegir
//              el período de análisis ("Hoy", "Esta semana", "Este mes").
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AnchorRect, FloatingDropdownMenu } from '../atomic/FloatingDropdownMenu';
import { styles } from './PeriodSelector.styles';

export interface PeriodOption {
  value: string;
  label: string;
}

export interface PeriodSelectorProps {
  options: PeriodOption[];
  value: string;
  onChange: (value: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  testID?: string;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  options,
  value,
  onChange,
  isOpen,
  onToggle,
  testID,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const triggerRef = useRef<View>(null);
  const open = isOpen !== undefined ? isOpen : internalOpen;

  const measureTrigger = (afterMeasure?: () => void) => {
    if (
      triggerRef.current &&
      typeof triggerRef.current.measureInWindow === 'function'
    ) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setAnchor({ x, y, width, height });
        }
        afterMeasure?.();
      });
    } else {
      afterMeasure?.();
    }
  };

  useEffect(() => {
    if (open) {
      measureTrigger();
    }
  }, [open]);

  const openMenu = () => {
    measureTrigger(() => {
      if (onToggle) {
        if (!open) onToggle();
      } else {
        setInternalOpen(true);
      }
    });
  };

  const closeMenu = () => {
    if (onToggle) {
      if (open) onToggle();
    } else {
      setInternalOpen(false);
    }
  };

  const toggleOpen = () => {
    if (open) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const selected = options.find((o) => o.value === value);

  const handleSelect = (nextValue: string) => {
    closeMenu();
    onChange(nextValue);
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleOpen}
          accessibilityRole="button"
          accessibilityLabel="Filtrar por fecha"
          accessibilityState={{ expanded: open }}
          style={[styles.trigger, open && styles.triggerOpen]}
        >
          <Text
            style={styles.triggerText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selected?.label ?? value}
          </Text>
          <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>

      <FloatingDropdownMenu
        visible={open}
        anchor={anchor}
        onClose={closeMenu}
        maxHeight={220}
        estimatedHeight={Math.min(220, options.length * 42 + 4)}
        menuStyle={styles.dropdownMenu}
      >
        {options.map((opt, index) => {
          const active = opt.value === value;
          const isLast = index === options.length - 1;
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.7}
              onPress={() => handleSelect(opt.value)}
              accessibilityRole="menuitem"
              style={[
                styles.menuItem,
                active && styles.menuItemActive,
                isLast && styles.menuItemLast,
              ]}
            >
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
              {active && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </FloatingDropdownMenu>
    </View>
  );
};
