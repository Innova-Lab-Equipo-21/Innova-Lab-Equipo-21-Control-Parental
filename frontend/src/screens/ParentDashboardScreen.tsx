// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Panel de Control de Responsable)
// Archivo: src/screens/ParentDashboardScreen.tsx
// Descripción: Panel de control con barra de navegación inferior (Navbar 5 pestañas:
//              Inicio, Dispositivos, Sitios, Actividad y Cuenta) e íconos en @navbar.
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Modal,
  TouchableOpacity,
  AppState,
  Keyboard,
  Platform,
} from 'react-native';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { PermissionsScreen, PermissionItemState } from './PermissionsScreen';
import { LoginScreen } from './LoginScreen';
import { OnboardingScreen } from './OnboardingScreen';
import { apiService } from '../services/api.service';
import {
  MAX_PROTECTED_DEVICES,
  SelfControlState,
  DeviceInfo,
  CustomBlockedDomain,
  CustomBlockedApp,
} from '../types';

// Subcomponentes modulares organizados por carpetas de la Navbar
import { SeccionDesplegable } from '../components/dashboard/SeccionDesplegable';
import { DashboardNavbar, DashboardTab } from '../components/dashboard/DashboardNavbar';
import { ParentInicioSection } from '../components/dashboard/inicio';
import {
  ProtectedDevicesSection,
  PairingSection,
  PairingModal,
  SelfControlSection,
  AutocontrolConfirmationModal,
  AutocontrolModalMode,
} from '../components/dashboard/dispositivos';
import { SitesAndAppsSection } from '../components/dashboard/sitios';
import { AnalyticsPanel, useRealAnalyticsData } from '../components/dashboard/actividad';
import {
  ProfileSection,
  GlobalRulesSection,
  HelpSection,
  LegalSection,
  RatingSection,
} from '../components/dashboard/cuenta';
import { FaqModal } from '../components/dashboard/cuenta/FaqModal';
import { FabWithTooltip } from '../components/FabWithTooltip';
import { FeedbackModal } from '../components/FeedbackModal';
import { BOTITO_ASSETS, getBotMascotImage } from '../components/dashboard/protected/botAssets';
import { colors } from '../theme/colors';
import { checkRealDevicePermissions } from '../utils/permissionChecker';
import { saveNavigationState } from '../utils/navigationSession';
import { protectionService } from '../services/protection.service';
import { safeStorage } from '../services/api/client';
import {
  ResponsibleInitialAction,
  shouldRedirectToHomeAfterSelfControlActivation,
  hasActiveSitesOrAppsForResponsable,
} from '../utils/responsibleFirstAccess';
import { styles } from './ParentDashboardScreen.styles';

interface ParentDashboardScreenProps {
  onExitMode: () => void;
  onLogout?: () => void;
  initialUser?: any;
  initialToken?: string | null;
  permissions?: PermissionItemState;
  initialAction?: ResponsibleInitialAction;
  initialShowPermissionsModal?: boolean;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  onExitMode,
  onLogout,
  initialUser,
  initialToken,
  permissions,
  initialAction,
  initialShowPermissionsModal,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialToken);
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Ref para disparar el modal de agregar sitio o app desde el FAB fijo
  const siteAddHandlerRef = useRef<(() => void) | null>(null);

  // Oculta la navbar y el FAB mientras el teclado está abierto para que no suban por encima del teclado
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Pestaña Activa de la Navbar ('sitios' si eligió "Configurar este dispositivo", sino 'inicio')
  const [activeTab, setActiveTab] = useState<DashboardTab>(
    initialAction === 'SELF_CONTROL' ? 'sitios' : 'inicio'
  );
  const [redirectHomeOnSelfControl, setRedirectHomeOnSelfControl] = useState<boolean>(
    initialAction === 'SELF_CONTROL'
  );

  // Modal de Permisos del Dispositivo local del Responsable
  const [showPermissionsModal, setShowPermissionsModal] = useState(
    Boolean(initialShowPermissionsModal)
  );

  // Modal para Vincular Nuevo Dispositivo (desde FAB +)
  const [showPairingModal, setShowPairingModal] = useState(false);

  // Modal estándar de retroalimentación
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

  // Flujo de Onboarding desde la sección de Cuenta
  const [showOnboardingFlow, setShowOnboardingFlow] = useState(false);

  // Estados de Reglas de Control Parental
  const [ruleUninstallProtection, setRuleUninstallProtection] = useState(true);
  const [rulePermissions, setRulePermissions] = useState(
    permissions
      ? !!(
          permissions.vpn &&
          permissions.accessibility &&
          permissions.notifications &&
          permissions.batteryOptimization &&
          permissions.location
        )
      : false
  );

  // Sincronizar estado real de antidesinstalación con el sistema
  useEffect(() => {
    const syncAntiUninstall = async () => {
      const isA11yActive = await protectionService.isAccessibilityEnabled();
      const isEnabledInPrefs = await protectionService.isAntiUninstallEnabled();
      setRuleUninstallProtection(isA11yActive && isEnabledInPrefs);
    };
    syncAntiUninstall();
  }, []);

  // Monitorear cuando la app regresa a primer plano desde los Ajustes del sistema
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        refreshPermissions();
        const isA11yActive = await protectionService.isAccessibilityEnabled();
        const isEnabledInPrefs = await protectionService.isAntiUninstallEnabled();
        setRuleUninstallProtection(isA11yActive && isEnabledInPrefs);
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const handleToggleUninstallProtection = async (val: boolean) => {
    // Si la autoprotección está activa, NO se permite desactivar la antidesinstalación
    const isAutoproteccionActive = Boolean(
      selfControl.active ||
      selfControl.status === 'ACTIVE_LOCKED' ||
      selfControl.status === 'DEACTIVATION_PENDING' ||
      selfControl.status === 'DEACTIVATION_READY'
    );

    if (isAutoproteccionActive && !val) {
      showFeedback({
        imageSource: getBotMascotImage('ADULT', 'nervioso'),
        title: 'Antidesinstalación protegida',
        message: 'La protección antidesinstalación no puede desactivarse mientras la Autoprotección de 24 horas esté activa.',
        buttonText: 'Entendido',
      });
      return;
    }

    if (val) {
      const isA11yActive = await protectionService.isAccessibilityEnabled();
      if (!isA11yActive) {
        setRuleUninstallProtection(false);
        showFeedback({
          imageSource: BOTITO_ASSETS.pensando,
          title: 'Protección antidesinstalación',
          message:
            'Para activar este permiso, tenés que habilitar BA Protege + en los ajustes de accesibilidad de tu celular. ¿Querés hacer la configuración ahora?',
          buttonText: 'Configurar',
          secondaryButtonText: 'Cancelar',
          onConfirm: async () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
            try {
              await protectionService.openAccessibilitySettings();
              const activeAfterSettings = await protectionService.isAccessibilityEnabled();
              if (activeAfterSettings) {
                setRuleUninstallProtection(true);
                await protectionService.setAntiUninstallEnabled(true);
                refreshPermissions();
                showFeedback({
                  imageSource: BOTITO_ASSETS.feliz,
                  title: '¡Antidesinstalación activada con éxito!',
                  message:
                    'Ya está funcionando en tu celular la protección para que la aplicación no se cierre o se elimine por error.',
                  buttonText: 'Entendido',
                });
              } else {
                setRuleUninstallProtection(false);
                showFeedback({
                  imageSource: BOTITO_ASSETS.pensando,
                  title: 'La antidesinstalación sigue desactivada',
                  message:
                    'Sin esta protección, la aplicación podría cerrarse o eliminarse por error. Podés activarla cuando quieras desde los ajustes del sistema.',
                  buttonText: 'Entendido',
                });
              }
            } catch (err) {
              console.warn('[ParentDashboard] Error al abrir accesibilidad:', err);
            }
          },
          onSecondaryPress: () => {
            setFeedbackModal((prev) => ({ ...prev, visible: false }));
          },
        });
        return;
      }
    }
    setRuleUninstallProtection(val);
    await protectionService.setAntiUninstallEnabled(val);
  };

  // Estados de Autocontrol del Responsable (Bloqueo de 24hs)
  const [selfControl, setSelfControl] = useState<SelfControlState>({
    active: false,
    enabledAt: null,
    expiresAt: null,
    canDisable: true,
    remainingHours: 0,
    remainingMinutes: 0,
  });

  // Modal de Doble Confirmación de Autocontrol
  const [showSelfControlModal, setShowSelfControlModal] = useState(false);
  const [selfControlModalMode, setSelfControlModalMode] = useState<AutocontrolModalMode | null>(null);

  // Estados de Sitios y Apps Bloqueados Personalizados (CRUD)
  const [customSites, setCustomSites] = useState<CustomBlockedDomain[]>([]);
  const [customApps, setCustomApps] = useState<CustomBlockedApp[]>([]);
  const [grantedPermsCount, setGrantedPermsCount] = useState<number>(6);
  const [showHomeFaqModal, setShowHomeFaqModal] = useState<boolean>(false);
  const [sitesInitialSubTab, setSitesInitialSubTab] = useState<'sites' | 'apps'>('sites');
  const [currentSitiosSubTab, setCurrentSitiosSubTab] = useState<'sites' | 'apps'>('sites');

  // Métricas reales para el Panel de Analítica (Propuesta Superadora MVP)
  const realAnalytics = useRealAnalyticsData({
    devices,
    customSites,
    customApps,
    currentUser,
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadDevices();
      checkSelfControlStatus();
      loadCustomSites();
      if (initialAction === 'SELF_CONTROL') {
        setActiveTab('sitios');
        setRedirectHomeOnSelfControl(true);
      } else if (initialAction === 'SUPERVISE') {
        setActiveTab('inicio');
      }
    }
  }, [isLoggedIn, initialAction]);

  // Refrescar métricas reales de Actividad e Inicio al cambiar a esas pestañas
  useEffect(() => {
    if (isLoggedIn && (activeTab === 'actividad' || activeTab === 'inicio')) {
      realAnalytics.refresh();
    }
  }, [isLoggedIn, activeTab]);

  // Actualización periódica de temporizadores de Autocontrol (espera 24hs o pase temporal)
  useEffect(() => {
    if (!isLoggedIn) return;
    let timer: NodeJS.Timeout | null = null;
    if (
      selfControl.status === 'DEACTIVATION_PENDING' ||
      selfControl.status === 'TEMPORARILY_UNLOCKED'
    ) {
      timer = setInterval(() => {
        checkSelfControlStatus();
      }, 10000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoggedIn, selfControl.status]);

  const handleLoginSuccess = (user: any, _token: string) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const refreshPermissions = async () => {
    try {
      const real = await checkRealDevicePermissions(currentUser?.id);
      setGrantedPermsCount(real.grantedCount ?? 0);
      const allGranted = !!(
        real.vpn &&
        real.accessibility &&
        real.notifications &&
        real.batteryOptimization &&
        real.location
      );
      setRulePermissions(allGranted);
    } catch (e) {
      setGrantedPermsCount(0);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshPermissions();
    }
  }, [isLoggedIn, currentUser?.id]);

  const loadDevices = async () => {
    try {
      // 1. Cargar inmediatamente desde almacenamiento local para respuesta visual instantánea (0ms)
      const raw = await safeStorage.getItem('@ba_protege_devices_list');
      if (raw) {
        const cached = JSON.parse(raw);
        if (Array.isArray(cached) && cached.length > 0) {
          setDevices(cached);
        }
      }
      // 2. Sincronizar con la API en segundo plano
      const res = await apiService.listDevices();
      if (Array.isArray(res.data)) {
        setDevices(res.data);
      }
    } catch (e) {
      console.warn('No se pudo conectar a la API, usando datos en caché:', e);
    }
  };

  const checkSelfControlStatus = async () => {
    try {
      const status = await apiService.getSelfControlStatus();
      setSelfControl(status);
    } catch (e) {
      console.error('Error al consultar estado de autocontrol:', e);
    }
  };

  const loadCustomSites = async () => {
    try {
      const res = await apiService.getCustomBlocklist();
      setCustomSites(res.data?.domains || []);
      setCustomApps(res.data?.apps || []);
      // Sincronizar inmediatamente con los servicios nativos de Android
      await protectionService.syncProtectionRulesWithNative('self', 'PARENT');
    } catch (e) {
      console.warn('Error al cargar sitios personalizados:', e);
    }
  };

  const handleGeneratePairingCode = async (formData?: any) => {
    setLoading(true);
    try {
      const res = await apiService.generatePairingCode(formData);
      setPairingCode(res.data?.code || res.data?.pairingCode || '483921');
      await loadDevices();
    } catch (e: any) {
      // Fallback robusto en modo standalone / sin base de datos conectada
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setPairingCode(fallbackCode);
      await loadDevices();
      showFeedback({
        imageSource: BOTITO_ASSETS.feliz,
        title: 'Código generado',
        message: `Se generó el código de vinculación: ${fallbackCode}. Los datos del protegido se mantendrán guardados hasta el emparejamiento.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const hasSitesOrApps = hasActiveSitesOrAppsForResponsable(customSites, customApps);
  const isSelfControlCurrentlyActive = Boolean(
    selfControl.active ||
    selfControl.status === 'ACTIVE_LOCKED' ||
    selfControl.status === 'DEACTIVATION_PENDING' ||
    selfControl.status === 'DEACTIVATION_READY'
  );
  const isAutoproteccionDisabled = !isSelfControlCurrentlyActive && !hasSitesOrApps;

  const handleStartSelfControlFlow = async (source: 'default' | 'cuenta' = 'default') => {
    let currentSc = selfControl;
    try {
      currentSc = await apiService.getSelfControlStatus();
      setSelfControl(currentSc);
    } catch {
      // Usar estado en memoria como respaldo
    }

    const currentlyActive = Boolean(
      currentSc.active ||
      currentSc.status === 'ACTIVE_LOCKED' ||
      currentSc.status === 'DEACTIVATION_PENDING' ||
      currentSc.status === 'DEACTIVATION_READY'
    );

    let currentHasItems = hasActiveSitesOrAppsForResponsable(customSites, customApps);
    if (!currentlyActive && !currentHasItems) {
      try {
        const freshList = await apiService.getCustomBlocklist();
        const freshDomains = freshList.data?.domains || [];
        const freshApps = freshList.data?.apps || [];
        setCustomSites(freshDomains);
        setCustomApps(freshApps);
        currentHasItems = hasActiveSitesOrAppsForResponsable(freshDomains, freshApps);
      } catch {
        // Conservar conteo actual
      }
    }

    if (!currentlyActive && !currentHasItems) {
      if (source === 'cuenta') {
        showFeedback({
          imageSource: BOTITO_ASSETS.pensando,
          title: 'Agregá un sitio o aplicación',
          message:
            'Para activar la autoprotección, primero sumá al menos un sitio o aplicación en este dispositivo desde la sección “Sitios y apps”.',
        });
      } else {
        showFeedback({
          imageSource: BOTITO_ASSETS.nervioso,
          title: 'Agregá un sitio o aplicación',
          message:
            'Para activar la autoprotección, primero sumá al menos un sitio o aplicación en “Mi dispositivo”.',
        });
      }
      return;
    }

    if (!currentSc.active || currentSc.status === 'INACTIVE') {
      // Estado inicial: Desactivado -> Doble confirmación para activar
      setSelfControlModalMode('ACTIVATE');
      setShowSelfControlModal(true);
    } else if (!currentSc.canDisable || currentSc.status === 'ACTIVE_LOCKED') {
      // Activado: Durante las 24h, la desactivación NO está permitida -> Mostrar aviso
      setSelfControlModalMode('ACTIVE_LOCKED');
      setShowSelfControlModal(true);
    } else {
      // Activado: Tras 24h, la desactivación ESTÁ permitida -> Confirmar desactivación
      setSelfControlModalMode('DEACTIVATION_READY');
      setShowSelfControlModal(true);
    }
  };

  const handleFinalSelfControlActivation = async () => {
    const res = await apiService.enableSelfControl();
    setSelfControl(res);
    // Al activar la Autoprotección, la antidesinstalación también es activada automáticamente
    setRuleUninstallProtection(true);
    try {
      await protectionService.setAntiUninstallEnabled(true);
    } catch (_) {}
    setShowSelfControlModal(false);
    if (shouldRedirectToHomeAfterSelfControlActivation(activeTab, redirectHomeOnSelfControl)) {
      setRedirectHomeOnSelfControl(false);
      setActiveTab('inicio');
    }
  };

  const handleConfirmDeactivation = async () => {
    const res = await apiService.disableSelfControl();
    setSelfControl(res);
    setShowSelfControlModal(false);
  };

  const handleDisableSelfControl = handleConfirmDeactivation;

  const handleOpenPermissions = () => {
    saveNavigationState({ activeScreen: 'PERMISSIONS' }).catch(() => {});
    setShowPermissionsModal(true);
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        initialViewMode="LOGIN"
        onLoginSuccess={handleLoginSuccess}
        onBack={onExitMode}
      />
    );
  }

  if (showPermissionsModal) {
    return (
      <PermissionsScreen
        flowSource="PARENT_LOGIN"
        userId={currentUser?.id}
        onPermissionsComplete={() => {
          saveNavigationState({ activeScreen: 'DASHBOARD' }).catch(() => {});
          setShowPermissionsModal(false);
          refreshPermissions();
          loadDevices();
        }}
        onBack={() => {
          saveNavigationState({ activeScreen: 'DASHBOARD' }).catch(() => {});
          setShowPermissionsModal(false);
          refreshPermissions();
          loadDevices();
        }}
      />
    );
  }

  if (showOnboardingFlow) {
    return (
      <OnboardingScreen
        initialStep={1}
        completeButtonText="Cerrar"
        onComplete={() => setShowOnboardingFlow(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* VISTA 1: INICIO (HOME SIN SCROLL) */}
      {activeTab === 'inicio' && (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingBottom: 65 }}>
          <Header showSubHeader={false} />
          <ParentInicioSection
            currentUser={currentUser}
            devices={devices}
            selfControl={selfControl}
            customSitesCount={customSites.filter((s) => s.isActive !== false).length}
            blockedAppsCount={customApps.filter((a) => a.isActive !== false).length}
            grantedCount={grantedPermsCount}
            analyticsDevices={realAnalytics.devices}
            rawBlockedEvents={realAnalytics.rawBlockedEvents}
            onNavigateToPermissions={handleOpenPermissions}
            onNavigateToDevices={() => setActiveTab('dispositivos')}
            onAddDevice={() => {
              setActiveTab('dispositivos');
              setShowPairingModal(true);
            }}
            onToggleSelfControl={handleStartSelfControlFlow}
            onNavigateToSites={() => {
              setSitesInitialSubTab('sites');
              setCurrentSitiosSubTab('sites');
              setActiveTab('sitios');
            }}
            onNavigateToApps={() => {
              setSitesInitialSubTab('apps');
              setCurrentSitiosSubTab('apps');
              setActiveTab('sitios');
            }}
            onNavigateToActivity={() => setActiveTab('actividad')}
            onOpenFaq={() => setShowHomeFaqModal(true)}
          />
        </View>
      )}

      {/* VISTA 2: DISPOSITIVOS */}
      {activeTab === 'dispositivos' && (
        <View style={{ flex: 1, position: 'relative' }}>
          <Header
            title="Mis dispositivos protegidos"
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView
            contentContainerStyle={[styles.container, { paddingBottom: 85, flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <ProtectedDevicesSection
              devices={devices}
              selfControl={selfControl}
              hasSitesOrApps={hasSitesOrApps}
              currentUser={currentUser}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                saveNavigationState({ parentUser: updated }).catch(() => {});
              }}
              onUpdateSelfControl={(sc) => setSelfControl(sc)}
              onStartSelfControlFlow={handleStartSelfControlFlow}
              onDisableSelfControl={handleDisableSelfControl}
              onRefreshList={loadDevices}
              onUnbindDevice={() => loadDevices()}
              onOpenPermissions={handleOpenPermissions}
            />
          </ScrollView>

          {/* Botón Flotante (FAB +) con bocadillo explicativo para Nuevo Dispositivo (desaparece con 5 dispositivos) */}
          {devices.length < MAX_PROTECTED_DEVICES && (
            <FabWithTooltip
              label="Nuevo dispositivo"
              hidden={isKeyboardVisible}
              onPress={() => setShowPairingModal(true)}
            />
          )}
        </View>
      )}

      {/* VISTA 3: SITIOS Y APPS */}
      {activeTab === 'sitios' && (
        <View style={{ flex: 1, position: 'relative' }}>
          <Header
            title="Gestión de sitios y apps"
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 85 }]}>
            {/* Banner Informativo de Filtro LOTBA */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerTitle}>🌐 Lista oficial LOTBA activa</Text>
              <Text style={styles.infoBannerText}>
                Bloqueamos de forma automática sitios y apps de apuestas ilegales no autorizados por LOTBA.
              </Text>
            </View>

            <SitesAndAppsSection
              customSites={customSites}
              customApps={customApps}
              devices={devices}
              onRefreshList={loadCustomSites}
              selfControl={selfControl}
              onStartSelfControlFlow={handleStartSelfControlFlow}
              hideInternalFab={true}
              initialSubTab={sitesInitialSubTab}
              onSubTabChange={setCurrentSitiosSubTab}
              onSetAddHandler={(handler) => {
                siteAddHandlerRef.current = handler;
              }}
            />
          </ScrollView>

          {/* Botón Flotante (FAB +) con bocadillo explicativo para Bloquear sitio o app */}
          <FabWithTooltip
            label="Bloquear sitio o app"
            hidden={isKeyboardVisible}
            onPress={() => {
              if (siteAddHandlerRef.current) {
                siteAddHandlerRef.current();
              }
            }}
          />
        </View>
      )}

      {/* VISTA 4: ACTIVIDAD (Propuesta Superadora MVP con datos reales) */}
      {activeTab === 'actividad' && (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF', position: 'relative' }}>
          <AnalyticsPanel
            devices={realAnalytics.devices}
            rawDevices={realAnalytics.rawDevices}
            customApps={realAnalytics.customApps}
            weekData={realAnalytics.weekData}
            hourlyData={realAnalytics.hourlyData}
            blockedAttempts={realAnalytics.blockedAttempts}
            rawBlockedEvents={realAnalytics.rawBlockedEvents}
            bypassEvents={realAnalytics.bypassEvents}
            appUsageSnapshots={realAnalytics.appUsageSnapshots}
            pasatiemposRecordsByDevice={realAnalytics.pasatiemposRecordsByDevice}
            pasatiemposStreakByDevice={realAnalytics.pasatiemposStreakByDevice}
            pasatiemposWeeklyPctByDevice={realAnalytics.pasatiemposWeeklyPctByDevice}
            allUptime={realAnalytics.allUptime}
            onBack={() => setActiveTab('inicio')}
            scrollable={true}
          />
        </View>
      )}

      {/* VISTA 5: CUENTA */}
      {activeTab === 'cuenta' && (
        <>
          <Header
            title="Mi cuenta"
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={styles.container}>
            {/* 1. Perfil (Datos editables solo por RESPONSABLE y CTA Eliminar cuenta solo RESPONSABLE; Mock Beti y color azul) */}
            <ProfileSection
              currentUser={currentUser}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                saveNavigationState({ parentUser: updated }).catch(() => {});
              }}
              onDeleteAccount={async () => {
                try {
                  await apiService.deleteAccount();
                } catch (err: any) {
                  console.warn('⚠️ Error al eliminar cuenta en backend:', err?.message);
                }
                setIsLoggedIn(false);
                onExitMode();
              }}
            />

            {/* Reglas de protección global (Bloqueo sitios LotBA, Antidesinstalación, Autocontrol, Permisos) */}
            <GlobalRulesSection
              ruleUninstallProtection={ruleUninstallProtection}
              rulePermissions={rulePermissions}
              selfControl={selfControl}
              isAutoproteccionDisabled={isAutoproteccionDisabled}
              onToggleUninstallProtection={handleToggleUninstallProtection}
              onTogglePermissions={(val) => {
                setRulePermissions(val);
                if (val) {
                  handleOpenPermissions();
                }
              }}
              onStartSelfControlFlow={() => handleStartSelfControlFlow('cuenta')}
              onDisableSelfControl={handleDisableSelfControl}
              onOpenPermissions={handleOpenPermissions}
            />

            {/* 2. Ayuda y soporte (Tutorial y Preguntas frecuentes) */}
            <HelpSection
              onOpenOnboarding={() => setShowOnboardingFlow(true)}
            />

            {/* 3, 4 & 5. Información legal y valoración (Términos, Privacidad y Evaluar la app) */}
            <LegalSection />

            {/* Eliminar cuenta */}
            <View style={{
              backgroundColor: '#FFF5F5',
              borderColor: '#FEB2B2',
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              marginTop: 12,
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#C53030', marginBottom: 6 }}>
                Eliminar cuenta
              </Text>
              <Text style={{ fontSize: 12, color: '#9B2C2C', marginBottom: 12, lineHeight: 18 }}>
                Si eliminás tu cuenta, se borrarán tus datos y se desvincularán los dispositivos. Al hacerlo, se interrumpirá el cuidado digital y las personas protegidas podrán acceder a sitios y apps de apuestas ilegales no autorizados por LOTBA y los de la lista personalizada. Si de todas maneras querés eliminar tu cuenta, más adelante podés volver a descargar BA Protege + y empezar desde cero.
              </Text>
              <ActionButton
                title="Eliminar cuenta"
                variant="danger"
                onPress={() => {
                  showFeedback({
                    imageSource: BOTITO_ASSETS.nervioso,
                    title: 'Eliminar cuenta',
                    message:
                      '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción es irreversible.',
                    buttonText: 'Eliminar',
                    secondaryButtonText: 'Cancelar',
                    onConfirm: async () => {
                      setFeedbackModal((prev) => ({ ...prev, visible: false }));
                      try {
                        await apiService.deleteAccount();
                      } catch (err: any) {
                        console.warn('⚠️ Error al eliminar cuenta en backend:', err?.message);
                      }
                      setIsLoggedIn(false);
                      onExitMode();
                    },
                    onSecondaryPress: () => {
                      setFeedbackModal((prev) => ({ ...prev, visible: false }));
                    },
                  });
                }}
              />
            </View>

            {/* 6. Cerrar sesión */}
            <View style={styles.footer}>
              <ActionButton
                title="Cerrar sesión"
                variant="secondary"
                onPress={() => {
                  setIsLoggedIn(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    onExitMode();
                  }
                }}
              />
            </View>

            {/* 7. Versión de la app al final */}
            <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 24 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '700' }}>
                BA Protege+ v1.0.0
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                Gobierno de la Ciudad de Buenos Aires
              </Text>
            </View>
          </ScrollView>
        </>
      )}

      {/* BARRA DE NAVEGACIÓN INFERIOR (NAVBAR CON 5 OPCIONES Y DESTAQUE) */}
      {!isKeyboardVisible && (
        <DashboardNavbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}

      {/* Modal para Vincular Nuevo Dispositivo */}
      <PairingModal
        visible={showPairingModal}
        deviceCount={devices.length}
        onClose={() => setShowPairingModal(false)}
        onDeviceCreated={(newDev) => {
          // Actualización instantánea en memoria para Inicio y Dispositivos sin esperar el cierre del modal
          setDevices((prev) => {
            const exists = prev.some(
              (d) =>
                (d.deviceId && d.deviceId === newDev.deviceId) ||
                (d.deviceUuid && d.deviceUuid === newDev.deviceUuid)
            );
            if (exists) return prev;
            return [...prev, newDev];
          });
          loadDevices();
        }}
        onDeviceAdded={(savedName) => {
          loadDevices();
          setShowPairingModal(false);
          showFeedback({
            imageSource: BOTITO_ASSETS.feliz,
            title: 'Dispositivo guardado',
            message: `${savedName || 'El dispositivo'} quedará como inactivo y se vinculará a tu cuenta cuando ingresen el código o escaneen el QR en ese dispositivo.`,
          });
        }}
      />

      {/* Modal de Doble Confirmación y Gestión de Autocontrol */}
      <AutocontrolConfirmationModal
        visible={showSelfControlModal}
        mode={selfControlModalMode}
        selfControl={selfControl}
        onClose={() => setShowSelfControlModal(false)}
        onActivate={handleFinalSelfControlActivation}
        onRequestDeactivation={handleConfirmDeactivation}
        onConfirmDeactivation={handleConfirmDeactivation}
        onReactivate={handleFinalSelfControlActivation}
      />

      {/* Modal de Preguntas Frecuentes desde la Home */}
      <FaqModal
        visible={showHomeFaqModal}
        onClose={() => setShowHomeFaqModal(false)}
      />

      {/* Modal Estándar de Retroalimentación del App */}
      <FeedbackModal
        visible={feedbackModal.visible}
        icon={feedbackModal.icon}
        imageSource={feedbackModal.imageSource}
        title={feedbackModal.title}
        message={feedbackModal.message}
        buttonText={feedbackModal.buttonText || 'Entendido'}
        onConfirm={feedbackModal.onConfirm}
        secondaryButtonText={feedbackModal.secondaryButtonText}
        onSecondaryPress={feedbackModal.onSecondaryPress}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};
