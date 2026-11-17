// ==============================================================================
// Proyecto: BA Protege+
// Componente: PeriodSelector Styles
// Archivo: src/components/dashboard/actividad/blocks/PeriodSelector.styles.ts
// Descripción: Estilos para el botón selector desplegable de período y menú flotante
//              en modal con fondo translúcido.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },

  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.offWhite,
    borderWidth: 1.5,
    borderColor: palette.cardBorder,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 40,
  },

  triggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textMain,
  },

  chevron: {
    fontSize: 10,
    color: palette.textSubtle,
    marginLeft: 6,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  menu: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: palette.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },

  menuItemActive: {
    backgroundColor: '#E5F1FF',
  },

  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textSubtle,
  },

  menuItemTextActive: {
    color: '#0369a1',
    fontWeight: '800',
  },
});
