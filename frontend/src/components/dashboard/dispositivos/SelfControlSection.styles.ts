// ==============================================================================
// Proyecto: BA Protege+
// Componente: SelfControlSection Styles
// Archivo: src/components/dashboard/dispositivos/SelfControlSection.styles.ts
// Descripción: Estilos visuales para la sección de Autocontrol del Responsable.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  descText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
});
