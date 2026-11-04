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
});
