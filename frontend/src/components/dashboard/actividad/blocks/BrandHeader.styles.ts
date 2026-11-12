// ==============================================================================
// Proyecto: BA Protege+
// Componente: BrandHeader Styles
// Archivo: src/components/dashboard/actividad/blocks/BrandHeader.styles.ts
// Descripción: Estilos para la cabecera institucional alternativa con título de
//              marca y pílula de sincronización de listas oficiales.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: palette.headerGradientTop,
    borderBottomWidth: 1,
    borderBottomColor: palette.headerBorder,
  },

  brandTitle: {
    color: palette.lotbaBlueDark,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
    letterSpacing: -0.4,
  },

  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.lotbaBlueBorder,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },

  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.success,
  },

  syncText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.lotbaBlueDark,
  },
});
