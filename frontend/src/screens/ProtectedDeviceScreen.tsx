// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Dispositivo Protegido)
// Archivo: src/screens/ProtectedDeviceScreen.tsx
// Descripción: Panel de control local del dispositivo protegido con estado de VPN en vivo,
//              sincronización de listas LOTBA y envío de latidos de telemetría.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Header } from '../components/Header';
import { StatusCard } from '../components/StatusCard';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme/colors';
import { vpnServiceBridge } from '../services/vpn.service';
import { apiService } from '../services/api.service';
import { ProtectionStatus } from '../types';

interface ProtectedDeviceScreenProps {
  deviceUuid: string;
  onExitMode: () => void;
}

export const ProtectedDeviceScreen: React.FC<ProtectedDeviceScreenProps> = ({
  deviceUuid,
  onExitMode,
}) => {
  const [status, setStatus] = useState<ProtectionStatus>('ACTIVE');
  const [domainCount, setDomainCount] = useState<number>(4);
  const [blocklistVersion, setBlocklistVersion] = useState<number>(1);
  const [lastSyncText, setLastSyncText] = useState<string>('Ahora');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    checkVpnStatus();
    syncBlocklist();

    // Configurar temporizador periódico para envío de telemetría (Heartbeat)
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

  const toggleProtection = async () => {
    setLoading(true);
    try {
      if (status === 'ACTIVE') {
        await vpnServiceBridge.stopProtection();
        setStatus('INACTIVE');
        // Reportar evento de seguridad al backend
        await apiService.reportSecurityEvent({
          deviceUuid,
          eventType: 'VPN_DISABLED',
          description: 'El motor de protección fue pausado desde la interfaz local',
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
        permissionsOk: true,
        blocklistVersion,
        appVersion: '1.0.0',
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
        <StatusCard
          status={status}
          domainCount={domainCount}
          blocklistVersion={blocklistVersion}
          lastSyncText={lastSyncText}
        />

        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Controles del Motor de Filtrado</Text>
          
          <ActionButton
            title={status === 'ACTIVE' ? 'Pausar Protección' : 'Reanudar Protección'}
            variant={status === 'ACTIVE' ? 'danger' : 'primary'}
            onPress={toggleProtection}
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
  actionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  footer: {
    marginTop: 20,
  },
});
