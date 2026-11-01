// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesAppsOptionsMenuModal (Modal Bottom Sheet para Opciones de Gestión)
// Archivo: src/components/dashboard/sitios/SitesAppsOptionsMenuModal.tsx
// Descripción: Modal Bottom Sheet que despliega las opciones de personalización
//              de vista, filtrado por dispositivo, ordenamiento y modo de selección múltiple.
// ==============================================================================

import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ToggleSwitch } from '../../ToggleSwitch';
import { Icon } from '../../Icon';
import { colors } from '../../../theme/colors';
import { styles } from './SitesAppsOptionsMenuModal.styles';

interface SitesAppsOptionsMenuModalProps {
  visible: boolean;
  onClose: () => void;
  showSearchInput: boolean;
  onToggleSearch: () => void;
  showDeviceFilter: boolean;
  onToggleDeviceFilter: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  sortBy: 'date' | 'az';
  onSelectSortBy: (sort: 'date' | 'az') => void;
}

export const SitesAppsOptionsMenuModal: React.FC<SitesAppsOptionsMenuModalProps> = ({
  visible,
  onClose,
  showSearchInput,
  onToggleSearch,
  showDeviceFilter,
  onToggleDeviceFilter,
  isSelectionMode,
  onToggleSelectionMode,
  sortBy,
  onSelectSortBy,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.bottomSheetOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.bottomSheetCard}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Manija superior táctil del bottom sheet */}
          <View style={styles.bottomSheetHandle} />

          {/* Cabecera del Bottom Sheet */}
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Opciones de vista y gestión</Text>
            <TouchableOpacity onPress={onClose} style={styles.sheetCloseBtn}>
              <Text style={styles.sheetCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetSubtitle}>
            Herramientas para buscar, filtrar y organizar listas bloqueadas
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sección: Herramientas Rápidas */}
            <Text style={styles.sheetSectionTitle}>Herramientas de visualización</Text>

            {/* Opción 1: Barra de Búsqueda */}
            <View style={styles.sheetOptionRow}>
              <View style={styles.sheetOptionLeft}>
                <View style={styles.sheetOptionIconBox}>
                  <Icon name="search" size={20} color={colors.primary} />
                </View>
                <View style={styles.sheetOptionTextCol}>
                  <Text style={styles.sheetOptionTitle}>Barra de búsqueda</Text>
                  <Text style={styles.sheetOptionDesc}>Buscar dominios o apps por texto</Text>
                </View>
              </View>
              <ToggleSwitch
                value={showSearchInput}
                onValueChange={onToggleSearch}
              />
            </View>

            {/* Opción 2: Filtro por Dispositivo */}
            <View style={styles.sheetOptionRow}>
              <View style={styles.sheetOptionLeft}>
                <View style={styles.sheetOptionIconBox}>
                  <Icon name="smartphone" size={20} color={colors.primary} />
                </View>
                <View style={styles.sheetOptionTextCol}>
                  <Text style={styles.sheetOptionTitle}>Filtro por dispositivo</Text>
                  <Text style={styles.sheetOptionDesc}>Mostrar chips de selección por celular</Text>
                </View>
              </View>
              <ToggleSwitch
                value={showDeviceFilter}
                onValueChange={onToggleDeviceFilter}
              />
            </View>

            {/* Opción 3: Modo Selección Múltiple */}
            <View style={styles.sheetOptionRow}>
              <View style={styles.sheetOptionLeft}>
                <View style={styles.sheetOptionIconBox}>
                  <Icon name="check-square" size={20} color={colors.primary} />
                </View>
                <View style={styles.sheetOptionTextCol}>
                  <Text style={styles.sheetOptionTitle}>Acciones en lote</Text>
                  <Text style={styles.sheetOptionDesc}>Selección múltiple para activar, pausar o eliminar</Text>
                </View>
              </View>
              <ToggleSwitch
                value={isSelectionMode}
                onValueChange={onToggleSelectionMode}
              />
            </View>

            {/* Sección: Criterio de Ordenamiento */}
            <Text style={styles.sheetSectionTitle}>Criterio de ordenamiento</Text>
            <View style={styles.sortOptionsContainer}>
              {/* Opción: Recientes primero */}
              <TouchableOpacity
                style={[styles.sortOptionCard, sortBy === 'date' && styles.sortOptionCardActive]}
                onPress={() => onSelectSortBy('date')}
              >
                <View style={styles.sortOptionCardHeader}>
                  <Text style={[styles.sortOptionCardTitle, sortBy === 'date' && styles.sortOptionCardTitleActive]}>
                    Recientes
                  </Text>
                  <View style={[styles.sortRadioCircle, sortBy === 'date' && styles.sortRadioCircleActive]}>
                    {sortBy === 'date' && <View style={styles.sortRadioInner} />}
                  </View>
                </View>
                <Text style={styles.sortOptionCardDesc}>Últimos agregados primero</Text>
              </TouchableOpacity>

              {/* Opción: Alfabético A-Z */}
              <TouchableOpacity
                style={[styles.sortOptionCard, sortBy === 'az' && styles.sortOptionCardActive]}
                onPress={() => onSelectSortBy('az')}
              >
                <View style={styles.sortOptionCardHeader}>
                  <Text style={[styles.sortOptionCardTitle, sortBy === 'az' && styles.sortOptionCardTitleActive]}>
                    A - Z
                  </Text>
                  <View style={[styles.sortRadioCircle, sortBy === 'az' && styles.sortRadioCircleActive]}>
                    {sortBy === 'az' && <View style={styles.sortRadioInner} />}
                  </View>
                </View>
                <Text style={styles.sortOptionCardDesc}>Orden por nombre o dominio</Text>
              </TouchableOpacity>
            </View>

            {/* Botón de Aplicar / Cerrar */}
            <TouchableOpacity style={styles.sheetConfirmBtn} onPress={onClose}>
              <Text style={styles.sheetConfirmBtnText}>Aplicar opciones</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
