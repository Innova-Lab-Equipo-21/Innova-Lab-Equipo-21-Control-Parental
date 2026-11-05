// ==============================================================================
// Proyecto: BA Protege+
// Componente: DashboardNavbar (Navegación Inferior del Panel del Responsable)
// Archivo: src/components/dashboard/DashboardNavbar.tsx
// Descripción: Barra de navegación inferior (Bottom Navigation Bar) para el panel del
//              tutor responsable, que permite conmutar entre las pestañas principales.
// ==============================================================================

import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { styles } from './DashboardNavbar.styles';

/** Pestañas válidas disponibles en la barra de navegación del Dashboard */
export type DashboardTab = 'inicio' | 'dispositivos' | 'sitios' | 'actividad' | 'cuenta';

/**
 * Propiedades del componente DashboardNavbar.
 *
 * @property activeTab - Identificador de la pestaña actualmente seleccionada.
 * @property onSelectTab - Callback ejecutado al presionar sobre cualquiera de los botones de la barra de navegación.
 */
interface DashboardNavbarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
}

/** Mapeo de recursos de imágenes de íconos asignados a cada pestaña */
const navIcons: Record<DashboardTab, any> = {
  inicio: require('../../assets/icons/navbar/inicio.png'),
  dispositivos: require('../../assets/icons/navbar/dispositivos.png'),
  sitios: require('../../assets/icons/navbar/sitios.png'),
  actividad: require('../../assets/icons/navbar/actividad.png'),
  cuenta: require('../../assets/icons/navbar/cuenta.png'),
};

/** Etiquetas en español visibles para cada pestaña de la barra inferior */
const tabLabels: Record<DashboardTab, string> = {
  inicio: 'Panel',
  dispositivos: 'Dispositivos',
  sitios: 'Sitios y apps',
  actividad: 'Actividad',
  cuenta: 'Cuenta',
};

/** Arreglo ordenado con todas las pestañas para renderizado dinámico */
const tabs: DashboardTab[] = ['inicio', 'dispositivos', 'sitios', 'actividad', 'cuenta'];

/**
 * Componente principal de la barra de navegación inferior del responsable.
 * Muestra 5 secciones clave: Panel, Dispositivos, Sitios y apps, Actividad y Cuenta.
 */
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
