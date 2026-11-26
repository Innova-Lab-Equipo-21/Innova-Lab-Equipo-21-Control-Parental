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
  embeddedCard: {
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  compactCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },

  headerRowCompact: {
    marginBottom: 2,
  },

  kpiLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: palette.textMain,
    flex: 1,
  },

  kpiLabelCompact: {
    fontSize: 11.5,
  },

  chevron: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.lotbaBlue,
    paddingLeft: 4,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
    marginBottom: 10,
  },

  mainRowCompact: {
    marginTop: 0,
    marginBottom: 6,
  },

  mainRowCollapsed: {
    marginBottom: 2,
  },

  kpiNumber: {
    fontSize: 29,
    fontWeight: '800',
    color: palette.textMain,
    letterSpacing: -0.8,
    lineHeight: 32,
  },

  kpiNumberCompact: {
    fontSize: 22,
    lineHeight: 24,
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

  historySectionCompact: {
    paddingTop: 6,
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

  chartAreaCompact: {
    height: 50,
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

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.surfaceBg,
  },

  footerRowCompact: {
    marginTop: 6,
    paddingTop: 6,
  },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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

  actionBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },
});
