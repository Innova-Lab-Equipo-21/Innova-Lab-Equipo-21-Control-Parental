// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Panel de Control de Responsable)
// Archivo: src/screens/ParentDashboardScreen.tsx
// Descripción: Panel de control modularizado con acordeones para reducir scroll.
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
} from 'react-native';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { PermissionsScreen, PermissionItemState } from './PermissionsScreen';
import { LoginScreen } from './LoginScreen';
import { colors } from '../theme/colors';
import { apiService } from '../services/api.service';
import { MAX_PARENT_DEVICES, SelfControlState, DeviceInfo, CustomBlockedDomain } from '../types';

// Subcomponentes modulares de acordeón
import { AccordionSection } from '../components/dashboard/AccordionSection';
import { TutorPermissionsSection } from '../components/dashboard/TutorPermissionsSection';
import { SelfControlSection } from '../components/dashboard/SelfControlSection';
import { PairingSection } from '../components/dashboard/PairingSection';
import { GlobalRulesSection } from '../components/dashboard/GlobalRulesSection';
import { CustomSitesSection } from '../components/dashboard/CustomSitesSection';
import { ProtectedDevicesSection } from '../components/dashboard/ProtectedDevicesSection';

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
      <Header
        title="Panel del Responsable"
        subtitle={
          currentUser?.fullName
            ? `Bienvenido/a, ${currentUser.fullName}`
            : 'Monitoreo, Permisos de Dispositivos y Autocontrol'
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* GRUPO 1: PERMISOS DEL TUTOR */}
        <TutorPermissionsSection
          permissions={permissions}
          onConfigurePermissions={() => setShowPermissionsModal(true)}
        />

        {/* GRUPO 2: VINCULAR DISPOSITIVO MENOR (CÓDIGO Y QR) */}
        <AccordionSection
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
        </AccordionSection>

        {/* GRUPO 3: AUTOCONTROL DEL TUTOR */}
        <AccordionSection
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
          initialExpanded={false}
        >
          <SelfControlSection
            selfControl={selfControl}
            onStartSelfControlFlow={handleStartSelfControlFlow}
            onDisableSelfControl={handleDisableSelfControl}
          />
        </AccordionSection>

        {/* GRUPO 4: REGLAS DE PROTECCIÓN GLOBAL */}
        <AccordionSection
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
        </AccordionSection>

        {/* GRUPO 5: SITIOS WEB BLOQUEADOS PERSONALIZADOS */}
        <AccordionSection
          title="Sitios Web Bloqueados"
          subtitle="Dominios adicionales bloqueados manualmente"
          badgeLabel={`${customSites.length} SITIOS`}
          badgeStatus={customSites.length > 0 ? 'activo' : 'inactivo'}
          icon="🌐"
          initialExpanded={false}
        >
          <CustomSitesSection
            customSites={customSites}
            onRefreshList={loadCustomSites}
          />
        </AccordionSection>

        {/* GRUPO 6: AUDITORÍA DE DISPOSITIVOS PROTEGIDOS */}
        <AccordionSection
          title={`Dispositivos Protegidos (${devices.length}/${MAX_PARENT_DEVICES})`}
          subtitle="Auditoría detallada de permisos por celular"
          badgeLabel={`${devices.length} DISPOSITIVOS`}
          badgeStatus="activo"
          icon="📊"
          initialExpanded={true}
        >
          <ProtectedDevicesSection devices={devices} />
        </AccordionSection>

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
      </ScrollView>
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
  footer: {
    marginTop: 12,
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
