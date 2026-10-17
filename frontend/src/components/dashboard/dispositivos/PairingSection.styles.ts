// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingSection Styles
// Archivo: src/components/dashboard/dispositivos/PairingSection.styles.ts
// Descripción: Estilos visuales para la sección de vinculación de dispositivos y código QR.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  descText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  formCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  requiredAsterisk: {
    color: colors.statusDanger,
    fontWeight: '800',
  },
  optionalText: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
  },
  inputContainerError: {
    borderColor: colors.statusDanger,
    borderWidth: 1.5,
  },
  inputNoBorder: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: '100%',
    fontSize: 13,
    color: colors.textPrimary,
  },
  inputIconAction: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  inputErrorBorder: {
    borderColor: colors.statusDanger,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 11,
    color: colors.statusDanger,
    marginTop: 3,
    fontWeight: '600',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  typeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Estilos de Dropdown de Género (igual que RegisterForm)
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dropdownSelectedText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dropdownPlaceholderText: {
    color: colors.textMuted,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  dropdownMenu: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownMenuItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownMenuItemText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dropdownMenuItemTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  dropdownCheckmark: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  codeDisplayCard: {
    marginVertical: 8,
  },
  codeDisplay: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  protectedSummaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  codeNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 6,
    color: colors.primaryDark,
  },
  codeExpiry: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: 2,
  },
  qrCodeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    padding: 12,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  qrSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  qrImageContainer: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrImage: {
    width: 130,
    height: 130,
  },
  shareContainer: {
    width: '100%',
    marginTop: 10,
  },
});
