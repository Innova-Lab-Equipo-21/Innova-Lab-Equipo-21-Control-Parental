// ==============================================================================
// Proyecto: BA Protege+
// Componente: TotalBlocksCard Styles
// Archivo: src/components/dashboard/actividad/TotalBlocksCard.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  kpiOverline: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },

  kpiMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },

  kpiValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },

  kpiDeltaBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },

  kpiDeltaBadgeUp: {
    backgroundColor: '#FEE2E2',
  },

  kpiDeltaBadgeDown: {
    backgroundColor: colors.statusActiveBg,
  },

  kpiDeltaBadgeNeutral: {
    backgroundColor: colors.primaryLight,
  },

  kpiDeltaText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  kpiDeltaTextUp: {
    color: '#DC2626',
  },

  kpiDeltaTextDown: {
    color: colors.statusActive,
  },

  kpiDeltaTextNeutral: {
    color: colors.primaryDark,
  },

  kpiSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
