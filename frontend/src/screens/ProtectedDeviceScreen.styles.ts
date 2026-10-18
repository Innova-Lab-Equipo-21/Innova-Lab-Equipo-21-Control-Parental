// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedDeviceScreen Styles
// Archivo: src/screens/ProtectedDeviceScreen.styles.ts
// Descripción: Estilos visuales para el panel del dispositivo protegido.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
  },
  warningBannerCard: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '800',
    color: '#856404',
  },
  warningDesc: {
    ...typography.body,
    fontSize: 13,
    color: '#856404',
    marginBottom: 8,
    lineHeight: 18,
  },
  missingItemText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#856404',
    marginLeft: 4,
    marginVertical: 2,
  },
  warningActionBox: {
    marginTop: 10,
  },
  rulesContainer: {
    marginVertical: 8,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  educationalSection: {
    marginVertical: 10,
  },
  eduCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  adultSpecialCard: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    borderWidth: 1.5,
  },
  eduCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eduCardEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  eduCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  adultTitleText: {
    color: '#7E22CE',
  },
  eduCardBody: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 12,
  },
  footer: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    ...typography.header,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 8,
  },
  pinDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
