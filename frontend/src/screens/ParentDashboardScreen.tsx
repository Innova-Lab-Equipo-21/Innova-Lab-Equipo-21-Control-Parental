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
  StyleSheet,
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
import { colors } from '../theme/colors';
import { apiService } from '../services/api.service';
import { MAX_PARENT_DEVICES, SelfControlState, DeviceInfo, CustomBlockedDomain } from '../types';

// Subcomponentes modulares organizados por carpetas de la Navbar
import { SeccionDesplegable } from '../components/dashboard/SeccionDesplegable';
import { DashboardNavbar, DashboardTab } from '../components/dashboard/DashboardNavbar';
import { ProtectedDevicesSection, PairingSection } from '../components/dashboard/dispositivos';
import { CustomSitesSection, GlobalRulesSection } from '../components/dashboard/sitios';
import { ActivitySection } from '../components/dashboard/actividad';
import { SelfControlSection, TutorPermissionsSection } from '../components/dashboard/cuenta';

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

  const handleGeneratePairingCode = async () => {
    if (devices.length >= MAX_PARENT_DEVICES) {
      Alert.alert(
        'Límite de Dispositivos Alcanzado',
        `Un responsable solo puede administrar hasta un máximo de ${MAX_PARENT_DEVICES} dispositivos vinculados.`,
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.generatePairingCode();
      setPairingCode(res.data.pairingCode);
    } catch (e: any) {
      if (e.message?.includes('Límite alcanzado')) {
        Alert.alert('Límite Alcanzado', e.message);
      } else {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setPairingCode(code);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartSelfControlFlow = () => {
    setConfirmationStep(1);
    setShowSelfControlModal(true);
  };

  const handleConfirmStep1 = () => {
    setConfirmationStep(2);
  };

  const handleFinalSelfControlActivation = async () => {
    setShowSelfControlModal(false);
    setLoading(true);
    try {
      const newState = await apiService.enableSelfControl();
      setSelfControl(newState);
      Alert.alert(
        '🛡️ Autocontrol Activado Exitosamente',
        'La protección de autocontrol está activa de forma permanente. Para desactivarla, deberás solicitar la desactivación y esperar 24 horas.',
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo activar el autocontrol.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSelfControl = async () => {
    try {
      const newState = await apiService.disableSelfControl();
      setSelfControl(newState);
      if (newState.status === 'DEACTIVATION_PENDING') {
        Alert.alert(
          '⏳ Solicitud de Desactivación Iniciada',
          'La desactivación se habilitará en 24 horas. Durante este tiempo de espera, la autoprotección permanecerá activa.',
        );
      } else if (newState.status === 'TEMPORARILY_UNLOCKED') {
        Alert.alert(
          '🔓 Autoprotección Desbloqueada',
          'Has desactivado la autoprotección inmediatamente. Se otorgó un pase temporal de 24 horas. Cumplido ese plazo, la autoprotección se volverá a activar automáticamente.',
        );
      }
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
            title="Panel del Responsable"
            subtitle={
              currentUser?.fullName
                ? `Bienvenido/a, ${currentUser.fullName}`
                : 'Monitoreo, Permisos de Dispositivos y Autocontrol'
            }
            useBaLogo={true}
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

            {/* SECCIÓN 1: VINCULAR DISPOSITIVO MENOR */}
            <SeccionDesplegable
              title="Vincular Dispositivo Menor"
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
              title="Reglas de Protección Global"
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
            useBaLogo={true}
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
            useBaLogo={true}
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
            useBaLogo={true}
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
            useBaLogo={true}
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
                    <Text style={styles.verifiedBadgeText}>✓ Mayor de 18 años verificado</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Configuración de Permisos del Dispositivo del Tutor */}
            <TutorPermissionsSection
              permissions={permissions}
              onConfigurePermissions={() => setShowPermissionsModal(true)}
            />

            {/* Autocontrol del Tutor */}
            <SeccionDesplegable
              title="Autocontrol del Tutor"
              subtitle="Protección permanente con desbloqueo de 24hs"
              badgeLabel={
                selfControl.status === 'TEMPORARILY_UNLOCKED'
                  ? 'PASE 24H'
                  : selfControl.status === 'DEACTIVATION_PENDING'
                  ? 'ESPERA 24H'
                  : selfControl.active
                  ? 'ACTIVA'
                  : 'INACTIVO'
              }
              badgeStatus={
                selfControl.active || selfControl.status === 'DEACTIVATION_PENDING'
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionMargin: {
    marginTop: 12,
  },
  infoBanner: {
    backgroundColor: '#E7F1FF',
    borderColor: '#B6D4FE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0056B3',
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#0A58CA',
    lineHeight: 16,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1E7DD',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F5132',
  },
  footer: {
    marginTop: 12,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
  },
  modalEmoji: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningBoxText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});
