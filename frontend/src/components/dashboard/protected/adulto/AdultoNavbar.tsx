// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoNavbar
// Archivo: src/components/dashboard/protected/adulto/AdultoNavbar.tsx
// Descripción: Barra de navegación inferior exclusiva del Modo Protegido Adulto:
//              Inicio, Sitios y apps, Actividad y Cuenta.
// ==============================================================================

import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { styles } from './AdultoNavbar.styles';

export type AdultoTab = 'inicio' | 'sitios' | 'actividad' | 'cuenta';

interface AdultoNavbarProps {
  activeTab: AdultoTab;
  onSelectTab: (tab: AdultoTab) => void;
}

const navIcons: Record<AdultoTab, any> = {
  inicio: require('../../../../assets/icons/navbar/inicio.png'),
  sitios: require('../../../../assets/icons/navbar/sitios.png'),
  actividad: require('../../../../assets/icons/navbar/actividad.png'),
  cuenta: require('../../../../assets/icons/navbar/cuenta.png'),
};

const activeNavIcons: Record<AdultoTab, any> = {
  inicio: require('../../../../assets/icons/navbar/inicio_activo.png'),
  sitios: require('../../../../assets/icons/navbar/sitios.png'),
  actividad: require('../../../../assets/icons/navbar/actividad_activo.png'),
  cuenta: require('../../../../assets/icons/navbar/cuenta_activo.png'),
};

const tabLabels: Record<AdultoTab, string> = {
  inicio: 'Inicio',
  sitios: 'Sitios y apps',
  actividad: 'Actividad',
  cuenta: 'Cuenta',
};

const tabs: AdultoTab[] = ['inicio', 'sitios', 'actividad', 'cuenta'];

export const AdultoNavbar: React.FC<AdultoNavbarProps> = ({
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
              source={isActive ? activeNavIcons[tab] : navIcons[tab]}
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
