// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoSitiosOptionsModal (Bottom Sheet de Opciones en Modo Adulto)
// Archivo: src/components/dashboard/protected/adulto/AdultoSitiosOptionsModal.tsx
// Descripción: Modal Bottom Sheet de opciones ajustado para el Modo Protegido Adulto:
//              permite únicamente Buscar y Ordenar la lista (Por fecha o Alfabético),
//              sin filtro por dispositivo ni selección múltiple en lote.
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
import { Icon } from '../../../Icon';
import { AdultoSortOption } from '../../../../utils/adultoSitios';
import { styles } from './AdultoSitiosOptionsModal.styles';

export interface AdultoSitiosOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (text: string) => void;
  sortBy: AdultoSortOption;
  onSelectSortBy: (sort: AdultoSortOption) => void;
}

export const AdultoSitiosOptionsModal: React.FC<AdultoSitiosOptionsModalProps> = ({
  visible,
  onClose,
  searchValue,
  onSearchChange,
  sortBy,
  onSelectSortBy,
}) => {
  const inputRef = useRef<TextInput>(null);

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
              <View style={styles.bottomSheetHandle} />

              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>Opciones de gestión</Text>
                <TouchableOpacity
                  onPress={() => {
                    handleDismissKeyboard();
                    onClose();
                  }}
                  style={styles.sheetCloseBtn}
                  accessibilityLabel="Cerrar opciones"
                >
                  <Text style={styles.sheetCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sheetSubtitle}>
                Buscá elementos o cambiá el orden de visualización de la lista
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={handleDismissKeyboard}
              >
                {/* 1. BARRA DE BÚSQUEDA DIRECTA */}
                <View style={styles.searchInputContainer}>
                  <Icon name="busqueda" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder="Buscar por dominio o aplicación..."
                    placeholderTextColor="#94A3B8"
                    value={searchValue}
                    onChangeText={onSearchChange}
                  />
                  {searchValue.length > 0 && (
                    <TouchableOpacity
                      style={styles.searchClearBtn}
                      onPress={() => onSearchChange('')}
                      accessibilityLabel="Limpiar búsqueda"
                    >
                      <Text style={styles.searchClearText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 2. ORDENAR LISTA (Única opción adicional permitida en Modo Protegido Adulto) */}
                <Text style={styles.sheetSectionTitle}>Ordenar lista</Text>
                <View style={styles.badgeRow}>
                  <TouchableOpacity
                    style={[
                      styles.filterBadge,
                      sortBy === 'date' && styles.filterBadgeActive,
                    ]}
                    onPress={() => {
                      handleDismissKeyboard();
                      onSelectSortBy('date');
                    }}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        sortBy === 'date' && styles.filterBadgeTextActive,
                      ]}
                    >
                      Por fecha (recientes)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterBadge,
                      sortBy === 'az' && styles.filterBadgeActive,
                    ]}
                    onPress={() => {
                      handleDismissKeyboard();
                      onSelectSortBy('az');
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
