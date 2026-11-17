// ==============================================================================
// Proyecto: BA Protege+
// Componente: HeartbeatBanner Styles
// Archivo: src/components/dashboard/actividad/blocks/HeartbeatBanner.styles.ts
// Descripción: Estilos para el banner de advertencia operativa de dispositivos
//              inactivos o desconectados.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: palette.dangerBg,
    borderWidth: 1,
    borderColor: palette.dangerBorder,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
  },

  warningIcon: {
    fontSize: 12,
  },

  text: {
    flexShrink: 1,
    fontSize: 10.5,
    color: palette.dangerDeep,
    fontWeight: '600',
    lineHeight: 14,
  },

  tag: {
    backgroundColor: palette.dangerTagBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  tagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: palette.dangerDark,
  },
});
