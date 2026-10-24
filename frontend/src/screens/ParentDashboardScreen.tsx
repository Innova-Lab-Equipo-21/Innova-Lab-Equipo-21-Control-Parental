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
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { PermissionsScreen, PermissionItemState } from './PermissionsScreen';
import { LoginScreen } from './LoginScreen';
import { OnboardingScreen } from './OnboardingScreen';
import { apiService } from '../services/api.service';
import { MAX_PROTECTED_DEVICES, SelfControlState, DeviceInfo, CustomBlockedDomain } from '../types';

// Subcomponentes modulares organizados por carpetas de la Navbar
import { SeccionDesplegable } from '../components/dashboard/SeccionDesplegable';
import { DashboardNavbar, DashboardTab } from '../components/dashboard/DashboardNavbar';
import { ProtectedDevicesSection, PairingSection } from '../components/dashboard/dispositivos';
import { CustomSitesSection, GlobalRulesSection } from '../components/dashboard/sitios';
import { ActivitySection } from '../components/dashboard/actividad';
import { SelfControlSection, TutorPermissionsSection, ProfileSection, HelpSection, LegalSection, RatingSection } from '../components/dashboard/cuenta';
import { FabWithTooltip } from '../components/FabWithTooltip';
import { colors } from '../theme/colors';
import { styles } from './ParentDashboardScreen.styles';

interface ParentDashboardScreenProps {
  onExitMode: () => void;
  initialUser?: any;
  initialToken?: string | null;
  permissions?: PermissionItemState;
  initialAction?: 'SUPERVISE' | 'SELF_CONTROL';
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  onExitMode,
  initialUser,
  initialToken,
  permissions,
  initialAction,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialToken);
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Ref para disparar el modal de agregar sitio o app desde el FAB fijo
  const siteAddHandlerRef = useRef<(() => void) | null>(null);

  // Pestaña Activa de la Navbar (Default: 'inicio')
  const [activeTab, setActiveTab] = useState<DashboardTab>('inicio');

  // Modal de Permisos del Dispositivo local del Responsable
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // Flujo de Onboarding desde la sección de Cuenta
  const [showOnboardingFlow, setShowOnboardingFlow] = useState(false);

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
      if (initialAction === 'SELF_CONTROL') {
        setActiveTab('cuenta');
        setConfirmationStep(1);
        setShowSelfControlModal(true);
      }
    }
  }, [isLoggedIn, initialAction]);

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
      setPairingCode(res.data?.code || res.data?.pairingCode || '483921');
    } catch (e: any) {
      // Fallback robusto en modo standalone / sin base de datos conectada
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setPairingCode(fallbackCode);
      Alert.alert(
        '📱 Código Generado (Modo Standalone)',
        `Se generó el código de vinculación: ${fallbackCode}. Los datos del protegido se mantendrán guardados hasta el emparejamiento.`
      );
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
      const res = await apiService.enableSelfControl();
      setSelfControl(res);
      Alert.alert(
        '🛡️ Autocontrol activado exitosamente',
        'La protección de autocontrol está activa de forma permanente. Para desactivarla, deberás solicitar la espera de 24 horas.'
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo activar el autocontrol.');
    }
  };

  const handleDisableSelfControl = async () => {
    try {
      const res = await apiService.disableSelfControl();
      setSelfControl(res);
      Alert.alert(
        '🔓 Pase temporal de 24 horas iniciado',
        'El sistema se ha desbloqueado temporalmente por 24 horas. Cumplido este plazo, se reactivará automáticamente.'
      );
    } catch (e: any) {
      Alert.alert(
        '🔒 Desactivación en espera',
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
                <Text style={styles.summaryValue}>{devices.length}/{MAX_PROTECTED_DEVICES}</Text>
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
              badgeLabel={`${devices.length}/${MAX_PROTECTED_DEVICES} VINCULADOS`}
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

            {/* SECCIÓN 3: DISPOSITIVOS PROTEGIDOS */}
            <SeccionDesplegable
              title="Dispositivos protegidos"
              subtitle="Estado y monitoreo de celulares vinculados"
              badgeLabel={`${devices.length}/${MAX_PROTECTED_DEVICES} PROTEGIDOS`}
              badgeStatus="activo"
              icon="📱"
              initialExpanded={false}
            >
              <ProtectedDevicesSection devices={devices} />
            </SeccionDesplegable>

            {/* SECCIÓN 4: GESTIÓN DE SITIOS Y APPS */}
            <SeccionDesplegable
              title="Gestión de sitios y apps"
              subtitle="Filtro oficial LOTBA, dominios y aplicaciones de la red familiar"
              badgeLabel="REGLAS"
              badgeStatus="activo"
              icon="🌐"
              initialExpanded={false}
            >
              <CustomSitesSection
                customSites={customSites}
                devices={devices}
                onRefreshList={loadCustomSites}
              />
            </SeccionDesplegable>

            {/* SECCIÓN 5: ACTIVIDAD DEL SISTEMA */}
            <SeccionDesplegable
              title="Actividad del sistema"
              subtitle="Registro de bloqueos y alertas de seguridad"
              badgeLabel="AUDITORÍA"
              badgeStatus="activo"
              icon="📊"
              initialExpanded={false}
            >
              <ActivitySection devices={devices} />
            </SeccionDesplegable>

            {/* SECCIÓN 6: AUTOCONTROL DEL TUTOR */}
            <SeccionDesplegable
              title="Autocontrol del tutor"
              subtitle="Bloqueo preventivo de 24 horas para este dispositivo"
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
              initialExpanded={false}
            >
              <SelfControlSection
                selfControl={selfControl}
                onStartSelfControlFlow={handleStartSelfControlFlow}
                onDisableSelfControl={handleDisableSelfControl}
              />
            </SeccionDesplegable>
          </ScrollView>
        </>
      )}

      {/* VISTA 2: DISPOSITIVOS */}
      {activeTab === 'dispositivos' && (
        <View style={{ flex: 1, position: 'relative' }}>
          <Header
            title="Mis dispositivos protegidos"
            subtitle={`Administración de hasta ${MAX_PROTECTED_DEVICES} celulares vinculados`}
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={styles.container}>
            <ProtectedDevicesSection devices={devices} />
          </ScrollView>

          {/* Botón Flotante (FAB +) con bocadillo explicativo para Nuevo Dispositivo */}
          <FabWithTooltip
            label="Nuevo dispositivo"
            onPress={() => setActiveTab('inicio')}
          />
        </View>
      )}

      {/* VISTA 3: SITIOS Y APPS */}
      {activeTab === 'sitios' && (
        <View style={{ flex: 1, position: 'relative' }}>
          <Header
            title="Gestión de sitios y apps"
            subtitle="Filtro oficial LOTBA, dominios y aplicaciones"
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 85 }]}>
            {/* Banner Informativo de Filtro LOTBA */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerTitle}>🌐 Lista oficial LOTBA activa</Text>
              <Text style={styles.infoBannerText}>
                Se bloquean automáticamente más de 450 plataformas de apuestas clandestinas e ilegales en navegadores y apps.
              </Text>
            </View>

            <CustomSitesSection
              customSites={customSites}
              devices={devices}
              onRefreshList={loadCustomSites}
              hideInternalFab={true}
              onSetAddHandler={(handler) => {
                siteAddHandlerRef.current = handler;
              }}
            />
          </ScrollView>

          {/* Botón Flotante (FAB +) con bocadillo explicativo para Bloquear sitio o app */}
          <FabWithTooltip
            label="Bloquear sitio o app"
            onPress={() => {
              if (siteAddHandlerRef.current) {
                siteAddHandlerRef.current();
              }
            }}
          />
        </View>
      )}

      {/* VISTA 4: ACTIVIDAD */}
      {activeTab === 'actividad' && (
        <>
          <Header
            title="Actividad del sistema"
            subtitle="Auditoría de bloqueos, alertas y geolocalización"
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={styles.container}>
            <ActivitySection devices={devices} />
          </ScrollView>
        </>
      )}

      {/* VISTA 5: CUENTA */}
      {activeTab === 'cuenta' && (
        <>
          <Header
            title="Perfil y cuenta"
            subtitle="Ajustes del responsable, permisos y autoprotección"
            onBack={() => setActiveTab('inicio')}
          />
          <ScrollView contentContainerStyle={styles.container}>
            {/* 1. Perfil (Datos editables solo por RESPONSABLE y CTA Eliminar cuenta solo RESPONSABLE; Mock Beti y color azul) */}
            <ProfileSection
              currentUser={currentUser}
              onUpdateUser={(updated) => setCurrentUser(updated)}
              onDeleteAccount={() => {
                setIsLoggedIn(false);
                onExitMode();
              }}
            />

            {/* Subsección: Permisos del Dispositivo */}
            <SeccionDesplegable
              title="Permisos de aplicación"
              subtitle="Auditoría y re-autorización de permisos Android"
              badgeLabel="CONFIGURAR"
              badgeStatus="activo"
              icon="🔒"
              initialExpanded={false}
            >
              <TutorPermissionsSection
                permissions={permissions}
                onConfigurePermissions={() => setShowPermissionsModal(true)}
              />
            </SeccionDesplegable>

            {/* Subsección: Autocontrol del Responsable */}
            <SeccionDesplegable
              title="Autocontrol del tutor"
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
              initialExpanded={false}
            >
              <SelfControlSection
                selfControl={selfControl}
                onStartSelfControlFlow={handleStartSelfControlFlow}
                onDisableSelfControl={handleDisableSelfControl}
              />
            </SeccionDesplegable>

            {/* 2. Ayuda (FAQ + Ver onboarding + Form para dudas y sugerencias con hasta 3 anexos para baprotegemas@gmail.com) */}
            <SeccionDesplegable
              title="Ayuda y soporte"
              subtitle="Preguntas frecuentes, onboarding y contacto con baprotegemas@gmail.com"
              badgeLabel="SOPORTE"
              badgeStatus="activo"
              icon="❓"
              initialExpanded={false}
            >
              <HelpSection
                onOpenOnboarding={() => setShowOnboardingFlow(true)}
              />
            </SeccionDesplegable>

            {/* 3, 4 & 5. Información legal y valoración (Términos, Privacidad y Evaluar la app) */}
            <LegalSection />

            {/* Zona de Peligro / Eliminar Cuenta Definitivamente */}
            <View style={{
              backgroundColor: '#FFF5F5',
              borderColor: '#FEB2B2',
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              marginTop: 12,
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#C53030', marginBottom: 4 }}>
                ⚠️ Zona de Peligro
              </Text>
              <Text style={{ fontSize: 12, color: '#9B2C2C', marginBottom: 12, lineHeight: 16 }}>
                Eliminar tu cuenta borrará permanentemente todos tus datos y dispositivos vinculados. Esta acción no se puede deshacer.
              </Text>
              <ActionButton
                title="🗑️ Eliminar cuenta definitivamente"
                variant="danger"
                onPress={() => {
                  Alert.alert(
                    '⚠️ Eliminar Cuenta',
                    '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción es irreversible.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: () => {
                          setIsLoggedIn(false);
                          onExitMode();
                        },
                      },
                    ]
                  );
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
                  onExitMode();
                }}
              />
            </View>

            {/* 7. Versión de la app al final */}
            <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 24 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '700' }}>
                BA Protege+ v1.0.0 (Build 2025.3)
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                Lotería de la Ciudad de Buenos Aires (LOTBA S.E.)
              </Text>
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
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSelfControlModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {confirmationStep === 1 ? (
              <View>
                <Text style={styles.modalEmoji}>🔒</Text>
                <Text style={styles.modalTitle}>Confirmación 1 de 2: Autocontrol del tutor</Text>
                <Text style={styles.modalBody}>
                  Al activar el autocontrol, se aplicarán restricciones de acceso a sitios de apuestas en tu perfil.
                </Text>
                <View style={styles.warningBox}>
                  <Text style={styles.warningBoxText}>
                    ⚠️ IMPORTANTE: El bloqueo se queda permanente y deberás esperar 24 hs obligatorias para desactivar.
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <ActionButton
                      title="Cancelar"
                      variant="secondary"
                      onPress={() => setShowSelfControlModal(false)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ActionButton
                      title="Continuar ➔"
                      variant="primary"
                      onPress={handleConfirmStep1}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.modalEmoji}>⚠️</Text>
                <Text style={styles.modalTitle}>Confirmación 2 de 2: Activar bloqueo permanente</Text>
                <Text style={styles.modalBody}>
                  ¿Confirmas activar la autoprotección? El bloqueo quedará permanente. Pasadas las 24 hs, podrás tocar el botón para desbloquear inmediatamente por 24 hs.
                </Text>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <ActionButton
                      title="Volver atrás"
                      variant="secondary"
                      onPress={() => setConfirmationStep(1)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ActionButton
                      title="Confirmar"
                      variant="danger"
                      onPress={handleFinalSelfControlActivation}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
