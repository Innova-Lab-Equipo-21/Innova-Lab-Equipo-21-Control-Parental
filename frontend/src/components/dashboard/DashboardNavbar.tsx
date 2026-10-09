// ==============================================================================
// Proyecto: BA Protege+
// Componente: DashboardNavbar (Navegación Inferior del Panel del Responsable)
// Archivo: src/components/dashboard/DashboardNavbar.tsx
// Descripción: Barra de navegación inferior con 5 opciones (Panel, Dispositivos,
//              Sitios, Actividad, Cuenta) con sus nombres e íconos PNG y resalte
//              con fondo de bordes suaves #E5F1FF.
// ==============================================================================

import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

export type DashboardTab = 'inicio' | 'dispositivos' | 'sitios' | 'actividad' | 'cuenta';

interface DashboardNavbarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
}

const navIcons: Record<DashboardTab, any> = {
  inicio: require('../../assets/icons/navbar/inicio.png'),
  dispositivos: require('../../assets/icons/navbar/dispositivos.png'),
  sitios: require('../../assets/icons/navbar/sitios.png'),
  actividad: require('../../assets/icons/navbar/actividad.png'),
  cuenta: require('../../assets/icons/navbar/cuenta.png'),
};

const tabLabels: Record<DashboardTab, string> = {
  inicio: 'Panel',
  dispositivos: 'Dispositivos',
  sitios: 'Sitios',
  actividad: 'Actividad',
  cuenta: 'Cuenta',
};

const tabs: DashboardTab[] = ['inicio', 'dispositivos', 'sitios', 'actividad', 'cuenta'];

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <View style={styles.navbarContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              isActive && styles.activeTabButton,
            ]}
            onPress={() => onSelectTab(tab)}
            activeOpacity={0.8}
            accessibilityLabel={`Navegar a ${tabLabels[tab]}`}
          >
            <Image
              source={navIcons[tab]}
              style={styles.iconImage}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.activeTabLabel,
              ]}
              numberOfLines={1}
            >
              {tabLabels[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
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
