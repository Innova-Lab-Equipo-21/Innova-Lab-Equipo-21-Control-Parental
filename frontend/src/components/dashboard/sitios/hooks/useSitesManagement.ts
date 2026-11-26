// ==============================================================================
// Proyecto: BA Protege+
// Componente: useSitesManagement (Hook de Lógica de Sitios Bloqueados)
// Archivo: src/components/dashboard/sitios/hooks/useSitesManagement.ts
// Descripción: Encapsula el estado, validaciones de dominio, restricciones de
//              autoprotección y operaciones CRUD/masivas para sitios web bloqueados.
// ==============================================================================

import { useState } from 'react';
import {
  BlockOriginFilter,
  CustomBlockedDomain,
  DeviceInfo,
  SelfControlState,
} from '../../../../types';
import { apiService } from '../../../../services/api.service';
import { isValidDomainOrUrl, cleanDomainInput } from '../../../../utils/deviceColors';
import { matchesBlockOriginFilter } from '../../../../utils/adultoSitios';
import { BOTITO_ASSETS } from '../../protected/botAssets';

interface UseSitesManagementProps {
  customSites: CustomBlockedDomain[];
  devices: DeviceInfo[];
  onRefreshList: () => void;
  selfControl?: SelfControlState;
  selectedDeviceFilter: string;
  selectedOriginFilter?: BlockOriginFilter;
  sortBy: 'date' | 'az';
  showFeedback: (config: {
    icon?: string;
    imageSource?: any;
    title: string;
    message: string;
    buttonText?: string;
    secondaryButtonText?: string;
    onConfirm?: () => void;
    onSecondaryPress?: () => void;
  }) => void;
  setItemToDelete: (item: { type: 'site' | 'app'; id: string; name: string } | null) => void;
  onExitSelectionMode?: () => void;
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
  onExitSelectionMode,
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
      showFeedback({
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Dominio inválido',
        message: 'Ingresa una dirección o dominio válido con extensión (ejemplo: casino-ilegal.bet o https://...).',
      });
      return;
    }

    const cleaned = cleanDomainInput(newSiteDomain);
    const isDuplicate = customSites.some(
      (site) => cleanDomainInput(site.domain) === cleaned
    );
    if (isDuplicate) {
      showFeedback({
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Sitio ya bloqueado',
        message: 'Este sitio web ya está en tu lista de bloqueo.',
      });
      return;
    }

    if (!newSiteApplyToAll && newSiteDeviceIds.length === 0) {
      showFeedback({
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Dispositivo requerido',
        message: 'Selecciona al menos un dispositivo o activa la regla global.',
      });
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
        imageSource: BOTITO_ASSETS.feliz,
        title: '¡Sitio bloqueado con éxito!',
        message: 'Sumamos el sitio a tu lista de bloqueo.',
        buttonText: 'Entendido',
      });
    } catch (e: any) {
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Error',
        message: e.message || 'No se pudo agregar el dominio.',
      });
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
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Autoprotección activa',
        message: 'No podés desactivar el bloqueo en tu propio dispositivo mientras la autoprotección esté activa.',
      });
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
      showFeedback({
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Dominio inválido',
        message: 'Ingresa una dirección o dominio válido con extensión (ejemplo: casino-ilegal.bet).',
      });
      return;
    }

    const cleaned = cleanDomainInput(editSiteDomain);
    const isDuplicate = customSites.some(
      (site) => site.id !== editingSite.id && cleanDomainInput(site.domain) === cleaned
    );
    if (isDuplicate) {
      showFeedback({
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Sitio ya bloqueado',
        message: 'Ya existe otro sitio web bloqueado con este dominio.',
      });
      return;
    }

    if (!editSiteApplyToAll && editSiteDeviceIds.length === 0) {
      showFeedback({
        imageSource: BOTITO_ASSETS.pensando,
        title: 'Dispositivo requerido',
        message: 'Selecciona al menos un dispositivo o activa la regla global.',
      });
      return;
    }
    const wasAppliedToSelf = appliesToSelf(editingSite);
    const willApplyToSelf = editSiteApplyToAll || editSiteDeviceIds.includes('self');
    if (isAutocontrolActive && wasAppliedToSelf && !willApplyToSelf) {
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Autoprotección activa',
        message: 'No podés desactivar el bloqueo en tu propio dispositivo mientras la autoprotección esté activa.',
      });
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
        imageSource: BOTITO_ASSETS.feliz,
        title: '¡Sitio actualizado con éxito!',
        message: 'Guardamos los cambios en tu lista de sitios bloqueados.',
      });
    } catch (e: any) {
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Error',
        message: e.message || 'No se pudo actualizar el dominio.',
      });
    } finally {
      setLoadingSite(false);
    }
  };

  // Toggle de activación individual
  const handleToggleSiteActive = async (site: CustomBlockedDomain) => {
    if (isAutocontrolActive && appliesToSelf(site) && site.isActive) {
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Autoprotección activa',
        message: 'No podés deshabilitar ni pausar bloqueos aplicados a tu propio dispositivo mientras la autoprotección esté activa.',
      });
      return;
    }
    try {
      await apiService.updateCustomBlockedSite(site.id, {
        isActive: !site.isActive,
      });
      onRefreshList();
    } catch (e: any) {
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Error',
        message: e.message || 'No se pudo cambiar el estado del bloqueo.',
      });
    }
  };

  // Iniciar eliminación de sitio
  const handleDeleteSite = (site: CustomBlockedDomain) => {
    if (isAutocontrolActive && appliesToSelf(site)) {
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Autoprotección activa',
        message: 'No podés eliminar sitios web bloqueados para tu propio dispositivo mientras la autoprotección esté activa.',
      });
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
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Autoprotección activa',
        message: 'No podés pausar bloqueos aplicados a tu propio dispositivo mientras la autoprotección esté activa.',
      });
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
      showFeedback({
        imageSource: BOTITO_ASSETS.nervioso,
        title: 'Autoprotección activa',
        message: 'No podés eliminar sitios web bloqueados para tu propio dispositivo mientras la autoprotección esté activa.',
      });
      return;
    }
    showFeedback({
      imageSource: BOTITO_ASSETS.pensando,
      title: 'Eliminar sitios seleccionados',
      message: `¿Deseas eliminar permanentemente los ${selectedSiteIds.length} sitios seleccionados?`,
      buttonText: 'Eliminar todos',
      secondaryButtonText: 'Cancelar',
      onConfirm: async () => {
        for (const id of selectedSiteIds) {
          await apiService.deleteCustomBlockedSite(id);
        }
        setSelectedSiteIds([]);
        onRefreshList();
      },
    });
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
