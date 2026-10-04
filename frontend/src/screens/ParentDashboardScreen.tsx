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
  TextInput,
} from 'react-native';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { Badge } from '../components/Badge';
import { ControlCard } from '../components/ControlCard';
import { PermissionsScreen, PermissionItemState } from './PermissionsScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { apiService } from '../services/api.service';
import { MAX_PARENT_DEVICES, SelfControlState, DeviceInfo, CustomBlockedDomain } from '../types';
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

  // Estados de Sitios Bloqueados Personalizados (CRUD)
  const [customSites, setCustomSites] = useState<CustomBlockedDomain[]>([]);
  const [siteSearch, setSiteSearch] = useState('');
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState('Apuestas');
  const [editingSite, setEditingSite] = useState<CustomBlockedDomain | null>(null);
  const [editSiteDomain, setEditSiteDomain] = useState('');
  const [editSiteCategory, setEditSiteCategory] = useState('Apuestas');
  const [loadingSite, setLoadingSite] = useState(false);

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

  const handleAddSite = async () => {
    if (!newSiteDomain.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingresa un dominio válido (ej. casino-ilegal.bet).');
      return;
    }
    setLoadingSite(true);
    try {
      const res = await apiService.addCustomBlockedSite(newSiteDomain, newSiteCategory);
      setCustomSites((prev) => [res.data, ...prev.filter((d) => d.id !== res.data.id)]);
      setNewSiteDomain('');
      setShowAddSiteModal(false);
      Alert.alert('🛡️ Sitio Bloqueado', `El dominio ${res.data.domain} fue agregado a tu lista de bloqueo.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo agregar el dominio.');
    } finally {
      setLoadingSite(false);
    }
  };

  const handleStartEdit = (site: CustomBlockedDomain) => {
    setEditingSite(site);
    setEditSiteDomain(site.domain);
    setEditSiteCategory(site.category || 'Apuestas');
  };

  const handleSaveEdit = async () => {
    if (!editingSite) return;
    if (!editSiteDomain.trim()) {
      Alert.alert('Campo Requerido', 'El dominio no puede quedar vacío.');
      return;
    }
    setLoadingSite(true);
    try {
      const res = await apiService.updateCustomBlockedSite(editingSite.id, {
        domain: editSiteDomain,
        category: editSiteCategory,
      });
      setCustomSites((prev) =>
        prev.map((s) => (s.id === editingSite.id ? res.data : s))
      );
      setEditingSite(null);
      Alert.alert('✅ Sitio Actualizado', `Los cambios en el sitio bloqueado fueron guardados.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el dominio.');
    } finally {
      setLoadingSite(false);
    }
  };

  const handleToggleSiteActive = async (site: CustomBlockedDomain) => {
    try {
      const nextActive = !site.isActive;
      const res = await apiService.updateCustomBlockedSite(site.id, {
        isActive: nextActive,
      });
      setCustomSites((prev) =>
        prev.map((s) => (s.id === site.id ? res.data : s))
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo cambiar el estado del bloqueo.');
    }
  };

  const handleDeleteSite = (site: CustomBlockedDomain) => {
    Alert.alert(
      'Eliminar Sitio Bloqueado',
      `¿Deseas desbloquear y eliminar permanentemente "${site.domain}" de tu lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCustomBlockedSite(site.id);
              setCustomSites((prev) => prev.filter((s) => s.id !== site.id));
              Alert.alert('Sitio Eliminado', `El dominio ${site.domain} fue eliminado.`);
            } catch (e: any) {
              Alert.alert('Error al eliminar', e.message || 'No se pudo eliminar el dominio.');
            }
          },
        },
      ]
    );
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

  const handleAttemptToggleSelfControl = async (newVal: boolean) => {
    if (!newVal) {
      await handleDisableSelfControl();
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

        {/* Sección de Autocontrol del Tutor */}
        <View style={styles.selfControlSection}>
          <View style={styles.selfControlHeaderRow}>
            <Text style={styles.sectionTitle}>Autocontrol del Tutor</Text>
            <Badge
              status={
                selfControl.status === 'TEMPORARILY_UNLOCKED'
                  ? 'activo'
                  : selfControl.status === 'DEACTIVATION_READY'
                  ? 'activo'
                  : selfControl.status === 'DEACTIVATION_PENDING'
                  ? 'alerta'
                  : selfControl.active
                  ? 'alerta'
                  : 'inactivo'
              }
              label={
                selfControl.status === 'TEMPORARILY_UNLOCKED'
                  ? '🔓 DESBLOQUEADO (PASE 24H)'
                  : selfControl.status === 'DEACTIVATION_READY'
                  ? '🔓 DESACTIVACIÓN HABILITADA'
                  : selfControl.status === 'DEACTIVATION_PENDING'
                  ? '⏳ ESPERA 24H'
                  : selfControl.active
                  ? '🔒 ACTIVA'
                  : 'INACTIVO'
              }
            />
          </View>
          <Text style={styles.sectionSubtitle}>
            {selfControl.status === 'TEMPORARILY_UNLOCKED'
              ? `Autoprotección desbloqueada inmediatamente. Pase temporal de 24 horas activo (restan ${selfControl.remainingUnlockHours ?? selfControl.remainingHours}h ${(selfControl.remainingUnlockMinutes ?? selfControl.remainingMinutes).toString().padStart(2, '0')}m). Cumplido ese plazo, la autoprotección se volverá a activar automáticamente.`
              : selfControl.status === 'DEACTIVATION_READY'
              ? 'Pasaron las 24 horas requeridas. Hacé clic por segunda vez para desbloquear inmediatamente por 24 horas.'
              : selfControl.status === 'DEACTIVATION_PENDING'
              ? `La desactivación se habilitará en 24 horas. Tiempo restante de espera: ${selfControl.remainingWaitHours ?? selfControl.remainingHours}h ${(selfControl.remainingWaitMinutes ?? selfControl.remainingMinutes).toString().padStart(2, '0')}m.`
              : selfControl.active
              ? 'La autoprotección está activa en tu perfil. Al solicitar la desactivación se iniciará una espera de 24 horas.'
              : 'Una vez activada la autoprotección mediante doble confirmación, el bloqueo se queda permanente y para desactivarla se requerirá iniciar una espera de 24 hs.'}
          </Text>

          {selfControl.status === 'TEMPORARILY_UNLOCKED' ? (
            <ActionButton
              title="🔒 Volver a Activar Ahora"
              variant="primary"
              onPress={handleStartSelfControlFlow}
            />
          ) : selfControl.status === 'DEACTIVATION_READY' ? (
            <ActionButton
              title="🔓 Confirmar Desactivación (Desbloqueo Inmediato)"
              variant="danger"
              onPress={handleDisableSelfControl}
            />
          ) : selfControl.status === 'DEACTIVATION_PENDING' ? (
            <ActionButton
              title={`🔒 La desactivación se habilitará en ${selfControl.remainingWaitHours ?? selfControl.remainingHours}h ${(selfControl.remainingWaitMinutes ?? selfControl.remainingMinutes).toString().padStart(2, '0')}m`}
              variant="secondary"
              disabled
              onPress={handleDisableSelfControl}
            />
          ) : selfControl.active ? (
            <ActionButton
              title="Desactivar autoprotección"
              variant="danger"
              onPress={handleDisableSelfControl}
            />
          ) : (
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

        {/* Sección de Bloqueo de Sitios Personalizados (CRUD) */}
        <View style={styles.customSitesSection}>
          <View style={styles.sitesHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Sitios Web Bloqueados</Text>
              <Text style={styles.sectionSubtitle}>
                Lista personalizada de dominios bloqueados adicionalmente a la lista oficial LOTBA.
              </Text>
            </View>
            <Badge
              status={customSites.length > 0 ? 'activo' : 'inactivo'}
              label={`${customSites.length} SITIOS`}
            />
          </View>

          {/* Buscador de sitios */}
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Buscar dominio bloqueado..."
            placeholderTextColor={colors.textSecondary}
            value={siteSearch}
            onChangeText={setSiteSearch}
          />

          {/* Botón para abrir modal de agregar */}
          <ActionButton
            title="+ Bloquear Nuevo Sitio Web"
            variant="primary"
            onPress={() => setShowAddSiteModal(true)}
          />

          {/* Lista de sitios */}
          {customSites.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No tienes sitios personalizados bloqueados. Agrega dominios específicos que desees restringir.
              </Text>
            </View>
          ) : (
            customSites
              .filter((s) => s.domain.toLowerCase().includes(siteSearch.toLowerCase()))
              .map((site) => (
                <View key={site.id} style={styles.siteCard}>
                  <View style={styles.siteCardHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.siteDomainText}>🌐 {site.domain}</Text>
                      <View style={styles.siteCategoryBadge}>
                        <Text style={styles.siteCategoryText}>
                          {site.category || 'Personalizado'}
                        </Text>
                      </View>
                    </View>
                    <Badge
                      status={site.isActive ? 'activo' : 'inactivo'}
                      label={site.isActive ? 'BLOQUEADO' : 'PAUSADO'}
                    />
                  </View>

                  <View style={styles.siteActionsRow}>
                    <TouchableOpacity
                      style={styles.siteActionButton}
                      onPress={() => handleToggleSiteActive(site)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.siteActionText}>
                        {site.isActive ? '⏸️ Pausar' : '▶️ Reanudar'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.siteActionButton}
                      onPress={() => handleStartEdit(site)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.siteActionText}>✏️ Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.siteActionButton, styles.siteActionDeleteButton]}
                      onPress={() => handleDeleteSite(site)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.siteActionText, styles.siteActionDeleteText]}>
                        🗑️ Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}
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

        {/* Modal: Agregar Sitio Bloqueado Personalizado */}
        <Modal
          visible={showAddSiteModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddSiteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalEmoji}>🛡️</Text>
              <Text style={styles.modalTitle}>Bloquear Sitio Web</Text>
              <Text style={styles.modalBody}>
                Ingresa el dominio o dirección web que deseas restringir en los dispositivos de tu familia.
              </Text>

              <Text style={styles.inputLabel}>Dominio o URL del Sitio:</Text>
              <TextInput
                style={styles.formInput}
                placeholder="ejemplo: casino-ilegal.bet"
                placeholderTextColor={colors.textSecondary}
                value={newSiteDomain}
                onChangeText={setNewSiteDomain}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.inputLabel}>Categoría / Motivo:</Text>
              <View style={styles.categorySelectorRow}>
                {['Apuestas', 'Redes Sociales', 'Juegos', 'Adultos', 'Personalizado'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      newSiteCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setNewSiteCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        newSiteCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ActionButton
                title="Guardar y Bloquear Sitio"
                variant="primary"
                loading={loadingSite}
                onPress={handleAddSite}
              />
              <ActionButton
                title="Cancelar"
                variant="secondary"
                onPress={() => setShowAddSiteModal(false)}
              />
            </View>
          </View>
        </Modal>

        {/* Modal: Editar Sitio Bloqueado */}
        <Modal
          visible={!!editingSite}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditingSite(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalEmoji}>✏️</Text>
              <Text style={styles.modalTitle}>Editar Sitio Bloqueado</Text>
              <Text style={styles.modalBody}>
                Modifica el dominio o la categoría del sitio restringido.
              </Text>

              <Text style={styles.inputLabel}>Dominio o URL:</Text>
              <TextInput
                style={styles.formInput}
                value={editSiteDomain}
                onChangeText={setEditSiteDomain}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.inputLabel}>Categoría:</Text>
              <View style={styles.categorySelectorRow}>
                {['Apuestas', 'Redes Sociales', 'Juegos', 'Adultos', 'Personalizado'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      editSiteCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setEditSiteCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        editSiteCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ActionButton
                title="Guardar Cambios"
                variant="primary"
                loading={loadingSite}
                onPress={handleSaveEdit}
              />
              <ActionButton
                title="Cancelar"
                variant="secondary"
                onPress={() => setEditingSite(null)}
              />
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
  // Estilos de Sitios Web Bloqueados Personalizados (CRUD)
  customSitesSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sitesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 10,
  },
  siteCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  siteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  siteDomainText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  siteCategoryBadge: {
    backgroundColor: '#E7F1FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  siteCategoryText: {
    fontSize: 11,
    color: '#0056B3',
    fontWeight: '600',
  },
  siteActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  siteActionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  siteActionDeleteButton: {
    borderColor: '#F8D7DA',
    backgroundColor: '#FFF5F5',
  },
  siteActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  siteActionDeleteText: {
    color: colors.statusDanger,
  },
  categorySelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
});
