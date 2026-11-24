// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeviceSelector (Dropdown selector de dispositivos en Actividad)
// Archivo: src/components/dashboard/actividad/blocks/DeviceSelector.tsx
// Descripción: Dropdown inline (estándar oficial del app, sin modal) para
//              filtrar métricas de actividad por dispositivo:
//              - "Todos (N)"
//              - "Yo" (Responsable con su ícono y color institucional azul)
//              - Dispositivos protegidos ordenados A-Z con sus respectivos
//                íconos y colores asignados en Dispositivos (getDeviceHighlight).
// ==============================================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getDeviceHighlight } from '../../../../utils/deviceColors';
import { AnchorRect, FloatingDropdownMenu } from '../atomic/FloatingDropdownMenu';
import { AnalyticsDevice } from '../types';
import { styles } from './DeviceSelector.styles';

export interface DeviceSelectorOption {
  id: string;
  label: string;
  status?: AnalyticsDevice['status'];
  colorIndex?: number;
}

export interface DeviceSelectorProps {
  options: DeviceSelectorOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  allLabel?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  testID?: string;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  options,
  selectedId,
  onSelect,
  allLabel = 'Todos',
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

  const fullOptions = useMemo<DeviceSelectorOption[]>(() => {
    return [
      { id: 'all', label: allLabel },
      ...options.filter((o) => o.id !== 'all'),
    ];
  }, [options, allLabel]);

  const selectedIndex = fullOptions.findIndex((o) => o.id === selectedId);
  const selected =
    selectedIndex >= 0 ? fullOptions[selectedIndex] : fullOptions[0];

  const handleSelect = (id: string) => {
    closeMenu();
    onSelect(id);
  };

  const renderDeviceAvatar = (opt: DeviceSelectorOption, fallbackIndex: number) => {
    if (opt.id === 'all') {
      return (
        <View style={[styles.deviceAvatar, styles.allAvatar]}>
          <Text style={styles.deviceAvatarIcon}>👥</Text>
        </View>
      );
    }
    const highlight = getDeviceHighlight(
      opt.id,
      opt.label,
      opt.label,
      opt.id === 'self' ? 0 : (opt.colorIndex ?? fallbackIndex)
    );
    return (
      <View
        style={[
          styles.deviceAvatar,
          {
            backgroundColor: highlight.bgColor,
            borderColor: highlight.borderColor,
          },
        ]}
      >
        <Text style={styles.deviceAvatarIcon}>{highlight.icon}</Text>
      </View>
    );
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleOpen}
          accessibilityRole="button"
          accessibilityLabel="Filtrar por dispositivo"
          accessibilityState={{ expanded: open }}
          style={[styles.trigger, open && styles.triggerOpen]}
        >
          <View style={styles.triggerLeft}>
            {selected && renderDeviceAvatar(selected, Math.max(0, selectedIndex - 1))}
            <Text
              style={styles.triggerText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selected?.label ?? allLabel}
            </Text>
          </View>
          <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>

      <FloatingDropdownMenu
        visible={open}
        anchor={anchor}
        onClose={closeMenu}
        maxHeight={240}
        estimatedHeight={Math.min(240, fullOptions.length * 44 + 4)}
        menuStyle={styles.dropdownMenu}
      >
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={styles.dropdownScroll}
        >
          {fullOptions.map((opt, index) => {
            const active = opt.id === selectedId;
            const isLast = index === fullOptions.length - 1;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.7}
                onPress={() => handleSelect(opt.id)}
                accessibilityRole="menuitem"
                style={[
                  styles.menuItem,
                  active && styles.menuItemActive,
                  isLast && styles.menuItemLast,
                ]}
              >
                <View style={styles.menuItemLeft}>
                  {renderDeviceAvatar(opt, Math.max(0, index - 1))}
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
      </FloatingDropdownMenu>
    </View>
  );
};
