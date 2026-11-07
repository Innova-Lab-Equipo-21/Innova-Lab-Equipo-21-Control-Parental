// ==============================================================================
// Proyecto: BA Protege+
// Componente: HourlyAttemptsCard Styles
// Archivo: src/components/dashboard/actividad/HourlyAttemptsCard.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { CUSTOM_SOURCE_COLOR } from './ActivitySection.styles';

export const styles = StyleSheet.create({
  peakLabel: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },

  peakPrefix: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  peakStrong: {
    fontSize: 11.5,
    color: colors.textPrimary,
    fontWeight: '800',
  },

  hourlyChartContainer: {
    height: 102,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  hourlyBarTouch: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 1,
  },

  hourlyBarColumn: {
    width: '100%',
    maxWidth: 11,
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },

  hourlyBarColumnHighlighted: {
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderRadius: 4,
    padding: 0.5,
    backgroundColor: 'rgba(30, 41, 59, 0.06)',
  },

  hourlySegmentCustom: {
    width: '100%',
    backgroundColor: CUSTOM_SOURCE_COLOR,
  },

  hourlySegmentLotba: {
    width: '100%',
    backgroundColor: colors.primary,
  },

  hourlySegmentEmpty: {
    width: '100%',
    height: 2,
    backgroundColor: colors.borderLight,
    borderRadius: 1,
  },

  hourlyAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },

  hourlyAxisText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
