// ==============================================================================
// Proyecto: BA Protege+
// Componente: AppsUsageCard Styles
// Archivo: src/components/dashboard/actividad/blocks/AppsUsageCard.styles.ts
// Descripción: Estilos oficiales para el bloque de uso diario de apps bloqueadas
//              (reutilizable en Responsable, Protegido Adulto y Protegido Menor).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  accordionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },

  accordionTitle: {
    fontSize: 13.5,
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

  // Lista de apps bloqueadas
  listContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: palette.cardBorder,
    gap: 10,
  },

  appRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: palette.surfaceBg,
  },

  appRowFirst: {
    paddingTop: 0,
    borderTopWidth: 0,
  },

  appTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 7,
  },

  appName: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.textMain,
    flex: 1,
  },

  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 99,
    borderWidth: 1,
  },

  statusPillAvailable: {
    backgroundColor: palette.successBg,
    borderColor: palette.successBorder,
  },

  statusPillWaiting: {
    backgroundColor: palette.customAmberBg,
    borderColor: palette.customAmberBorder,
  },

  statusPillBlocked: {
    backgroundColor: palette.dangerBg,
    borderColor: palette.dangerBorder,
  },

  statusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },

  statusPillTextAvailable: {
    color: palette.successDark,
  },

  statusPillTextWaiting: {
    color: palette.customAmberDark,
  },

  statusPillTextBlocked: {
    color: palette.dangerDark,
  },

  barSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.textMuted,
    marginBottom: 4,
  },

  progressTrack: {
    height: 7,
    backgroundColor: palette.surfaceBg,
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 6,
  },

  progressFill: {
    height: '100%',
    borderRadius: 99,
  },

  metricsFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },

  metricText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: palette.textMuted,
  },

  metricStrong: {
    fontWeight: '800',
    color: palette.textMain,
  },

  // Desglose por dispositivo cuando el filtro está en "Todos"
  deviceBarsList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.surfaceBg,
    gap: 7,
  },

  deviceBarRow: {
    gap: 4,
  },

  deviceBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  deviceBarIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },

  deviceBarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  deviceBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textMain,
    flexShrink: 1,
  },

  deviceBarValue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: palette.textMuted,
    flexShrink: 0,
  },

  deviceProgressTrack: {
    height: 5,
    backgroundColor: palette.surfaceBg,
    borderRadius: 99,
    overflow: 'hidden',
  },

  deviceProgressFill: {
    height: '100%',
    borderRadius: 99,
  },

  emptyBox: {
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.textMain,
    marginBottom: 3,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: palette.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },

  narrativeText: {
    fontSize: 12,
    fontWeight: '500',
    color: palette.textSubtle,
    lineHeight: 18,
  },

  carouselSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.cardBorder,
  },

  carouselContent: {
    gap: 8,
    paddingVertical: 2,
  },

  carouselCard: {
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },

  carouselCardSingle: {
    width: '100%',
  },

  carouselCardActive: {
    borderColor: palette.lotbaBlueBorder,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.cardBorder,
  },

  dotActive: {
    width: 16,
    backgroundColor: palette.lotbaBlue,
  },
});
