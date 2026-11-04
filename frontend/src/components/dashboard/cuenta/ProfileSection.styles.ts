// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProfileSection Styles
// Archivo: src/components/dashboard/cuenta/ProfileSection.styles.ts
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  profilePhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    backgroundColor: '#D1E7DD',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F5132',
  },
  photoNotice: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    alignItems: 'center',
  },
  googleLinkButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginVertical: 8,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DADCE0',
    gap: 8,
  },
  googleLinkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C4043',
  },
  googleLinkedButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 8,
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#A5D6A7',
  },
  googleLinkedButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  googleIconSmall: {
    width: 18,
    height: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  modalCloseBtn: {
    padding: 4,
    marginLeft: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#DC3545',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  inputFocusedBorder: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  inputErrorBorder: {
    borderColor: colors.statusDanger,
    backgroundColor: '#FFF8F8',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  fieldErrorText: {
    fontSize: 11,
    color: colors.statusDanger,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 2,
  },
  dropdownContainer: {
    justifyContent: 'space-between',
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dropdownPlaceholderText: {
    color: colors.textMuted,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  dropdownMenu: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownMenuItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownMenuItemText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dropdownMenuItemTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  dropdownCheckmark: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  dangerZoneContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C53030',
    marginBottom: 4,
  },
  dangerZoneSubtitle: {
    fontSize: 12,
    color: '#9B2C2C',
    marginBottom: 12,
    lineHeight: 16,
  },
});
