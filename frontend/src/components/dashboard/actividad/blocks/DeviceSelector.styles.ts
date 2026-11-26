// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeviceSelector Styles
// Archivo: src/components/dashboard/actividad/blocks/DeviceSelector.styles.ts
// Descripción: Estilos del dropdown inline de selección de dispositivo en
//              Actividad, siguiendo el patrón oficial de dropdowns del app.
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 10,
    minHeight: 35,
  },

  triggerOpen: {
    borderColor: colors.primary,
  },

  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 4,
  },

  triggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  chevron: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '700',
    paddingLeft: 4,
  },

  deviceAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  allAvatar: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },

  deviceAvatarIcon: {
    fontSize: 10,
    lineHeight: 13,
  },

  dropdownMenu: {
    backgroundColor: colors.surface,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },

  dropdownScroll: {
    maxHeight: 240,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
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

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  menuItemTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },

  checkmark: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
});
