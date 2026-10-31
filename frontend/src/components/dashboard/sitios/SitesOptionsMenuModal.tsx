// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesOptionsMenuModal (Modal Bottom Sheet para Opciones de Gestión)
// Archivo: src/components/dashboard/sitios/SitesOptionsMenuModal.tsx
// ==============================================================================

import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ToggleSwitch } from '../../ToggleSwitch';
import { Icon } from '../../Icon';
import { colors } from '../../../theme/colors';
import { styles } from './CustomSitesSection.styles';

interface SitesOptionsMenuModalProps {
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

export const SitesOptionsMenuModal: React.FC<SitesOptionsMenuModalProps> = ({
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
        <View
          style={styles.bottomSheetCard}
          onStartShouldSetResponder={() => true}
        >
          {/* Manija táctil del Bottom Sheet */}
          <View style={styles.bottomSheetHandle} />

          {/* Encabezado */}
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Opciones de gestión</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.sheetCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.sheetCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetSubtitle}>
            Personaliza la vista, filtros y el orden de los elementos
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sección: Herramientas de Visualización */}
            <Text style={styles.sheetSectionTitle}>Herramientas</Text>

            {/* Opción 1: Barra de búsqueda */}
            <TouchableOpacity
              style={styles.sheetOptionRow}
              onPress={onToggleSearch}
              activeOpacity={0.7}
            >
              <View style={styles.sheetOptionLeft}>
                <View style={styles.sheetOptionIconBox}>
                  <Icon name="busqueda" size={20} color={colors.primary} />
                </View>
                <View style={styles.sheetOptionTextCol}>
                  <Text style={styles.sheetOptionTitle}>Barra de búsqueda</Text>
                  <Text style={styles.sheetOptionDesc}>
                    Buscar dominios o aplicaciones en la lista
                  </Text>
                </View>
              </View>
              <ToggleSwitch
                value={showSearchInput}
                onValueChange={onToggleSearch}
              />
            </TouchableOpacity>

            {/* Opción 2: Filtro por dispositivo */}
            <TouchableOpacity
              style={styles.sheetOptionRow}
              onPress={onToggleDeviceFilter}
              activeOpacity={0.7}
            >
              <View style={styles.sheetOptionLeft}>
                <View style={styles.sheetOptionIconBox}>
                  <Icon name="celular" size={20} color={colors.primary} />
                </View>
                <View style={styles.sheetOptionTextCol}>
                  <Text style={styles.sheetOptionTitle}>Filtrar por dispositivo</Text>
                  <Text style={styles.sheetOptionDesc}>
                    Mostrar selector de dispositivo asignado
                  </Text>
                </View>
              </View>
              <ToggleSwitch
                value={showDeviceFilter}
                onValueChange={onToggleDeviceFilter}
              />
            </TouchableOpacity>

            {/* Opción 3: Selección múltiple */}
            <TouchableOpacity
              style={[styles.sheetOptionRow, { borderBottomWidth: 0 }]}
              onPress={onToggleSelectionMode}
              activeOpacity={0.7}
            >
              <View style={styles.sheetOptionLeft}>
                <View style={styles.sheetOptionIconBox}>
                  <Icon name="check" size={20} color={colors.primary} />
                </View>
                <View style={styles.sheetOptionTextCol}>
                  <Text style={styles.sheetOptionTitle}>Selección múltiple</Text>
                  <Text style={styles.sheetOptionDesc}>
                    Acciones masivas de activación, pausa o eliminación
                  </Text>
                </View>
              </View>
              <ToggleSwitch
                value={isSelectionMode}
                onValueChange={onToggleSelectionMode}
              />
            </TouchableOpacity>

            {/* Sección: Criterio de Ordenamiento */}
            <Text style={styles.sheetSectionTitle}>Ordenar lista</Text>
            <View style={styles.sortOptionsContainer}>
              {/* Opción Fecha */}
              <TouchableOpacity
                style={[
                  styles.sortOptionCard,
                  sortBy === 'date' && styles.sortOptionCardActive,
                ]}
                onPress={() => onSelectSortBy('date')}
                activeOpacity={0.8}
              >
                <View style={styles.sortOptionCardHeader}>
                  <Text
                    style={[
                      styles.sortOptionCardTitle,
                      sortBy === 'date' && styles.sortOptionCardTitleActive,
                    ]}
                  >
                    📅 Por fecha
                  </Text>
                  <View
                    style={[
                      styles.sortRadioCircle,
                      sortBy === 'date' && styles.sortRadioCircleActive,
                    ]}
                  >
                    {sortBy === 'date' && <View style={styles.sortRadioInner} />}
                  </View>
                </View>
                <Text style={styles.sortOptionCardDesc}>
                  Más recientes primero
                </Text>
              </TouchableOpacity>

              {/* Opción A-Z */}
              <TouchableOpacity
                style={[
                  styles.sortOptionCard,
                  sortBy === 'az' && styles.sortOptionCardActive,
                ]}
                onPress={() => onSelectSortBy('az')}
                activeOpacity={0.8}
              >
                <View style={styles.sortOptionCardHeader}>
                  <Text
                    style={[
                      styles.sortOptionCardTitle,
                      sortBy === 'az' && styles.sortOptionCardTitleActive,
                    ]}
                  >
                    🔤 Alfabético
                  </Text>
                  <View
                    style={[
                      styles.sortRadioCircle,
                      sortBy === 'az' && styles.sortRadioCircleActive,
                    ]}
                  >
                    {sortBy === 'az' && <View style={styles.sortRadioInner} />}
                  </View>
                </View>
                <Text style={styles.sortOptionCardDesc}>
                  De la A a la Z
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botón de Confirmación / Cerrar */}
            <TouchableOpacity
              style={styles.sheetConfirmBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.sheetConfirmBtnText}>Listo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
