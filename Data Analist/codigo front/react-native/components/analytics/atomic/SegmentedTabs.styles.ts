// ==============================================================================
// Proyecto: BA Protege+
// Componente: SegmentedTabs Styles
// Archivo: components/analytics/SegmentedTabs.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceBg,
    borderRadius: 9,
    padding: 3,
    borderWidth: 1,
    borderColor: palette.cardBorder,
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    borderRadius: 7,
  },

  tabActive: {
    backgroundColor: palette.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textMuted,
  },

  labelActive: {
    color: palette.textMain,
  },

  badge: {
    backgroundColor: palette.dangerRed,
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },

  badgeText: {
    color: palette.white,
    fontSize: 9.5,
    fontWeight: '800',
  },
});
