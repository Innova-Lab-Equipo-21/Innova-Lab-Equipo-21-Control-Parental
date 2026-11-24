// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesAppsOptionsMenuModal (Modal Bottom Sheet para Opciones de Gestión)
// Archivo: src/components/dashboard/sitios/SitesAppsOptionsMenuModal.tsx
// Descripción: Modal Bottom Sheet interactivo que despliega opciones directas de gestión:
//              Barra de búsqueda directa (con cierre al tocar fuera), Badges de filtrado por dispositivo,
//              Badges de ordenamiento y switch de la app para Selección Múltiple (limpio, sin fondo ni ícono).
// ==============================================================================

import React, { useRef, useState, useMemo } from 'react';
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
import { BlockOriginFilter, DeviceInfo } from '../../../types';
import { ToggleSwitch } from '../../ToggleSwitch';
import { Icon } from '../../Icon';
import { getDeviceFirstName } from '../../../utils/authValidation';
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
  selectedOriginFilter?: BlockOriginFilter;
  onSelectOriginFilter?: (origin: BlockOriginFilter) => void;
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
  selectedOriginFilter = 'all',
  onSelectOriginFilter,
  sortBy = 'date',
  onSelectSortBy,
  isSelectionMode = false,
  onToggleSelectionMode,
  onToggleSearch,
  onToggleDeviceFilter,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);

  /** Cierra el teclado virtual y desenfoca el campo de búsqueda */
  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  /**
   * Opciones de dispositivo para el dropdown:
   * 1. 'Todos'
   * 2. 'Yo' (dispositivo del responsable, siempre de primero entre dispositivos)
   * 3. Dispositivos protegidos ordenados alfabéticamente (A-Z) con solo el primer nombre.
   */
  const deviceOptions = useMemo(() => {
    const list: Array<{ id: string; label: string }> = [
      { id: 'all', label: 'Todos' },
      { id: 'self', label: 'Yo' },
    ];

    const protectedList = devices
      .filter((d) => d.deviceId !== 'self' && d.profileType !== 'Responsable')
      .map((d) => ({
        id: d.deviceId,
        label: getDeviceFirstName(d.childName || d.deviceName || 'Protegido'),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));

    return [...list, ...protectedList];
  }, [devices]);

  const selectedDevice =
    deviceOptions.find((o) => o.id === selectedDeviceFilter) ||
    deviceOptions[0];

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
                Filtrá y ordená la lista a tu manera.
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
                    placeholder="Buscar sitio o aplicación..."
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

                {/* 2. FILTRAR POR DISPOSITIVO (Dropdown en estilo de la app) */}
                <Text style={styles.sheetSectionTitle}>Filtrar por dispositivo</Text>
                <TouchableOpacity
                  style={styles.dropdownContainer}
                  activeOpacity={0.7}
                  onPress={() => {
                    handleDismissKeyboard();
                    setIsDeviceDropdownOpen(true);
                  }}
                >
                  <Text style={styles.dropdownValueText}>
                    {selectedDevice?.label ?? 'Todos'}
                  </Text>
                  <Text style={styles.dropdownChevron}>▾</Text>
                </TouchableOpacity>

                {/* Modal Dropdown para selección de Dispositivo */}
                <Modal
                  visible={isDeviceDropdownOpen}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setIsDeviceDropdownOpen(false)}
                >
                  <TouchableWithoutFeedback onPress={() => setIsDeviceDropdownOpen(false)}>
                    <View style={styles.dropdownModalOverlay}>
                      <TouchableWithoutFeedback>
                        <View style={styles.dropdownMenuCard}>
                          <Text style={styles.dropdownMenuHeader}>
                            Filtrar por dispositivo
                          </Text>
                          <ScrollView showsVerticalScrollIndicator={false}>
                            {deviceOptions.map((opt) => {
                              const isSelected = selectedDeviceFilter === opt.id;
                              return (
                                <TouchableOpacity
                                  key={opt.id}
                                  style={[
                                    styles.dropdownItem,
                                    isSelected && styles.dropdownItemActive,
                                  ]}
                                  onPress={() => {
                                    setIsDeviceDropdownOpen(false);
                                    if (onSelectDeviceFilter) onSelectDeviceFilter(opt.id);
                                    if (onToggleDeviceFilter) onToggleDeviceFilter();
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.dropdownItemText,
                                      isSelected && styles.dropdownItemTextActive,
                                    ]}
                                  >
                                    {opt.label}
                                  </Text>
                                  {isSelected && (
                                    <Text style={styles.dropdownCheckmark}>✓</Text>
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

                {/* 3. FILTRAR POR ORIGEN (Sentence case) */}
                <Text style={styles.sheetSectionTitle}>Filtrar por origen</Text>
                <View style={styles.originBadgeRow}>
                  <TouchableOpacity
                    style={[
                      styles.filterBadge,
                      styles.originFilterBadge,
                      selectedOriginFilter === 'all' && styles.filterBadgeActive,
                    ]}
                    onPress={() => {
                      handleDismissKeyboard();
                      if (onSelectOriginFilter) onSelectOriginFilter('all');
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      style={[
                        styles.filterBadgeText,
                        styles.originFilterBadgeText,
                        selectedOriginFilter === 'all' && styles.filterBadgeTextActive,
                      ]}
                    >
                      Todos
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterBadge,
                      styles.originFilterBadge,
                      selectedOriginFilter === 'responsable' && styles.filterBadgeActive,
                    ]}
                    onPress={() => {
                      handleDismissKeyboard();
                      if (onSelectOriginFilter) onSelectOriginFilter('responsable');
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      style={[
                        styles.filterBadgeText,
                        styles.originFilterBadgeText,
                        selectedOriginFilter === 'responsable' && styles.filterBadgeTextActive,
                      ]}
                    >
                      Responsable
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterBadge,
                      styles.originFilterBadge,
                      selectedOriginFilter === 'adulto_protegido' && styles.filterBadgeActive,
                    ]}
                    onPress={() => {
                      handleDismissKeyboard();
                      if (onSelectOriginFilter) onSelectOriginFilter('adulto_protegido');
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      style={[
                        styles.filterBadgeText,
                        styles.originFilterBadgeText,
                        selectedOriginFilter === 'adulto_protegido' && styles.filterBadgeTextActive,
                      ]}
                    >
                      Persona protegida
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 4. CRITERIO DE ORDENACIÓN (Sentence case) */}
                <Text style={styles.sheetSectionTitle}>Ordenar lista</Text>
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
                      Más recientes
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

                {/* 5. ACCIÓN EN LOTE (Sentence case) */}
                <Text style={styles.sheetSectionTitle}>Elegir varios</Text>
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
