// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoSitiosSection
// Archivo: src/components/dashboard/protected/adulto/AdultoSitiosSection.tsx
// Descripción: Sección "Sitios y apps" exclusiva del Modo Protegido Adulto.
//              Replica visualmente la vista de Sitios y apps del Modo Responsable,
//              sin Autoprotección, sin edición ni eliminación, con filtros
//              limitados a Buscar y Ordenar, e informando al incluir un elemento
//              que solo el responsable puede desactivarlo o eliminarlo.
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ImageSourcePropType,
} from 'react-native';
import { CustomBlockedApp, CustomBlockedDomain } from '../../../../types';
import { apiService } from '../../../../services/api.service';
import { protectionService } from '../../../../services/protection.service';
import { isValidDomainOrUrl, cleanDomainInput } from '../../../../utils/deviceColors';
import {
  ADULTO_APP_ADDED_FEEDBACK,
  ADULTO_APP_CARD_LOCK_NOTICE,
  ADULTO_SITE_CARD_LOCK_NOTICE,
  ADULTO_SITE_ADDED_FEEDBACK,
  AdultoSortOption,
  filterAndSortAdultoApps,
  filterAndSortAdultoSites,
  isItemVisibleForAdultoDevice,
} from '../../../../utils/adultoSitios';
import { Badge } from '../../../Badge';
import { FeedbackModal } from '../../../FeedbackModal';
import { FabWithTooltip } from '../../../FabWithTooltip';
import { colors } from '../../../../theme/colors';
import { AdultoSitiosOptionsModal } from './AdultoSitiosOptionsModal';
import { AdultoAddSiteModal } from './AdultoAddSiteModal';
import { AdultoAddAppModal } from './AdultoAddAppModal';
import { BOTI_ASSETS } from '../botAssets';
import { styles } from './AdultoSitiosSection.styles';

export interface AdultoSitiosSectionProps {
  customSites: CustomBlockedDomain[];
  customApps: CustomBlockedApp[];
  onRefreshList: () => void;
  sourceDeviceId?: string;
  adultName?: string;
  hideInternalFab?: boolean;
  initialSubTab?: 'sites' | 'apps';
  onSetAddHandler?: (handler: () => void) => void;
  onSubTabChange?: (subTab: 'sites' | 'apps') => void;
}

export const AdultoSitiosSection: React.FC<AdultoSitiosSectionProps> = ({
  customSites,
  customApps,
  onRefreshList,
  sourceDeviceId,
  adultName,
  hideInternalFab = false,
  initialSubTab = 'sites',
  onSetAddHandler,
  onSubTabChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sites' | 'apps'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Búsqueda y ordenamiento (únicos filtros permitidos para adulto protegido)
  const [siteSearch, setSiteSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');
  const [sortBy, setSortBy] = useState<AdultoSortOption>('date');

  // Modal de agregar sitio web
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [loadingSite, setLoadingSite] = useState(false);

  // Modal de agregar aplicación
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPackage, setNewAppPackage] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('Personalizado');
  const [loadingApp, setLoadingApp] = useState(false);

  // Modal estándar de retroalimentación con emociones de Boti
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    imageSource?: ImageSourcePropType;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleOpenAddSite = useCallback(() => {
    setNewSiteDomain('');
    setShowAddSiteModal(true);
  }, []);

  const handleOpenAddApp = useCallback(() => {
    setNewAppName('');
    setNewAppPackage('');
    setNewAppCategory('Personalizado');
    setShowAddAppModal(true);
  }, []);

  useEffect(() => {
    if (onSubTabChange) {
      onSubTabChange(activeSubTab);
    }
  }, [activeSubTab, onSubTabChange]);

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
  }, [activeSubTab, onSetAddHandler, handleOpenAddSite, handleOpenAddApp]);

  const targetDeviceId = sourceDeviceId || 'dev-adult-default';

  const handleAddSite = async () => {
    if (!newSiteDomain.trim() || !isValidDomainOrUrl(newSiteDomain)) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.triste,
        title: 'Dominio inválido',
        message:
          'Ingresá una dirección o dominio válido con extensión (ejemplo: casino-ilegal.bet o https://...).',
      });
      return;
    }

    const cleaned = cleanDomainInput(newSiteDomain);
    const isDuplicate = customSites.some(
      (existing) =>
        isItemVisibleForAdultoDevice(existing, sourceDeviceId) &&
        cleanDomainInput(existing.domain) === cleaned
    );
    if (isDuplicate) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.triste,
        title: 'Sitio ya bloqueado',
        message: 'Este sitio web ya se encuentra en tu lista de bloqueo.',
      });
      return;
    }

    setLoadingSite(true);
    try {
      await apiService.addCustomBlockedSite(
        cleaned,
        'Personalizado',
        false,
        [targetDeviceId],
        {
          createdBy: 'ADULTO_PROTEGIDO',
          createdByName: adultName,
          sourceDeviceId: targetDeviceId,
        }
      );
      protectionService.updateBlocklist(5, [cleaned]);
      setNewSiteDomain('');
      setShowAddSiteModal(false);
      onRefreshList();
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.feliz,
        title: ADULTO_SITE_ADDED_FEEDBACK.title,
        message: ADULTO_SITE_ADDED_FEEDBACK.message,
      });
    } catch (e: any) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.triste,
        title: 'No se pudo bloquear el sitio',
        message: e.message || 'No se pudo agregar el dominio.',
      });
    } finally {
      setLoadingSite(false);
    }
  };

  const handleAddApp = async () => {
    const trimmedName = newAppName.trim();
    if (!trimmedName) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.triste,
        title: 'Campo requerido',
        message: 'Ingresá o seleccioná el nombre de la aplicación.',
      });
      return;
    }

    const pkg =
      newAppPackage.trim() ||
      `com.${trimmedName.toLowerCase().replace(/\s+/g, '')}.app`;

    const isDuplicate = customApps.some(
      (existing) =>
        isItemVisibleForAdultoDevice(existing, sourceDeviceId) &&
        (existing.appName.trim().toLowerCase() === trimmedName.toLowerCase() ||
          (Boolean(pkg) && Boolean(existing.packageName) && existing.packageName.trim().toLowerCase() === pkg.toLowerCase()))
    );

    if (isDuplicate) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.triste,
        title: 'Aplicación ya bloqueada',
        message: 'Esta aplicación ya se encuentra en tu lista de bloqueo.',
      });
      return;
    }

    setLoadingApp(true);
    try {
      const pkg =
        newAppPackage.trim() ||
        `com.${trimmedName.toLowerCase().replace(/\s+/g, '')}.app`;
      await apiService.addCustomBlockedApp(
        trimmedName,
        pkg,
        newAppCategory,
        false,
        [targetDeviceId],
        undefined,
        undefined,
        {
          createdBy: 'ADULTO_PROTEGIDO',
          createdByName: adultName,
          sourceDeviceId: targetDeviceId,
        }
      );
      setNewAppName('');
      setNewAppPackage('');
      setNewAppCategory('Personalizado');
      setShowAddAppModal(false);
      onRefreshList();
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.feliz,
        title: ADULTO_APP_ADDED_FEEDBACK.title,
        message: ADULTO_APP_ADDED_FEEDBACK.message,
      });
    } catch (e: any) {
      setFeedbackModal({
        visible: true,
        imageSource: BOTI_ASSETS.triste,
        title: 'No se pudo bloquear la aplicación',
        message: e.message || 'No se pudo bloquear la aplicación.',
      });
    } finally {
      setLoadingApp(false);
    }
  };

  // Solo mostramos elementos activos aplicables al dispositivo del adulto protegido
  const activeSites = customSites.filter((s) =>
    isItemVisibleForAdultoDevice(s, sourceDeviceId)
  );
  const activeApps = customApps.filter((a) =>
    isItemVisibleForAdultoDevice(a, sourceDeviceId)
  );

  const visibleSites = filterAndSortAdultoSites(activeSites, siteSearch, sortBy);
  const visibleApps = filterAndSortAdultoApps(activeApps, appSearch, sortBy);

  const currentSearchValue = activeSubTab === 'sites' ? siteSearch : appSearch;
  const handleCurrentSearchChange = (text: string) => {
    if (activeSubTab === 'sites') {
      setSiteSearch(text);
    } else {
      setAppSearch(text);
    }
  };

  return (
    <View style={styles.container}>
      {/* Banner Informativo de Filtro Oficial LOTBA (idéntico al modo Responsable) */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerTitle}>🌐 Lista oficial LOTBA activa</Text>
        <Text style={styles.infoBannerText}>
          Bloqueamos de forma automática sitios y apps de apuestas ilegales no autorizados por LOTBA.
        </Text>
      </View>

      {/* NOTA: Sin fila de Autoprotección en Modo Protegido Adulto */}

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

        <TouchableOpacity
          style={styles.optionsMenuButton}
          onPress={() => setShowOptionsMenu(true)}
          activeOpacity={0.7}
          accessibilityLabel="Opciones de gestión"
        >
          <Text style={styles.optionsMenuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda visible en lista cuando hay texto filtrado */}
      {currentSearchValue.length > 0 && (
        <View style={styles.searchSortRow}>
          <TextInput
            style={styles.searchInputFlex}
            placeholder={
              activeSubTab === 'sites'
                ? '🔍 Buscar dominio...'
                : '🔍 Buscar aplicación...'
            }
            placeholderTextColor={colors.textSecondary}
            value={currentSearchValue}
            onChangeText={handleCurrentSearchChange}
          />
          <TouchableOpacity
            style={styles.clearSearchBtn}
            onPress={() => handleCurrentSearchChange('')}
            accessibilityLabel="Limpiar búsqueda"
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sub-pestaña: Sitios web (solo lectura: sin switch, sin editar, sin eliminar) */}
      {activeSubTab === 'sites' && (
        <>
          {visibleSites.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {siteSearch.trim().length > 0
                  ? 'No se encontraron sitios web que coincidan con tu búsqueda.'
                  : 'No tenés sitios personalizados bloqueados. Agregá los que quieras con el botón +.'}
              </Text>
            </View>
          ) : (
            visibleSites.map((site) => (
              <View key={site.id} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.itemTitleText} numberOfLines={1}>
                      {site.domain}
                    </Text>
                  </View>
                  <Badge status="activo" label="Bloqueado" />
                </View>

                <View style={styles.cardFooterRow}>
                  <Text style={styles.lockNoticeText}>
                    {ADULTO_SITE_CARD_LOCK_NOTICE}
                  </Text>
                </View>
              </View>
            ))
          )}
        </>
      )}

      {/* Sub-pestaña: Aplicaciones (solo lectura: sin switch, sin editar, sin eliminar) */}
      {activeSubTab === 'apps' && (
        <>
          {visibleApps.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {appSearch.trim().length > 0
                  ? 'No se encontraron aplicaciones que coincidan con tu búsqueda.'
                  : 'No tenés aplicaciones personalizadas bloqueadas. Agregá las que quieras con el botón +.'}
              </Text>
            </View>
          ) : (
            visibleApps.map((app) => (
              <View key={app.id} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.itemTitleText} numberOfLines={1}>
                      {app.appName}
                    </Text>
                  </View>
                  <Badge status="activo" label="Bloqueada" />
                </View>

                <View style={styles.cardFooterRow}>
                  <Text style={styles.lockNoticeText}>
                    {ADULTO_APP_CARD_LOCK_NOTICE}
                  </Text>
                </View>
              </View>
            ))
          )}
        </>
      )}

      {/* FAB interno opcional si no se gestiona desde ProtectedDeviceScreen */}
      {!hideInternalFab && (
        <FabWithTooltip
          label={activeSubTab === 'sites' ? 'Bloquear sitio' : 'Bloquear app'}
          onPress={() =>
            activeSubTab === 'sites' ? handleOpenAddSite() : handleOpenAddApp()
          }
        />
      )}

      {/* Modal Bottom Sheet de Opciones (solo Buscar y Ordenar) */}
      <AdultoSitiosOptionsModal
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        searchValue={currentSearchValue}
        onSearchChange={handleCurrentSearchChange}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
      />

      {/* Modal Bottom Sheet para Bloquear Sitio Web */}
      <AdultoAddSiteModal
        visible={showAddSiteModal}
        onClose={() => setShowAddSiteModal(false)}
        domain={newSiteDomain}
        onDomainChange={setNewSiteDomain}
        onSelectSuggestion={(sug) => {
          setNewSiteDomain(sug.domain);
        }}
        existingSites={customSites.filter((s) => isItemVisibleForAdultoDevice(s, sourceDeviceId))}
        loading={loadingSite}
        onSave={handleAddSite}
      />

      {/* Modal Bottom Sheet para Bloquear Aplicación */}
      <AdultoAddAppModal
        visible={showAddAppModal}
        onClose={() => setShowAddAppModal(false)}
        appName={newAppName}
        onAppNameChange={(text) => {
          setNewAppName(text);
          if (!text.trim()) {
            setNewAppPackage('');
            setNewAppCategory('Personalizado');
          }
        }}
        onSelectSuggestion={(sug) => {
          setNewAppName(sug.name);
          setNewAppPackage(sug.pkg);
          setNewAppCategory(sug.category);
        }}
        existingApps={customApps.filter((a) => isItemVisibleForAdultoDevice(a, sourceDeviceId))}
        loading={loadingApp}
        onSave={handleAddApp}
      />

      {/* Modal Estándar de Confirmación y Validación con emociones de Boti */}
      <FeedbackModal
        visible={feedbackModal.visible}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
};
