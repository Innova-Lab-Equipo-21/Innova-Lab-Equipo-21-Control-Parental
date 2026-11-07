// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesTab Styles
// Archivo: src/components/dashboard/sitios/SitesTab.styles.ts
// Descripción: Estilos encapsulados para la sub-pestaña de sitios web bloqueados
//              (búsqueda, acciones masivas, tarjetas interactivas de dominios y controles).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  searchSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchInputFlex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  bulkHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  selectAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#EAEAEA',
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  selectedCountText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  bulkActionsBar: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#007AFF15',
    borderColor: '#007AFF30',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bulkActionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bulkActionButtonDelete: {
    backgroundColor: '#FFF5F5',
    borderColor: '#F8D7DA',
  },
  bulkActionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  bulkActionDeleteText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.statusDanger,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  siteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  siteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxSquareChecked: {
    backgroundColor: colors.primary,
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -2,
  },
  cardTitleCol: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  siteDomainText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  originBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  deviceIndicatorText: {
    flex: 1,
    marginRight: 10,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  compactActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.3,
  },
});
