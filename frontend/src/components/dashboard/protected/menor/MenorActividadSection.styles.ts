// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorActividadSection Styles
// Archivo: src/components/dashboard/protected/menor/MenorActividadSection.styles.ts
// Descripción: Estilos oficiales de la pestaña Actividad del Protegido Menor
//              con 2 bloques: Mis apps hoy y Mis pasatiempos.
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

  // --- Bloque 2: Mis pasatiempos ---
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.textMain,
  },

  headerPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  progressPill: {
    backgroundColor: palette.lotbaBlueBg,
    borderWidth: 1,
    borderColor: palette.lotbaBlueBorder,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 99,
  },

  progressPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: palette.lotbaBlueDark,
  },

  streakPill: {
    backgroundColor: palette.customAmberBg,
    borderWidth: 1,
    borderColor: palette.customAmberBorder,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 99,
  },

  streakPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: palette.customAmberDark,
  },

  gameSection: {
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: palette.surfaceBg,
  },

  gameSectionFirst: {
    paddingTop: 2,
    borderTopWidth: 0,
  },

  gameTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },

  gameIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  gameIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gameIconText: {
    fontSize: 16,
    fontWeight: '900',
    color: palette.white,
  },

  gameTextCol: {
    flex: 1,
  },

  gameTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: palette.textMain,
  },

  gameSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.textSubtle,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 99,
    borderWidth: 1,
  },

  statusBadgeCompleted: {
    backgroundColor: palette.successBg,
    borderColor: palette.successBorder,
  },

  statusBadgeInProgress: {
    backgroundColor: palette.lotbaBlueBg,
    borderColor: palette.lotbaBlueBorder,
  },

  statusBadgePending: {
    backgroundColor: palette.offWhite,
    borderColor: palette.cardBorder,
  },

  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },

  statusBadgeTextCompleted: {
    color: palette.successDark,
  },

  statusBadgeTextInProgress: {
    color: palette.lotbaBlueDark,
  },

  statusBadgeTextPending: {
    color: palette.textMuted,
  },

  // Barras segmentadas
  segmentsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },

  segmentPill: {
    flex: 1,
    height: 7,
    borderRadius: 99,
    backgroundColor: palette.cardBorder,
  },

  // Desglose de las 3 sopas de letras
  boardsBreakdownContainer: {
    marginTop: 8,
    gap: 5,
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },

  boardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  boardName: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textMain,
    flex: 1,
  },

  boardStats: {
    fontSize: 10.5,
    fontWeight: '700',
    color: palette.textSubtle,
  },

  boardStatsDone: {
    color: palette.successDark,
  },
});
