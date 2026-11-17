// ==============================================================================
// Proyecto: BA Protege+
// Componente: AnalyticsPanel Styles
// Archivo: components/analytics/AnalyticsPanel.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from './palette';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },

  content: {
    paddingBottom: 20,
  },

  body: {
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
});
