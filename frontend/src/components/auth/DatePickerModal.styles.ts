// ==============================================================================
// Proyecto: BA Protege+
// Componente: DatePickerModal Styles
// Archivo: src/components/auth/DatePickerModal.styles.ts
// Descripción: Estilos modulares desacoplados para el modal de selección de fecha
//              de nacimiento (calendario interactivo para verificación de edad).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
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
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    color: colors.primary,
    fontSize: 14.5,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
