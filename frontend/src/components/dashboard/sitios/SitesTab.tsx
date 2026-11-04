// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesTab (Sub-vista de Gestión de Sitios Web Bloqueados)
// Archivo: src/components/dashboard/sitios/SitesTab.tsx
// Descripción: Sub-pestaña interactiva de sitios web bloqueados con barra de búsqueda,
//              acciones masivas, tarjetas individuales y controles de edición/pausa.
// ==============================================================================

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Badge } from '../../Badge';
import { ToggleSwitch } from '../../ToggleSwitch';
import { Icon } from '../../Icon';
import { colors } from '../../../theme/colors';
import { CustomBlockedDomain } from '../../../types';
import { styles } from './SitesTab.styles';

interface SitesTabProps {
  siteSearch: string;
  onSearchChange: (text: string) => void;
  showSearchInput?: boolean;
  onHideSearch?: () => void;
  isSelectionMode?: boolean;
  sitesList: CustomBlockedDomain[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onBulkActivate: () => void;
  onBulkPause: () => void;
  onBulkDelete: () => void;
  onToggleActive: (site: CustomBlockedDomain) => void;
  onStartEdit: (site: CustomBlockedDomain) => void;
  onDeleteSite: (site: CustomBlockedDomain) => void;
}

export const SitesTab: React.FC<SitesTabProps> = ({
  siteSearch,
  onSearchChange,
  showSearchInput = false,
  onHideSearch,
  isSelectionMode = false,
  sitesList,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onBulkActivate,
  onBulkPause,
  onBulkDelete,
  onToggleActive,
  onStartEdit,
  onDeleteSite,
}) => {
  const allSelected = sitesList.length > 0 && selectedIds.length === sitesList.length;
  const selectedSites = sitesList.filter((s) => selectedIds.includes(s.id));
  const hasPaused = selectedSites.some((s) => !s.isActive);
  const hasActive = selectedSites.some((s) => s.isActive);

  return (
    <>
      {/* Campo de búsqueda opcional cuando se activa mediante el menú de 3 puntos */}
      {(showSearchInput || siteSearch.length > 0) && (
        <View style={styles.searchSortRow}>
          <TextInput
            style={styles.searchInputFlex}
            placeholder="🔍 Buscar dominio..."
            placeholderTextColor={colors.textSecondary}
            value={siteSearch}
            onChangeText={onSearchChange}
            autoFocus={showSearchInput}
            onBlur={() => {
              if (!siteSearch.trim() && onHideSearch) {
                onHideSearch();
              }
            }}
          />
        </View>
      )}

      {/* Fila de Selección Múltiple (Solo visible en modo de selección) */}
      {isSelectionMode && sitesList.length > 0 && (
        <View style={styles.bulkHeaderRow}>
          <TouchableOpacity style={styles.selectAllBtn} onPress={onSelectAll}>
            <Text style={styles.selectAllText}>
              {allSelected ? '☑️ Desmarcar todos' : '☐ Seleccionar todos'}
            </Text>
          </TouchableOpacity>

          {selectedIds.length > 0 && (
            <Text style={styles.selectedCountText}>
              {selectedIds.length} seleccionado(s)
            </Text>
          )}
        </View>
      )}

      {/* Barra de Acciones Masivas dinámicas si hay selección */}
      {isSelectionMode && selectedIds.length > 0 && (
        <View style={styles.bulkActionsBar}>
          {hasPaused && (
            <TouchableOpacity style={styles.bulkActionButton} onPress={onBulkActivate}>
              <Text style={styles.bulkActionText}>▶️ Activar</Text>
            </TouchableOpacity>
          )}

          {hasActive && (
            <TouchableOpacity style={styles.bulkActionButton} onPress={onBulkPause}>
              <Text style={styles.bulkActionText}>⏸️ Pausar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.bulkActionButton, styles.bulkActionButtonDelete]}
            onPress={onBulkDelete}
          >
            <Text style={styles.bulkActionDeleteText}>🗑️ Eliminar ({selectedIds.length})</Text>
          </TouchableOpacity>
        </View>
      )}

      {sitesList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No tienes sitios personalizados bloqueados. Agrega dominios con el botón + flotante.
          </Text>
        </View>
      ) : (
        sitesList.map((site) => {
          const isSelected = selectedIds.includes(site.id);

          return (
            <TouchableOpacity
              key={site.id}
              style={[
                styles.siteCard,
                isSelectionMode && isSelected && { borderColor: colors.primary, borderWidth: 1.5 },
              ]}
              onPress={() => {
                if (isSelectionMode) onToggleSelect(site.id);
              }}
              activeOpacity={isSelectionMode ? 0.9 : 1}
            >
              <View style={styles.siteCardHeader}>
                {isSelectionMode && (
                  <TouchableOpacity
                    style={[styles.checkboxSquare, isSelected && styles.checkboxSquareChecked]}
                    onPress={() => onToggleSelect(site.id)}
                  >
                    {isSelected && <Text style={styles.checkboxCheckmark}>✓</Text>}
                  </TouchableOpacity>
                )}

                <View style={styles.cardTitleCol}>
                  <Text style={styles.siteDomainText} numberOfLines={1}>
                    {site.domain}
                  </Text>
                </View>

                <View style={styles.headerControlsRow}>
                  <Badge
                    status={site.isActive ? 'activo' : 'danger'}
                    label={site.isActive ? 'Bloqueado' : 'Desbloqueado'}
                  />
                  <ToggleSwitch
                    value={site.isActive}
                    onValueChange={() => onToggleActive(site)}
                  />
                </View>
              </View>

              {/* Fila inferior: Dispositivos aplicados a la izquierda y Acciones (editar, eliminar) a la derecha */}
              <View style={styles.cardFooterRow}>
                <Text style={styles.deviceIndicatorText} numberOfLines={1}>
                  {site.applyToAll
                    ? 'Todos los dispositivos'
                    : `${site.deviceIds?.length || 0} ${site.deviceIds?.length === 1 ? 'dispositivo' : 'dispositivos'}`}
                </Text>

                <View style={styles.compactActionsRow}>
                  <TouchableOpacity
                    style={[styles.iconButton, !site.isActive && styles.iconButtonDisabled]}
                    onPress={() => onStartEdit(site)}
                    disabled={!site.isActive}
                    activeOpacity={0.7}
                    accessibilityLabel="Editar sitio"
                  >
                    <Icon
                      name="editar"
                      size={22}
                      color={!site.isActive ? colors.textMuted : undefined}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => onDeleteSite(site)}
                    activeOpacity={0.7}
                    accessibilityLabel="Eliminar sitio"
                  >
                    <Icon name="eliminar" size={22} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </>
  );
};
