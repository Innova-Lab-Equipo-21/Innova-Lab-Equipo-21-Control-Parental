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
import { CustomBlockedDomain, CustomBlockedApp, DeviceInfo, SelfControlState } from '../../../types';
import { apiService } from '../../../services/api.service';
import { SitesTab } from './SitesTab';
import { AppsTab } from './AppsTab';
import { AddSiteModal } from './AddSiteModal';
import { EditSiteModal } from './EditSiteModal';
import { AddAppModal } from './AddAppModal';
import { EditAppModal } from './EditAppModal';
import { AppTimeLimitModal } from './AppTimeLimitModal';
import { SitesOptionsMenuModal } from './SitesOptionsMenuModal';
import { FabWithTooltip } from '../../FabWithTooltip';
import { isValidDomainOrUrl } from '../../../utils/deviceColors';
import { styles } from './CustomSitesSection.styles';

interface CustomSitesSectionProps {
  customSites: CustomBlockedDomain[];
  devices: DeviceInfo[];
  onRefreshList: () => void;
  selfControl?: SelfControlState;
  hideInternalFab?: boolean;
  onSetAddHandler?: (handler: () => void) => void;
}

export const CustomSitesSection: React.FC<CustomSitesSectionProps> = ({
  customSites,
  devices,
  onRefreshList,
  selfControl,
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
  const [newSiteApplyToAll, setNewSiteApplyToAll] = useState(false);
  const [newSiteDeviceIds, setNewSiteDeviceIds] = useState<string[]>([]);

  const [editingSite, setEditingSite] = useState<CustomBlockedDomain | null>(null);
  const [editSiteDomain, setEditSiteDomain] = useState('');
  const [editSiteCategory, setEditSiteCategory] = useState('Apuestas');
  const [editSiteApplyToAll, setEditSiteApplyToAll] = useState(false);
  const [editSiteDeviceIds, setEditSiteDeviceIds] = useState<string[]>([]);

  // Estados de Apps Bloqueadas
  const [customApps, setCustomApps] = useState<CustomBlockedApp[]>([]);
  const [appSearch, setAppSearch] = useState('');
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPackage, setNewAppPackage] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('Apuestas');
  const [newAppApplyToAll, setNewAppApplyToAll] = useState(false);
  const [newAppDeviceIds, setNewAppDeviceIds] = useState<string[]>([]);
  const [newAppDailyLimit, setNewAppDailyLimit] = useState<number | undefined>(undefined);
  const [newAppDeviceLimits, setNewAppDeviceLimits] = useState<Record<string, number | undefined>>({});

  const [editingApp, setEditingApp] = useState<CustomBlockedApp | null>(null);
  const [editAppName, setEditAppName] = useState('');
  const [editAppCategory, setEditAppCategory] = useState('Apuestas');
  const [editAppApplyToAll, setEditAppApplyToAll] = useState(false);
  const [editAppDeviceIds, setEditAppDeviceIds] = useState<string[]>([]);
  const [editAppDailyLimit, setEditAppDailyLimit] = useState<number | undefined>(undefined);

  const [timeLimitApp, setTimeLimitApp] = useState<CustomBlockedApp | null>(null);

  // Helper para obtener todos los IDs de dispositivos registrados (incluyendo 'self')
  const getAllDeviceIds = () => ['self', ...devices.map((d) => d.deviceId)];

  // Handlers para abrir modales con todos los toggles deshabilitados por defecto
  const handleOpenAddSite = () => {
    setNewSiteDomain('');
    setNewSiteCategory('Apuestas');
    setNewSiteApplyToAll(false);
    setNewSiteDeviceIds([]);
    setShowAddSiteModal(true);
  };

  const handleOpenAddApp = () => {
    setNewAppName('');
    setNewAppPackage('');
    setNewAppCategory('Apuestas');
    setNewAppApplyToAll(false);
    setNewAppDeviceIds([]);
    setNewAppDailyLimit(undefined);
    setNewAppDeviceLimits({});
    setShowAddAppModal(true);
  };

  const handleNewAppDeviceLimitChange = (deviceId: string, mins?: number) => {
    setNewAppDeviceLimits((prev) => ({
      ...prev,
      [deviceId]: mins,
    }));
  };

  const isAutocontrolActive = Boolean(
    selfControl?.active ||
    selfControl?.status === 'ACTIVE_LOCKED' ||
    selfControl?.status === 'DEACTIVATION_PENDING'
  );

  const appliesToSelf = (item?: { applyToAll?: boolean; deviceIds?: string[] } | null): boolean => {
    if (!item) return false;
    return item.applyToAll === true || (Array.isArray(item.deviceIds) && item.deviceIds.includes('self'));
  };

  // Handlers para Regla Global (al activar marca todos, al desactivar desmarca todos)
  const handleNewSiteApplyToAllChange = (val: boolean) => {
    setNewSiteApplyToAll(val);
    setNewSiteDeviceIds(val ? getAllDeviceIds() : []);
  };

  const handleNewAppApplyToAllChange = (val: boolean) => {
    setNewAppApplyToAll(val);
    setNewAppDeviceIds(val ? getAllDeviceIds() : []);
  };

  const handleEditSiteApplyToAllChange = (val: boolean) => {
    const wasAppliedToSelf = appliesToSelf(editingSite);
    setEditSiteApplyToAll(val);
    if (val) {
      setEditSiteDeviceIds(getAllDeviceIds());
    } else {
      setEditSiteDeviceIds(isAutocontrolActive && wasAppliedToSelf ? ['self'] : []);
    }
  };

  // Handlers para toggle individual de dispositivos (sincroniza con Regla Global)
  const handleToggleNewSiteDevice = (deviceId: string) => {
    const allIds = getAllDeviceIds();
    let updatedIds: string[];
    if (newSiteDeviceIds.includes(deviceId)) {
      updatedIds = newSiteDeviceIds.filter((id) => id !== deviceId);
    } else {
      updatedIds = [...newSiteDeviceIds, deviceId];
    }
    setNewSiteDeviceIds(updatedIds);
    setNewSiteApplyToAll(allIds.length > 0 && allIds.every((id) => updatedIds.includes(id)));
  };

  const handleToggleNewAppDevice = (deviceId: string) => {
    const allIds = getAllDeviceIds();
    let updatedIds: string[];
    if (newAppDeviceIds.includes(deviceId)) {
      updatedIds = newAppDeviceIds.filter((id) => id !== deviceId);
    } else {
      updatedIds = [...newAppDeviceIds, deviceId];
    }
    setNewAppDeviceIds(updatedIds);
    setNewAppApplyToAll(allIds.length > 0 && allIds.every((id) => updatedIds.includes(id)));
  };

  const handleToggleEditSiteDevice = (deviceId: string) => {
    const wasAppliedToSelf = appliesToSelf(editingSite);
    if (deviceId === 'self' && isAutocontrolActive && wasAppliedToSelf && editSiteDeviceIds.includes('self')) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés desactivar el bloqueo en tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
    const allIds = getAllDeviceIds();
    let updatedIds: string[];
    if (editSiteDeviceIds.includes(deviceId)) {
      updatedIds = editSiteDeviceIds.filter((id) => id !== deviceId);
    } else {
      updatedIds = [...editSiteDeviceIds, deviceId];
    }
    setEditSiteDeviceIds(updatedIds);
    setEditSiteApplyToAll(allIds.length > 0 && allIds.every((id) => updatedIds.includes(id)));
  };

  const handleEditAppApplyToAllChange = (val: boolean) => {
    const wasAppliedToSelf = appliesToSelf(editingApp);
    setEditAppApplyToAll(val);
    if (val) {
      setEditAppDeviceIds(getAllDeviceIds());
    } else {
      setEditAppDeviceIds(isAutocontrolActive && wasAppliedToSelf ? ['self'] : []);
    }
  };

  const handleToggleEditAppDevice = (deviceId: string) => {
    const wasAppliedToSelf = appliesToSelf(editingApp);
    if (deviceId === 'self' && isAutocontrolActive && wasAppliedToSelf && editAppDeviceIds.includes('self')) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés desactivar el bloqueo en tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
    const allIds = getAllDeviceIds();
    let updatedIds: string[];
    if (editAppDeviceIds.includes(deviceId)) {
      updatedIds = editAppDeviceIds.filter((id) => id !== deviceId);
    } else {
      updatedIds = [...editAppDeviceIds, deviceId];
    }
    setEditAppDeviceIds(updatedIds);
    setEditAppApplyToAll(allIds.length > 0 && allIds.every((id) => updatedIds.includes(id)));
  };

  useEffect(() => {
    loadApps();
  }, [selectedDeviceFilter]);

  useEffect(() => {
    if (onSetAddHandler) {
      onSetAddHandler(() => {
        if (activeSubTab === 'sites') {
          handleOpenAddSite();
        } else {
          handleOpenAddApp();
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

  const handleAddSite = async () => {
    if (!newSiteDomain.trim() || !isValidDomainOrUrl(newSiteDomain)) {
      Alert.alert('Dominio Inválido', 'Ingresa una dirección o dominio válido con extensión (ejemplo: casino-ilegal.bet o https://...).');
      return;
    }
    if (!newSiteApplyToAll && newSiteDeviceIds.length === 0) {
      Alert.alert('Dispositivo Requerido', 'Selecciona al menos un dispositivo o activa la regla global.');
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
      setNewSiteApplyToAll(false);
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
    const isGlobal = site.applyToAll !== false;
    setEditSiteApplyToAll(isGlobal);
    if (isGlobal) {
      setEditSiteDeviceIds(getAllDeviceIds());
    } else {
      setEditSiteDeviceIds(site.deviceIds || []);
    }
  };

  const handleSaveEditSite = async () => {
    if (!editingSite) return;
    if (!editSiteDomain.trim() || !isValidDomainOrUrl(editSiteDomain)) {
      Alert.alert('Dominio Inválido', 'Ingresa una dirección o dominio válido con extensión (ejemplo: casino-ilegal.bet).');
      return;
    }
    if (!editSiteApplyToAll && editSiteDeviceIds.length === 0) {
      Alert.alert('Dispositivo Requerido', 'Selecciona al menos un dispositivo o activa la regla global.');
      return;
    }
    const wasAppliedToSelf = appliesToSelf(editingSite);
    const willApplyToSelf = editSiteApplyToAll || editSiteDeviceIds.includes('self');
    if (isAutocontrolActive && wasAppliedToSelf && !willApplyToSelf) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés desactivar el bloqueo en tu propio dispositivo mientras el autocontrol esté activo.'
      );
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
    if (isAutocontrolActive && appliesToSelf(site) && site.isActive) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés deshabilitar ni pausar bloqueos aplicados a tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
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
    if (isAutocontrolActive && appliesToSelf(site)) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés eliminar sitios web bloqueados para tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
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
    const affectedSelf = selectedSiteIds.some((id) => {
      const site = customSites.find((s) => s.id === id);
      return site && appliesToSelf(site);
    });
    if (isAutocontrolActive && affectedSelf) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés pausar bloqueos aplicados a tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
    for (const id of selectedSiteIds) {
      await apiService.updateCustomBlockedSite(id, { isActive: false });
    }
    setSelectedSiteIds([]);
    onRefreshList();
  };

  const handleBulkDeleteSites = () => {
    const affectedSelf = selectedSiteIds.some((id) => {
      const site = customSites.find((s) => s.id === id);
      return site && appliesToSelf(site);
    });
    if (isAutocontrolActive && affectedSelf) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés eliminar sitios web bloqueados para tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
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
    if (!newAppApplyToAll && newAppDeviceIds.length === 0) {
      Alert.alert('Dispositivo Requerido', 'Selecciona al menos un dispositivo o activa la regla global.');
      return;
    }
    setLoadingSite(true);
    try {
      const pkg = newAppPackage.trim() || `com.${newAppName.toLowerCase().replace(/\s+/g, '')}.app`;
      // Extraer el primer límite definido para compatibilidad hacia atrás
      const definedLimits = Object.entries(newAppDeviceLimits)
        .filter(([id, val]) => newAppDeviceIds.includes(id) && val !== undefined)
        .map(([_, val]) => val);
      const fallbackLimit = definedLimits.length > 0 ? definedLimits[0] : newAppDailyLimit;

      await apiService.addCustomBlockedApp(
        newAppName,
        pkg,
        newAppCategory,
        newAppApplyToAll,
        newAppDeviceIds,
        fallbackLimit,
        newAppDeviceLimits
      );
      setNewAppName('');
      setNewAppPackage('');
      setNewAppApplyToAll(false);
      setNewAppDeviceIds([]);
      setNewAppDailyLimit(undefined);
      setNewAppDeviceLimits({});
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
    if (isAutocontrolActive && appliesToSelf(app) && app.isActive) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés deshabilitar ni pausar aplicaciones bloqueadas en tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
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
    if (isAutocontrolActive && appliesToSelf(app)) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés eliminar aplicaciones bloqueadas para tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
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

  const handleStartEditApp = (app: CustomBlockedApp) => {
    setEditingApp(app);
    setEditAppName(app.appName);
    setEditAppCategory(app.category || 'Apuestas');
    const isGlobal = app.applyToAll !== false;
    setEditAppApplyToAll(isGlobal);
    if (isGlobal) {
      setEditAppDeviceIds(getAllDeviceIds());
    } else {
      setEditAppDeviceIds(app.deviceIds || []);
    }
    setEditAppDailyLimit(app.dailyLimitMinutes);
  };

  const handleSaveEditApp = async () => {
    if (!editingApp) return;
    if (!editAppName.trim()) {
      Alert.alert('Campo Requerido', 'Ingresa el nombre de la aplicación.');
      return;
    }
    if (!editAppApplyToAll && editAppDeviceIds.length === 0) {
      Alert.alert('Dispositivo Requerido', 'Selecciona al menos un dispositivo o activa la regla global.');
      return;
    }
    const wasAppliedToSelf = appliesToSelf(editingApp);
    const willApplyToSelf = editAppApplyToAll || editAppDeviceIds.includes('self');
    if (isAutocontrolActive && wasAppliedToSelf && !willApplyToSelf) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés desactivar el bloqueo en tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
    setLoadingSite(true);
    try {
      await apiService.updateCustomBlockedApp(editingApp.id, {
        appName: editAppName,
        category: editAppCategory,
        applyToAll: editAppApplyToAll,
        deviceIds: editAppDeviceIds,
        dailyLimitMinutes: editAppDailyLimit,
      });
      setEditingApp(null);
      await loadApps();
      Alert.alert('✅ Aplicación Actualizada', 'Los cambios fueron guardados.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar la aplicación.');
    } finally {
      setLoadingSite(false);
    }
  };

  const handleStartTimeLimit = (app: CustomBlockedApp) => {
    setTimeLimitApp(app);
  };

  const handleSaveTimeLimit = async (limit?: number) => {
    if (!timeLimitApp) return;
    setLoadingSite(true);
    try {
      await apiService.updateCustomBlockedApp(timeLimitApp.id, {
        dailyLimitMinutes: limit,
      });
      const limitDesc = limit
        ? (limit >= 60 ? `${limit / 60}h diarias` : `${limit} min diarios`)
        : 'sin límite diario';
      setTimeLimitApp(null);
      await loadApps();
      Alert.alert('⏱️ Límite Actualizado', `Límite de ${timeLimitApp.appName} configurado (${limitDesc}).`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el límite de tiempo.');
    } finally {
      setLoadingSite(false);
    }
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
    const affectedSelf = selectedAppIds.some((id) => {
      const app = customApps.find((a) => a.id === id);
      return app && appliesToSelf(app);
    });
    if (isAutocontrolActive && affectedSelf) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés pausar aplicaciones bloqueadas en tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
    for (const id of selectedAppIds) {
      await apiService.updateCustomBlockedApp(id, { isActive: false });
    }
    setSelectedAppIds([]);
    await loadApps();
  };

  const handleBulkDeleteApps = () => {
    const affectedSelf = selectedAppIds.some((id) => {
      const app = customApps.find((a) => a.id === id);
      return app && appliesToSelf(app);
    });
    if (isAutocontrolActive && affectedSelf) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés eliminar aplicaciones bloqueadas en tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
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
          onStartEdit={handleStartEditApp}
        />
      )}

      {/* Botón Flotante de Acción (FAB) '+' con bocadillo explicativo dinámico */}
      {!hideInternalFab && (
        <FabWithTooltip
          label={activeSubTab === 'sites' ? 'Bloquear sitio' : 'Bloquear app'}
          onPress={() => (activeSubTab === 'sites' ? handleOpenAddSite() : handleOpenAddApp())}
        />
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
        onApplyToAllChange={handleNewSiteApplyToAllChange}
        deviceIds={newSiteDeviceIds}
        devices={devices}
        onToggleDevice={handleToggleNewSiteDevice}
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
        onApplyToAllChange={handleEditSiteApplyToAllChange}
        deviceIds={editSiteDeviceIds}
        devices={devices}
        onToggleDevice={handleToggleEditSiteDevice}
        loading={loadingSite}
        onSave={handleSaveEditSite}
      />

      <AddAppModal
        visible={showAddAppModal}
        onClose={() => setShowAddAppModal(false)}
        appName={newAppName}
        onAppNameChange={setNewAppName}
        onSelectSuggestion={(sug) => {
          setNewAppName(sug.name);
          setNewAppPackage(sug.pkg);
          setNewAppCategory(sug.category);
        }}
        category={newAppCategory}
        onCategoryChange={setNewAppCategory}
        applyToAll={newAppApplyToAll}
        onApplyToAllChange={handleNewAppApplyToAllChange}
        deviceIds={newAppDeviceIds}
        devices={devices}
        onToggleDevice={handleToggleNewAppDevice}
        dailyLimitMinutes={newAppDailyLimit}
        onDailyLimitChange={setNewAppDailyLimit}
        deviceLimits={newAppDeviceLimits}
        onDeviceLimitChange={handleNewAppDeviceLimitChange}
        loading={loadingSite}
        onSave={handleAddApp}
      />

      <EditAppModal
        editingApp={editingApp}
        onClose={() => setEditingApp(null)}
        appName={editAppName}
        onAppNameChange={setEditAppName}
        category={editAppCategory}
        onCategoryChange={setEditAppCategory}
        applyToAll={editAppApplyToAll}
        onApplyToAllChange={handleEditAppApplyToAllChange}
        deviceIds={editAppDeviceIds}
        devices={devices}
        onToggleDevice={handleToggleEditAppDevice}
        dailyLimitMinutes={editAppDailyLimit}
        onDailyLimitChange={setEditAppDailyLimit}
        loading={loadingSite}
        onSave={handleSaveEditApp}
      />

      <AppTimeLimitModal
        app={timeLimitApp}
        onClose={() => setTimeLimitApp(null)}
        loading={loadingSite}
        onSave={handleSaveTimeLimit}
      />

      <SitesOptionsMenuModal
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        showSearchInput={showSearchInput}
        onToggleSearch={() => setShowSearchInput((prev) => !prev)}
        showDeviceFilter={showDeviceFilter}
        onToggleDeviceFilter={() => setShowDeviceFilter((prev) => !prev)}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={() => setIsSelectionMode((prev) => !prev)}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
      />
    </View>
  );
};
