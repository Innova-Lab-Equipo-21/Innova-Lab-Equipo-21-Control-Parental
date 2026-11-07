// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivitySheetModal Styles (Bottom Sheets de Actividad)
// Archivo: src/components/dashboard/actividad/ActivitySheetModal.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },

  sheetCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '78%',
  },

  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },

  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetCloseText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
  },

  sheetSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginBottom: 14,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },

  optionRowActive: {
    backgroundColor: '#E5F1FF',
    borderColor: colors.primary,
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },

  optionAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  optionAvatarText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  optionTitleActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },

  optionSubtitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },

  optionCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionCheckText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  sheetDoneBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  sheetDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
