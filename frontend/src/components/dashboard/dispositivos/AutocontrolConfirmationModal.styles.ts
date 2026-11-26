// ==============================================================================
// Proyecto: BA Protege+
// Componente: AutocontrolConfirmationModal Styles
// Archivo: src/components/dashboard/dispositivos/AutocontrolConfirmationModal.styles.ts
// Descripción: Estilos para los modales de confirmación y gestión de Autoprotección.
//              Garantiza altura simétrica, botones en la misma fila y estética
//              idéntica a UnbindConfirmationModal.styles.ts.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  modalEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalBody: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
    minHeight: 36,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    minHeight: 64,
    justifyContent: 'center',
  },
  warningBoxText: {
    fontSize: 11.5,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonCol: {
    flex: 1,
  },
});
