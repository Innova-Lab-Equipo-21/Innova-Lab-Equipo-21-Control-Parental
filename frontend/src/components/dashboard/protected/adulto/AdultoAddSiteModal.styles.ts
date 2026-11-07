// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoAddSiteModal Styles
// Archivo: src/components/dashboard/protected/adulto/AdultoAddSiteModal.styles.ts
// Descripción: Estilos del Bottom Sheet para bloquear un nuevo sitio web desde
//              el Modo Protegido Adulto, replicando el diseño del modo Responsable.
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../../theme/colors';

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
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputValid: {
    borderColor: colors.statusActive,
    borderWidth: 1.5,
  },
  inputInvalid: {
    borderColor: colors.statusDanger,
    borderWidth: 1.5,
  },
  domainFeedbackValid: {
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.statusActiveBg,
    borderRadius: 6,
  },
  domainFeedbackInvalid: {
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.statusDangerBg,
    borderRadius: 6,
  },
  domainFeedbackTextValid: {
    fontSize: 11,
    color: '#0F5132',
    fontWeight: '600',
  },
  domainFeedbackTextInvalid: {
    fontSize: 11,
    color: colors.statusDanger,
    fontWeight: '600',
  },
  warningNoticeBox: {
    marginTop: 10,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningMascot: {
    width: 48,
    height: 48,
    marginRight: 10,
  },
  warningTextCol: {
    flex: 1,
  },
  warningNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  warningNoticeText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonFlex: {
    flex: 1,
  },
});
