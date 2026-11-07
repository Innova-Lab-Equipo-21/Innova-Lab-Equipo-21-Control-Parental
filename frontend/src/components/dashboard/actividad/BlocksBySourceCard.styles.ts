// ==============================================================================
// Proyecto: BA Protege+
// Componente: BlocksBySourceCard Styles
// Archivo: src/components/dashboard/actividad/BlocksBySourceCard.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { CUSTOM_SOURCE_COLOR } from './ActivitySection.styles';

export const styles = StyleSheet.create({
  sourceBarTrack: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 3,
    marginTop: 10,
    marginBottom: 10,
  },

  sourceBarSegmentLotba: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  sourceBarSegmentCustom: {
    height: '100%',
    backgroundColor: CUSTOM_SOURCE_COLOR,
    borderRadius: 4,
  },

  sourceBarEmpty: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.borderLight,
    borderRadius: 6,
  },

  sourceLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  sourceLegendItem: {
    fontSize: 12,
  },

  sourceLegendNameLotba: {
    color: colors.primary,
    fontWeight: '700',
  },

  sourceLegendNameCustom: {
    color: CUSTOM_SOURCE_COLOR,
    fontWeight: '700',
  },

  sourceLegendCount: {
    color: colors.textPrimary,
    fontWeight: '800',
  },

  sourceLegendPct: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
