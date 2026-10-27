// ==============================================================================
// Proyecto: BA Protege+
// Componente: HelpSection Styles
// Archivo: src/components/dashboard/cuenta/HelpSection.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  onboardingBanner: {
    backgroundColor: '#E7F1FF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B6D4FE',
  },
  onboardingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0056B3',
    marginBottom: 2,
  },
  onboardingText: {
    fontSize: 11.5,
    color: '#0A58CA',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  formSubText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  faqArrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  faqAnswerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  attachmentSection: {
    marginVertical: 12,
  },
  addAttachmentBtn: {
    backgroundColor: '#E9ECEF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  addAttachmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  attachmentName: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  removeAttachmentText: {
    fontSize: 11,
    color: colors.feedbackError,
    fontWeight: '700',
  },
});
