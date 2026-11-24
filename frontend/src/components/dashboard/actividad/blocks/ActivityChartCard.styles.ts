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
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  dayPillActive: {
    backgroundColor: palette.lotbaBlue,
    borderColor: palette.lotbaBlue,
  },

  dayPillToday: {
    backgroundColor: palette.lotbaBlueBg,
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
    gap: 8,
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

  inspectorPeak: {
    fontSize: 10.5,
    fontWeight: '800',
    color: palette.peakStrong,
    flexShrink: 0,
  },
});
