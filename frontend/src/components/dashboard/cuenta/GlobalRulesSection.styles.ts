// ==============================================================================
// Proyecto: BA Protege+
// Componente: GlobalRulesSection Styles
// Archivo: src/components/dashboard/cuenta/GlobalRulesSection.styles.ts
// Descripción: Estilos para la sección de Reglas de protección global en Cuenta
//              (mismo estilo visual que HelpSection y LegalSection).
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
  ruleItem: {
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
  ruleItemText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 12,
  },
  ruleArrow: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
});
