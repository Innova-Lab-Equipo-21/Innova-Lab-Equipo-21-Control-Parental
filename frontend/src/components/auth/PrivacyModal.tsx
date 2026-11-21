// ==============================================================================
// Proyecto: BA Protege+
// Componente: PrivacyModal (Modal de Políticas de privacidad)
// Archivo: src/components/auth/PrivacyModal.tsx
// Descripción: Modal Bottom Sheet que presenta las Políticas de privacidad oficiales
//              de BA Protege + en conformidad con la Ley N° 25.326 de Protección
//              de Datos Personales.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {
  legalStyles,
  LEGAL_SHEET_HEIGHT_RATIO,
  LEGAL_SHEET_PADDING_TOP,
  LEGAL_SHEET_PADDING_BOTTOM,
} from './LegalModal.styles';

export interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRIVACY_SECTIONS = [
  {
    title: '1. Tu privacidad nos importa',
    body: 'Por disposición de la Ley N° 25.326, tus datos privados quedan resguardados en tu celular. Nunca vamos a comercializar ni vender tus datos a anunciantes ni a terceros.',
  },
  {
    title: '2. ¿Qué información recopilamos?',
    body: 'Únicamente los datos mínimos e indispensables (nombre, apellido, correo electrónico, teléfono, fecha de nacimiento, identificador del dispositivo y registros de intentos de acceso a sitios bloqueados).',
  },
  {
    title: '3. ¿Cómo usamos la geolocalización?',
    body: 'La dirección IP de los dispositivos y la ubicación se utilizan únicamente para mantener activa la seguridad y vincular las cuentas entre personas responsables y protegidas.',
  },
  {
    title: '4. Garantizamos tu seguridad',
    body: 'Toda la comunicación entre tu dispositivo y nuestros servidores viaja cifrada mediante el protocolo TLS 1.3/HTTPS, lo que significa que ningún tercero puede acceder a esa información.',
  },
];

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  visible,
  onClose,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const [overlayHeight, setOverlayHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(64);
  const [footerHeight, setFooterHeight] = useState(62);

  const effectiveHeight = overlayHeight > 0 ? overlayHeight : windowHeight;
  const sheetHeight = Math.round(effectiveHeight * LEGAL_SHEET_HEIGHT_RATIO);
  const scrollHeight = Math.max(
    180,
    sheetHeight -
      LEGAL_SHEET_PADDING_TOP -
      LEGAL_SHEET_PADDING_BOTTOM -
      headerHeight -
      footerHeight,
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={legalStyles.legalModalOverlay}
        onLayout={(e) => {
          const measured = Math.round(e.nativeEvent.layout.height);
          if (measured > 0 && Math.abs(measured - overlayHeight) > 1) {
            setOverlayHeight(measured);
          }
        }}
      >
        {/* Fondo oscurecido detrás del sheet: cierra el modal sin interceptar el scroll */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar políticas de privacidad"
        />

        <View style={[legalStyles.legalModalSheet, { height: sheetHeight }]}>
          <View
            style={legalStyles.legalModalHeaderSection}
            onLayout={(e) => {
              const measured = Math.round(e.nativeEvent.layout.height);
              if (measured > 0 && Math.abs(measured - headerHeight) > 1) {
                setHeaderHeight(measured);
              }
            }}
          >
            {/* Manija táctil del Bottom Sheet */}
            <View style={legalStyles.bottomSheetHandle} />

            <View style={legalStyles.legalModalHeader}>
              <Text style={legalStyles.legalModalTitle}>Políticas de privacidad</Text>
              <TouchableOpacity
                onPress={onClose}
                style={legalStyles.legalModalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Text style={legalStyles.legalModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={[legalStyles.legalModalScroll, { height: scrollHeight }]}
            contentContainerStyle={legalStyles.legalModalBodyContent}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            nestedScrollEnabled={true}
            overScrollMode="never"
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={legalStyles.legalIntroText}>
              Tus datos personales están protegidos bajo la Ley N° 25.326.
            </Text>

            {PRIVACY_SECTIONS.map((section) => (
              <View key={section.title} style={legalStyles.legalItemCard}>
                <Text style={legalStyles.legalItemTitle}>{section.title}</Text>
                <Text style={legalStyles.legalItemText}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>

          <View
            style={legalStyles.legalModalFooter}
            onLayout={(e) => {
              const measured = Math.round(e.nativeEvent.layout.height);
              if (measured > 0 && Math.abs(measured - footerHeight) > 1) {
                setFooterHeight(measured);
              }
            }}
          >
            <TouchableOpacity
              style={legalStyles.legalModalConfirmBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={legalStyles.legalModalConfirmBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
