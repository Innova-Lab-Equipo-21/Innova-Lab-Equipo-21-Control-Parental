// ==============================================================================
// Proyecto: BA Protege+
// Componente: useSitesManagement (Hook de Lógica de Sitios Bloqueados)
// Archivo: src/components/dashboard/sitios/hooks/useSitesManagement.ts
// Descripción: Encapsula el estado, validaciones de dominio, restricciones de
//              autoprotección y operaciones CRUD/masivas para sitios web bloqueados.
// ==============================================================================

import { useState } from 'react';
import { Alert } from 'react-native';
import {
  BlockOriginFilter,
  CustomBlockedDomain,
  DeviceInfo,
  SelfControlState,
} from '../../../../types';
import { apiService } from '../../../../services/api.service';
import { isValidDomainOrUrl } from '../../../../utils/deviceColors';
import { matchesBlockOriginFilter } from '../../../../utils/adultoSitios';

interface UseSitesManagementProps {
  customSites: CustomBlockedDomain[];
  devices: DeviceInfo[];
  onRefreshList: () => void;
  selfControl?: SelfControlState;
  selectedDeviceFilter: string;
  selectedOriginFilter?: BlockOriginFilter;
  sortBy: 'date' | 'az';
  showFeedback: (config: { icon?: string; title: string; message: string }) => void;
  setItemToDelete: (item: { type: 'site' | 'app'; id: string; name: string } | null) => void;
}

export const useSitesManagement = ({
  customSites,
  devices,
  onRefreshList,
  selfControl,
  selectedDeviceFilter,
  selectedOriginFilter = 'all',
  sortBy,
  showFeedback,
  setItemToDelete,
}: UseSitesManagementProps) => {
  // Selección múltiple para acciones masivas
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);

  // Búsqueda y modal de creación
  const [siteSearch, setSiteSearch] = useState('');
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState('Apuestas');
  const [newSiteApplyToAll, setNewSiteApplyToAll] = useState(false);
  const [newSiteDeviceIds, setNewSiteDeviceIds] = useState<string[]>([]);

  // Modal de edición
  const [editingSite, setEditingSite] = useState<CustomBlockedDomain | null>(null);
  const [editSiteDomain, setEditSiteDomain] = useState('');
  const [editSiteCategory, setEditSiteCategory] = useState('Apuestas');
  const [editSiteApplyToAll, setEditSiteApplyToAll] = useState(false);
  const [editSiteDeviceIds, setEditSiteDeviceIds] = useState<string[]>([]);

  const [loadingSite, setLoadingSite] = useState(false);

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

  // Apertura del modal de creación
  const handleOpenAddSite = () => {
    setNewSiteDomain('');
    setNewSiteCategory('Apuestas');
    setNewSiteApplyToAll(false);
    setNewSiteDeviceIds([]);
    setShowAddSiteModal(true);
  };

  // Control del texto del dominio con reseteo de selección
  const handleNewSiteDomainChange = (text: string) => {
    setNewSiteDomain(text);
    if (text.trim().length === 0) {
      setNewSiteApplyToAll(false);
      setNewSiteDeviceIds([]);
    }
  };

  // Regla global para nuevo sitio
  const handleNewSiteApplyToAllChange = (val: boolean) => {
    if (newSiteDomain.trim().length === 0) return;
    setNewSiteApplyToAll(val);
    setNewSiteDeviceIds(val ? getAllDeviceIds() : []);
  };

  // Toggle individual de dispositivo para nuevo sitio
  const handleToggleNewSiteDevice = (deviceId: string) => {
    if (newSiteDomain.trim().length === 0) return;
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

  // Crear nuevo sitio
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
      showFeedback({
        icon: '🛡️',
        title: 'Sitio bloqueado',
        message: 'Dominio agregado a tu lista de bloqueo.',
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo agregar el dominio.');
    } finally {
      setLoadingSite(false);
    }
  };

  // Iniciar edición de un sitio
  const handleStartEditSite = (site: CustomBlockedDomain) => {
    setEditingSite(site);
    setEditSiteDomain(site.domain);
    setEditSiteCategory(site.category || 'Apuestas');
    const isGlobal = site.applyToAll !== false;
    setEditSiteApplyToAll(isGlobal);
    const availableIds = getAllDeviceIds();
    if (isGlobal) {
      setEditSiteDeviceIds(availableIds);
    } else {
      setEditSiteDeviceIds((site.deviceIds || []).filter((id) => availableIds.includes(id)));
    }
  };

  // Regla global en edición
  const handleEditSiteApplyToAllChange = (val: boolean) => {
    const wasAppliedToSelf = appliesToSelf(editingSite);
    setEditSiteApplyToAll(val);
    if (val) {
      setEditSiteDeviceIds(getAllDeviceIds());
    } else {
      setEditSiteDeviceIds(isAutocontrolActive && wasAppliedToSelf ? ['self'] : []);
    }
  };

  // Toggle individual en edición
  const handleToggleEditSiteDevice = (deviceId: string) => {
    const wasAppliedToSelf = appliesToSelf(editingSite);
    if (deviceId === 'self' && isAutocontrolActive && wasAppliedToSelf && editSiteDeviceIds.includes('self')) {
      Alert.alert(
        'Autoprotección del responsable activa',
        'No podés desactivar el bloqueo en tu propio dispositivo mientras la autoprotección esté activa.'
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

  // Guardar edición de sitio
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
        'Autoprotección del responsable activa',
        'No podés desactivar el bloqueo en tu propio dispositivo mientras la autoprotección esté activa.'
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
      showFeedback({
        icon: '✅',
        title: 'Sitio actualizado',
        message: 'Los cambios fueron guardados.',
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el dominio.');
    } finally {
      setLoadingSite(false);
    }
  };

  // Toggle de activación individual
  const handleToggleSiteActive = async (site: CustomBlockedDomain) => {
    if (isAutocontrolActive && appliesToSelf(site) && site.isActive) {
      Alert.alert(
        'Autoprotección del responsable activa',
        'No podés deshabilitar ni pausar bloqueos aplicados a tu propio dispositivo mientras la autoprotección esté activa.'
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

  // Iniciar eliminación de sitio
  const handleDeleteSite = (site: CustomBlockedDomain) => {
    if (isAutocontrolActive && appliesToSelf(site)) {
      Alert.alert(
        'Autoprotección del responsable activa',
        'No podés eliminar sitios web bloqueados para tu propio dispositivo mientras la autoprotección esté activa.'
      );
      return;
    }
    setItemToDelete({
      type: 'site',
      id: site.id,
      name: site.domain,
    });
  };

  // Acciones masivas
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
        'Autoprotección del responsable activa',
        'No podés pausar bloqueos aplicados a tu propio dispositivo mientras la autoprotección esté activa.'
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
        'Autoprotección del responsable activa',
        'No podés eliminar sitios web bloqueados para tu propio dispositivo mientras la autoprotección esté activa.'
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

  // Filtrado y ordenamiento de sitios
  const filteredSites = customSites.filter((s) => {
    const matchesSearch = s.domain.toLowerCase().includes(siteSearch.toLowerCase());
    let matchesDevice = true;
    if (selectedDeviceFilter !== 'all') {
      matchesDevice = s.applyToAll
        ? true
        : Boolean(
            s.deviceIds?.includes(selectedDeviceFilter) ||
              s.sourceDeviceId === selectedDeviceFilter
          );
    }
    const matchesOrigin = matchesBlockOriginFilter(s, selectedOriginFilter);
    return matchesSearch && matchesDevice && matchesOrigin;
  });

  const sortedAndFilteredSites = [...filteredSites].sort((a, b) => {
    if (sortBy === 'az') return a.domain.localeCompare(b.domain);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return {
    siteSearch,
    setSiteSearch,
    showAddSiteModal,
    setShowAddSiteModal,
    newSiteDomain,
    newSiteCategory,
    setNewSiteCategory,
    newSiteApplyToAll,
    newSiteDeviceIds,
    editingSite,
    setEditingSite,
    editSiteDomain,
    setEditSiteDomain,
    editSiteCategory,
    setEditSiteCategory,
    editSiteApplyToAll,
    editSiteDeviceIds,
    loadingSite,
    selectedSiteIds,
    sortedAndFilteredSites,
    handleOpenAddSite,
    handleNewSiteDomainChange,
    handleNewSiteApplyToAllChange,
    handleToggleNewSiteDevice,
    handleAddSite,
    handleStartEditSite,
    handleEditSiteApplyToAllChange,
    handleToggleEditSiteDevice,
    handleSaveEditSite,
    handleToggleSiteActive,
    handleDeleteSite,
    handleToggleSelectSite,
    handleSelectAllSites,
    handleBulkActivateSites,
    handleBulkPauseSites,
    handleBulkDeleteSites,
  };
};
