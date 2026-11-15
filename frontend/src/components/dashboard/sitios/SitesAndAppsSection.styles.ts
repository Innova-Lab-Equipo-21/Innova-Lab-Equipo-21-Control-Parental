// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesAndAppsSection Styles
// Archivo: src/components/dashboard/sitios/SitesAndAppsSection.styles.ts
// Descripción: Estilos visuales para el orquestador principal de sitios web y
//              aplicaciones móviles restringidas (selector de pestañas y filtros).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  autoprotectionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  autoprotectionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  autoprotectionEmptyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  autoprotectionEmptyIcon: {
    marginRight: 8,
  },
  autoprotectionEmptyText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 17,
  },
  a11yNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  a11yNoticeIcon: {
    marginRight: 8,
  },
  a11yNoticeText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 17,
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
  filterContainer: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#EBF5FF',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  activeOriginFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  activeOriginFilterText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  clearOriginFilterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  clearOriginFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
