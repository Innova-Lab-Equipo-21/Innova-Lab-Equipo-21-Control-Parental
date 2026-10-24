// ==============================================================================
// Proyecto: BA Protege+
// Componente: RatingSection Styles
// Archivo: src/components/dashboard/cuenta/RatingSection.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  starIcon: {
    fontSize: 32,
  },
  starActive: {
    color: '#FFC107',
  },
  starInactive: {
    color: '#E4E5E7',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: '#FAFAFA',
    height: 70,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
});
