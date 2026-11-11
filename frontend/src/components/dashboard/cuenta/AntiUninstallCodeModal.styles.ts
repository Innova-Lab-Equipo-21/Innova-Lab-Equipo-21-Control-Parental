// ==============================================================================
// Proyecto: BA Protege+
// Componente: AntiUninstallCodeModal Styles
// Archivo: src/components/dashboard/cuenta/AntiUninstallCodeModal.styles.ts
// Descripción: Estilos para el modal institucional de desactivación de antidesinstalación
//              que solicita el código OTP de 6 dígitos enviado al correo del responsable.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 22,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    zIndex: 10,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  modalMascotImage: {
    width: 78,
    height: 78,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: '700',
    color: colors.primary,
  },
  warningNoticeBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  warningNoticeText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 17,
  },
  codeInputContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  codeInput: {
    width: '100%',
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 10,
    color: colors.textPrimary,
    paddingHorizontal: 16,
  },
  codeInputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  codeInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: colors.textSecondary,
  },
  dualButtonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  dualButtonItem: {
    flex: 1,
  },
});
