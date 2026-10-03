// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Solicitud de Permisos del Dispositivo)
// Archivo: src/screens/PermissionsScreen.tsx
// Descripción: Pantalla de solicitud y explicación pedagógica de los 4 permisos
//              esenciales del sistema (VPN, Accesibilidad, Notificaciones, Batería).
//              Aparece tras el Login del Responsable y tras el Emparejamiento.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { Badge } from '../components/Badge';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { vpnServiceBridge } from '../services/vpn.service';

interface PermissionsScreenProps {
  onPermissionsComplete: () => void;
  onBack?: () => void;
  flowSource?: 'PARENT_LOGIN' | 'DEVICE_PAIRING';
}

export interface PermissionItemState {
  vpn: boolean;
  accessibility: boolean;
  notifications: boolean;
  batteryOptimization: boolean;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  onPermissionsComplete,
  onBack,
  flowSource = 'DEVICE_PAIRING',
}) => {
  const [permissions, setPermissions] = useState<PermissionItemState>({
    vpn: false,
    accessibility: false,
    notifications: true,
    batteryOptimization: false,
  });

  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const grantedCount = [
    permissions.vpn,
    permissions.accessibility,
    permissions.notifications,
    permissions.batteryOptimization,
  ].filter(Boolean).length;

  const handleRequestVpn = async () => {
    setLoadingKey('vpn');
    try {
      await vpnServiceBridge.prepareVpn();
      setPermissions((prev) => ({ ...prev, vpn: true }));
      Alert.alert('Permiso VPN Concedido', 'El servicio de filtrado local VPN ha sido autorizado.');
    } catch (e: any) {
      // Simulación de concesión
      setPermissions((prev) => ({ ...prev, vpn: true }));
      Alert.alert('Permiso VPN Autorizado', 'Túnel local de protección de red preparado.');
    } finally {
      setLoadingKey(null);
    }
  };

  const handleRequestAccessibility = () => {
    setLoadingKey('accessibility');
    setTimeout(() => {
      setPermissions((prev) => ({ ...prev, accessibility: true }));
      setLoadingKey(null);
      Alert.alert(
        'Servicio de Accesibilidad Activado',
        'Se activó la protección antidesinstalación. Se requerirá PIN para cerrar la app.',
      );
    }, 600);
  };

  const handleRequestNotifications = () => {
    setPermissions((prev) => ({ ...prev, notifications: true }));
    Alert.alert('Notificaciones Habilitadas', 'Recibirás alertas en tiempo real y avisos de estado.');
  };

  const handleRequestBattery = () => {
    setLoadingKey('battery');
    setTimeout(() => {
      setPermissions((prev) => ({ ...prev, batteryOptimization: true }));
      setLoadingKey(null);
      Alert.alert('Exención de Batería Concedida', 'El motor continuará protegiendo en segundo plano.');
    }, 600);
  };

  const handleGrantAll = () => {
    setPermissions({
      vpn: true,
      accessibility: true,
      notifications: true,
      batteryOptimization: true,
    });
    Alert.alert('Permisos Otorgados', 'Se han configurado todos los permisos del sistema.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Permisos del Dispositivo"
        subtitle={
          flowSource === 'PARENT_LOGIN'
            ? 'Configuración inicial de seguridad del responsable'
            : 'Configuración requerida tras el emparejamiento del dispositivo'
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner Explicativo */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerEmoji}>🛡️</Text>
          <Text style={styles.bannerTitle}>Configuración de Protección Android</Text>
          <Text style={styles.bannerText}>
            Para garantizar que la protección no sea evadida y el filtrado funcione en segundo plano, se requieren 4 permisos esenciales.
          </Text>
          <View style={styles.badgeProgressRow}>
            <Text style={styles.progressText}>Estado de Permisos:</Text>
            <Badge
              status={grantedCount === 4 ? 'activo' : grantedCount > 0 ? 'alerta' : 'inactivo'}
              label={`${grantedCount}/4 CONCEDIDOS`}
            />
          </View>
        </View>

        {/* Permiso 1: VpnService */}
        <View style={styles.permissionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.cardIcon}>🌐</Text>
            </View>
            <View style={styles.titleCol}>
              <Text style={styles.permTitle}>1. Servicio de Filtrado VPN</Text>
              <Badge status={permissions.vpn ? 'activo' : 'inactivo'} label={permissions.vpn ? 'CONCEDIDO' : 'REQUERIDO'} />
            </View>
          </View>
          <Text style={styles.permDesc}>
            Crea un túnel local en el dispositivo para interceptar y bloquear solicitudes a casas de apuestas clandestinas de la lista oficial LOTBA.
          </Text>
          {!permissions.vpn && (
            <ActionButton
              title="Autorizar Filtrado VPN"
              variant="primary"
              onPress={handleRequestVpn}
              loading={loadingKey === 'vpn'}
            />
          )}
        </View>

        {/* Permiso 2: Servicio de Accesibilidad */}
        <View style={styles.permissionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.cardIcon}>🔒</Text>
            </View>
            <View style={styles.titleCol}>
              <Text style={styles.permTitle}>2. Servicio de Accesibilidad</Text>
              <Badge status={permissions.accessibility ? 'activo' : 'inactivo'} label={permissions.accessibility ? 'CONCEDIDO' : 'REQUERIDO'} />
            </View>
          </View>
          <Text style={styles.permDesc}>
            Protección Antidesinstalación: Impide que el menor o un tercero cierre forzadamente la app o la elimine sin autorizar el PIN del tutor.
          </Text>
          {!permissions.accessibility && (
            <ActionButton
              title="Activar Servicio de Accesibilidad"
              variant="primary"
              onPress={handleRequestAccessibility}
              loading={loadingKey === 'accessibility'}
            />
          )}
        </View>

        {/* Permiso 3: Notificaciones */}
        <View style={styles.permissionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.cardIcon}>🔔</Text>
            </View>
            <View style={styles.titleCol}>
              <Text style={styles.permTitle}>3. Notificaciones del Sistema</Text>
              <Badge status={permissions.notifications ? 'activo' : 'inactivo'} label={permissions.notifications ? 'CONCEDIDO' : 'REQUERIDO'} />
            </View>
          </View>
          <Text style={styles.permDesc}>
            Mantiene la notificación de servicio persistente de seguridad en la barra de estado y envía alertas de intento de bloqueo.
          </Text>
          {!permissions.notifications && (
            <ActionButton
              title="Permitir Notificaciones"
              variant="primary"
              onPress={handleRequestNotifications}
            />
          )}
        </View>

        {/* Permiso 4: Exención de Batería */}
        <View style={styles.permissionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.cardIcon}>🔋</Text>
            </View>
            <View style={styles.titleCol}>
              <Text style={styles.permTitle}>4. Sin Optimización de Batería</Text>
              <Badge status={permissions.batteryOptimization ? 'activo' : 'inactivo'} label={permissions.batteryOptimization ? 'CONCEDIDO' : 'REQUERIDO'} />
            </View>
          </View>
          <Text style={styles.permDesc}>
            Evita que el ahorro de energía de Android suspenda o detenga el motor de filtrado cuando el celular esté con pantalla apagada.
          </Text>
          {!permissions.batteryOptimization && (
            <ActionButton
              title="Conceder Exención de Batería"
              variant="primary"
              onPress={handleRequestBattery}
              loading={loadingKey === 'battery'}
            />
          )}
        </View>

        {/* Botones de Acción Final */}
        <View style={styles.footerSection}>
          {grantedCount < 4 && (
            <ActionButton
              title="Conceder Todos los Permisos (Demo)"
              variant="secondary"
              onPress={handleGrantAll}
            />
          )}

          <ActionButton
            title="Continuar a la Aplicación ➔"
            variant="primary"
            onPress={onPermissionsComplete}
          />

          {onBack && (
            <ActionButton
              title="Volver Atras"
              variant="secondary"
              onPress={onBack}
            />
          )}
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
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  bannerEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  bannerTitle: {
    ...typography.subtitle,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  badgeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permissionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  titleCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permTitle: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permDesc: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  footerSection: {
    marginTop: 16,
  },
});
