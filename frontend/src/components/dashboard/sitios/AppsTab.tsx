// ==============================================================================
// Proyecto: BA Protege+
// Componente: AppsTab (Sub-vista de Gestión de Apps Bloqueadas)
// Archivo: src/components/dashboard/sitios/AppsTab.tsx
// ==============================================================================

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Badge } from '../../Badge';
import { colors } from '../../../theme/colors';
import { CustomBlockedApp } from '../../../types';
import { styles } from './CustomSitesSection.styles';

interface AppsTabProps {
  appSearch: string;
  onSearchChange: (text: string) => void;
  showSearchInput?: boolean;
  onHideSearch?: () => void;
  isSelectionMode?: boolean;
  appsList: CustomBlockedApp[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onBulkActivate: () => void;
  onBulkPause: () => void;
  onBulkDelete: () => void;
  onToggleActive: (app: CustomBlockedApp) => void;
  onDeleteApp: (app: CustomBlockedApp) => void;
}

export const AppsTab: React.FC<AppsTabProps> = ({
  appSearch,
  onSearchChange,
  showSearchInput = false,
  onHideSearch,
  isSelectionMode = false,
  appsList,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onBulkActivate,
  onBulkPause,
  onBulkDelete,
  onToggleActive,
  onDeleteApp,
}) => {
  const allSelected = appsList.length > 0 && selectedIds.length === appsList.length;
  const selectedApps = appsList.filter((a) => selectedIds.includes(a.id));
  const hasPaused = selectedApps.some((a) => !a.isActive);
  const hasActive = selectedApps.some((a) => a.isActive);

  return (
    <>
      {/* Campo de búsqueda opcional cuando se activa mediante el menú de 3 puntos */}
      {(showSearchInput || appSearch.length > 0) && (
        <View style={styles.searchSortRow}>
          <TextInput
            style={styles.searchInputFlex}
            placeholder="🔍 Buscar aplicación..."
            placeholderTextColor={colors.textSecondary}
            value={appSearch}
            onChangeText={onSearchChange}
            autoFocus={showSearchInput}
            onBlur={() => {
              if (!appSearch.trim() && onHideSearch) {
                onHideSearch();
              }
            }}
          />
        </View>
      )}

      {/* Fila de Selección Múltiple (Solo visible en modo de selección) */}
      {isSelectionMode && appsList.length > 0 && (
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

      {appsList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No tienes aplicaciones bloqueadas. Agrega apps con el botón + flotante.
          </Text>
        </View>
      ) : (
        appsList.map((app) => {
          const isSelected = selectedIds.includes(app.id);

          return (
            <TouchableOpacity
              key={app.id}
              style={[styles.siteCard, isSelectionMode && isSelected && { borderColor: colors.primary, borderWidth: 1.5 }]}
              onPress={() => {
                if (isSelectionMode) onToggleSelect(app.id);
              }}
              activeOpacity={isSelectionMode ? 0.9 : 1}
            >
              <View style={styles.siteCardHeader}>
                {isSelectionMode && (
                  <TouchableOpacity
                    style={[styles.checkboxSquare, isSelected && styles.checkboxSquareChecked]}
                    onPress={() => onToggleSelect(app.id)}
                  >
                    {isSelected && <Text style={styles.checkboxCheckmark}>✓</Text>}
                  </TouchableOpacity>
                )}

                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.siteDomainText}>📱 {app.appName}</Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>{app.packageName}</Text>
                  {app.dailyLimitMinutes ? (
                    <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '600' }}>
                      ⏱️ Límite diario: {app.dailyLimitMinutes >= 60 ? `${app.dailyLimitMinutes / 60}h` : `${app.dailyLimitMinutes} min`}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      ⏱️ Límite: Indeterminado (Sin límite diario)
                    </Text>
                  )}
                </View>
                <Badge
                  status={app.isActive ? 'activo' : 'inactivo'}
                  label={app.isActive ? 'BLOQUEADO' : 'PAUSADO'}
                />
              </View>

              {/* Fila inferior compacta: Dispositivos aplicados a la izquierda y Acciones a la derecha */}
              <View style={styles.cardFooterRow}>
                <Text style={styles.deviceIndicatorText} numberOfLines={1}>
                  {app.applyToAll
                    ? '📱 Todos los dispositivos'
                    : `📱 Aplicado en ${app.deviceIds?.length || 0} dispositivo(s)`}
                </Text>

                <View style={styles.compactActionsRow}>
                  <TouchableOpacity
                    style={styles.iconActionButton}
                    onPress={() => onToggleActive(app)}
                    activeOpacity={0.7}
                    accessibilityLabel={app.isActive ? 'Pausar' : 'Reanudar'}
                  >
                    <Text style={styles.iconActionText}>{app.isActive ? '⏸️' : '▶️'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.iconActionButton, styles.deleteIconActionButton]}
                    onPress={() => onDeleteApp(app)}
                    activeOpacity={0.7}
                    accessibilityLabel="Eliminar"
                  >
                    <Text style={styles.iconActionText}>🗑️</Text>
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
