// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesAndAppsSection (Gestión de Sitios Web y Apps Bloqueadas)
// Archivo: src/components/dashboard/sitios/SitesAndAppsSection.tsx
// Descripción: Orquestador modular de listas personalizadas de dominios web y
//              aplicaciones móviles con opción de Autoprotección (toggle azul),
//              filtrado por dispositivo, ordenamiento dinámico y acciones masivas.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  BlockOriginFilter,
  CustomBlockedApp,
  CustomBlockedDomain,
  DeviceInfo,
  SelfControlState,
} from '../../../types';
import { apiService } from '../../../services/api.service';
import { ToggleSwitch } from '../../ToggleSwitch';
import { SitesTab } from './SitesTab';
import { AppsTab } from './AppsTab';
import { AddSiteModal } from './AddSiteModal';
import { EditSiteModal } from './EditSiteModal';
import { AddAppModal } from './AddAppModal';
import { EditAppModal } from './EditAppModal';
import { AppTimeLimitModal } from './AppTimeLimitModal';
import { SitesAppsOptionsMenuModal } from './SitesAppsOptionsMenuModal';
import { DeleteBlockItemModal } from './DeleteBlockItemModal';
import { FeedbackModal } from '../../FeedbackModal';
import { FabWithTooltip } from '../../FabWithTooltip';
import { useSitesManagement } from './hooks/useSitesManagement';
import { useAppsManagement } from './hooks/useAppsManagement';
import { Icon } from '../../Icon';
import {
  AUTOPROTECCION_EMPTY_LIST_MESSAGE,
  shouldShowAutoproteccionEmptyNotice,
  countItemsForResponsable,
} from '../../../utils/responsibleFirstAccess';
import { styles } from './SitesAndAppsSection.styles';

export interface SitesAndAppsSectionProps {
  customSites: CustomBlockedDomain[];
  customApps?: CustomBlockedApp[];
  devices: DeviceInfo[];
  onRefreshList: () => void;
  selfControl?: SelfControlState;
  onStartSelfControlFlow?: () => void;
  hideInternalFab?: boolean;
  onSetAddHandler?: (handler: () => void) => void;
  initialSubTab?: 'sites' | 'apps';
  onSubTabChange?: (subTab: 'sites' | 'apps') => void;
}

export const SitesAndAppsSection: React.FC<SitesAndAppsSectionProps> = ({
  customSites,
  customApps = [],
  devices,
  onRefreshList,
  selfControl,
  onStartSelfControlFlow,
  hideInternalFab = false,
  onSetAddHandler,
  initialSubTab = 'sites',
  onSubTabChange,
}) => {
  // Navegación de Sub-pestañas
  const [activeSubTab, setActiveSubTab] = useState<'sites' | 'apps'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
      onSubTabChange?.(initialSubTab);
    }
  }, [initialSubTab, onSubTabChange]);

  // Menú de opciones de 3 puntos (⋮) y herramientas
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeviceFilter, setShowDeviceFilter] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Filtros y ordenamiento
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<string>('all');
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<BlockOriginFilter>('all');
  const [sortBy, setSortBy] = useState<'date' | 'az'>('date');

  // Modal estándar de confirmación de eliminación
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'site' | 'app';
    id: string;
    name: string;
  } | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Modal estándar de retroalimentación / éxito / confirmación
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    icon?: string;
    imageSource?: any;
    title: string;
    message: string;
    buttonText?: string;
    secondaryButtonText?: string;
    onConfirm?: () => void;
    onSecondaryPress?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const showFeedback = (config: {
    icon?: string;
    imageSource?: any;
    title: string;
    message: string;
    buttonText?: string;
    secondaryButtonText?: string;
    onConfirm?: () => void;
    onSecondaryPress?: () => void;
  }) => {
    setFeedbackModal({
      visible: true,
      ...config,
    });
  };

  // Hook modular de gestión de sitios web
  const sites = useSitesManagement({
    customSites,
    devices,
    onRefreshList,
    selfControl,
    selectedDeviceFilter,
    selectedOriginFilter,
    sortBy,
    showFeedback,
    setItemToDelete,
  });

  // Hook modular de gestión de aplicaciones móviles
  const apps = useAppsManagement({
    initialApps: customApps,
    devices,
    onRefreshList,
    selfControl,
    selectedDeviceFilter,
    selectedOriginFilter,
    sortBy,
    showFeedback,
    setItemToDelete,
  });

  // Confirmación centralizada de eliminación
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setLoadingDelete(true);
    try {
      if (itemToDelete.type === 'site') {
        await apiService.deleteCustomBlockedSite(itemToDelete.id);
        setItemToDelete(null);
        onRefreshList();
      } else {
        await apiService.deleteCustomBlockedApp(itemToDelete.id);
        setItemToDelete(null);
        await apps.loadApps();
        onRefreshList();
      }
    } catch (e: any) {
      showFeedback({
        icon: '⚠️',
        title: 'Error al eliminar',
        message: e.message || 'No se pudo completar la eliminación.',
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  // Conexión con FAB externo si aplica
  useEffect(() => {
    if (onSetAddHandler) {
      onSetAddHandler(() => {
        if (activeSubTab === 'sites') {
          sites.handleOpenAddSite();
        } else {
          apps.handleOpenAddApp();
        }
      });
    }
  }, [activeSubTab, onSetAddHandler, sites.handleOpenAddSite, apps.handleOpenAddApp]);

  // Estado de Autoprotección del responsable
  const isAutoproteccionActive = Boolean(
    selfControl?.active ||
    selfControl?.status === 'ACTIVE_LOCKED' ||
    selfControl?.status === 'DEACTIVATION_PENDING' ||
    selfControl?.status === 'DEACTIVATION_READY'
  );

  // Verificación: habilitado solo si existe al menos un sitio o una app activa asignada al Responsable ("Mi dispositivo")
  const sitesForResponsableCount = countItemsForResponsable(customSites);
  const appsForResponsableCount = countItemsForResponsable(apps.customApps);
  const hasSitesOrAppsForResponsable = sitesForResponsableCount + appsForResponsableCount > 0;
  const isAutoproteccionDisabled = !isAutoproteccionActive && !hasSitesOrAppsForResponsable;
  const showEmptyAutoproteccionNotice = shouldShowAutoproteccionEmptyNotice(
    customSites.length,
    apps.customApps.length,
    isAutoproteccionActive
  );

  const handleAutoproteccionPress = () => {
    if (isAutoproteccionDisabled) {
      showFeedback({
        icon: '⚠️',
        title: 'Habilitá un sitio o aplicación',
        message:
          'Para activar la autoprotección, primero debés habilitar al menos un sitio web o aplicación para "Mi dispositivo".',
      });
      return;
    }
    if (onStartSelfControlFlow) {
      onStartSelfControlFlow();
    }
  };

  return (
    <View style={styles.container}>
      {/* Opción de Autoprotección en Sitios y Apps (Texto al lado del toggle azul oficial) */}
      <TouchableOpacity
        style={styles.autoprotectionRow}
        activeOpacity={0.8}
        onPress={handleAutoproteccionPress}
      >
        <Text style={styles.autoprotectionText}>Autoprotección</Text>
        <ToggleSwitch
          value={isAutoproteccionActive}
          onValueChange={handleAutoproteccionPress}
          disabled={isAutoproteccionDisabled}
          onDisabledPress={handleAutoproteccionPress}
        />
      </TouchableOpacity>

      {/* Aviso cuando la lista está vacía explicando el requisito para activar Autoprotección */}
      {showEmptyAutoproteccionNotice && (
        <View style={styles.autoprotectionEmptyNotice}>
          <Icon
            name="alerta"
            size={18}
            color="#B45309"
            style={styles.autoprotectionEmptyIcon}
          />
          <Text style={styles.autoprotectionEmptyText}>
            {AUTOPROTECCION_EMPTY_LIST_MESSAGE}
          </Text>
        </View>
      )}

      {/* Selector de Sub-pestañas + Menú de 3 Puntos (⋮) */}
      <View style={styles.sectionTabRow}>
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.sectionTabBtn, activeSubTab === 'sites' && styles.sectionTabBtnActive]}
            onPress={() => {
              setActiveSubTab('sites');
              onSubTabChange?.('sites');
            }}
          >
            <Text style={[styles.sectionTabText, activeSubTab === 'sites' && styles.sectionTabTextActive]}>
              🌐 Sitios web
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sectionTabBtn, activeSubTab === 'apps' && styles.sectionTabBtnActive]}
            onPress={() => {
              setActiveSubTab('apps');
              onSubTabChange?.('apps');
            }}
          >
            <Text style={[styles.sectionTabText, activeSubTab === 'apps' && styles.sectionTabTextActive]}>
              📱 Aplicaciones
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón de Menú de 3 Puntos (⋮) que abre el Bottom Sheet */}
        <TouchableOpacity
          style={styles.optionsMenuButton}
          onPress={() => setShowOptionsMenu(true)}
          activeOpacity={0.7}
          accessibilityLabel="Opciones de gestión"
        >
          <Text style={styles.optionsMenuIcon}>⋮</Text>
        </TouchableOpacity>
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

      {/* Indicador de filtro activo por origen con botón rápido para restablecer */}
      {selectedOriginFilter !== 'all' && (
        <View style={styles.activeOriginFilterBar}>
          <Text style={styles.activeOriginFilterText}>
            {selectedOriginFilter === 'adulto_protegido'
              ? 'Origen: Adulto protegido'
              : 'Origen: Responsable'}
          </Text>
          <TouchableOpacity
            style={styles.clearOriginFilterBtn}
            onPress={() => setSelectedOriginFilter('all')}
            accessibilityLabel="Quitar filtro de origen"
          >
            <Text style={styles.clearOriginFilterText}>Ver todos ✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vista de Sitios Web */}
      {activeSubTab === 'sites' && (
        <SitesTab
          siteSearch={sites.siteSearch}
          onSearchChange={sites.setSiteSearch}
          showSearchInput={showSearchInput}
          onHideSearch={() => setShowSearchInput(false)}
          isSelectionMode={isSelectionMode}
          sitesList={sites.sortedAndFilteredSites}
          devices={devices}
          originFilter={selectedOriginFilter}
          selectedIds={sites.selectedSiteIds}
          onToggleSelect={sites.handleToggleSelectSite}
          onSelectAll={sites.handleSelectAllSites}
          onBulkActivate={sites.handleBulkActivateSites}
          onBulkPause={sites.handleBulkPauseSites}
          onBulkDelete={sites.handleBulkDeleteSites}
          onToggleActive={sites.handleToggleSiteActive}
          onStartEdit={sites.handleStartEditSite}
          onDeleteSite={sites.handleDeleteSite}
        />
      )}

      {/* Vista de Aplicaciones */}
      {activeSubTab === 'apps' && (
        <AppsTab
          appSearch={apps.appSearch}
          onSearchChange={apps.setAppSearch}
          showSearchInput={showSearchInput}
          onHideSearch={() => setShowSearchInput(false)}
          isSelectionMode={isSelectionMode}
          appsList={apps.sortedAndFilteredApps}
          devices={devices}
          originFilter={selectedOriginFilter}
          selectedIds={apps.selectedAppIds}
          onToggleSelect={apps.handleToggleSelectApp}
          onSelectAll={apps.handleSelectAllApps}
          onBulkActivate={apps.handleBulkActivateApps}
          onBulkPause={apps.handleBulkPauseApps}
          onBulkDelete={apps.handleBulkDeleteApps}
          onToggleActive={apps.handleToggleAppActive}
          onDeleteApp={apps.handleDeleteApp}
          onStartEdit={apps.handleStartEditApp}
        />
      )}

      {/* Botón Flotante de Acción (FAB) '+' con bocadillo explicativo dinámico */}
      {!hideInternalFab && (
        <FabWithTooltip
          label={activeSubTab === 'sites' ? 'Bloquear sitio' : 'Bloquear app'}
          onPress={() => (activeSubTab === 'sites' ? sites.handleOpenAddSite() : apps.handleOpenAddApp())}
        />
      )}

      {/* Modales Encapsulados */}
      <AddSiteModal
        visible={sites.showAddSiteModal}
        onClose={() => sites.setShowAddSiteModal(false)}
        domain={sites.newSiteDomain}
        onDomainChange={sites.handleNewSiteDomainChange}
        onSelectSuggestion={(sug) => {
          sites.handleNewSiteDomainChange(sug.domain);
          sites.setNewSiteCategory(sug.category);
        }}
        category={sites.newSiteCategory}
        onCategoryChange={sites.setNewSiteCategory}
        applyToAll={sites.newSiteApplyToAll}
        onApplyToAllChange={sites.handleNewSiteApplyToAllChange}
        deviceIds={sites.newSiteDeviceIds}
        devices={devices}
        onToggleDevice={sites.handleToggleNewSiteDevice}
        existingSites={customSites}
        loading={sites.loadingSite}
        onSave={sites.handleAddSite}
      />

      <EditSiteModal
        editingSite={sites.editingSite}
        onClose={() => sites.setEditingSite(null)}
        domain={sites.editSiteDomain}
        onDomainChange={sites.setEditSiteDomain}
        category={sites.editSiteCategory}
        onCategoryChange={sites.setEditSiteCategory}
        applyToAll={sites.editSiteApplyToAll}
        onApplyToAllChange={sites.handleEditSiteApplyToAllChange}
        deviceIds={sites.editSiteDeviceIds}
        devices={devices}
        onToggleDevice={sites.handleToggleEditSiteDevice}
        loading={sites.loadingSite}
        onSave={sites.handleSaveEditSite}
      />

      <AddAppModal
        visible={apps.showAddAppModal}
        onClose={() => apps.setShowAddAppModal(false)}
        appName={apps.newAppName}
        onAppNameChange={apps.handleNewAppNameChange}
        onSelectSuggestion={(sug) => {
          apps.setNewAppName(sug.name);
          apps.setNewAppPackage(sug.pkg);
          apps.setNewAppCategory(sug.category);
        }}
        category={apps.newAppCategory}
        onCategoryChange={apps.setNewAppCategory}
        applyToAll={apps.newAppApplyToAll}
        onApplyToAllChange={apps.handleNewAppApplyToAllChange}
        deviceIds={apps.newAppDeviceIds}
        devices={devices}
        onToggleDevice={apps.handleToggleNewAppDevice}
        dailyLimitMinutes={apps.newAppDailyLimit}
        onDailyLimitChange={apps.setNewAppDailyLimit}
        deviceLimits={apps.newAppDeviceLimits}
        onDeviceLimitChange={apps.handleNewAppDeviceLimitChange}
        existingApps={apps.customApps}
        loading={apps.loadingApp}
        onSave={apps.handleAddApp}
      />

      <EditAppModal
        editingApp={apps.editingApp}
        onClose={() => apps.setEditingApp(null)}
        appName={apps.editAppName}
        category={apps.editAppCategory}
        onCategoryChange={apps.setEditAppCategory}
        applyToAll={apps.editAppApplyToAll}
        onApplyToAllChange={apps.handleEditAppApplyToAllChange}
        deviceIds={apps.editAppDeviceIds}
        devices={devices}
        onToggleDevice={apps.handleToggleEditAppDevice}
        deviceLimits={apps.editAppDeviceLimits}
        onDeviceLimitChange={apps.handleEditAppDeviceLimitChange}
        loading={apps.loadingApp}
        onSave={apps.handleSaveEditApp}
      />

      <AppTimeLimitModal
        app={apps.timeLimitApp}
        onClose={() => apps.setTimeLimitApp(null)}
        loading={apps.loadingApp}
        onSave={apps.handleSaveTimeLimit}
      />

      <SitesAppsOptionsMenuModal
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        searchValue={activeSubTab === 'sites' ? sites.siteSearch : apps.appSearch}
        onSearchChange={(text) => {
          if (activeSubTab === 'sites') {
            sites.setSiteSearch(text);
          } else {
            apps.setAppSearch(text);
          }
          if (text) setShowSearchInput(true);
        }}
        devices={devices}
        selectedDeviceFilter={selectedDeviceFilter}
        onSelectDeviceFilter={(deviceId) => {
          setSelectedDeviceFilter(deviceId);
          setShowDeviceFilter(true);
        }}
        selectedOriginFilter={selectedOriginFilter}
        onSelectOriginFilter={setSelectedOriginFilter}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={() => setIsSelectionMode((prev) => !prev)}
        showSearchInput={showSearchInput}
        onToggleSearch={() => setShowSearchInput((prev) => !prev)}
        showDeviceFilter={showDeviceFilter}
        onToggleDeviceFilter={() => setShowDeviceFilter((prev) => !prev)}
      />

      {/* Modal estándar de confirmación de eliminación */}
      <DeleteBlockItemModal
        visible={!!itemToDelete}
        type={itemToDelete?.type ?? null}
        itemName={itemToDelete?.name ?? ''}
        loading={loadingDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal estándar de retroalimentación / éxito / confirmación masiva */}
      <FeedbackModal
        visible={feedbackModal.visible}
        icon={feedbackModal.icon}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        buttonText={feedbackModal.buttonText}
        secondaryButtonText={feedbackModal.secondaryButtonText}
        onConfirm={async () => {
          const action = feedbackModal.onConfirm;
          setFeedbackModal((prev) => ({ ...prev, visible: false }));
          if (action) {
            await action();
          }
        }}
        onSecondaryPress={() => {
          const secondaryAction = feedbackModal.onSecondaryPress;
          setFeedbackModal((prev) => ({ ...prev, visible: false }));
          if (secondaryAction) {
            secondaryAction();
          }
        }}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
};
