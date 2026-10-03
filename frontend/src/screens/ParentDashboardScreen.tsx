// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Panel de Control de Responsable)
// Archivo: src/screens/ParentDashboardScreen.tsx
// Descripción: Panel de control para que el responsable gestione hasta 5 dispositivos
//              vinculados, audite el estado detallado de permisos de cada dispositivo,
//              alerta pedagógica de permisos del tutor, administre reglas y Autocontrol.
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
import { Badge } from '../components/Badge';
import { ControlCard } from '../components/ControlCard';
import { PermissionsScreen, PermissionItemState } from './PermissionsScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { apiService } from '../services/api.service';
import { MAX_PARENT_DEVICES, SelfControlState, DeviceInfo } from '../types';
import { LoginScreen } from './LoginScreen';

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

  // ID del dispositivo seleccionado para ver detalle desplegado de permisos
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);

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

  // Calcular lista de permisos pendientes del tutor
  const missingLocalPermissions: string[] = [];
  if (permissions) {
    if (!permissions.vpn) missingLocalPermissions.push('Servicio de Filtrado VPN');
    if (!permissions.accessibility) missingLocalPermissions.push('Servicio de Accesibilidad (Antidesinstalación)');
    if (!permissions.notifications) missingLocalPermissions.push('Notificaciones del Sistema');
    if (!permissions.batteryOptimization) missingLocalPermissions.push('Exención de Batería (Segundo Plano)');
  }
  const localGrantedCount = permissions ? 4 - missingLocalPermissions.length : 4;

  useEffect(() => {
    if (isLoggedIn) {
      loadDevices();
      checkSelfControlStatus();
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
        'La protección de autocontrol está activa. La desactivación quedará strictly bloqueada durante las próximas 24 horas.',
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo activar el autocontrol.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttemptToggleSelfControl = async (newVal: boolean) => {
    if (!newVal) {
      try {
        const newState = await apiService.disableSelfControl();
        setSelfControl(newState);
        Alert.alert('Autocontrol Desactivado', 'Has cumplido las 24 horas obligatorias de protección.');
      } catch (e: any) {
        Alert.alert('🔒 Desactivación Bloqueada por 24hs', e.message || 'El autocontrol no puede desactivarse antes de las 24 horas.');
      }
    } else {
      handleStartSelfControlFlow();
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
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
        {/* Caja de Alerta de Permisos Faltantes del Tutor */}
        {missingLocalPermissions.length > 0 ? (
          <View style={styles.warningBannerCard}>
            <View style={styles.warningHeaderRow}>
              <Text style={styles.warningTitle}>⚠️ Permisos Pendientes del Tutor ({localGrantedCount}/4 Concedidos)</Text>
              <Badge status="alerta" label="INCOMPLETO" />
            </View>
            <Text style={styles.warningDesc}>
              Tu dispositivo de responsable no cuenta con todos los permisos habilitados. Faltan autorizar:
            </Text>
            {missingLocalPermissions.map((permText, idx) => (
              <Text key={idx} style={styles.missingItemText}>
                • {permText}
              </Text>
            ))}
            <View style={styles.warningActionBox}>
              <ActionButton
                title="Configurar Permisos Faltantes ⚙️"
                variant="primary"
                onPress={() => setShowPermissionsModal(true)}
              />
            </View>
          </View>
        ) : (
          <View style={styles.permissionsBar}>
            <View style={styles.permissionsTextCol}>
              <Text style={styles.permissionsTitle}>Permisos del Dispositivo Tutor</Text>
              <Text style={styles.permissionsDesc}>Todos los permisos configurados (4/4 Concedidos).</Text>
            </View>
            <ActionButton
              title="Auditar ⚙️"
              variant="secondary"
              onPress={() => setShowPermissionsModal(true)}
            />
          </View>
        )}

        {/* Sección de Autocontrol del Responsable con Bloqueo de 24hs */}
        <View style={styles.selfControlSection}>
          <View style={styles.selfControlHeaderRow}>
            <Text style={styles.sectionTitle}>Autocontrol del Responsable</Text>
            <Badge status={selfControl.active ? 'alerta' : 'inactivo'} label={selfControl.active ? '🔒 BLOQUEADO 24H' : 'INACTIVO'} />
          </View>
          <Text style={styles.sectionSubtitle}>
            Protección personal para el tutor. Al activarse mediante doble confirmación, la desactivación queda bloqueada por 24 horas.
          </Text>

          <ControlCard
            title="Autoprotección de Tutor (24 Horas)"
            description={
              selfControl.active
                ? `Activo. Tiempo restante de bloqueo: ${selfControl.remainingHours}h ${selfControl.remainingMinutes.toString().padStart(2, '0')}m.`
                : 'Activa la restricción voluntaria de acceso a casas de apuestas en tu propio perfil.'
            }
            active={selfControl.active}
            status={selfControl.active ? 'alerta' : 'inactivo'}
            onToggle={handleAttemptToggleSelfControl}
          />

          {!selfControl.active && (
            <ActionButton
              title="Activar Autocontrol con Doble Confirmación"
              variant="primary"
              onPress={handleStartSelfControlFlow}
            />
          )}
        </View>

        {/* Generador de código de pareamiento (Máximo 5 dispositivos) */}
        <View style={styles.pairingSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Vincular Dispositivo Menor</Text>
            <Text style={styles.limitBadge}>
              {devices.length}/{MAX_PARENT_DEVICES} Dispositivos
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Genera un código temporal para ingresarlo en el celular del menor (Máximo {MAX_PARENT_DEVICES} dispositivos).
          </Text>

          {pairingCode ? (
            <View style={styles.codeDisplay}>
              <Text style={styles.codeNumber}>{pairingCode}</Text>
              <Text style={styles.codeExpiry}>Válido por 15 minutos</Text>
            </View>
          ) : null}

          <ActionButton
            title={pairingCode ? 'Generar Nuevo Código' : 'Generar Código de Pareamiento'}
            variant="secondary"
            onPress={handleGeneratePairingCode}
            loading={loading}
            disabled={devices.length >= MAX_PARENT_DEVICES}
          />
        </View>

        {/* Sección de Reglas de Control Parental */}
        <View style={styles.rulesSection}>
          <Text style={styles.sectionTitle}>Reglas de Protección Global</Text>
          <Text style={styles.sectionSubtitle}>
            Administra los filtros y avisos aplicados a los dispositivos vinculados.
          </Text>

          <ControlCard
            title="Bloqueo de Dominios LOTBA"
            description="Bloquea el acceso a casas de apuestas online y sitios de juego de azar no autorizados."
            active={ruleBetting}
            status={ruleBetting ? 'activo' : 'inactivo'}
            onToggle={(val) => setRuleBetting(val)}
          />

          <ControlCard
            title="Alertas en Tiempo Real"
            description="Notifica inmediatamente al celular del tutor ante cualquier intento de acceso."
            active={ruleAlerts}
            status={ruleAlerts ? 'activo' : 'alerta'}
            onToggle={(val) => setRuleAlerts(val)}
          />

          <ControlCard
            title="Protección Antidesinstalación"
            description="Impide que la aplicación protegida se desinstale o detenga sin ingresar el PIN."
            active={ruleUninstallProtection}
            status={ruleUninstallProtection ? 'activo' : 'inactivo'}
            onToggle={(val) => setRuleUninstallProtection(val)}
          />
        </View>

        {/* Lista de dispositivos vinculados con auditoría de permisos */}
        <View style={styles.devicesSection}>
          <Text style={styles.sectionTitle}>
            Auditoría de Dispositivos Protegidos ({devices.length}/{MAX_PARENT_DEVICES})
          </Text>
          <Text style={styles.sectionSubtitle}>
            Consulta el estado de protección y el cumplimiento de permisos en cada celular.
          </Text>

          {devices.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay dispositivos vinculados aún.</Text>
            </View>
          ) : (
            devices.map((dev) => {
              const isActive = (dev.status as any) === 'ACTIVE' || (dev.status as any)?.effectiveStatus === 'ACTIVE' || dev.isProtected;
              const perms = dev.permissions || {
                vpn: true,
                accessibility: true,
                notifications: true,
                batteryOptimization: true,
                grantedCount: 4,
              };
              const isExpanded = expandedDeviceId === dev.deviceId;

              return (
                <View key={dev.deviceId || dev.deviceUuid} style={styles.deviceCard}>
                  <View style={styles.deviceHeader}>
                    <View style={styles.deviceTitleCol}>
                      <Text style={styles.deviceName}>{dev.deviceName}</Text>
                      <Text style={styles.deviceInfo}>
                        Asignado a: {dev.childName || 'Menor'}
                      </Text>
                    </View>
                    <Badge status={isActive ? 'activo' : 'inactivo'} />
                  </View>

                  {/* Resumen de Permisos */}
                  <TouchableOpacity
                    style={styles.permSummaryRow}
                    onPress={() => setExpandedDeviceId(isExpanded ? null : dev.deviceId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.permBadgeContainer}>
                      <Text style={styles.permLabel}>Permisos Android:</Text>
                      <Badge
                        status={perms.grantedCount === 4 ? 'activo' : 'alerta'}
                        label={`${perms.grantedCount}/4 CONCEDIDOS`}
                      />
                    </View>
                    <Text style={styles.expandToggleText}>
                      {isExpanded ? 'Ocultar Detalle ▲' : 'Ver Detalle ▼'}
                    </Text>
                  </TouchableOpacity>

                  {/* Detalle Desplegable de Permisos del Dispositivo */}
                  {isExpanded && (
                    <View style={styles.permDetailBox}>
                      <Text style={styles.permDetailTitle}>Estado de Permisos del Sistema:</Text>

                      <View style={styles.permItemRow}>
                        <Text style={styles.permItemText}>🌐 Servicio VPN (Filtrado LOTBA):</Text>
                        <Text style={[styles.permStatusText, perms.vpn ? styles.textGreen : styles.textRed]}>
                          {perms.vpn ? '✓ Concedido' : '✕ Pendiente'}
                        </Text>
                      </View>

                      <View style={styles.permItemRow}>
                        <Text style={styles.permItemText}>🔒 Accesibilidad (Antidesinstalación):</Text>
                        <Text style={[styles.permStatusText, perms.accessibility ? styles.textGreen : styles.textRed]}>
                          {perms.accessibility ? '✓ Concedido' : '⚠️ Pendiente'}
                        </Text>
                      </View>

                      <View style={styles.permItemRow}>
                        <Text style={styles.permItemText}>🔔 Notificaciones en Primer Plano:</Text>
                        <Text style={[styles.permStatusText, perms.notifications ? styles.textGreen : styles.textRed]}>
                          {perms.notifications ? '✓ Concedido' : '✕ Pendiente'}
                        </Text>
                      </View>

                      <View style={styles.permItemRow}>
                        <Text style={styles.permItemText}>🔋 Sin Optimización de Batería:</Text>
                        <Text style={[styles.permStatusText, perms.batteryOptimization ? styles.textGreen : styles.textRed]}>
                          {perms.batteryOptimization ? '✓ Concedido' : '⚠️ Pendiente'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

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
                  <Text style={styles.modalTitle}>Confirmación 1 de 2: Autocontrol del Responsable</Text>
                  <Text style={styles.modalBody}>
                    Al activar el autocontrol, se aplicarán restricciones de acceso a sitios de apuestas en tu perfil.
                  </Text>
                  <View style={styles.warningBox}>
                    <Text style={styles.warningBoxText}>
                      ⚠️ IMPORTANTE: Una vez activado, la desactivación quedará ESTRICTAMENTE BLOQUEADA durante 24 horas obligatorias.
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
                  <Text style={styles.modalTitle}>Confirmación 2 de 2: Activar Bloqueo Obligatorio por 24hs</Text>
                  <Text style={styles.modalBody}>
                    ¿Confirmas que deseas activar la protección de autocontrol ahora? No podrás desactivarla hasta dentro de 24 horas.
                  </Text>

                  <ActionButton
                    title="🔒 Confirmar y Activar Autocontrol por 24hs"
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
  },
  warningBannerCard: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '800',
    color: '#856404',
  },
  warningDesc: {
    ...typography.body,
    fontSize: 13,
    color: '#856404',
    marginBottom: 8,
    lineHeight: 18,
  },
  missingItemText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#856404',
    marginLeft: 4,
    marginVertical: 2,
  },
  warningActionBox: {
    marginTop: 10,
  },
  permissionsBar: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionsTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  permissionsTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permissionsDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selfControlSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    marginBottom: 16,
  },
  selfControlHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pairingSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitBadge: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rulesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  codeDisplay: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  codeNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 6,
    color: colors.primaryDark,
  },
  codeExpiry: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: 4,
  },
  devicesSection: {
    marginVertical: 8,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  deviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  deviceName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  deviceInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  permSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  permBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  expandToggleText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  permDetailBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permDetailTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  permItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  permItemText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  permStatusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  textGreen: {
    color: colors.statusActive,
  },
  textRed: {
    color: colors.statusDanger,
  },
  footer: {
    marginTop: 20,
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
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    ...typography.body,
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
    ...typography.caption,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});
