// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivitySection Base Styles (Pestaña Actividad — Modo Responsable)
// Archivo: src/components/dashboard/actividad/ActivitySection.styles.ts
// Descripción: Tokens y estilos base compartidos por los bloques modulares de
//              la pestaña Actividad.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const CUSTOM_SOURCE_COLOR = '#6366F1';
export const CUSTOM_SOURCE_BG = '#EEF2FF';

export const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
