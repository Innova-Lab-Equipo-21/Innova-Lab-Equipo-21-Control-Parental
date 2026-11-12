// ==============================================================================
// Proyecto: BA Protege+
// Componente: StackedBarChart Styles
// Archivo: src/components/dashboard/actividad/atomic/StackedBarChart.styles.ts
// Descripción: Estilos para el gráfico de barras apiladas, incluyendo escenario,
//              columnas, coronas de pico, ejes diarios/horarios y estados activos.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

const STAGE_HEIGHT = 132;

export const styles = StyleSheet.create({
  stage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: STAGE_HEIGHT,
    gap: 8,
    paddingTop: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: palette.cardBorder,
  },

  col: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  crown: {
    position: 'absolute',
    top: 0,
    backgroundColor: palette.textMain,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
  },

  crownText: {
    color: palette.white,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  todayCrown: {
    position: 'absolute',
    top: 0,
    backgroundColor: palette.lotbaBlueDark,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
  },

  todayCrownHourly: {
    paddingHorizontal: 2,
    paddingVertical: 1,
  },

  todayCrownText: {
    color: palette.white,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  todayCrownTextHourly: {
    fontSize: 7,
  },

  valueTop: {
    fontSize: 9.5,
    fontWeight: '700',
    color: palette.textSubtle,
    marginBottom: 3,
    lineHeight: 12,
  },

  valueTopEmphasis: {
    color: palette.textMain,
    fontWeight: '800',
  },

  stack: {
    width: '100%',
    maxWidth: 30,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 2,
  },

  stackHourly: {
    maxWidth: 13,
    borderRadius: 3,
    gap: 1.5,
  },

  stackSelected: {
    borderWidth: 2,
    borderColor: palette.textMain,
  },

  stackToday: {
    borderWidth: 2,
    borderColor: palette.lotbaBlue,
  },

  segCustom: {
    backgroundColor: palette.customAmber,
    width: '100%',
    borderRadius: 4,
  },

  segLotba: {
    backgroundColor: palette.lotbaBlue,
    width: '100%',
    borderRadius: 2,
  },

  axisDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 5,
    paddingHorizontal: 4,
  },

  axisDayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRadius: 6,
  },

  axisDayCellActive: {
    backgroundColor: palette.lotbaBlue,
  },

  axisDayCellToday: {
    backgroundColor: palette.lotbaBlueBg,
    borderWidth: 1,
    borderColor: palette.lotbaBlueBorder,
  },

  axisDayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textMuted,
  },

  axisDayLabelActive: {
    color: palette.white,
    fontWeight: '800',
  },

  axisDayLabelToday: {
    color: palette.lotbaBlueDark,
    fontWeight: '800',
  },

  axisHours: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
  },

  axisHourLabel: {
    fontSize: 10,
    color: palette.textMuted,
    fontWeight: '700',
  },
});
