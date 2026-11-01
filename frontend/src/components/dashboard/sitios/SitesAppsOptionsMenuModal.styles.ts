// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesAppsOptionsMenuModal Styles
// Archivo: src/components/dashboard/sitios/SitesAppsOptionsMenuModal.styles.ts
// Descripción: Estilos encapsulados para el modal de opciones de gestión de sitios y apps
//              (herramientas de visualización, filtros y criterios de ordenamiento).
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sheetCloseBtn: {
    padding: 6,
  },
  sheetCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  sheetSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sheetOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  sheetOptionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E7F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sheetOptionTextCol: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sheetOptionDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  sortOptionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: '#FFFFFF',
  },
  sortOptionCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#E7F1FF',
  },
  sortOptionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sortOptionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sortOptionCardTitleActive: {
    color: colors.primary,
  },
  sortOptionCardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sortRadioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortRadioCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  sortRadioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  sheetConfirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  sheetConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
