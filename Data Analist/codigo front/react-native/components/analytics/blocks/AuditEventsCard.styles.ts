// ==============================================================================
// Proyecto: BA Protege+
// Componente: AuditEventsCard Styles
// Archivo: components/analytics/AuditEventsCard.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  tabsWrap: {
    marginBottom: 8,
  },

  list: {
    flexDirection: 'column',
  },

  attemptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6.5,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceBg,
  },

  attemptInfo: {
    flex: 1,
    flexShrink: 1,
  },

  attemptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textMain,
  },

  attemptMeta: {
    fontSize: 10.5,
    color: palette.textMuted,
    marginTop: 1,
  },
});
