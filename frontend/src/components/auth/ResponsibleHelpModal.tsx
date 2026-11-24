// ==============================================================================
// Proyecto: BA Protege+
// Componente: ResponsibleHelpModal (Modal de Ayuda para el Panel Responsable)
// Archivo: src/components/auth/ResponsibleHelpModal.tsx
// Descripción: Modal Bottom Sheet que presenta la guía de ayuda y preguntas frecuentes
//              para el adulto responsable en BA Protege+ con el mismo estilo de TermsModal.
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

interface ResponsibleHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const HELP_SECTIONS = [
  {
    title: '1. ¿Qué significa “Proteger otro dispositivo”?',
    body: 'Que podés vincular el celular o la tablet de otra persona mediante un código QR o PIN para bloquear sitios de juegos y apuestas ilegales no autorizados por LOTBA, crear listas personalizadas de bloqueos, administrar tiempos de uso de las aplicaciones y recibir avisos de intentos de evasión de los bloqueos.',
  },
  {
    title: '2. ¿Qué significa “Ejercer autoprotección”?',
    body: 'Que podés agregar sitios para bloquear y administrar el tiempo de uso de las aplicaciones en tu dispositivo para cuidar tu propio bienestar digital, con funcionalidades pensadas para evitar cambios impulsivos o sin intención. Por ejemplo, si restringís un sitio nuevo o establecés un límite de tiempo para usar una aplicación, no podrás cambiarlo hasta dentro de 24 horas.',
  },
  {
    title: '3. ¿Para qué sirven los permisos que pide BA Protege +?',
    body: 'Para que el bloqueo de sitios no autorizados por LOTBA y los de la lista personalizada funcione de forma continua y que la aplicación no pueda eliminarse por error o sin autorización.',
  },
  {
    title: '4. ¿La aplicación accede a chats, fotos o mensajes privados?',
    body: 'Para nada. Solamente detecta a qué sitios web intenta conectarse el celular para impedir el acceso a sitios de juegos y apuestas ilegales. La aplicación no está diseñada para leer mensajes, fotos, audios ni correos privados.',
  },
];

export const ResponsibleHelpModal: React.FC<ResponsibleHelpModalProps> = ({
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
          accessibilityLabel="Cerrar centro de ayuda"
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
              <Text style={legalStyles.legalModalTitle}>Centro de ayuda</Text>
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
              Guía rápida para elegir cómo empezar.
            </Text>

            {HELP_SECTIONS.map((section) => (
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
