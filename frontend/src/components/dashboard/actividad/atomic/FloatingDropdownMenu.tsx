// ==============================================================================
// Proyecto: BA Protege+
// Componente: FloatingDropdownMenu (Menú desplegable flotante anclado al botón)
// Archivo: src/components/dashboard/actividad/atomic/FloatingDropdownMenu.tsx
// Descripción: Renderiza la lista desplegable de un filtro flotando por encima
//              del resto de los bloques de la pantalla (sin desplazar el layout
//              ni recortarse por los bordes de la tarjeta), anclada exactamente
//              al rectángulo del botón disparador y con cierre al tocar fuera.
// ==============================================================================

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloatingDropdownMenuProps {
  visible: boolean;
  anchor: AnchorRect | null;
  onClose: () => void;
  maxHeight?: number;
  estimatedHeight?: number;
  menuStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const GAP = 6;
const SCREEN_MARGIN = 12;

export const FloatingDropdownMenu: React.FC<FloatingDropdownMenuProps> = ({
  visible,
  anchor,
  onClose,
  maxHeight = 240,
  estimatedHeight = 140,
  menuStyle,
  children,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(0);

  if (!visible || !anchor) {
    return null;
  }

  const effectiveHeight = containerHeight > 0 ? containerHeight : windowHeight;
  const clampedWidth = Math.min(anchor.width, windowWidth - SCREEN_MARGIN * 2);
  const clampedLeft = Math.max(
    SCREEN_MARGIN,
    Math.min(anchor.x, windowWidth - clampedWidth - SCREEN_MARGIN)
  );

  const spaceBelow =
    effectiveHeight - (anchor.y + anchor.height + GAP) - SCREEN_MARGIN;
  const spaceAbove = anchor.y - GAP - SCREEN_MARGIN;
  const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

  const positionStyle: ViewStyle = openUpward
    ? containerHeight > 0
      ? {
          left: clampedLeft,
          width: clampedWidth,
          bottom: containerHeight - anchor.y + GAP,
          maxHeight: Math.min(maxHeight, Math.max(100, spaceAbove)),
        }
      : {
          left: clampedLeft,
          width: clampedWidth,
          top: Math.max(SCREEN_MARGIN, anchor.y - estimatedHeight - GAP),
          maxHeight: Math.min(maxHeight, Math.max(100, spaceAbove)),
        }
    : {
        left: clampedLeft,
        width: clampedWidth,
        top: anchor.y + anchor.height + GAP,
        maxHeight: Math.min(maxHeight, Math.max(100, spaceBelow)),
      };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={false}
      onRequestClose={onClose}
    >
      <View
        style={styles.overlayRoot}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && h !== containerHeight) {
            setContainerHeight(h);
          }
        }}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú desplegable"
        />
        <View style={[styles.menuContainer, positionStyle, menuStyle]}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
  },
});
