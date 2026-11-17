// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoSitiosSection Styles
// Archivo: src/components/dashboard/protected/adulto/AdultoSitiosSection.styles.ts
// Descripción: Estilos para la sección "Sitios y apps" del Modo Protegido Adulto,
//              replicando la interfaz del Modo Responsable sin Autoprotección
//              ni controles de edición o eliminación.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 88,
  },
  infoBanner: {
    backgroundColor: '#E7F1FF',
    borderColor: '#B6D4FE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0056B3',
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#0A58CA',
    lineHeight: 16,
  },
  sectionTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  subTabContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    padding: 3,
  },
  sectionTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  sectionTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  optionsMenuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  optionsMenuIcon: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  searchSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInputFlex: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
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
  itemCard: {
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
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleCol: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  itemTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
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
  lockNoticeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
  },
});
