// ==============================================================================
// Proyecto: BA Protege+
// Componente: DashboardNavbar (Navegación Inferior del Panel del Responsable)
// Archivo: src/components/dashboard/DashboardNavbar.tsx
// ==============================================================================

import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { styles } from './DashboardNavbar.styles';

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
  sitios: 'Sitios y apps',
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
