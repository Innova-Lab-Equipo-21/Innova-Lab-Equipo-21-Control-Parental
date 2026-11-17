// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorNavbar
// Archivo: src/components/dashboard/protected/menor/MenorNavbar.tsx
// Descripción: Barra de navegación inferior exclusiva del Modo Protegido Menor:
//              Inicio, Pasatiempos, Actividad y Cuenta.
// ==============================================================================

import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { styles } from './MenorNavbar.styles';

export type MenorTab = 'inicio' | 'pasatiempos' | 'actividad' | 'cuenta';

interface MenorNavbarProps {
  activeTab: MenorTab;
  onSelectTab: (tab: MenorTab) => void;
}

const navIcons: Record<MenorTab, any> = {
  inicio: require('../../../../assets/icons/navbar/inicio.png'),
  pasatiempos: require('../../../../assets/icons/navbar/rompecabezas.png'),
  actividad: require('../../../../assets/icons/navbar/actividad.png'),
  cuenta: require('../../../../assets/icons/navbar/cuenta.png'),
};

const activeNavIcons: Record<MenorTab, any> = {
  inicio: require('../../../../assets/icons/navbar/inicio_activo.png'),
  pasatiempos: require('../../../../assets/icons/navbar/rompecabezas_activo.png'),
  actividad: require('../../../../assets/icons/navbar/actividad_activo.png'),
  cuenta: require('../../../../assets/icons/navbar/cuenta_activo.png'),
};

const tabLabels: Record<MenorTab, string> = {
  inicio: 'Inicio',
  pasatiempos: 'Pasatiempos',
  actividad: 'Actividad',
  cuenta: 'Cuenta',
};

const tabs: MenorTab[] = ['inicio', 'pasatiempos', 'actividad', 'cuenta'];

export const MenorNavbar: React.FC<MenorNavbarProps> = ({
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
