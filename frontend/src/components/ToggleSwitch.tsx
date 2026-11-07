// ==============================================================================
// Proyecto: BA Protege+
// Componente: ToggleSwitch (Switch OFF/ON UI Kit)
// Archivo: src/components/ToggleSwitch.tsx
// Descripción: Componente reutilizable de UI Kit para interruptor deslizante binario (ON/OFF)
//              con soporte para personalización de colores, estado deshabilitado y accesibilidad.
// ==============================================================================

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

/**
 * Propiedades del componente ToggleSwitch.
 *
 * @property value - Valor booleano del interruptor (true = Encendido / ON, false = Apagado / OFF).
 * @property onValueChange - Callback ejecutado con el nuevo estado al presionar el interruptor.
 * @property disabled - Opcional. Si es true, el switch no responderá a eventos táctiles.
 * @property activeColor - Color de fondo del carril en estado activo (por defecto azul institucional #007AFF).
 * @property inactiveColor - Color de fondo del carril en estado inactivo (por defecto gris #D1D5DB).
 */
interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  onDisabledPress?: () => void;
  activeColor?: string;
  inactiveColor?: string;
}

/**
 * Componente que renderiza un switch deslizante nativo con soporte de accesibilidad.
 * Utilizado para alternar estados de protección, VPN, bloqueo de apps y filtros parentales.
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  onDisabledPress,
  activeColor = '#007AFF',
  inactiveColor = '#D1D5DB',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled && !onDisabledPress}
      onPress={() => {
        if (disabled) {
          onDisabledPress?.();
          return;
        }
        onValueChange(!value);
      }}
      style={[
        styles.track,
        value
          ? [styles.trackActive, { backgroundColor: activeColor }]
          : [styles.trackInactive, { backgroundColor: inactiveColor }],
        disabled && styles.disabled,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <View
        style={[
          styles.thumb,
          value ? styles.thumbActive : styles.thumbInactive,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: '#007AFF',
  },
  trackInactive: {
    backgroundColor: '#D1D5DB',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2.5,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  thumbInactive: {
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
});
