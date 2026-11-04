// ==============================================================================
// Proyecto: BA Protege+
// Componente: useAppsManagement (Hook de Lógica de Aplicaciones Bloqueadas)
// Archivo: src/components/dashboard/sitios/hooks/useAppsManagement.ts
// Descripción: Encapsula el estado, límites diarios de uso por dispositivo,
//              restricciones de autocontrol y operaciones CRUD/masivas para apps.
// ==============================================================================

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { CustomBlockedApp, DeviceInfo, SelfControlState } from '../../../../types';
import { apiService } from '../../../../services/api.service';

interface UseAppsManagementProps {
  devices: DeviceInfo[];
  onRefreshList: () => void;
  selfControl?: SelfControlState;
  selectedDeviceFilter: string;
  sortBy: 'date' | 'az';
  showFeedback: (config: { icon?: string; title: string; message: string }) => void;
  setItemToDelete: (item: { type: 'site' | 'app'; id: string; name: string } | null) => void;
}

export const useAppsManagement = ({
  devices,
  onRefreshList,
  selfControl,
  selectedDeviceFilter,
  sortBy,
  showFeedback,
  setItemToDelete,
}: UseAppsManagementProps) => {
  // Lista de apps y selección múltiple
  const [customApps, setCustomApps] = useState<CustomBlockedApp[]>([]);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Búsqueda y modal de creación
  const [appSearch, setAppSearch] = useState('');
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPackage, setNewAppPackage] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('Apuestas');
  const [newAppApplyToAll, setNewAppApplyToAll] = useState(false);
  const [newAppDeviceIds, setNewAppDeviceIds] = useState<string[]>([]);
  const [newAppDailyLimit, setNewAppDailyLimit] = useState<number | undefined>(undefined);
  const [newAppDeviceLimits, setNewAppDeviceLimits] = useState<Record<string, number | undefined>>({});

  // Modal de edición
  const [editingApp, setEditingApp] = useState<CustomBlockedApp | null>(null);
  const [editAppName, setEditAppName] = useState('');
  const [editAppCategory, setEditAppCategory] = useState('Apuestas');
  const [editAppApplyToAll, setEditAppApplyToAll] = useState(false);
  const [editAppDeviceIds, setEditAppDeviceIds] = useState<string[]>([]);
  const [editAppDailyLimit, setEditAppDailyLimit] = useState<number | undefined>(undefined);
  const [editAppDeviceLimits, setEditAppDeviceLimits] = useState<Record<string, number | undefined>>({});

  // Modal de límite de tiempo rápido
  const [timeLimitApp, setTimeLimitApp] = useState<CustomBlockedApp | null>(null);
  const [loadingApp, setLoadingApp] = useState(false);

  // Helpers de verificación
  const getAllDeviceIds = () => ['self', ...devices.map((d) => d.deviceId)];

  const isAutocontrolActive = Boolean(
    selfControl?.active ||
    selfControl?.status === 'ACTIVE_LOCKED' ||
    selfControl?.status === 'DEACTIVATION_PENDING'
  );

  const appliesToSelf = (item?: { applyToAll?: boolean; deviceIds?: string[] } | null): boolean => {
    if (!item) return false;
    return item.applyToAll === true || (Array.isArray(item.deviceIds) && item.deviceIds.includes('self'));
  };

  // Carga inicial y por cambio de filtro de dispositivo
  const loadApps = async () => {
    try {
      const listRes = await apiService.getCustomBlocklist();
      setCustomApps(listRes.data?.apps || []);
    } catch (e) {
      console.warn('Error al cargar aplicaciones bloqueadas:', e);
    }
  };

  useEffect(() => {
    loadApps();
  }, [selectedDeviceFilter]);

  // Apertura del modal de creación
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

  // Control del nombre de la app con reseteo de selección si queda vacío
  const handleNewAppNameChange = (text: string) => {
    setNewAppName(text);
    if (text.trim().length === 0) {
      setNewAppApplyToAll(false);
      setNewAppDeviceIds([]);
      setNewAppDailyLimit(undefined);
      setNewAppDeviceLimits({});
    }
  };

  // Regla global para nueva app
  const handleNewAppApplyToAllChange = (val: boolean) => {
    if (newAppName.trim().length === 0) return;
    setNewAppApplyToAll(val);
    setNewAppDeviceIds(val ? getAllDeviceIds() : []);
  };

  // Toggle individual de dispositivo para nueva app
  const handleToggleNewAppDevice = (deviceId: string) => {
    if (newAppName.trim().length === 0) return;
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

  const handleNewAppDeviceLimitChange = (deviceId: string, mins?: number) => {
    setNewAppDeviceLimits((prev) => ({
      ...prev,
      [deviceId]: mins,
    }));
  };

  // Crear nueva aplicación
  const handleAddApp = async () => {
    if (!newAppName.trim()) {
      Alert.alert('Campo Requerido', 'Ingresa el nombre de la aplicación.');
      return;
    }
    if (!newAppApplyToAll && newAppDeviceIds.length === 0) {
      Alert.alert('Dispositivo Requerido', 'Selecciona al menos un dispositivo o activa la regla global.');
      return;
    }
    setLoadingApp(true);
    try {
      const pkg = newAppPackage.trim() || `com.${newAppName.toLowerCase().replace(/\s+/g, '')}.app`;
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
      onRefreshList();
      showFeedback({
        icon: '🛡️',
        title: 'Aplicación bloqueada',
        message: 'La aplicación fue agregada a la lista de restricción.',
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo bloquear la aplicación.');
    } finally {
      setLoadingApp(false);
    }
  };

  // Iniciar edición de una app
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

    const initialLimits: Record<string, number | undefined> = {};
    if (app.deviceLimits) {
      Object.assign(initialLimits, app.deviceLimits);
    } else if (app.dailyLimitMinutes !== undefined) {
      (app.deviceIds || []).forEach((id) => {
        initialLimits[id] = app.dailyLimitMinutes;
      });
    }
    setEditAppDeviceLimits(initialLimits);
  };

  // Regla global en edición
  const handleEditAppApplyToAllChange = (val: boolean) => {
    const wasAppliedToSelf = appliesToSelf(editingApp);
    setEditAppApplyToAll(val);
    if (val) {
      setEditAppDeviceIds(getAllDeviceIds());
    } else {
      setEditAppDeviceIds(isAutocontrolActive && wasAppliedToSelf ? ['self'] : []);
    }
  };

  // Toggle individual en edición
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

  const handleEditAppDeviceLimitChange = (deviceId: string, mins?: number) => {
    setEditAppDeviceLimits((prev) => ({
      ...prev,
      [deviceId]: mins,
    }));
  };

  // Guardar edición de app
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
    setLoadingApp(true);
    try {
      const definedLimits = Object.entries(editAppDeviceLimits)
        .filter(([id, val]) => editAppDeviceIds.includes(id) && val !== undefined)
        .map(([_, val]) => val);
      const fallbackLimit = definedLimits.length > 0 ? definedLimits[0] : editAppDailyLimit;

      await apiService.updateCustomBlockedApp(editingApp.id, {
        appName: editAppName,
        category: editAppCategory,
        applyToAll: editAppApplyToAll,
        deviceIds: editAppDeviceIds,
        dailyLimitMinutes: fallbackLimit,
        deviceLimits: editAppDeviceLimits,
      });
      setEditingApp(null);
      await loadApps();
      showFeedback({
        icon: '✅',
        title: 'Aplicación actualizada',
        message: 'Los cambios fueron guardados.',
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar la aplicación.');
    } finally {
      setLoadingApp(false);
    }
  };

  // Guardar límite rápido
  const handleStartTimeLimit = (app: CustomBlockedApp) => {
    setTimeLimitApp(app);
  };

  const handleSaveTimeLimit = async (limit?: number) => {
    if (!timeLimitApp) return;
    setLoadingApp(true);
    try {
      await apiService.updateCustomBlockedApp(timeLimitApp.id, {
        dailyLimitMinutes: limit,
      });
      const limitDesc = limit
        ? (limit >= 60 ? `${limit / 60}h diarias` : `${limit} min diarios`)
        : 'sin límite diario';
      setTimeLimitApp(null);
      await loadApps();
      showFeedback({
        icon: '⏱️',
        title: 'Límite actualizado',
        message: `Límite de ${timeLimitApp.appName} configurado (${limitDesc}).`,
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el límite de tiempo.');
    } finally {
      setLoadingApp(false);
    }
  };

  // Toggle de activación individual
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
      onRefreshList();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo cambiar el estado del bloqueo.');
    }
  };

  // Iniciar eliminación de app
  const handleDeleteApp = (app: CustomBlockedApp) => {
    if (isAutocontrolActive && appliesToSelf(app)) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'No podés eliminar aplicaciones bloqueadas para tu propio dispositivo mientras el autocontrol esté activo.'
      );
      return;
    }
    setItemToDelete({
      type: 'app',
      id: app.id,
      name: app.appName,
    });
  };

  // Acciones masivas
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

  // Filtrado y ordenamiento de apps
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

  return {
    customApps,
    loadApps,
    appSearch,
    setAppSearch,
    showAddAppModal,
    setShowAddAppModal,
    newAppName,
    setNewAppName,
    newAppPackage,
    setNewAppPackage,
    newAppCategory,
    setNewAppCategory,
    newAppApplyToAll,
    newAppDeviceIds,
    newAppDailyLimit,
    setNewAppDailyLimit,
    newAppDeviceLimits,
    editingApp,
    setEditingApp,
    editAppName,
    editAppCategory,
    setEditAppCategory,
    editAppApplyToAll,
    editAppDeviceIds,
    editAppDeviceLimits,
    timeLimitApp,
    setTimeLimitApp,
    loadingApp,
    selectedAppIds,
    sortedAndFilteredApps,
    handleOpenAddApp,
    handleNewAppNameChange,
    handleNewAppApplyToAllChange,
    handleToggleNewAppDevice,
    handleNewAppDeviceLimitChange,
    handleAddApp,
    handleStartEditApp,
    handleEditAppApplyToAllChange,
    handleToggleEditAppDevice,
    handleEditAppDeviceLimitChange,
    handleSaveEditApp,
    handleStartTimeLimit,
    handleSaveTimeLimit,
    handleToggleAppActive,
    handleDeleteApp,
    handleToggleSelectApp,
    handleSelectAllApps,
    handleBulkActivateApps,
    handleBulkPauseApps,
    handleBulkDeleteApps,
  };
};
