// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Pantalla de Acción Inicial del Responsable)
// Archivo: src/screens/ResponsibleActionScreen.tsx
// Descripción: Pantalla mostrada únicamente en el primer acceso del usuario
//              Responsable tras conceder permisos:
//              - Vincular dispositivo: abre el modal "Vincular nuevo dispositivo"
//                y, al guardar el dispositivo, continúa directo a Inicio (Home).
//              - Configurar este dispositivo: continúa a "Sitios y apps" para
//                incluir sitios/apps y activar la Autoprotección.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Icon } from '../components/Icon';
import { colors } from '../theme/colors';
import { ResponsibleHelpModal } from '../components/auth/ResponsibleHelpModal';
import { PairingModal } from '../components/dashboard/dispositivos';
import { apiService } from '../services/api.service';
import { styles } from './ResponsibleActionScreen.styles';

interface ResponsibleActionScreenProps {
  userName?: string;
  onSelectAction: (
    actionType: 'SUPERVISE' | 'SELF_CONTROL',
    addedDeviceName?: string
  ) => void;
  onBack: () => void;
}

export const ResponsibleActionScreen: React.FC<ResponsibleActionScreenProps> = ({
  userName = '',
  onSelectAction,
  onBack,
}) => {
  const [helpModalVisible, setHelpModalVisible] = useState<boolean>(false);
  const [showPairingModal, setShowPairingModal] = useState<boolean>(false);
  const [deviceCount, setDeviceCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    apiService
      .listDevices()
      .then((res) => {
        if (mounted && Array.isArray(res.data)) {
          setDeviceCount(res.data.length);
          // Si el Responsable ya cuenta con algún dispositivo registrado, omitir "Elegir protección"
          if (res.data.length > 0) {
            onSelectAction('SUPERVISE');
          }
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [onSelectAction]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Encabezado Superior Institucional con logo_baprotege_texto.png sobre fondo #EAF3FF */}
      <View style={styles.topHeaderBar}>
        <Image
          source={require('../assets/logo/logo_baprotege_texto.png')}
          style={styles.topHeaderLogo}
          resizeMode="contain"
          accessibilityLabel="BA Protege +"
        />
      </View>

      {/* 2. Subheader con botón volver (solo flecha, sin título) */}
      <View style={styles.subHeaderRow}>
        <View style={styles.subHeaderLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Volver"
          >
            <Image
              source={require('../assets/icons/volver.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Sección de Títulos y Saludo */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>¡Hola, {userName}!</Text>
          <Text style={styles.mainSubtitle}>¿Qué te gustaría hacer hoy?</Text>
        </View>

        {/* CONTENEDOR DE BLOQUES DISTRIBUIDO PARA OCUPAR MÁS ESPACIO */}
        <View style={styles.blocksContainer}>
          {/* CARD 1: PROTEGER OTRO DISPOSITIVO */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="celular" size={26} color={colors.primary} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Proteger otro dispositivo</Text>
            </View>

            <Text style={styles.cardDesc}>
              Vinculá el celular o la tablet de un menor a tu cargo o de una persona adulta que necesite tu acompañamiento en la navegación digital.
            </Text>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setShowPairingModal(true)}
              activeOpacity={0.85}
              accessibilityLabel="Vincular dispositivo"
            >
              <Text style={styles.actionBtnText}>Vincular dispositivo</Text>
            </TouchableOpacity>
          </View>

          {/* CARD 2: EJERCER AUTOPROTECCIÓN */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="reloj" size={26} color={colors.primary} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Ejercer autoprotección</Text>
            </View>

            <Text style={styles.cardDesc}>
              Elegí qué sitios y apps bloquear en este dispositivo y administrá el tiempo de uso de las aplicaciones para cuidar tu propio bienestar digital.
            </Text>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onSelectAction('SELF_CONTROL')}
              activeOpacity={0.85}
              accessibilityLabel="Configurar este dispositivo"
            >
              <Text style={styles.actionBtnText}>Configurar este dispositivo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de Ayuda (FAB inferior derecha junto al último bloque) */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>¿Necesitás ayuda?</Text>
          <TouchableOpacity
            style={styles.helpIconBtn}
            onPress={() => setHelpModalVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="¿Necesitás ayuda?"
          >
            <Image
              source={require('../assets/icons/pregunta.png')}
              style={styles.helpIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para Vincular Nuevo Dispositivo directamente desde Elegir protección */}
      <PairingModal
        visible={showPairingModal}
        deviceCount={deviceCount}
        onClose={() => setShowPairingModal(false)}
        onDeviceCreated={(newDev) => {
          setDeviceCount((prev) => prev + 1);
        }}
        onDeviceAdded={(savedName) => {
          setShowPairingModal(false);
          onSelectAction('SUPERVISE', savedName);
        }}
      />

      {/* Modal de Ayuda con el mismo estilo de TermsModal */}
      <ResponsibleHelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />
    </SafeAreaView>
  );
};
