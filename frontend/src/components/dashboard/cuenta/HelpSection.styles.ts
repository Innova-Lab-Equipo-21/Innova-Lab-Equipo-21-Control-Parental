// ==============================================================================
// Proyecto: BA Protege+
// Componente: HelpSection Styles
// Archivo: src/components/dashboard/cuenta/HelpSection.styles.ts
// Descripción: Estilos para el bloque de Ayuda y soporte (mismo diseño que LegalSection)
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  helpItem: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  helpItemText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  helpArrow: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  infoModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  infoModalCloseBtn: {
    padding: 4,
  },
  infoModalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  infoModalBody: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 21,
    marginBottom: 18,
  },
  infoModalLink: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
