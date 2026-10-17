// ==============================================================================
// Proyecto: BA Protege+
// Componente: PairingScreen Styles
// Archivo: src/screens/PairingScreen.styles.ts
// Descripción: Estilos visuales para la pantalla de pareamiento / vinculación de dispositivo.
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  instructionCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: 'contain',
    tintColor: '#007AFF',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  instructionStep: {
    fontSize: 13.5,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  labelCenter: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  digitRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
  },
  digitBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  digitBoxActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
  },
  digitText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: 52,
    opacity: 0.01,
  },
  qrSectionContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  qrViewport: {
    width: '100%',
    height: 130,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 10,
  },
  qrTargetBox: {
    alignItems: 'center',
  },
  qrIconLarge: {
    fontSize: 30,
    marginBottom: 4,
  },
  qrStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  scanQrBtn: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanQrBtnText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  verifiedCard: {
    backgroundColor: '#D1E7DD',
    borderColor: '#BADBCC',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  verifiedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F5132',
  },
  verifiedSubtitle: {
    fontSize: 12,
    color: '#0F5132',
    marginTop: 2,
  },
  buttonGroup: {
    marginTop: 12,
  },
});
