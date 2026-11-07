// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivityFiltersBar Styles
// Archivo: src/components/dashboard/actividad/ActivityFiltersBar.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  deviceSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },

  deviceIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  deviceIconImg: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },

  deviceTextCol: {
    flex: 1,
  },

  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deviceSelectorLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  selectorChevron: {
    fontSize: 12,
    color: colors.textPrimary,
    marginLeft: 5,
    fontWeight: '800',
  },

  deviceSelectorSubtitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },

  periodSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  periodSelectorText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  periodChevron: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 5,
    fontWeight: '800',
  },
});
