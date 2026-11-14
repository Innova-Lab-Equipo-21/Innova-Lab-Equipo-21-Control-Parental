// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeviceSelector Styles
// Archivo: src/components/dashboard/actividad/blocks/DeviceSelector.styles.ts
// Descripción: Estilos para el dropdown de selección de dispositivo en Actividad.
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

  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 4,
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

  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  dotOnline: {
    backgroundColor: '#10b981',
  },

  dotOffline: {
    backgroundColor: '#ef4444',
  },

  dotWarning: {
    backgroundColor: '#f59e0b',
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
    maxWidth: 300,
    maxHeight: 380,
    backgroundColor: palette.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  menuHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.textMain,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
  },

  menuItemActive: {
    backgroundColor: '#E5F1FF',
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
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

  checkmark: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369a1',
    marginLeft: 6,
  },
});
