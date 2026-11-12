// ==============================================================================
// Proyecto: BA Protege+
// Componente: PillChip Styles
// Archivo: components/analytics/PillChip.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: palette.cardBorder,
    backgroundColor: palette.offWhite,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  chipActive: {
    backgroundColor: palette.textMain,
    borderColor: palette.textMain,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textSubtle,
  },

  labelActive: {
    color: palette.white,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
