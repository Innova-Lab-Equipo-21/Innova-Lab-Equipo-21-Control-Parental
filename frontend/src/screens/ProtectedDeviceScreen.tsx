// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Dispositivo Protegido)
// Archivo: src/screens/ProtectedDeviceScreen.tsx
// Descripción: Panel de control del dispositivo protegido diferenciado para Menor
//              y Adulto en tratamiento con contenidos educativos especializados,
//              línea de orientación 24hs, estado VPN y teclado PIN.
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
import { StatusCard } from '../components/StatusCard';
import { ControlCard } from '../components/ControlCard';
import { Badge } from '../components/Badge';
import { PinKeyboard } from '../components/PinKeyboard';
import { ActionButton } from '../components/ActionButton';
import { PermissionItemState } from './PermissionsScreen';
import { vpnServiceBridge } from '../services/vpn.service';
import { apiService } from '../services/api.service';
import { ProtectionStatus } from '../types';
import { styles } from './ProtectedDeviceScreen.styles';

interface ProtectedDeviceScreenProps {
  deviceUuid: string;
  onExitMode: () => void;
  mode?: 'CHILD' | 'ADULT';
  permissions?: PermissionItemState;
  onOpenPermissions?: () => void;
}

export const ProtectedDeviceScreen: React.FC<ProtectedDeviceScreenProps> = ({
  deviceUuid,
  onExitMode,
  mode = 'CHILD',
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
    if (!permissions.location) missingPermissions.push('Ubicación y Geolocalización (GPS)');
  }
  const grantedCount = permissions ? 5 - missingPermissions.length : 5;

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

  const handleCallAssistance = () => {
    Alert.alert(
      '📞 Línea de Orientación 24hs',
      'Llamando a la Línea Gratuita de Asistencia y Prevención de Ludopatía: 0800-444-5682',
      [{ text: 'Aceptar', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={mode === 'ADULT' ? 'Dispositivo Adulto Protegido' : 'Dispositivo Menor Protegido'}
        subtitle={
          mode === 'ADULT'
            ? 'Acompañamiento digital y autoprotección activa'
            : 'Protección digital contra casas de apuestas e internet seguro'
        }
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

        {/* CONTENIDO EDUCATIVO Y DE ORIENTACIÓN ESPECIALIZADO POR PERFIL */}
        {mode === 'ADULT' ? (
          /* DASHBOARD Y RECURSOS PARA ADULTO PROTEGIDO */
          <View style={styles.educationalSection}>
            <Text style={styles.sectionTitle}>Acompañamiento y Prevención 💜</Text>
            <Text style={styles.sectionSubtitle}>
              Recursos de autoprotección, orientación profesional y manejo de impulsos.
            </Text>

            {/* Tarjeta 1: Asistencia 24/7 */}
            <View style={[styles.eduCard, styles.adultSpecialCard]}>
              <View style={styles.eduCardHeader}>
                <Text style={styles.eduCardEmoji}>📞</Text>
                <Text style={[styles.eduCardTitle, styles.adultTitleText]}>
                  Línea de Asistencia al Jugador Compulsivo
                </Text>
              </View>
              <Text style={styles.eduCardBody}>
                Atención confidencial, gratuita y profesional las 24hs para contención emocional y prevención de recaídas.
              </Text>

              <View style={{ marginTop: 10 }}>
                <ActionButton
                  title="📞 Llamar a Línea 0800-444-5682 (24hs)"
                  variant="primary"
                  onPress={handleCallAssistance}
                />
              </View>
            </View>

            {/* Tarjeta 2: Manejo de Impulsos */}
            <View style={styles.eduCard}>
              <View style={styles.eduCardHeader}>
                <Text style={styles.eduCardEmoji}>🧠</Text>
                <Text style={styles.eduCardTitle}>
                  Estrategias para el Manejo de Impulsos
                </Text>
              </View>
              <Text style={styles.eduCardBody}>
                Aprende a reconocer señales de ansiedad. Pausa antes de actuar, respira profundo y reemplaza el impulso de juego por hábitos saludables.
              </Text>
            </View>

            {/* Tarjeta 3: Red de Apoyo */}
            <View style={styles.eduCard}>
              <View style={styles.eduCardHeader}>
                <Text style={styles.eduCardEmoji}>🤝</Text>
                <Text style={styles.eduCardTitle}>
                  Red de Apoyo y Transparencia
                </Text>
              </View>
              <Text style={styles.eduCardBody}>
                Mantén comunicación abierta con tu tutor o referente asignado. Compartir tus metas fortalece el camino de recuperación.
              </Text>
            </View>
          </View>
        ) : (
          /* DASHBOARD Y RECURSOS PARA MENOR PROTEGIDO */
          <View style={styles.educationalSection}>
            <Text style={styles.sectionTitle}>Aprende a Navegar Seguro 🚀</Text>
            <Text style={styles.sectionSubtitle}>
              Información sobre tu seguridad digital y protección en internet.
            </Text>

            {/* Tarjeta 1 */}
            <View style={styles.eduCard}>
              <View style={styles.eduCardHeader}>
                <Text style={styles.eduCardEmoji}>🎮</Text>
                <Text style={styles.eduCardTitle}>
                  ¿Por qué las apuestas están prohibidas para menores?
                </Text>
              </View>
              <Text style={styles.eduCardBody}>
                Las apuestas online generan riesgos de adicción y pérdidas económicas. Por ley, la participación está restringida a mayores de 18 años.
              </Text>
            </View>

            {/* Tarjeta 2 */}
            <View style={styles.eduCard}>
              <View style={styles.eduCardHeader}>
                <Text style={styles.eduCardEmoji}>🛡️</Text>
                <Text style={styles.eduCardTitle}>
                  Consejos para cuidar tu privacidad
                </Text>
              </View>
              <Text style={styles.eduCardBody}>
                Nunca compartas tus contraseñas, no abras enlaces desconocidos en redes sociales y avisa a tu tutor si ves publicidad sospechosa.
              </Text>
            </View>

            {/* Tarjeta 3 */}
            <View style={styles.eduCard}>
              <View style={styles.eduCardHeader}>
                <Text style={styles.eduCardEmoji}>📞</Text>
                <Text style={styles.eduCardTitle}>
                  Línea Gratuita de Orientación 24hs
                </Text>
              </View>
              <Text style={styles.eduCardBody}>
                Si tienes dudas sobre seguridad en internet, puedes comunicarte gratis las 24hs al <Text style={styles.boldText}>0800-444-5682</Text>.
              </Text>
            </View>
          </View>
        )}

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
