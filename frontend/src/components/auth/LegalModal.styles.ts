// ==============================================================================
// Proyecto: BA Protege+
// Componente: LegalModal Styles
// Archivo: src/components/auth/LegalModal.styles.ts
// Descripción: Estilos modulares desacoplados para modales legales en formato Bottom Sheet
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

export const LEGAL_SHEET_HEIGHT_RATIO = 0.76;
export const LEGAL_SHEET_PADDING_TOP = 12;
export const LEGAL_SHEET_PADDING_BOTTOM = Platform.OS === 'ios' ? 34 : 20;

export const legalStyles = StyleSheet.create({
  legalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  legalModalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: LEGAL_SHEET_PADDING_TOP,
    paddingHorizontal: 20,
    paddingBottom: LEGAL_SHEET_PADDING_BOTTOM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  legalModalSheet: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: LEGAL_SHEET_PADDING_TOP,
    paddingHorizontal: 20,
    paddingBottom: LEGAL_SHEET_PADDING_BOTTOM,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  legalModalHeaderSection: {
    flexGrow: 0,
    flexShrink: 0,
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
    marginBottom: 8,
  },
  legalModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    flex: 1,
    paddingRight: 8,
  },
  legalModalCloseBtn: {
    padding: 6,
  },
  legalModalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  legalModalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
    marginBottom: 10,
  },
  legalModalBody: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 1,
    marginVertical: 8,
  },
  legalModalScroll: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
  },
  legalModalBodyContent: {
    paddingTop: 4,
    paddingBottom: 12,
    paddingRight: 10,
  },
  legalIntroText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '400',
    lineHeight: 21,
    marginBottom: 12,
  },
  legalLeadTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  legalItemCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D6E8FF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  legalItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  legalItemText: {
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  legalSectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  legalParagraph: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  legalModalFooter: {
    flexShrink: 0,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  legalModalConfirmBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  legalModalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
