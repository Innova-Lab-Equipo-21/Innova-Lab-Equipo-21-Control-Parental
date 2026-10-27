// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla del Dispositivo Protegido)
// Archivo: src/screens/ProtectedDeviceScreen.tsx
// Descripción: Panel del usuario protegido (Menor / Adulto) estructurado en 4 módulos
//              (Actividad, Inicio, Sitios y apps, Cuenta) con Quiz diario interactivo,
//              FAB (+) de bloqueo ubicado exclusivamente en "Sitios y apps" y validación
//              por PIN de tutor.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { ProtectedNavbar, ProtectedTab } from '../components/dashboard/protected/ProtectedNavbar';
import { ProtectedInicioSection } from '../components/dashboard/protected/ProtectedInicioSection';
import { ProtectedActividadSection } from '../components/dashboard/protected/ProtectedActividadSection';
import { ProtectedSitiosSection } from '../components/dashboard/protected/ProtectedSitiosSection';
import { ProtectedCuentaSection } from '../components/dashboard/protected/ProtectedCuentaSection';
import { BlockModal } from '../components/dashboard/protected/BlockModal';
import { PinKeyboard } from '../components/PinKeyboard';
import { ActionButton } from '../components/ActionButton';
import { FabWithTooltip } from '../components/FabWithTooltip';
import { PermissionItemState } from './PermissionsScreen';
import { vpnServiceBridge } from '../services/vpn.service';
import { apiService } from '../services/api.service';
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
}) => {
  // Pestaña activa en la navbar (Por defecto: 'inicio')
  const [activeTab, setActiveTab] = useState<ProtectedTab>('inicio');

  // Modal FAB (+): Bloqueo rápido de sitio o app
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [customBlockedItems, setCustomBlockedItems] = useState<string[]>([
    'casino-clandestino.net',
    'red-social-peligrosa.org',
  ]);

  // Modal Teclado PIN para tutor
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    checkVpnStatus();
    loadCustomBlockedList();
  }, []);

  const checkVpnStatus = async () => {
    try {
      await vpnServiceBridge.isProtectionActive();
    } catch (e) {
      console.warn('Servicio VPN en modo emulador');
    }
  };

  const loadCustomBlockedList = async () => {
    try {
      const res = await apiService.getCustomBlocklist();
      if (res.data?.domains && res.data.domains.length > 0) {
        setCustomBlockedItems(res.data.domains.map((d) => d.domain));
      }
    } catch (e) {
      // Usar elementos locales por defecto
    }
  };

  const handleBlockSuccess = (item: { domainOrApp: string; type: 'SITE' | 'APP' }) => {
    setCustomBlockedItems((prev) => [item.domainOrApp, ...prev.filter((d) => d !== item.domainOrApp)]);
    // Forzar actualización de filtrado VPN
    vpnServiceBridge.updateBlocklist(5, [item.domainOrApp]);
  };

  const handlePinKeyPress = (key: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + key;
      setEnteredPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234') {
          setShowPinModal(false);
          setEnteredPin('');
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          } else {
            Alert.alert('PIN correcto', 'Acción de tutor autorizada exitosamente.');
          }
        } else {
          Alert.alert('PIN incorrecto', 'El código de tutor es inválido (Demo: 1234). Intenta nuevamente.');
          setEnteredPin('');
        }
      }
    }
  };

  const handlePinDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const triggerTutorPinAction = (action: () => void) => {
    setPendingAction(() => action);
    setEnteredPin('');
    setShowPinModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. TOP HEADER INSTITUCIONAL (#EAF3FF) CON LOGO Y BADGE DE MODO */}
      <View style={styles.topHeaderBar}>
        <View style={styles.topHeaderLeft}>
          <Image
            source={require('../assets/logo/logo_baprotege_texto.png')}
            style={styles.topHeaderLogo}
            resizeMode="contain"
            accessibilityLabel="BA Protege +"
          />
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeBadgeText}>
            {mode === 'CHILD' ? '👦 PERFIL MENOR' : '👤 PERFIL ADULTO'}
          </Text>
        </View>
      </View>

      {/* 2. CONTENIDO PRINCIPAL SEGÚN PESTAÑA ACTIVA (Actividad, Inicio, Sitios y apps, Cuenta) */}
      <View style={styles.scrollBody}>
        {activeTab === 'inicio' && (
          <ProtectedInicioSection
            mode={mode}
            tutorName="Ana"
            onNavigateToActivity={() => setActiveTab('actividad')}
          />
        )}

        {activeTab === 'actividad' && (
          <ProtectedActividadSection
            customBlockedItems={customBlockedItems}
            onOpenPinModal={() => triggerTutorPinAction(() => {
              Alert.alert('Modificación autorizada', 'Has ingresado el PIN del tutor.');
            })}
          />
        )}

        {activeTab === 'sitios' && (
          <ProtectedSitiosSection
            customBlockedItems={customBlockedItems}
            onOpenPinModal={() => triggerTutorPinAction(() => {
              Alert.alert('Modificación autorizada', 'Has ingresado el PIN del tutor.');
            })}
          />
        )}

        {activeTab === 'cuenta' && (
          <ProtectedCuentaSection
            deviceUuid={deviceUuid}
            mode={mode}
            tutorName="Ana"
            onExitMode={onExitMode}
            onOpenPinModal={() => triggerTutorPinAction(() => {
              Alert.alert('Tutor autorizado', 'Modificación de estado habilitada.');
            })}
          />
        )}
      </View>

      {/* 3. BOTÓN FLOTANTE FAB (+) UBICADO EXCLUSIVAMENTE EN EL MÓDULO "SITIOS Y APPS" */}
      {activeTab === 'sitios' && (
        <FabWithTooltip
          label="Bloquear sitio o app"
          onPress={() => setShowBlockModal(true)}
        />
      )}

      {/* 4. NAVBAR INFERIOR DE 4 MÓDULOS (Actividad, Inicio, Sitios y apps, Cuenta) */}
      <ProtectedNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* MODAL DE BLOQUEO RÁPIDO (FAB +) */}
      <BlockModal
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onBlockSuccess={handleBlockSuccess}
      />

      {/* MODAL TECLADO PIN PARA VALIDACIÓN DE TUTOR */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PIN del tutor requerido</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa el PIN de 4 dígitos para autorizar esta acción (Demo: 1234).
            </Text>

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

            <PinKeyboard
              onKeyPress={handlePinKeyPress}
              onDelete={handlePinDelete}
              onClear={() => setEnteredPin('')}
            />

            <ActionButton
              title="Cancelar"
              variant="secondary"
              onPress={() => {
                setShowPinModal(false);
                setPendingAction(null);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
