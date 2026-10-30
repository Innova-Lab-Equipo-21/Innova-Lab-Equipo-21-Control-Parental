// ==============================================================================
// Proyecto: BA Protege+
// Componente: LegalModal Styles
// Archivo: src/components/auth/LegalModal.styles.ts
// Descripción: Estilos modulares desacoplados para modales legales en formato Bottom Sheet
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

export const legalStyles = StyleSheet.create({
  legalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  legalModalCard: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
  legalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legalModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  legalModalCloseBtn: {
    padding: 6,
  },
  legalModalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  legalModalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
    marginBottom: 10,
  },
  legalModalBody: {
    marginVertical: 8,
    paddingRight: 4,
  },
  legalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  legalParagraph: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  legalModalConfirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  legalModalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
