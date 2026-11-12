// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivityChartCard Styles
// Archivo: src/components/dashboard/actividad/blocks/ActivityChartCard.styles.ts
// Descripción: Estilos para la tarjeta de gráfico de actividad, incluyendo barra
//              superior, selector de días estilo Google Maps e inspector de métricas.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginBottom: 7,
  },

  tabsWrap: {
    flex: 1,
  },

  peakPill: {
    backgroundColor: palette.peakBg,
    borderWidth: 1,
    borderColor: palette.peakBorder,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },

  peakPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.peakText,
  },

  peakPillStrong: {
    color: palette.peakStrong,
    fontWeight: '800',
  },

  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 8,
    backgroundColor: palette.offWhite,
    padding: 4,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: palette.cardBorder,
  },

  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 6,
  },

  dayPillActive: {
    backgroundColor: palette.lotbaBlue,
  },

  dayPillToday: {
    backgroundColor: palette.lotbaBlueBg,
    borderWidth: 1,
    borderColor: palette.lotbaBlueBorder,
  },

  dayPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: palette.textMuted,
  },

  dayPillTextActive: {
    color: palette.white,
  },

  dayPillTextToday: {
    color: palette.lotbaBlueDark,
    fontWeight: '800',
  },

  inspector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginBottom: 8,
  },

  inspectorLeft: {
    fontSize: 10.5,
    fontWeight: '800',
    color: palette.textMain,
    flexShrink: 1,
  },

  inspectorRight: {
    flexDirection: 'row',
    gap: 8,
  },

  inspectorLotba: {
    fontSize: 10.5,
    fontWeight: '700',
    color: palette.lotbaBlueDark,
  },

  inspectorCustom: {
    fontSize: 10.5,
    fontWeight: '700',
    color: palette.customAmberDark,
  },
});
