// ==============================================================================
// Proyecto: BA Protege+
// Componente: FeedbackModal Styles
// Archivo: src/components/FeedbackModal.styles.ts
// Descripción: Estilos para el modal estándar de confirmación y retroalimentación
//              positiva / informativa (diseño unificado del app con soporte para
//              ilustración de mascota Boti / Botito).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

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
  modalEmoji: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    width: '100%',
  },
  dualButtonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  dualButtonItem: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
  },
});
