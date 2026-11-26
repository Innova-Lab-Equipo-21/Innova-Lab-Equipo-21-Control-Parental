// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoSitiosOptionsModal Styles
// Archivo: src/components/dashboard/protected/adulto/AdultoSitiosOptionsModal.styles.ts
// Descripción: Estilos del Bottom Sheet "Opciones de gestión" exclusivo del
//              Modo Protegido Adulto (únicamente Búsqueda y Ordenar lista).
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../../theme/colors';

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
    maxHeight: '88%',
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
    marginBottom: 14,
  },
  sheetSectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 14,
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  searchClearBtn: {
    padding: 6,
  },
  searchClearText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterBadgeTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  sheetConfirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  sheetConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
