// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesAppsOptionsMenuModal (Modal Bottom Sheet para Opciones de Gestión)
// Archivo: src/components/dashboard/sitios/SitesAppsOptionsMenuModal.tsx
// Descripción: Modal Bottom Sheet interactivo que despliega opciones directas de gestión:
//              Barra de búsqueda directa (con cierre al tocar fuera), Badges de filtrado por dispositivo,
//              Badges de ordenamiento y switch de la app para Selección Múltiple (limpio, sin fondo ni ícono).
// ==============================================================================

import React, { useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { DeviceInfo } from '../../../types';
import { ToggleSwitch } from '../../ToggleSwitch';
import { Icon } from '../../Icon';
import { styles } from './SitesAppsOptionsMenuModal.styles';

/**
 * Propiedades del componente SitesAppsOptionsMenuModal.
 *
 * @property visible - Controla si el bottom sheet está desplegado en pantalla.
 * @property onClose - Callback invocado al cerrar el modal o presionar "Listo".
 * @property searchValue - Texto de búsqueda actual para la lista de sitios/apps.
 * @property onSearchChange - Callback ejecutado al escribir en la barra de búsqueda directa.
 * @property devices - Arreglo con la información de dispositivos vinculados.
 * @property selectedDeviceFilter - ID del dispositivo actualmente filtrado ('all', 'self' o ID específico).
 * @property onSelectDeviceFilter - Callback ejecutado al seleccionar una insignia de dispositivo.
 * @property sortBy - Criterio de ordenamiento ('date' = Por fecha / recientes, 'az' = Alfabético).
 * @property onSelectSortBy - Callback ejecutado al cambiar el criterio de ordenamiento.
 * @property isSelectionMode - Booleano que indica si la selección múltiple en lote está activa.
 * @property onToggleSelectionMode - Callback ejecutado al alternar el modo de selección en lote.
 * @property showSearchInput - (Opcional) Indica si la barra de búsqueda está visible en la vista principal.
 * @property onToggleSearch - (Opcional) Callback para alternar la visibilidad de la búsqueda en la vista principal.
 * @property showDeviceFilter - (Opcional) Indica si la barra de chips está visible en la vista principal.
 * @property onToggleDeviceFilter - (Opcional) Callback para alternar los chips en la vista principal.
 */
export interface SitesAppsOptionsMenuModalProps {
  visible: boolean;
  onClose: () => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  devices?: DeviceInfo[];
  selectedDeviceFilter?: string;
  onSelectDeviceFilter?: (deviceId: string) => void;
  sortBy?: 'date' | 'az';
  onSelectSortBy?: (sort: 'date' | 'az') => void;
  isSelectionMode?: boolean;
  onToggleSelectionMode?: () => void;
  showSearchInput?: boolean;
  onToggleSearch?: () => void;
  showDeviceFilter?: boolean;
  onToggleDeviceFilter?: () => void;
}

/**
 * Componente Modal Bottom Sheet optimizado para la gestión de listas de sitios y apps.
 * Presenta controles directos limpios sin emojis en títulos ni badges, barra de búsqueda
 * con cierre automático al tocar fuera, y switch de la app en la fila de Selección Múltiple.
 */
export const SitesAppsOptionsMenuModal: React.FC<SitesAppsOptionsMenuModalProps> = ({
  visible,
  onClose,
  searchValue = '',
  onSearchChange,
  devices = [],
  selectedDeviceFilter = 'all',
  onSelectDeviceFilter,
  sortBy = 'date',
  onSelectSortBy,
  isSelectionMode = false,
  onToggleSelectionMode,
  onToggleSearch,
  onToggleDeviceFilter,
}) => {
  const inputRef = useRef<TextInput>(null);

  /** Cierra el teclado virtual y desenfoca el campo de búsqueda */
  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        handleDismissKeyboard();
        onClose();
      }}
    >
      <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
        <View style={styles.bottomSheetOverlay}>
          <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
            <View style={styles.bottomSheetCard}>
              {/* Manija superior táctil del bottom sheet */}
              <View style={styles.bottomSheetHandle} />

              {/* Cabecera del Bottom Sheet */}
              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>Opciones de gestión</Text>
                <TouchableOpacity
                  onPress={() => {
                    handleDismissKeyboard();
                    onClose();
                  }}
                  style={styles.sheetCloseBtn}
                >
                  <Text style={styles.sheetCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sheetSubtitle}>
                Personalizá la vista, filtros y el orden de los elementos
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={handleDismissKeyboard}
              >
                {/* 1. BARRA DE BÚSQUEDA DIRECTA (Sin título encima) */}
                <View style={styles.searchInputContainer}>
                  <Icon name="busqueda" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder="Buscar por dominio o aplicación..."
                    placeholderTextColor="#94A3B8"
                    value={searchValue}
                    onChangeText={(text) => {
                      if (onSearchChange) onSearchChange(text);
                      if (onToggleSearch && !searchValue && text) {
                        onToggleSearch();
                      }
                    }}
                  />
                  {searchValue.length > 0 && (
                    <TouchableOpacity
                      style={styles.searchClearBtn}
                      onPress={() => {
                        if (onSearchChange) onSearchChange('');
                      }}
                    >
                      <Text style={styles.searchClearText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 2. FILTRAR POR DISPOSITIVO (Sin emojis) */}
                <Text style={styles.sheetSectionTitle}>FILTRAR POR DISPOSITIVO</Text>
                <View style={styles.badgeRow}>
                  {/* Badge: Todos */}
                  <TouchableOpacity
                    style={[
                      styles.filterBadge,
                      selectedDeviceFilter === 'all' && styles.filterBadgeActive,
                    ]}
                    onPress={() => {
                      handleDismissKeyboard();
                      if (onSelectDeviceFilter) onSelectDeviceFilter('all');
                      if (onToggleDeviceFilter) onToggleDeviceFilter();
                    }}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        selectedDeviceFilter === 'all' && styles.filterBadgeTextActive,
                      ]}
                    >
                      Todos
                    </Text>
                  </TouchableOpacity>

                  {/* Badge: Mi dispositivo */}
                  <TouchableOpacity
                    style={[
                      styles.filterBadge,
                      selectedDeviceFilter === 'self' && styles.filterBadgeActive,
                    ]}
                    onPress={() => {
                      handleDismissKeyboard();
                      if (onSelectDeviceFilter) onSelectDeviceFilter('self');
                      if (onToggleDeviceFilter) onToggleDeviceFilter();
                    }}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        selectedDeviceFilter === 'self' && styles.filterBadgeTextActive,
                      ]}
                    >
                      Mi dispositivo
                    </Text>
                  </TouchableOpacity>

                  {/* Badges por cada dispositivo individual del tutor */}
                  {devices.map((device) => {
                    const isSelected = selectedDeviceFilter === device.deviceId;
                    const labelName = device.childName || device.deviceName;

                    return (
                      <TouchableOpacity
                        key={device.deviceId}
                        style={[styles.filterBadge, isSelected && styles.filterBadgeActive]}
                        onPress={() => {
                          handleDismissKeyboard();
                          if (onSelectDeviceFilter) onSelectDeviceFilter(device.deviceId);
                          if (onToggleDeviceFilter) onToggleDeviceFilter();
                        }}
                      >
                        <Text style={[styles.filterBadgeText, isSelected && styles.filterBadgeTextActive]}>
                          {labelName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. CRITERIO DE ORDENACIÓN (Sin emojis) */}
                <Text style={styles.sheetSectionTitle}>ORDENAR LISTA</Text>
                <View style={styles.badgeRow}>
                  {/* Badge: Por fecha */}
                  <TouchableOpacity
                    style={[
                      styles.filterBadge,
                      sortBy === 'date' && styles.filterBadgeActive,
                    ]}
                    onPress={() => {
                      handleDismissKeyboard();
                      if (onSelectSortBy) onSelectSortBy('date');
                    }}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        sortBy === 'date' && styles.filterBadgeTextActive,
                      ]}
                    >
                      Por fecha (Recientes)
                    </Text>
                  </TouchableOpacity>

                  {/* Badge: Alfabético */}
                  <TouchableOpacity
                    style={[
                      styles.filterBadge,
                      sortBy === 'az' && styles.filterBadgeActive,
                    ]}
                    onPress={() => {
                      handleDismissKeyboard();
                      if (onSelectSortBy) onSelectSortBy('az');
                    }}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        sortBy === 'az' && styles.filterBadgeTextActive,
                      ]}
                    >
                      Alfabético (A - Z)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 4. ACCIÓN EN LOTE (Fila limpia con ToggleSwitch) */}
                <Text style={styles.sheetSectionTitle}>ACCIÓN EN LOTE</Text>
                <View style={styles.batchRow}>
                  <Text style={styles.batchTitle}>Selección múltiple</Text>
                  <ToggleSwitch
                    value={isSelectionMode}
                    onValueChange={() => {
                      handleDismissKeyboard();
                      if (onToggleSelectionMode) onToggleSelectionMode();
                    }}
                  />
                </View>

                {/* Botón de Confirmación / Listo */}
                <TouchableOpacity
                  style={styles.sheetConfirmBtn}
                  onPress={() => {
                    handleDismissKeyboard();
                    onClose();
                  }}
                >
                  <Text style={styles.sheetConfirmBtnText}>Listo</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
