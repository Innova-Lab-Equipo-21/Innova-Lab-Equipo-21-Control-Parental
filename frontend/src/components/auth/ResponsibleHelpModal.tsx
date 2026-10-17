// ==============================================================================
// Proyecto: BA Protege+
// Componente: ResponsibleHelpModal (Modal de Ayuda para el Panel Responsable)
// Archivo: src/components/auth/ResponsibleHelpModal.tsx
// Descripción: Modal Bottom Sheet que presenta la guía de ayuda y preguntas frecuentes
//              para el adulto responsable en BA Protege+ con el mismo estilo de TermsModal.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { legalStyles } from './LegalModal.styles';

interface ResponsibleHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ResponsibleHelpModal: React.FC<ResponsibleHelpModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={legalStyles.legalModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={legalStyles.legalModalCard}
          onStartShouldSetResponder={() => true}
        >
          {/* Manija táctil del Bottom Sheet */}
          <View style={legalStyles.bottomSheetHandle} />

          <View style={legalStyles.legalModalHeader}>
            <Text style={legalStyles.legalModalTitle}>Centro de Ayuda - Responsable</Text>
            <TouchableOpacity
              onPress={onClose}
              style={legalStyles.legalModalCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={legalStyles.legalModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={legalStyles.legalModalSubtitle}>
            BA Protege+ • Guía Rápida de Supervisión y Autocontrol
          </Text>

          <ScrollView
            style={legalStyles.legalModalBody}
            showsVerticalScrollIndicator={true}
          >
            <Text style={legalStyles.legalSectionTitle}>1. ¿Qué es "Supervisar otro dispositivo"?</Text>
            <Text style={legalStyles.legalParagraph}>
              Te permite vincular el teléfono o tablet de un menor a tu cargo mediante un código QR o PIN numérico. Podrás bloquear sitios de apuestas clandestinas (lista LOTBA), establecer límites de tiempo y recibir alertas de seguridad en tiempo real.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>2. ¿Qué es "Ejercer un autocontrol"?</Text>
            <Text style={legalStyles.legalParagraph}>
              Establece protección y bloqueos preventivos en este mismo dispositivo. Incluye un sistema de autocontrol con doble confirmación y período de enfriamiento de 24 horas para evitar desactivaciones impulsivas.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>3. ¿Cómo funcionan los permisos?</Text>
            <Text style={legalStyles.legalParagraph}>
              Los permisos de VPN local, Accesibilidad (anti-desinstalación), Notificaciones y Geolocalización aseguran que la protección funcione de forma ininterrumpida en segundo plano y cumpla con las normativas de seguridad de LOTBA.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>4. ¿Necesitás soporte técnico?</Text>
            <Text style={legalStyles.legalParagraph}>
              Comunicate con el centro de atención al ciudadano del Gobierno de la Ciudad de Buenos Aires o a través de los canales oficiales de asistencia de LOTBA S.E.
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={legalStyles.legalModalConfirmBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={legalStyles.legalModalConfirmBtnText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
