// ==============================================================================
// Proyecto: BA Protege+
// Componente: FabWithTooltip
// Archivo: src/components/FabWithTooltip.tsx
// Descripción: Componente reutilizable del Botón Flotante de Acción (FAB +) con bocadillo
//              de texto dinámico explicativo (Tooltip con flecha) que desaparece automáticamente
//              después de 3 segundos de visibilidad.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './FabWithTooltip.styles';

interface FabWithTooltipProps {
  label: string; // Texto dinámico explicativo (ej: "Bloquear sitio o app", "Nuevo dispositivo")
  onPress: () => void;
  badgeCount?: number;
  iconText?: string;
  accessibilityLabel?: string;
  bottomOffset?: number; // Permite personalizar la distancia del borde inferior si se requiere
  hidden?: boolean; // Oculta visualmente el FAB (ej: mientras el teclado está abierto) sin reiniciar el tooltip
}

export const FabWithTooltip: React.FC<FabWithTooltipProps> = ({
  label,
  onPress,
  badgeCount,
  iconText = '+',
  accessibilityLabel,
  bottomOffset,
  hidden = false,
}) => {
  const [visibleTooltip, setVisibleTooltip] = useState<boolean>(true);

  useEffect(() => {
    // Muestra el bocadillo explicativo durante exactamente 3 segundos al aparecer
    setVisibleTooltip(true);

    const timer = setTimeout(() => {
      setVisibleTooltip(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [label]);

  const handleFabPress = () => {
    setVisibleTooltip(false);
    onPress();
  };

  return (
    <View
      style={[
        styles.container,
        bottomOffset !== undefined ? { bottom: bottomOffset } : null,
        hidden ? { display: 'none' } : null,
      ]}
    >
      {/* Bocadillo de texto explicativo (Speech Bubble) que se muestra por 3 segundos */}
      {visibleTooltip && (
        <View style={styles.bubbleRow}>
          <View style={styles.speechBubble}>
            <Text style={styles.speechBubbleText}>{label}</Text>
          </View>
          {/* Triángulo apuntando hacia el FAB */}
          <View style={styles.arrowTail} />
        </View>
      )}

      {/* Botón Flotante Circular FAB (+) */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleFabPress}
        activeOpacity={0.85}
        accessibilityLabel={accessibilityLabel || label}
      >
        <Text style={styles.fabIconText}>{iconText}</Text>
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {badgeCount > 9 ? '9+' : badgeCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
