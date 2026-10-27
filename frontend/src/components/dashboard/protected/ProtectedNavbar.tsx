// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedNavbar
// Archivo: src/components/dashboard/protected/ProtectedNavbar.tsx
// Descripción: Navegación inferior para usuario protegido con el mismo diseño del
//              Responsable y orden estricto: Inicio, Sitios y apps, Actividad y Cuenta.
// ==============================================================================

import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { styles } from './ProtectedNavbar.styles';

export type ProtectedTab = 'inicio' | 'sitios' | 'actividad' | 'cuenta';

interface ProtectedNavbarProps {
  activeTab: ProtectedTab;
  onSelectTab: (tab: ProtectedTab) => void;
}

const navIcons: Record<ProtectedTab, any> = {
  inicio: require('../../../assets/icons/navbar/inicio.png'),
  sitios: require('../../../assets/icons/navbar/sitios.png'),
  actividad: require('../../../assets/icons/navbar/actividad.png'),
  cuenta: require('../../../assets/icons/navbar/cuenta.png'),
};

const tabLabels: Record<ProtectedTab, string> = {
  inicio: 'Inicio',
  sitios: 'Sitios y apps',
  actividad: 'Actividad',
  cuenta: 'Cuenta',
};

const tabs: ProtectedTab[] = ['inicio', 'sitios', 'actividad', 'cuenta'];

export const ProtectedNavbar: React.FC<ProtectedNavbarProps> = ({
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
