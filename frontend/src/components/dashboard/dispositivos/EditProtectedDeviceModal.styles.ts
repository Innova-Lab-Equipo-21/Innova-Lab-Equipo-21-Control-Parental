// ==============================================================================
// Proyecto: BA Protege+
// Componente: EditProtectedDeviceModal Styles
// Archivo: src/components/dashboard/dispositivos/EditProtectedDeviceModal.styles.ts
// Descripción: Estilos para el modal de edición de datos del protegido,
//              idénticos al diseño y estándar visual de EditResponsibleModal.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  closeBtnText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#DC3545',
    fontWeight: '700',
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
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
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeChip: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  typeHelperText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    marginLeft: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
