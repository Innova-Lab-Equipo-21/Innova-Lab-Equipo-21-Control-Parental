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
  kpiLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: palette.textMain,
    marginBottom: 10,
  },

  tabsWrapper: {
    marginBottom: 8,
  },

  devicesList: {
    flexDirection: 'column',
  },

  deviceSection: {
    paddingTop: 2,
  },

  deviceSectionDivider: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: palette.cardBorder,
  },

  deviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
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

  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceBg,
    gap: 8,
  },

  gameRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
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

  // KPIs inferiores (Racha y En la semana)
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: palette.surfaceBg,
  },

  kpiPill: {
    flex: 1,
    backgroundColor: palette.offWhite,
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
