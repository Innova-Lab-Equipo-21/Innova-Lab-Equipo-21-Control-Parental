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

  scroll: {
    flex: 1,
  },

  content: {
    paddingBottom: 20,
  },

  body: {
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
  },

  dropdownsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 2,
    zIndex: 20,
  },

  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textSubtle,
    marginBottom: 4,
    paddingLeft: 2,
  },

  dropdownColDevice: {
    flex: 1,
  },

  dropdownColPeriod: {
    flex: 1,
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
