// ==============================================================================
// Proyecto: BA Protege+
// Componente: HeartbeatBanner Styles
// Archivo: src/components/dashboard/actividad/blocks/HeartbeatBanner.styles.ts
// Descripción: Estilos para el bloque de alerta de dispositivos pendientes de
//              vinculación con hasta 5 tarjetas compactas por línea.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.dangerBg,
    borderWidth: 1,
    borderColor: palette.dangerBorder,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  warningIcon: {
    fontSize: 12,
  },

  headerText: {
    flexShrink: 1,
    fontSize: 11,
    color: palette.dangerDeep,
    fontWeight: '700',
    lineHeight: 15,
  },

  rowsWrap: {
    gap: 6,
  },

  blocksRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
  },

  deviceBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.dangerBorder,
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  deviceBlockCompact: {
    flexDirection: 'column',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },

  deviceAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  deviceAvatarCompact: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  deviceAvatarIcon: {
    fontSize: 11,
    lineHeight: 14,
  },

  deviceAvatarIconCompact: {
    fontSize: 12,
    lineHeight: 15,
  },

  deviceName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: palette.dangerDeep,
    flexShrink: 1,
  },

  deviceNameCompact: {
    fontSize: 10,
    textAlign: 'center',
    width: '100%',
  },
});
