// ==============================================================================
// Proyecto: BA Protege+
// Componente: AnalyticsPanel Styles
// Archivo: src/components/dashboard/actividad/AnalyticsPanel.styles.ts
// Descripción: Estilos estructurales del contenedor principal y cuerpo del panel
//              de Actividad y métricas.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from './palette';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },

  content: {
    paddingBottom: 20,
  },

  body: {
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
});
