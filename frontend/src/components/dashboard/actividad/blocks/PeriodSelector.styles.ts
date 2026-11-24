// ==============================================================================
// Proyecto: BA Protege+
// Componente: PeriodSelector Styles
// Archivo: src/components/dashboard/actividad/blocks/PeriodSelector.styles.ts
// Descripción: Estilos para el dropdown inline de período / fecha, siguiendo el
//              patrón oficial de dropdowns del app (sin modal).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';

export const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
  },

  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    minHeight: 42,
  },

  triggerOpen: {
    borderColor: colors.primary,
  },

  triggerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  chevron: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    paddingLeft: 4,
  },

  dropdownMenu: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  menuItemLast: {
    borderBottomWidth: 0,
  },

  menuItemActive: {
    backgroundColor: colors.primaryLight,
  },

  menuItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  menuItemTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },

  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
});
