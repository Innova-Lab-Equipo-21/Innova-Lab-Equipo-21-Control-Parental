// ==============================================================================
// Proyecto: BA Protege+
// Componente: RegisterForm Styles
// Archivo: src/components/auth/RegisterForm.styles.ts
// Descripción: Estilos modulares desacoplados para la pantalla de registro
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  backBtn: {
    marginRight: 10,
    paddingVertical: 4,
    paddingRight: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 28,
    flex: 1,
    letterSpacing: -0.3,
  },
  requiredAsterisk: {
    color: '#DC3545',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 20,
    textAlign: 'left',
  },
  alertError: {
    backgroundColor: colors.statusDangerBg,
    borderColor: '#F5C2C7',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  alertErrorText: {
    color: colors.statusDanger,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  inputFocusedBorder: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  inputErrorBorder: {
    borderColor: colors.statusDanger,
    backgroundColor: '#FFF8F8',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  iconActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputIconAction: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  fieldErrorText: {
    fontSize: 11,
    color: colors.statusDanger,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 2,
  },
  dropdownContainer: {
    justifyContent: 'space-between',
  },
  dropdownSelectedText: {
    fontSize: 14,
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
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownMenuItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownMenuItemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dropdownMenuItemTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  dropdownCheckmark: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  actionsSection: {
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  googleButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  googleButtonImage: {
    width: 200,
    height: 44,
  },
  secondaryCardButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  secondaryCardButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  highlightText: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Estilos de Modal de Calendario
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  pickerScrollView: {
    height: 140,
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerItem: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  pickerItemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Estilos del Checkbox de Términos y Condiciones y Políticas de Privacidad
  termsGroupContainer: {
    marginVertical: 12,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  checkboxTouch: {
    paddingRight: 10,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 15,
  },
  termsText: {
    flex: 1,
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 19,
    fontWeight: '400',
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
  },

});
