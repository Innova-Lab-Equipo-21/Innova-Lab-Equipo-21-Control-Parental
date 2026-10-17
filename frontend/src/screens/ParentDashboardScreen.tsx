// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Panel de Control de Responsable)
// Archivo: src/screens/ParentDashboardScreen.tsx
// Descripción: Panel de control con barra de navegación inferior (Navbar 5 pestañas:
//              Inicio, Dispositivos, Sitios, Actividad y Cuenta) e íconos en @navbar.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { PermissionsScreen, PermissionItemState } from './PermissionsScreen';
import { LoginScreen } from './LoginScreen';
import { apiService } from '../services/api.service';
import { MAX_PARENT_DEVICES, SelfControlState, DeviceInfo, CustomBlockedDomain } from '../types';

// Subcomponentes modulares organizados por carpetas de la Navbar
import { SeccionDesplegable } from '../components/dashboard/SeccionDesplegable';
import { DashboardNavbar, DashboardTab } from '../components/dashboard/DashboardNavbar';
import { ProtectedDevicesSection, PairingSection } from '../components/dashboard/dispositivos';
import { CustomSitesSection, GlobalRulesSection } from '../components/dashboard/sitios';
import { ActivitySection } from '../components/dashboard/actividad';
import { SelfControlSection, TutorPermissionsSection } from '../components/dashboard/cuenta';
import { styles } from './ParentDashboardScreen.styles';

interface ParentDashboardScreenProps {
  onExitMode: () => void;
  initialUser?: any;
  initialToken?: string | null;
  permissions?: PermissionItemState;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  onExitMode,
  initialUser,
  initialToken,
  permissions,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialToken);
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Pestaña Activa de la Navbar (Default: 'inicio')
  const [activeTab, setActiveTab] = useState<DashboardTab>('inicio');

  // Modal de Permisos del Dispositivo local del Responsable
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // Estados de Reglas de Control Parental
  const [ruleBetting, setRuleBetting] = useState(true);
  const [ruleAlerts, setRuleAlerts] = useState(true);
  const [ruleUninstallProtection, setRuleUninstallProtection] = useState(true);

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
  const [confirmationStep, setConfirmationStep] = useState<1 | 2>(1);

  // Estados de Sitios Bloqueados Personalizados (CRUD)
  const [customSites, setCustomSites] = useState<CustomBlockedDomain[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      loadDevices();
      checkSelfControlStatus();
      loadCustomSites();
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = (user: any, _token: string) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const loadDevices = async () => {
    try {
      const res = await apiService.listDevices();
      setDevices(res.data || []);
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
    } catch (e) {
      console.warn('Error al cargar sitios personalizados:', e);
    }
  };

  const handleGeneratePairingCode = async (formData?: any) => {
    setLoading(true);
    try {
      const res = await apiService.generatePairingCode(formData);
      setPairingCode(res.data?.code || res.data?.pairingCode || 'BA-9824');
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || 'No se pudo generar el código de vinculación.';
      Alert.alert('⚠️ Vinculación Pendiente', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSelfControlFlow = () => {
    if (selfControl.active) {
      if (selfControl.canDisable) {
        Alert.alert(
          'Desactivación Temporal (24 Horas)',
          'El temporizador de espera ha finalizado. Al desactivar, se abrirá un pase temporal de 24 horas antes del rebloqueo automático.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Desactivar', onPress: handleDisableSelfControl },
          ]
        );
      } else {
        Alert.alert(
          '🔒 Autocontrol Activo',
          `Faltan ${selfControl.remainingHours}h ${selfControl.remainingMinutes}m para habilitar la desactivación.`
        );
      }
    } else {
      setConfirmationStep(1);
      setShowSelfControlModal(true);
    }
  };

  const handleConfirmStep1 = () => {
    setConfirmationStep(2);
  };

  const handleFinalSelfControlActivation = async () => {
    setShowSelfControlModal(false);
    try {
      const res = await apiService.activateSelfControl();
      setSelfControl(res.data);
      Alert.alert(
        '🛡️ Autocontrol Activado Exitosamente',
        'La protección de autocontrol está activa de forma permanente. Para desactivarla, deberás solicitar la espera de 24 horas.'
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo activar el autocontrol.');
    }
  };

  const handleDisableSelfControl = async () => {
    try {
      const res = await apiService.disableSelfControl();
      setSelfControl(res.data);
      Alert.alert(
        '🔓 Pase Temporal de 24 Horas Iniciado',
        'El sistema se ha desbloqueado temporalmente por 24 horas. Cumplido este plazo, se reactivará automáticamente.'
      );
    } catch (e: any) {
      Alert.alert(
        '🔒 Desactivación en Espera',
        e.message || 'La desactivación se habilitará en 24 horas.',
      );
    }
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
        onPermissionsComplete={() => setShowPermissionsModal(false)}
        onBack={() => setShowPermissionsModal(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* VISTA 1: INICIO (HOME) */}
      {activeTab === 'inicio' && (
        <>
          <Header
            title="Panel del responsable"
            subtitle={
              currentUser?.fullName
                ? `Bienvenido/a, ${currentUser.fullName}`
                : 'Monitoreo, permisos de dispositivos y autocontrol'
            }
          />
          <ScrollView contentContainerStyle={styles.container}>
            {/* Tarjetas de Resumen General */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{devices.length}/{MAX_PARENT_DEVICES}</Text>
                <Text style={styles.summaryLabel}>Dispositivos</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>3/3</Text>
                <Text style={styles.summaryLabel}>Reglas Activas</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {selfControl.active ? '🔒 Activa' : 'Off'}
                </Text>
                <Text style={styles.summaryLabel}>Autocontrol</Text>
              </View>
            </View>

            {/* SECCIÓN 1: VINCULAR DISPOSITIVO */}
            <SeccionDesplegable
              title="Vincular dispositivo"
              subtitle="Generar código y QR para vincular celular"
              badgeLabel={`${devices.length}/${MAX_PARENT_DEVICES} VINCULADOS`}
              badgeStatus="activo"
              icon="📱"
              initialExpanded={true}
            >
              <PairingSection
                pairingCode={pairingCode}
                deviceCount={devices.length}
                loading={loading}
                onGenerateCode={handleGeneratePairingCode}
              />
            </SeccionDesplegable>

            {/* SECCIÓN 2: REGLAS DE PROTECCIÓN GLOBAL */}
            <SeccionDesplegable
              title="Reglas de protección global"
              subtitle="Filtros LOTBA y protección antidesinstalación"
              badgeLabel="3 REGLAS"
              badgeStatus="activo"
              icon="🛡️"
              initialExpanded={false}
            >
              <GlobalRulesSection
                ruleBetting={ruleBetting}
                ruleAlerts={ruleAlerts}
                ruleUninstallProtection={ruleUninstallProtection}
                onToggleBetting={setRuleBetting}
                onToggleAlerts={setRuleAlerts}
                onToggleUninstallProtection={setRuleUninstallProtection}
              />
            </SeccionDesplegable>
          </ScrollView>
        </>
      )}

      {/* VISTA 2: DISPOSITIVOS */}
      {activeTab === 'dispositivos' && (
        <>
          <Header
            title="Mis Dispositivos Protegidos"
            subtitle={`Administración de hasta ${MAX_PARENT_DEVICES} celulares vinculados`}
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={styles.container}>
            <ProtectedDevicesSection devices={devices} />

            {devices.length < MAX_PARENT_DEVICES && (
              <View style={styles.sectionMargin}>
                <ActionButton
                  title="📱 Vincular Nuevo Dispositivo"
                  variant="primary"
                  onPress={() => setActiveTab('inicio')}
                />
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* VISTA 3: SITIOS */}
      {activeTab === 'sitios' && (
        <>
          <Header
            title="Gestión de Sitios Web"
            subtitle="Filtro oficial LOTBA y dominios bloqueados manualmente"
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={styles.container}>
            {/* Banner Informativo de Filtro LOTBA */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerTitle}>🌐 Lista Oficial LOTBA Activa</Text>
              <Text style={styles.infoBannerText}>
                Se bloquean automáticamente más de 450 plataformas de apuestas clandestinas e ilegales.
              </Text>
            </View>

            <CustomSitesSection
              customSites={customSites}
              onRefreshList={loadCustomSites}
            />
          </ScrollView>
        </>
      )}

      {/* VISTA 4: ACTIVIDAD */}
      {activeTab === 'actividad' && (
        <>
          <Header
            title="Actividad del Sistema"
            subtitle="Auditoría de bloqueos, alertas y geolocalización"
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={styles.container}>
            <ActivitySection />
          </ScrollView>
        </>
      )}

      {/* VISTA 5: CUENTA */}
      {activeTab === 'cuenta' && (
        <>
          <Header
            title="Perfil y Cuenta"
            subtitle="Ajustes del responsable, permisos y autoprotección"
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={styles.container}>
            {/* Tarjeta de Perfil del Usuario */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {currentUser?.fullName?.charAt(0) || 'T'}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {currentUser?.fullName || 'Tutor Responsable'}
                  </Text>
                  <Text style={styles.profileEmail}>
                    {currentUser?.email || 'tutor@baprotege.gob.ar'}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>✓ Identidad Verificada (+18)</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Subsección: Permisos del Dispositivo */}
            <SeccionDesplegable
              title="Permisos de Aplicación"
              subtitle="Auditoría y re-autorización de permisos Android"
              badgeLabel="CONFIGURAR"
              badgeStatus="activo"
              icon="🔒"
              initialExpanded={false}
            >
              <TutorPermissionsSection
                onOpenPermissions={() => setShowPermissionsModal(true)}
              />
            </SeccionDesplegable>

            {/* Subsección: Autocontrol del Responsable */}
            <SeccionDesplegable
              title="Autocontrol del Tutor"
              subtitle="Bloqueo preventivo de 24 horas"
              badgeLabel={
                selfControl.active
                  ? '🔒 ACTIVO'
                  : selfControl.remainingHours > 0
                  ? 'EN ESPERA'
                  : 'INACTIVO'
              }
              badgeStatus={
                selfControl.active
                  ? 'activo'
                  : selfControl.remainingHours > 0
                  ? 'alerta'
                  : 'inactivo'
              }
              icon="🔒"
              initialExpanded={true}
            >
              <SelfControlSection
                selfControl={selfControl}
                onStartSelfControlFlow={handleStartSelfControlFlow}
                onDisableSelfControl={handleDisableSelfControl}
              />
            </SeccionDesplegable>

            {/* Botón de Salida */}
            <View style={styles.footer}>
              <ActionButton
                title="Cerrar Sesión del Panel"
                variant="secondary"
                onPress={() => {
                  setIsLoggedIn(false);
                  onExitMode();
                }}
              />
            </View>
          </ScrollView>
        </>
      )}

      {/* BARRA DE NAVEGACIÓN INFERIOR (NAVBAR CON 5 OPCIONES Y DESTAQUE) */}
      <DashboardNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Modal de Doble Confirmación de Autocontrol */}
      <Modal
        visible={showSelfControlModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSelfControlModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {confirmationStep === 1 ? (
              <View>
                <Text style={styles.modalEmoji}>🔒</Text>
                <Text style={styles.modalTitle}>Confirmación 1 de 2: Autocontrol del Tutor</Text>
                <Text style={styles.modalBody}>
                  Al activar el autocontrol, se aplicarán restricciones de acceso a sitios de apuestas en tu perfil.
                </Text>
                <View style={styles.warningBox}>
                  <Text style={styles.warningBoxText}>
                    ⚠️ IMPORTANTE: El bloqueo se queda permanente y deberás esperar 24 hs obligatorias para desactivar.
                  </Text>
                </View>

                <ActionButton
                  title="Entiendo las condiciones, Continuar ➔"
                  variant="primary"
                  onPress={handleConfirmStep1}
                />
                <ActionButton
                  title="Cancelar"
                  variant="secondary"
                  onPress={() => setShowSelfControlModal(false)}
                />
              </View>
            ) : (
              <View>
                <Text style={styles.modalEmoji}>⚠️</Text>
                <Text style={styles.modalTitle}>Confirmación 2 de 2: Activar Bloqueo Permanente</Text>
                <Text style={styles.modalBody}>
                  ¿Confirmas activar la autoprotección? El bloqueo quedará permanente. Pasadas las 24 hs, podrás tocar el botón para desbloquear inmediatamente por 24 hs.
                </Text>

                <ActionButton
                  title="🔒 Confirmar y Activar Autocontrol"
                  variant="danger"
                  onPress={handleFinalSelfControlActivation}
                />
                <ActionButton
                  title="Volver Atrás"
                  variant="secondary"
                  onPress={() => setConfirmationStep(1)}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
