// ==============================================================================
// Proyecto: BA Protege+
// Componente: CustomSitesSection (Gestión CRUD de Sitios Web y Apps Bloqueadas)
// Archivo: src/components/dashboard/sitios/CustomSitesSection.tsx
// Descripción: Orquestador modular de listas personalizadas de dominios web y
//              aplicaciones móviles con menú de opciones de 3 puntos (⋮),
//              filtrado por dispositivo, ordenamiento dinámico y acciones masivas.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CustomBlockedDomain, CustomBlockedApp, DeviceInfo } from '../../../types';
import { apiService } from '../../../services/api.service';
import { SitesTab } from './SitesTab';
import { AppsTab } from './AppsTab';
import { AddSiteModal } from './AddSiteModal';
import { EditSiteModal } from './EditSiteModal';
import { AddAppModal } from './AddAppModal';
import { styles } from './CustomSitesSection.styles';

interface CustomSitesSectionProps {
  customSites: CustomBlockedDomain[];
  devices: DeviceInfo[];
  onRefreshList: () => void;
  hideInternalFab?: boolean;
  onSetAddHandler?: (handler: () => void) => void;
}

export const CustomSitesSection: React.FC<CustomSitesSectionProps> = ({
  customSites,
  devices,
  onRefreshList,
  hideInternalFab = false,
  onSetAddHandler,
}) => {
  // Navegación de Sub-pestañas
  const [activeSubTab, setActiveSubTab] = useState<'sites' | 'apps'>('sites');

  // Menú de Opciones de 3 Puntos (⋮) e Visibilidad de Herramientas
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeviceFilter, setShowDeviceFilter] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Filtros y Ordenamiento
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'az'>('date');
  const [loadingSite, setLoadingSite] = useState(false);

  // Selecciones Múltiples para Acciones Masivas
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Estados de Sitios
  const [siteSearch, setSiteSearch] = useState('');
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState('Apuestas');
  const [newSiteApplyToAll, setNewSiteApplyToAll] = useState(true);
  const [newSiteDeviceIds, setNewSiteDeviceIds] = useState<string[]>([]);

  const [editingSite, setEditingSite] = useState<CustomBlockedDomain | null>(null);
  const [editSiteDomain, setEditSiteDomain] = useState('');
  const [editSiteCategory, setEditSiteCategory] = useState('Apuestas');
  const [editSiteApplyToAll, setEditSiteApplyToAll] = useState(true);
  const [editSiteDeviceIds, setEditSiteDeviceIds] = useState<string[]>([]);

  // Estados de Apps Bloqueadas
  const [customApps, setCustomApps] = useState<CustomBlockedApp[]>([]);
  const [appSearch, setAppSearch] = useState('');
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPackage, setNewAppPackage] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('Apuestas');
  const [newAppApplyToAll, setNewAppApplyToAll] = useState(true);
  const [newAppDeviceIds, setNewAppDeviceIds] = useState<string[]>([]);
  const [newAppDailyLimit, setNewAppDailyLimit] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadApps();
  }, [selectedDeviceFilter]);

  useEffect(() => {
    if (onSetAddHandler) {
      onSetAddHandler(() => {
        if (activeSubTab === 'sites') {
          setShowAddSiteModal(true);
        } else {
          setShowAddAppModal(true);
        }
      });
    }
  }, [activeSubTab, onSetAddHandler]);

  const loadApps = async () => {
    try {
      const listRes = await apiService.getCustomBlocklist();
      setCustomApps(listRes.data?.apps || []);
    } catch (e) {
      console.warn('Error al cargar aplicaciones bloqueadas:', e);
    }
  };

  const toggleDeviceSelection = (deviceId: string, isEditing: boolean = false) => {
    const setIds = isEditing ? setEditSiteDeviceIds : setNewSiteDeviceIds;
    const currentIds = isEditing ? editSiteDeviceIds : newSiteDeviceIds;
    const setApplyToAll = isEditing ? setEditSiteApplyToAll : setNewSiteApplyToAll;

    let updatedIds: string[];
    if (currentIds.includes(deviceId)) {
      updatedIds = currentIds.filter((id) => id !== deviceId);
    } else {
      updatedIds = [...currentIds, deviceId];
    }

    setIds(updatedIds);

    const totalDevices = devices.length + 1;
    if (updatedIds.length === totalDevices) {
      setApplyToAll(true);
      setIds([]);
    }
  };

  const handleAddSite = async () => {
    if (!newSiteDomain.trim()) {
      Alert.alert('Campo Requerido', 'Ingresa un dominio válido (ej. casino-ilegal.bet).');
      return;
    }
    setLoadingSite(true);
    try {
      await apiService.addCustomBlockedSite(
        newSiteDomain,
        newSiteCategory,
        newSiteApplyToAll,
        newSiteDeviceIds
      );
      setNewSiteDomain('');
      setNewSiteApplyToAll(true);
      setNewSiteDeviceIds([]);
      setShowAddSiteModal(false);
      onRefreshList();
      Alert.alert('🛡️ Sitio Bloqueado', 'Dominio agregado a tu lista de bloqueo.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo agregar el dominio.');
    } finally {
      setLoadingSite(false);
    }
  };

  const handleStartEditSite = (site: CustomBlockedDomain) => {
    setEditingSite(site);
    setEditSiteDomain(site.domain);
    setEditSiteCategory(site.category || 'Apuestas');
    setEditSiteApplyToAll(site.applyToAll !== false);
    setEditSiteDeviceIds(site.deviceIds || []);
  };

  const handleSaveEditSite = async () => {
    if (!editingSite) return;
    if (!editSiteDomain.trim()) {
      Alert.alert('Campo Requerido', 'El dominio no puede quedar vacío.');
      return;
    }
    setLoadingSite(true);
    try {
      await apiService.updateCustomBlockedSite(editingSite.id, {
        domain: editSiteDomain,
        category: editSiteCategory,
        applyToAll: editSiteApplyToAll,
        deviceIds: editSiteDeviceIds,
      });
      setEditingSite(null);
      onRefreshList();
      Alert.alert('✅ Sitio Actualizado', 'Los cambios fueron guardados.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el dominio.');
    } finally {
      setLoadingSite(false);
    }
  };

  const handleToggleSiteActive = async (site: CustomBlockedDomain) => {
    try {
      await apiService.updateCustomBlockedSite(site.id, {
        isActive: !site.isActive,
      });
      onRefreshList();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo cambiar el estado del bloqueo.');
    }
  };

  const handleDeleteSite = (site: CustomBlockedDomain) => {
    Alert.alert(
      'Eliminar Sitio Bloqueado',
      `¿Deseas desbloquear y eliminar permanentemente "${site.domain}" de tu lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCustomBlockedSite(site.id);
              onRefreshList();
              Alert.alert('Sitio Eliminado', `El dominio ${site.domain} fue eliminado.`);
            } catch (e: any) {
              Alert.alert('Error al eliminar', e.message || 'No se pudo eliminar el dominio.');
            }
          },
        },
      ]
    );
  };

  // Acciones Masivas para Sitios
  const handleToggleSelectSite = (id: string) => {
    setSelectedSiteIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAllSites = () => {
    if (selectedSiteIds.length === sortedAndFilteredSites.length) {
      setSelectedSiteIds([]);
    } else {
      setSelectedSiteIds(sortedAndFilteredSites.map((s) => s.id));
    }
  };

  const handleBulkActivateSites = async () => {
    for (const id of selectedSiteIds) {
      await apiService.updateCustomBlockedSite(id, { isActive: true });
    }
    setSelectedSiteIds([]);
    onRefreshList();
  };

  const handleBulkPauseSites = async () => {
    for (const id of selectedSiteIds) {
      await apiService.updateCustomBlockedSite(id, { isActive: false });
    }
    setSelectedSiteIds([]);
    onRefreshList();
  };

  const handleBulkDeleteSites = () => {
    Alert.alert(
      'Eliminar sitios seleccionados',
      `¿Deseas eliminar permanentemente los ${selectedSiteIds.length} sitios seleccionados?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todos',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedSiteIds) {
              await apiService.deleteCustomBlockedSite(id);
            }
            setSelectedSiteIds([]);
            onRefreshList();
          },
        },
      ]
    );
  };

  // Handlers para Apps
  const handleAddApp = async () => {
    if (!newAppName.trim()) {
      Alert.alert('Campo Requerido', 'Ingresa el nombre de la aplicación.');
      return;
    }
    setLoadingSite(true);
    try {
      const pkg = newAppPackage.trim() || `com.${newAppName.toLowerCase().replace(/\s+/g, '')}.app`;
      await apiService.addCustomBlockedApp(
        newAppName,
        pkg,
        newAppCategory,
        newAppApplyToAll,
        newAppDeviceIds,
        newAppDailyLimit
      );
      setNewAppName('');
      setNewAppPackage('');
      setNewAppApplyToAll(true);
      setNewAppDeviceIds([]);
      setNewAppDailyLimit(undefined);
      setShowAddAppModal(false);
      await loadApps();
      Alert.alert('🛡️ Aplicación bloqueada', 'La aplicación fue agregada a la lista de restricción.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo bloquear la aplicación.');
    } finally {
      setLoadingSite(false);
    }
  };

  const handleToggleAppActive = async (app: CustomBlockedApp) => {
    try {
      await apiService.updateCustomBlockedApp(app.id, {
        isActive: !app.isActive,
      });
      await loadApps();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo cambiar el estado del bloqueo.');
    }
  };

  const handleDeleteApp = (app: CustomBlockedApp) => {
    Alert.alert(
      'Eliminar aplicación bloqueada',
      `¿Deseas desbloquear y eliminar permanentemente "${app.appName}" de tu lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCustomBlockedApp(app.id);
              await loadApps();
              Alert.alert('Aplicación eliminada', `La aplicación ${app.appName} fue eliminada.`);
            } catch (e: any) {
              Alert.alert('Error al eliminar', e.message || 'No se pudo eliminar la aplicación.');
            }
          },
        },
      ]
    );
  };

  // Acciones Masivas para Apps
  const handleToggleSelectApp = (id: string) => {
    setSelectedAppIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAllApps = () => {
    if (selectedAppIds.length === sortedAndFilteredApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(sortedAndFilteredApps.map((a) => a.id));
    }
  };

  const handleBulkActivateApps = async () => {
    for (const id of selectedAppIds) {
      await apiService.updateCustomBlockedApp(id, { isActive: true });
    }
    setSelectedAppIds([]);
    await loadApps();
  };

  const handleBulkPauseApps = async () => {
    for (const id of selectedAppIds) {
      await apiService.updateCustomBlockedApp(id, { isActive: false });
    }
    setSelectedAppIds([]);
    await loadApps();
  };

  const handleBulkDeleteApps = () => {
    Alert.alert(
      'Eliminar aplicaciones seleccionadas',
      `¿Deseas eliminar permanentemente las ${selectedAppIds.length} aplicaciones seleccionadas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todas',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedAppIds) {
              await apiService.deleteCustomBlockedApp(id);
            }
            setSelectedAppIds([]);
            await loadApps();
          },
        },
      ]
    );
  };

  // Filtrado y Ordenamiento
  const filteredSites = customSites.filter((s) => {
    const matchesSearch = s.domain.toLowerCase().includes(siteSearch.toLowerCase());
    let matchesDevice = true;
    if (selectedDeviceFilter !== 'all') {
      matchesDevice = s.applyToAll ? true : s.deviceIds?.includes(selectedDeviceFilter) || false;
    }
    return matchesSearch && matchesDevice;
  });

  const sortedAndFilteredSites = [...filteredSites].sort((a, b) => {
    if (sortBy === 'az') return a.domain.localeCompare(b.domain);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredApps = customApps.filter((a) => {
    const matchesSearch =
      a.appName.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.packageName.toLowerCase().includes(appSearch.toLowerCase());
    let matchesDevice = true;
    if (selectedDeviceFilter !== 'all') {
      matchesDevice = a.applyToAll ? true : a.deviceIds?.includes(selectedDeviceFilter) || false;
    }
    return matchesSearch && matchesDevice;
  });

  const sortedAndFilteredApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'az') return a.appName.localeCompare(b.appName);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const quickAppSuggestions = [
    { name: 'Bet365', pkg: 'com.bet365.mobile', category: 'Apuestas' },
    { name: 'Pokerstars', pkg: 'com.pokerstars.mobile', category: 'Apuestas' },
    { name: 'TikTok', pkg: 'com.zhiliaoapp.musically', category: 'Redes sociales' },
    { name: 'Instagram', pkg: 'com.instagram.android', category: 'Redes sociales' },
    { name: 'Free Fire', pkg: 'com.dts.freefireth', category: 'Juegos' },
  ];

  return (
    <View style={styles.container}>
      {/* Selector de Sub-pestañas + Menú de 3 Puntos (⋮) */}
      <View style={styles.sectionTabRow}>
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.sectionTabBtn, activeSubTab === 'sites' && styles.sectionTabBtnActive]}
            onPress={() => setActiveSubTab('sites')}
          >
            <Text style={[styles.sectionTabText, activeSubTab === 'sites' && styles.sectionTabTextActive]}>
              🌐 Sitios web
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sectionTabBtn, activeSubTab === 'apps' && styles.sectionTabBtnActive]}
            onPress={() => setActiveSubTab('apps')}
          >
            <Text style={[styles.sectionTabText, activeSubTab === 'apps' && styles.sectionTabTextActive]}>
              📱 Aplicaciones
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón de Menú de 3 Puntos (⋮) */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={styles.optionsMenuButton}
            onPress={() => setShowOptionsMenu((prev) => !prev)}
            activeOpacity={0.7}
            accessibilityLabel="Opciones de gestión"
          >
            <Text style={styles.optionsMenuIcon}>⋮</Text>
          </TouchableOpacity>

          {/* Menú Desplegable Dinámico de 5 Opciones con Checkmarks */}
          {showOptionsMenu && (
            <View style={styles.optionsMenuDropdown}>
              <TouchableOpacity
                style={styles.optionsMenuItem}
                onPress={() => {
                  setShowDeviceFilter((prev) => !prev);
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={[styles.optionsMenuItemText, showDeviceFilter && styles.optionsMenuItemTextActive]}>
                  {showDeviceFilter ? '✓ 📱 Filtrar por dispositivo' : '📱 Filtrar por dispositivo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionsMenuItem}
                onPress={() => {
                  setShowSearchInput((prev) => !prev);
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={[styles.optionsMenuItemText, showSearchInput && styles.optionsMenuItemTextActive]}>
                  {showSearchInput ? '✓ 🔍 Buscar' : '🔍 Buscar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionsMenuItem}
                onPress={() => {
                  setSortBy('date');
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={[styles.optionsMenuItemText, sortBy === 'date' && styles.optionsMenuItemTextActive]}>
                  {sortBy === 'date' ? '✓ 📅 Ordenar por fecha' : '📅 Ordenar por fecha'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionsMenuItem}
                onPress={() => {
                  setSortBy('az');
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={[styles.optionsMenuItemText, sortBy === 'az' && styles.optionsMenuItemTextActive]}>
                  {sortBy === 'az' ? '✓ 🔤 Ordenar A-Z' : '🔤 Ordenar A-Z'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionsMenuItem}
                onPress={() => {
                  setIsSelectionMode((prev) => !prev);
                  setShowOptionsMenu(false);
                }}
              >
                <Text style={[styles.optionsMenuItemText, isSelectionMode && styles.optionsMenuItemTextActive]}>
                  {isSelectionMode ? '✓ ☑️ Selección múltiple' : '☑️ Selección múltiple'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Filtro por Dispositivo (Solo visible si el usuario lo activa en el menú ⋮) */}
      {showDeviceFilter && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filtrar por dispositivo:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, selectedDeviceFilter === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedDeviceFilter('all')}
            >
              <Text style={[styles.filterChipText, selectedDeviceFilter === 'all' && styles.filterChipTextActive]}>
                🌎 Todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, selectedDeviceFilter === 'self' && styles.filterChipActive]}
              onPress={() => setSelectedDeviceFilter('self')}
            >
              <Text style={[styles.filterChipText, selectedDeviceFilter === 'self' && styles.filterChipTextActive]}>
                📱 Mi dispositivo
              </Text>
            </TouchableOpacity>

            {devices.map((device) => (
              <TouchableOpacity
                key={device.deviceId}
                style={[styles.filterChip, selectedDeviceFilter === device.deviceId && styles.filterChipActive]}
                onPress={() => setSelectedDeviceFilter(device.deviceId)}
              >
                <Text style={[styles.filterChipText, selectedDeviceFilter === device.deviceId && styles.filterChipTextActive]}>
                  📱 {device.childName || device.deviceName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Vista de Sitios Web */}
      {activeSubTab === 'sites' && (
        <SitesTab
          siteSearch={siteSearch}
          onSearchChange={setSiteSearch}
          showSearchInput={showSearchInput}
          onHideSearch={() => setShowSearchInput(false)}
          isSelectionMode={isSelectionMode}
          sitesList={sortedAndFilteredSites}
          selectedIds={selectedSiteIds}
          onToggleSelect={handleToggleSelectSite}
          onSelectAll={handleSelectAllSites}
          onBulkActivate={handleBulkActivateSites}
          onBulkPause={handleBulkPauseSites}
          onBulkDelete={handleBulkDeleteSites}
          onToggleActive={handleToggleSiteActive}
          onStartEdit={handleStartEditSite}
          onDeleteSite={handleDeleteSite}
        />
      )}

      {/* Vista de Aplicaciones */}
      {activeSubTab === 'apps' && (
        <AppsTab
          appSearch={appSearch}
          onSearchChange={setAppSearch}
          showSearchInput={showSearchInput}
          onHideSearch={() => setShowSearchInput(false)}
          isSelectionMode={isSelectionMode}
          appsList={sortedAndFilteredApps}
          selectedIds={selectedAppIds}
          onToggleSelect={handleToggleSelectApp}
          onSelectAll={handleSelectAllApps}
          onBulkActivate={handleBulkActivateApps}
          onBulkPause={handleBulkPauseApps}
          onBulkDelete={handleBulkDeleteApps}
          onToggleActive={handleToggleAppActive}
          onDeleteApp={handleDeleteApp}
        />
      )}

      {/* Botón Flotante de Acción (FAB) '+' quando não estiver oculto */}
      {!hideInternalFab && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => (activeSubTab === 'sites' ? setShowAddSiteModal(true) : setShowAddAppModal(true))}
          activeOpacity={0.85}
          accessibilityLabel={activeSubTab === 'sites' ? 'Bloquear nuevo sitio' : 'Bloquear nueva aplicación'}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* Modales Encapsulados */}
      <AddSiteModal
        visible={showAddSiteModal}
        onClose={() => setShowAddSiteModal(false)}
        domain={newSiteDomain}
        onDomainChange={setNewSiteDomain}
        category={newSiteCategory}
        onCategoryChange={setNewSiteCategory}
        applyToAll={newSiteApplyToAll}
        onApplyToAllChange={setNewSiteApplyToAll}
        deviceIds={newSiteDeviceIds}
        devices={devices}
        onToggleDevice={(id) => toggleDeviceSelection(id, false)}
        loading={loadingSite}
        onSave={handleAddSite}
      />

      <EditSiteModal
        editingSite={editingSite}
        onClose={() => setEditingSite(null)}
        domain={editSiteDomain}
        onDomainChange={setEditSiteDomain}
        category={editSiteCategory}
        onCategoryChange={setEditSiteCategory}
        applyToAll={editSiteApplyToAll}
        onApplyToAllChange={setEditSiteApplyToAll}
        deviceIds={editSiteDeviceIds}
        devices={devices}
        onToggleDevice={(id) => toggleDeviceSelection(id, true)}
        loading={loadingSite}
        onSave={handleSaveEditSite}
      />

      <AddAppModal
        visible={showAddAppModal}
        onClose={() => setShowAddAppModal(false)}
        appName={newAppName}
        onAppNameChange={setNewAppName}
        quickSuggestions={quickAppSuggestions}
        onSelectSuggestion={(sug) => {
          setNewAppName(sug.name);
          setNewAppPackage(sug.pkg);
          setNewAppCategory(sug.category);
        }}
        category={newAppCategory}
        onCategoryChange={setNewAppCategory}
        applyToAll={newAppApplyToAll}
        onApplyToAllChange={setNewAppApplyToAll}
        deviceIds={newAppDeviceIds}
        devices={devices}
        onToggleDevice={(id) => {
          if (newAppDeviceIds.includes(id)) {
            setNewAppDeviceIds(newAppDeviceIds.filter((d) => d !== id));
          } else {
            setNewAppDeviceIds([...newAppDeviceIds, id]);
          }
        }}
        dailyLimitMinutes={newAppDailyLimit}
        onDailyLimitChange={setNewAppDailyLimit}
        loading={loadingSite}
        onSave={handleAddApp}
      />
    </View>
  );
};
