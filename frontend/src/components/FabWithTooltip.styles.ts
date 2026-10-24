// ==============================================================================
// Proyecto: BA Protege+
// Componente: FabWithTooltip Styles
// Archivo: src/components/FabWithTooltip.styles.ts
// Descripción: Estilos para el Botón Flotante de Acción (FAB +) con bocadillo explicativo
//              dinámico (Tooltip) y flecha indicadora hacia el botón.
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 2,
  },
  // Tarjeta de bocadillo de texto (Speech Bubble)
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  speechBubbleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  // Flecha / Triángulo indicadora apuntando hacia la derecha (al FAB)
  arrowTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    marginLeft: -1,
  },
  // Botón Flotante Circular (FAB)
  fabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabIconText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 28,
    marginTop: -2,
  },
  // Badge de notificación o contador
  badgeContainer: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#DC2626',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
