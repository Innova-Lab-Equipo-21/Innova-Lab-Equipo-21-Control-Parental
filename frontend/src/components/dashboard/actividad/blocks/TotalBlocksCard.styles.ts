// ==============================================================================
// Proyecto: BA Protege+
// Componente: TotalBlocksCard Styles
// Archivo: src/components/dashboard/actividad/blocks/TotalBlocksCard.styles.ts
// Descripción: Estilos para la tarjeta de Bloqueos totales y el gráfico
//              histórico de intentos a sitios bloqueados por dispositivo.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  kpiLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: palette.textMain,
    marginBottom: 4,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
    marginBottom: 10,
  },

  kpiNumber: {
    fontSize: 29,
    fontWeight: '800',
    color: palette.textMain,
    letterSpacing: -0.8,
    lineHeight: 32,
  },

  kpiSub: {
    fontSize: 11.5,
    color: palette.textMuted,
    fontWeight: '500',
  },

  historySection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: palette.cardBorder,
  },

  historyTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: palette.textMain,
    marginBottom: 6,
  },

  chartArea: {
    height: 60,
    width: '100%',
    position: 'relative',
    marginVertical: 2,
  },

  chartBaseline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: palette.cardBorder,
  },

  chartEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chartEmptyText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: palette.textMuted,
  },

  chartDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },

  chartDateText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: palette.textMuted,
  },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.surfaceBg,
  },

  legendItem: {
    alignItems: 'center',
    gap: 3,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.textSubtle,
  },
});
