// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoActividadSection Styles
// Archivo: src/components/dashboard/protected/adulto/AdultoActividadSection.styles.ts
// Descripción: Estilos oficiales de la pestaña Actividad del Protegido Adulto
//              con 3 bloques: Mis apps hoy, Cuestionario diario y Sitios y apps
//              bloqueados (usando analyticsPalette oficial).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../../actividad/palette';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: palette.surfaceBg,
  },

  // --- Bloque 2: Cuestionario diario ---
  quizHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },

  quizTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },

  quizIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: palette.lotbaBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quizIconBoxDone: {
    backgroundColor: '#16A34A',
  },

  quizIconText: {
    fontSize: 16,
    fontWeight: '900',
    color: palette.white,
  },

  quizTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.textMain,
  },

  quizSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.textMuted,
    marginTop: 1,
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },

  statusPillDone: {
    backgroundColor: palette.successBg,
    borderColor: palette.successBorder,
  },

  statusPillProgress: {
    backgroundColor: palette.lotbaBlueBg,
    borderColor: palette.lotbaBlueBorder,
  },

  statusPillPending: {
    backgroundColor: palette.customAmberBg,
    borderColor: palette.customAmberBorder,
  },

  statusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },

  statusPillTextDone: {
    color: palette.successDark,
  },

  statusPillTextProgress: {
    color: palette.lotbaBlueDark,
  },

  statusPillTextPending: {
    color: palette.customAmberDark,
  },

  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },

  kpiBox: {
    flex: 1,
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 9,
  },

  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.textMuted,
    marginBottom: 3,
  },

  kpiValue: {
    fontSize: 14,
    fontWeight: '900',
    color: palette.textMain,
  },

  kpiSub: {
    fontSize: 9.5,
    fontWeight: '600',
    color: palette.textMuted,
    marginTop: 2,
  },

  quizCtaButton: {
    marginTop: 10,
    backgroundColor: palette.lotbaBlue,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },

  quizCtaText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.white,
  },

  // --- Bloque 3: Sitios y apps bloqueados ---
  blockedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },

  blockedTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: palette.textMain,
  },

  blockedSubtitleCount: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textMuted,
  },

  stackedBarTrack: {
    height: 10,
    borderRadius: 99,
    backgroundColor: palette.surfaceBg,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 9,
  },

  stackedBarLotba: {
    height: '100%',
    backgroundColor: palette.lotbaBlue,
  },

  stackedBarDivider: {
    width: 2,
    height: '100%',
    backgroundColor: palette.white,
  },

  stackedBarCustom: {
    height: '100%',
    backgroundColor: palette.customAmber,
  },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceBg,
    marginBottom: 4,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },

  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.textSubtle,
  },

  legendStrong: {
    fontWeight: '900',
    color: palette.textMain,
  },

  legendPct: {
    fontSize: 10.5,
    fontWeight: '700',
    color: palette.textMuted,
  },

  attemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceBg,
    gap: 10,
  },

  attemptRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },

  attemptInfo: {
    flex: 1,
  },

  attemptTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: palette.textMain,
  },

  attemptDate: {
    fontSize: 10.5,
    fontWeight: '600',
    color: palette.textMuted,
    marginTop: 2,
  },

  emptyBox: {
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 6,
  },

  emptyText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: palette.textMuted,
    textAlign: 'center',
  },
});
