// ==============================================================================
// Proyecto: BA Protege+
// Componente: RatingSection Styles
// Archivo: src/components/dashboard/cuenta/RatingSection.styles.ts
// Descripción: Estilos modulares para la sección de calificación de la app (5 estrellas,
//              campo de comentarios y botones de envío e integración con Google Play).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

/**
 * Reglas de estilo para el bloque de evaluación de la app dentro del panel de Cuenta.
 * Incluye componentes para la tarjeta principal, sistema de estrellas, campos de entrada y botones.
 */
export const styles = StyleSheet.create({
  /** Contenedor exterior de la sección de evaluación */
  container: {
    marginVertical: 8,
  },
  /** Título de la sección con ícono de estrella */
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  /** Tarjeta interior que aloja el formulario de puntuación */
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  /** Título dentro de la tarjeta de calificación */
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  /** Subtítulo con invitación a dejar feedback */
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  /** Fila horizontal que contiene las 5 estrellas interactivas */
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  /** Tamaño base del ícono de estrella */
  starIcon: {
    fontSize: 32,
  },
  /** Color amarillo brillante para estrellas seleccionadas / activas */
  starActive: {
    color: '#FFC107',
  },
  /** Color gris atenuado para estrellas inactivas */
  starInactive: {
    color: '#E4E5E7',
  },
  /** Texto indicador del número de estrellas seleccionadas (e.g. "5 de 5 estrellas") */
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  /** Etiqueta sobre el cuadro de entrada de comentarios */
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  /** Caja TextInput multiladínea para comentarios y sugerencias del usuario */
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: '#FAFAFA',
    height: 70,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
});
