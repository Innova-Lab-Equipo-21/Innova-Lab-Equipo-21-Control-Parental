// ==============================================================================
// Proyecto: BA Protege+
// Componente: DashboardNavbar Styles
// Archivo: src/components/dashboard/DashboardNavbar.styles.ts
// Descripción: Estilos visuales para la barra de navegación inferior del panel.
// ==============================================================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  navbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingVertical: 6,
    paddingHorizontal: 4,
    height: 66,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    maxWidth: 72,
  },
  activeTabButton: {
    backgroundColor: '#E5F1FF',
  },
  iconImage: {
    width: 22,
    height: 22,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#0056B3',
    fontWeight: '700',
  },
});
