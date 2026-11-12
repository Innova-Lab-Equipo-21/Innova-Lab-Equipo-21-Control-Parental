// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tarjeta base compartida
// Archivo: components/analytics/card.styles.ts
// Descripción: Estilos de tarjeta reutilizados por los bloques del panel.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from './palette';

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.cardBorder,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginBottom: 10,
  },

  cardHeaderTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: palette.textMain,
    marginBottom: 8,
  },
});
