// ==============================================================================
// Proyecto: BA Protege+
// Componente: RecoveryForm Styles
// Archivo: src/components/auth/RecoveryForm.styles.ts
// Descripción: Estilos modulares desacoplados para la recuperación de contraseña
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 18,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  alertError: {
    backgroundColor: colors.statusDangerBg,
    borderColor: '#F5C2C7',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  alertErrorText: {
    color: colors.statusDanger,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  alertSuccess: {
    backgroundColor: colors.statusActiveBg,
    borderColor: '#BADBCC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  alertSuccessTitle: {
    color: colors.statusActive,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertSuccessText: {
    color: '#0F5132',
    fontSize: 13,
    lineHeight: 18,
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
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  inputIconAction: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  actionsSection: {
    marginTop: 10,
  },
  dualButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonFull: {
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButtonHalf: {
    flex: 1,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
