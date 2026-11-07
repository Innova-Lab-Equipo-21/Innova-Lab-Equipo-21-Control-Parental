// ==============================================================================
// Proyecto: BA Protege+
// Componente: RecentAttemptsCard & BlockedAttemptRow Styles
// Archivo: src/components/dashboard/actividad/RecentAttemptsCard.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import {
  CUSTOM_SOURCE_BG,
  CUSTOM_SOURCE_COLOR,
} from './ActivitySection.styles';

export const styles = StyleSheet.create({
  seeAllLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },

  attemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  attemptRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },

  attemptLeftCol: {
    flex: 1,
    marginRight: 10,
  },

  attemptDomain: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  attemptMeta: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
  },

  sourcePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },

  sourcePillLotba: {
    backgroundColor: colors.primaryLight,
  },

  sourcePillCustom: {
    backgroundColor: CUSTOM_SOURCE_BG,
  },

  sourcePillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  sourcePillTextLotba: {
    color: colors.primary,
  },

  sourcePillTextCustom: {
    color: CUSTOM_SOURCE_COLOR,
  },

  emptyText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
