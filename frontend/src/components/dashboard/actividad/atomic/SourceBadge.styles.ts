// ==============================================================================
// Proyecto: BA Protege+
// Componente: SourceBadge Styles
// Archivo: src/components/dashboard/actividad/atomic/SourceBadge.styles.ts
// Descripción: Estilos para la insignia de origen de bloqueo (LOTBA, Personalizada
//              o Anti-bypass) con variantes de color y tipografía accesible.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 0,
  },

  bgLotba: {
    backgroundColor: palette.lotbaBlueBg,
    borderColor: palette.lotbaBlueBorder,
  },

  bgCustom: {
    backgroundColor: palette.customAmberBg,
    borderColor: palette.customAmberBorder,
  },

  bgBypass: {
    backgroundColor: palette.dangerBg,
    borderColor: palette.dangerBorder,
  },

  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
