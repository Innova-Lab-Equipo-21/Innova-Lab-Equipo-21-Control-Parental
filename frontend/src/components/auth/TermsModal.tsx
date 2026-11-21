// ==============================================================================
// Proyecto: BA Protege+
// Componente: TermsModal (Modal de Términos y condiciones)
// Archivo: src/components/auth/TermsModal.tsx
// Descripción: Modal Bottom Sheet que presenta los Términos y condiciones oficiales
//              de BA Protege + provistos por LOTBA para la prevención del juego
//              ilegal y el cuidado digital.
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

export interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

const TERMS_SECTIONS = [
  {
    title: '1. La aceptación del servicio',
    body: 'Al crear tu cuenta, aceptás estos términos para usar la app de forma segura.',
  },
  {
    title: '2. La mayoría de edad',
    body: 'Quienes utilizan la app bajo el modo responsable deben ser mayores de 18 años (madres, padres, tutores o adultos responsables).',
  },
  {
    title: '3. El filtro VPN',
    body: 'La app activa este filtro en tu dispositivo para bloquear automáticamente el acceso a sitios de apuestas clandestinas no autorizados por LOTBA. Tus datos privados quedan protegidos en tu celular.',
  },
  {
    title: '4. La protección antidesinstalación',
    body: 'Para mantener activa tu protección y la de tu entorno, la app cuenta con mecanismos que evitan la desinstalación no autorizada.',
  },
  {
    title: '5. Actualizaciones en el sistema',
    body: 'Para garantizar la protección continua, LOTBA puede actualizar la lista de sitios bloqueados y las funcionalidades de la app cuando sea necesario.',
  },
];

export const TermsModal: React.FC<TermsModalProps> = ({
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
          accessibilityLabel="Cerrar términos y condiciones"
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
              <Text style={legalStyles.legalModalTitle}>Términos y condiciones</Text>
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
              BA Protege + es una plataforma para bloquear sitios y apps no autorizados por la Lotería de la Ciudad de Buenos Aires (LOTBA) con el fin de prevenir el juego ilegal y proteger a las personas contra consumos problemáticos.
            </Text>

            <Text style={legalStyles.legalLeadTitle}>
              Para funcionar, la app necesita:
            </Text>

            {TERMS_SECTIONS.map((section) => (
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
