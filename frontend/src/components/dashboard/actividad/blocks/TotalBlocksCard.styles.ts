// ==============================================================================
// Proyecto: BA Protege+
// Componente: TotalBlocksCard Styles
// Archivo: src/components/dashboard/actividad/blocks/TotalBlocksCard.styles.ts
// Descripción: Estilos para la tarjeta de Bloqueos totales, insignia de protección
//              activa, número principal KPI y píldoras de desglose por dispositivo.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  kpiLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: palette.textMain,
    marginBottom: 8,
  },

  uptimeBadge: {
    backgroundColor: palette.successBg,
    borderWidth: 1,
    borderColor: palette.successBorder,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },

  uptimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.successDark,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 3,
    marginBottom: 6,
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

  breakdownRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: palette.cardBorder,
    borderStyle: 'dashed',
  },

  pill: {
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  pillText: {
    fontSize: 10,
    color: palette.textSubtle,
    fontWeight: '600',
  },

  pillStrong: {
    color: palette.textMain,
    fontWeight: '800',
  },
});
