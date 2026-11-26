// ==============================================================================
// Proyecto: BA Protege+
// Componente: PasatiemposSummaryCard Styles
// Archivo: src/components/dashboard/actividad/blocks/PasatiemposSummaryCard.styles.ts
// Descripción: Estilos limpios para el bloque Pasatiempos con pestañas
//              Menores / Mayores, badges de estado y KPIs Racha / En la semana.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  blockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },

  blockHeaderRowCollapsed: {
    marginBottom: 0,
  },

  blockTitle: {
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

  deviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },

  deviceIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },

  deviceColorDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    flexShrink: 0,
  },

  deviceHeaderName: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.textMain,
    flexShrink: 1,
  },

  cardChevron: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.lotbaBlue,
    paddingLeft: 4,
  },

  gamesSection: {
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: palette.cardBorder,
  },

  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceBg,
    gap: 8,
  },

  gameRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },

  gameLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },

  gameIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gameIconText: {
    fontSize: 13,
    fontWeight: '900',
    color: palette.white,
  },

  gameInfo: {
    flex: 1,
  },

  gameName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: palette.textMain,
  },

  gameSubDetail: {
    fontSize: 10.5,
    fontWeight: '600',
    color: palette.textMuted,
    marginTop: 1,
  },

  // Badges de estado (No iniciado / En curso / Completado)
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 99,
    borderWidth: 1,
    flexShrink: 0,
  },

  statusBadgePending: {
    backgroundColor: palette.surfaceBg,
    borderColor: palette.cardBorder,
  },

  statusBadgeInProgress: {
    backgroundColor: palette.customAmberBg,
    borderColor: palette.customAmberBorder,
  },

  statusBadgeCompleted: {
    backgroundColor: palette.successBg,
    borderColor: palette.successBorder,
  },

  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },

  statusBadgeTextPending: {
    color: palette.textMuted,
  },

  statusBadgeTextInProgress: {
    color: palette.customAmberDark,
  },

  statusBadgeTextCompleted: {
    color: palette.successDark,
  },

  // KPIs (Racha y En la semana) en la parte visible del card
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },

  kpiPill: {
    flex: 1,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },

  kpiPillLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.textMuted,
    marginBottom: 2,
  },

  kpiPillValue: {
    fontSize: 13,
    fontWeight: '900',
    color: palette.textMain,
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
});
