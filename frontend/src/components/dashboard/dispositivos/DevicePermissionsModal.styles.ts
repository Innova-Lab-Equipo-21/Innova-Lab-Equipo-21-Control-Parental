// ==============================================================================
// Proyecto: BA Protege+
// Componente: DevicePermissionsModal Styles
// Archivo: src/components/dashboard/dispositivos/DevicePermissionsModal.styles.ts
// Descripción: Estilos visuales optimizados y compactos para el modal bottom sheet
//              de permisos de dispositivo (sin necesidad de scroll vertical).
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    maxHeight: '94%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  summaryBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  summaryDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
    marginTop: 2,
  },
  scrollBody: {
    marginVertical: 2,
  },
  permCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  permCardPending: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E5E7EB',
  },
  permIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  permIcon: {
    fontSize: 14,
  },
  permInfoCol: {
    flex: 1,
  },
  permTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 6,
  },
  badgeItem: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  permDesc: {
    fontSize: 10.5,
    color: colors.textSecondary,
    lineHeight: 13,
    marginTop: 1,
  },
  protectedNoticeBox: {
    backgroundColor: '#E7F1FF',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#B6D4FE',
  },
  protectedNoticeText: {
    fontSize: 11,
    color: '#0A58CA',
    lineHeight: 15,
  },
  footerActions: {
    marginTop: 8,
  },
  footerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footerBtnCol: {
    flex: 1,
  },
});
