// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoActividadSection Styles
// Archivo: src/components/dashboard/protected/adulto/AdultoActividadSection.styles.ts
// Descripción: Estilos oficiales de la pestaña Actividad del Protegido Adulto
//              siguiendo el estilo de Modo Responsable con 3 bloques personales:
//              1. Tiempo de uso de las aplicaciones
//              2. Historial de intentos de acceso a sitios y apps bloqueados
//                 (solo subbloque Historial de toda la actividad)
//              3. Pasatiempos
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../../actividad/palette';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: palette.surfaceBg,
  },

  accordionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },

  accordionHeaderRowCollapsed: {
    marginBottom: 0,
  },

  accordionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: palette.textMain,
    lineHeight: 19,
    flex: 1,
  },

  accordionChevron: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.lotbaBlue,
    paddingLeft: 4,
  },

  subblocksStack: {
    flexDirection: 'column',
    gap: 10,
  },
});
