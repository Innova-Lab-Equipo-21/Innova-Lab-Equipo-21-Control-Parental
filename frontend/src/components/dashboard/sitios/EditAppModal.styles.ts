// ==============================================================================
// Proyecto: BA Protege+
// Componente: EditAppModal Styles
// Archivo: src/components/dashboard/sitios/EditAppModal.styles.ts
// Descripción: Estilos encapsulados para el modal de editar aplicación bloqueada
//              (campo de app no editable, selección de dispositivos y límites por dispositivo).
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheetModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sheetCloseBtn: {
    padding: 6,
  },
  sheetCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  deviceSelectionContainer: {
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applyToAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceListContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  deviceListTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  deviceCardContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  deviceRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceLeftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 10,
  },
  deviceIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceIconText: {
    fontSize: 16,
  },
  deviceTextCol: {
    flex: 1,
  },
  deviceName: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  deviceTimeLimitContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  deviceTimeLimitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deviceTimeLimitLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  deviceTimeLimitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  quickAppChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  quickAppChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAppChipText: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  customMinutesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    color: colors.textPrimary,
    width: 90,
    textAlign: 'center',
  },
});
