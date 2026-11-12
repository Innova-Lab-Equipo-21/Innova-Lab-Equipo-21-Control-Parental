// ==============================================================================
// Proyecto: BA Protege+
// Componente: PanelHeader Styles
// Archivo: src/components/dashboard/actividad/blocks/PanelHeader.styles.ts
// Descripción: Estilos para la cabecera de panel con botón de retroceso, título,
//              subtítulo y contenedor del selector de período.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: palette.white,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flexShrink: 1,
  },

  backBtn: {
    paddingVertical: 2,
  },

  backIcon: {
    fontSize: 28,
    lineHeight: 26,
    color: palette.textSubtle,
    fontWeight: '700',
  },

  titleBlock: {
    flexShrink: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.textMain,
    lineHeight: 20,
  },

  subtitle: {
    fontSize: 11,
    color: palette.textMuted,
    marginTop: 2,
  },
});
