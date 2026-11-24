// ==============================================================================
// Proyecto: BA Protege+
// Componente: StackedBarChart Styles
// Archivo: src/components/dashboard/actividad/atomic/StackedBarChart.styles.ts
// Descripción: Estilos para el gráfico de barras apiladas por franja horaria,
//              incluyendo escenario, columnas, coronas de pico/HOY y eje horario.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

const STAGE_HEIGHT = 108;

export const styles = StyleSheet.create({
  stage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: STAGE_HEIGHT,
    gap: 8,
    paddingTop: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: palette.cardBorder,
  },

  col: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  stack: {
    width: '100%',
    maxWidth: 13,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 1.5,
  },

  stackSelected: {
    borderWidth: 2,
    borderColor: palette.textMain,
  },

  segEmpty: {
    backgroundColor: palette.cardBorder,
    width: '100%',
    height: '100%',
    borderRadius: 2,
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
