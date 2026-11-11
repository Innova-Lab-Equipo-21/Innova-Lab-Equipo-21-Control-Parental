// ==============================================================================
// Proyecto: BA Protege+
// Componente: StackedBarChart Styles
// Archivo: components/analytics/StackedBarChart.styles.ts
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
    paddingVertical: 2,
    borderRadius: 4,
  },

  axisDayLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: palette.textMuted,
  },

  axisDayLabelActive: {
    color: palette.textMain,
    fontWeight: '800',
    backgroundColor: palette.cardBorder,
    paddingHorizontal: 6,
    borderRadius: 4,
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
