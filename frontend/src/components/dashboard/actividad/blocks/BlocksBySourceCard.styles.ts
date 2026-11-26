// ==============================================================================
// Proyecto: BA Protege+
// Componente: BlocksBySourceCard Styles
// Archivo: src/components/dashboard/actividad/blocks/BlocksBySourceCard.styles.ts
// Descripción: Estilos para la barra comparativa de fuentes (LOTBA vs Personalizada)
//              y leyendas con muestras de color y porcentajes.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  embeddedCard: {
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },

  headerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: palette.textMain,
    flex: 1,
  },

  chevron: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.lotbaBlue,
    paddingLeft: 4,
  },

  expandedContent: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: palette.cardBorder,
  },

  barContainer: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 3,
    backgroundColor: palette.white,
    marginBottom: 8,
  },

  barContainerEmpty: {
    backgroundColor: palette.cardBorder,
  },

  segmentLotba: {
    backgroundColor: palette.lotbaBlue,
    height: '100%',
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },

  segmentCustom: {
    backgroundColor: palette.customAmber,
    height: '100%',
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },

  swatch: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },

  swatchLotba: {
    backgroundColor: palette.lotbaBlue,
  },

  swatchCustom: {
    backgroundColor: palette.customAmber,
  },

  legendNameLotba: {
    color: palette.lotbaBlueDark,
    fontWeight: '700',
    fontSize: 11,
  },

  legendNameCustom: {
    color: palette.customAmberDark,
    fontWeight: '700',
    fontSize: 11,
  },

  legendPct: {
    color: palette.textMain,
    fontWeight: '800',
    fontSize: 11,
  },
});
