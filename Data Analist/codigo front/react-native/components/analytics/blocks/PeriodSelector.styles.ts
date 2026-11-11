// ==============================================================================
// Proyecto: BA Protege+
// Componente: PeriodSelector Styles
// Archivo: components/analytics/PeriodSelector.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  wrapper: {
    flexShrink: 0,
    position: 'relative',
  },

  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.offWhite,
    borderWidth: 1.5,
    borderColor: palette.cardBorder,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },

  triggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textMain,
  },

  chevron: {
    fontSize: 9,
    color: palette.textSubtle,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 0,
  },

  menu: {
    marginTop: 8,
    marginRight: 12,
    minWidth: 150,
    backgroundColor: palette.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  menuItem: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 7,
  },

  menuItemActive: {
    backgroundColor: palette.surfaceBg,
  },

  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textSubtle,
  },

  menuItemTextActive: {
    color: palette.textMain,
    fontWeight: '800',
  },
});
