// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Dispositivo Protegido)
// Archivo: src/screens/ProtectedDeviceScreen.tsx
// Descripción: Panel de control local del dispositivo protegido con estado de VPN en vivo,
//              alerta pedagógica de permisos faltantes, teclado PIN y tarjetas del UI Kit.
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
import { StatusCard } from '../components/StatusCard';
import { ControlCard } from '../components/ControlCard';
import { Badge } from '../components/Badge';
import { PinKeyboard } from '../components/PinKeyboard';
import { ActionButton } from '../components/ActionButton';
import { PermissionItemState } from './PermissionsScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { vpnServiceBridge } from '../services/vpn.service';
import { apiService } from '../services/api.service';
import { ProtectionStatus } from '../types';

interface ProtectedDeviceScreenProps {
  deviceUuid: string;
  onExitMode: () => void;
  permissions?: PermissionItemState;
  onOpenPermissions?: () => void;
}

export const ProtectedDeviceScreen: React.FC<ProtectedDeviceScreenProps> = ({
  deviceUuid,
  onExitMode,
  permissions,
  onOpenPermissions,
}) => {
  const [status, setStatus] = useState<ProtectionStatus>('ACTIVE');
  const [domainCount, setDomainCount] = useState<number>(4);
  const [blocklistVersion, setBlocklistVersion] = useState<number>(1);
  const [lastSyncText, setLastSyncText] = useState<string>('Ahora');
  const [loading, setLoading] = useState<boolean>(false);

  // Estados de validación de PIN con el Teclado PIN del UI Kit
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [targetAction, setTargetAction] = useState<'PAUSE' | 'RESUME' | null>(null);

  // Calcular lista de permisos pendientes
  const missingPermissions: string[] = [];
  if (permissions) {
    if (!permissions.vpn) missingPermissions.push('Servicio de Filtrado VPN');
    if (!permissions.accessibility) missingPermissions.push('Servicio de Accesibilidad (Antidesinstalación)');
    if (!permissions.notifications) missingPermissions.push('Notificaciones del Sistema');
    if (!permissions.batteryOptimization) missingPermissions.push('Exención de Batería (Segundo Plano)');
  }
  const grantedCount = permissions ? 4 - missingPermissions.length : 4;

  useEffect(() => {
    checkVpnStatus();
    syncBlocklist();

    const timer = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const checkVpnStatus = async () => {
    try {
      const active = await vpnServiceBridge.isProtectionActive();
      setStatus(active ? 'ACTIVE' : 'INACTIVE');
      const info = await vpnServiceBridge.getBlocklistInfo();
      setDomainCount(info.totalDomains);
      setBlocklistVersion(info.version);
    } catch (e) {
      console.error('Error al consultar estado de VPN:', e);
    }
  };

  const handleRequestToggle = (action: 'PAUSE' | 'RESUME') => {
    setTargetAction(action);
    setEnteredPin('');
    setShowPinModal(true);
  };

  const handlePinKeyPress = (key: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + key;
      setEnteredPin(newPin);
      if (newPin.length === 4) {
        verifyPinAndExecute(newPin);
      }
    }
  };

  const handlePinDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const verifyPinAndExecute = async (pin: string) => {
    if (pin === '1234') {
      setShowPinModal(false);
      if (targetAction === 'PAUSE') {
        await executeToggle(false);
      } else {
        await executeToggle(true);
      }
    } else {
      Alert.alert('PIN Incorrecto', 'El código ingresado es inválido. Intenta nuevamente.');
      setEnteredPin('');
    }
  };

  const executeToggle = async (enable: boolean) => {
    setLoading(true);
    try {
      if (!enable) {
        await vpnServiceBridge.stopProtection();
        setStatus('INACTIVE');
        await apiService.reportSecurityEvent({
          deviceUuid,
          eventType: 'VPN_DISABLED',
          description: 'El motor de protección fue pausado validando PIN del tutor',
        });
      } else {
        await vpnServiceBridge.prepareVpn();
        await vpnServiceBridge.startProtection();
        setStatus('ACTIVE');
      }
      sendHeartbeat();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo cambiar el estado de la protección');
    } finally {
      setLoading(false);
    }
  };

  const syncBlocklist = async () => {
    try {
      const res = await apiService.getDeviceBlocklist(deviceUuid);
      if (res.data?.domains) {
        await vpnServiceBridge.updateBlocklist(res.data.version, res.data.domains);
        setDomainCount(res.data.totalCount);
        setBlocklistVersion(res.data.version);
        setLastSyncText('Reciente');
      }
    } catch (e) {
      console.warn('Operando con lista offline en caché:', e);
    }
  };

  const sendHeartbeat = async () => {
    try {
      const isVpnActive = status === 'ACTIVE';
      await apiService.sendHeartbeat({
        deviceUuid,
        vpnActive: isVpnActive,
        permissionsOk: missingPermissions.length === 0,
        blocklistVersion,
        appVersion: '1.0.0',
        permissions: permissions || {
          vpn: true,
          accessibility: true,
          notifications: true,
          batteryOptimization: true,
        },
      });
      setLastSyncText('Hace 1m');
    } catch (e) {
      console.warn('Falla temporal en el envío de telemetría:', e);
    }
  };

  const simulateBlockedAttempt = async () => {
    const domain = 'apuestas-online-ilegal.bet';
    try {
      await apiService.reportBlockedEvent({
        deviceUuid,
        attemptedDomain: domain,
        sourceListType: 'LOTBA',
      });
      Alert.alert('🛡️ Dominio Bloqueado', `Se bloqueó el acceso simulado a: ${domain}\nRegistrado en la lista oficial LOTBA.`);
    } catch (e) {
      Alert.alert('Simulación Local', `Acceso denegado localmente a ${domain}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Dispositivo Protegido"
        subtitle={`UUID: ${deviceUuid.substring(0, 14)}...`}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Caja de Alerta de Permisos Faltantes */}
        {missingPermissions.length > 0 && (
          <View style={styles.warningBannerCard}>
            <View style={styles.warningHeaderRow}>
              <Text style={styles.warningTitle}>⚠️ Permisos Pendientes ({grantedCount}/4 Concedidos)</Text>
              <Badge status="alerta" label="INCOMPLETO" />
            </View>
            <Text style={styles.warningDesc}>
              El dispositivo no cuenta con la protección completa. Falta autorizar:
            </Text>
            {missingPermissions.map((permText, idx) => (
              <Text key={idx} style={styles.missingItemText}>
                • {permText}
              </Text>
            ))}
            {onOpenPermissions && (
              <View style={styles.warningActionBox}>
                <ActionButton
                  title="Configurar Permisos Faltantes ⚙️"
                  variant="primary"
                  onPress={onOpenPermissions}
                />
              </View>
            )}
          </View>
        )}

        <StatusCard
          status={status}
          domainCount={domainCount}
          blocklistVersion={blocklistVersion}
          lastSyncText={lastSyncText}
        />

        {/* Tarjetas de Control del Kit UI/UX */}
        <View style={styles.rulesContainer}>
          <Text style={styles.sectionTitle}>Estado de Reglas en Dispositivo</Text>
          <ControlCard
            title="Filtrado de Dominios LOTBA"
            description="Motor de protección local VPN activo bloqueando sitios de apuestas."
            active={status === 'ACTIVE'}
            status={status === 'ACTIVE' ? 'activo' : 'inactivo'}
            onToggle={(val) => handleRequestToggle(val ? 'RESUME' : 'PAUSE')}
          />
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Controles del Motor de Filtrado</Text>

          <ActionButton
            title={status === 'ACTIVE' ? 'Pausar Protección (Ingresar PIN)' : 'Reanudar Protección'}
            variant={status === 'ACTIVE' ? 'danger' : 'primary'}
            onPress={() => handleRequestToggle(status === 'ACTIVE' ? 'PAUSE' : 'RESUME')}
            loading={loading}
          />

          <ActionButton
            title="Sincronizar Lista Oficial LOTBA"
            variant="secondary"
            onPress={syncBlocklist}
          />

          <ActionButton
            title="Probar Bloqueo Simulado"
            variant="secondary"
            onPress={simulateBlockedAttempt}
          />
        </View>

        <View style={styles.footer}>
          <ActionButton
            title="Cambiar Modo de Operación"
            variant="secondary"
            onPress={onExitMode}
          />
        </View>

        {/* Modal con Teclado PIN del UI Kit */}
        <Modal
          visible={showPinModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>PIN del Tutor Requerido</Text>
              <Text style={styles.modalSubtitle}>
                Ingresa el PIN de 4 dígitos para autorizar el cambio de estado (Demo: 1234).
              </Text>

              {/* Indicadores de PIN ingresado */}
              <View style={styles.pinDotsRow}>
                {[0, 1, 2, 3].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.pinDot,
                      enteredPin.length > index && styles.pinDotFilled,
                    ]}
                  />
                ))}
              </View>

              {/* Componente Teclado PIN del UI Kit */}
              <PinKeyboard
                onKeyPress={handlePinKeyPress}
                onDelete={handlePinDelete}
                onClear={() => setEnteredPin('')}
              />

              <ActionButton
                title="Cancelar"
                variant="secondary"
                onPress={() => setShowPinModal(false)}
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
    marginBottom: 12,
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
  rulesContainer: {
    marginVertical: 8,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 12,
  },
  footer: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    ...typography.header,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 8,
  },
  pinDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
