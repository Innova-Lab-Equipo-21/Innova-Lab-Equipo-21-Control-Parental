// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingModal Styles
// Archivo: src/components/dashboard/dispositivos/PairingModal.styles.ts
// Descripción: Estilos para el modal de vinculación de nuevo dispositivo.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '92%',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  limitWarningCard: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  limitWarningText: {
    fontSize: 13,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmPairingBtn: {
    backgroundColor: '#28A745',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  confirmPairingBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
});
