// ==============================================================================
// Proyecto: BA Protege+
// Componente: LegalSection Styles
// Archivo: src/components/dashboard/cuenta/LegalSection.styles.ts
// Descripción: Estilos modulares para la sección de accesos a términos legales,
//              políticas de privacidad y licencias institucionales.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

/**
 * Conjunto de reglas de estilo para renderizar la lista de elementos legales.
 * Define la estructura del contenedor, encabezados de sección, ítems navegables e íconos.
 */
export const styles = StyleSheet.create({
  /** Contenedor principal de la sección legal */
  container: {
    marginVertical: 8,
  },
  /** Título del encabezado de la sección legal */
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  /** Tarjeta rectangular táctil para cada elemento legal de la lista */
  legalItem: {
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
  /** Texto con la denominación del documento legal */
  legalItemText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  /** Indicador visual flecha para señalar que el ítem es interactivo y abre un modal */
  legalArrow: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
});
