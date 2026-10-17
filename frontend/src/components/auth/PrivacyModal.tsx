// ==============================================================================
// Proyecto: BA Protege+
// Componente: PrivacyModal (Modal de Políticas de Privacidad)
// Archivo: src/components/auth/PrivacyModal.tsx
// Descripción: Modal Bottom Sheet que presenta las Políticas de Privacidad oficiales
//              de BA Protege+ en conformidad con la Ley N° 25.326 de Protección
//              de Datos Personales.
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

export interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
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
            <Text style={legalStyles.legalModalTitle}>Políticas de Privacidad</Text>
            <TouchableOpacity
              onPress={onClose}
              style={legalStyles.legalModalCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={legalStyles.legalModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={legalStyles.legalModalSubtitle}>
            Protección de Datos Personales • Ley N° 25.326
          </Text>

          <ScrollView
            style={legalStyles.legalModalBody}
            showsVerticalScrollIndicator={true}
          >
            <Text style={legalStyles.legalSectionTitle}>1. Compromiso de Privacidad</Text>
            <Text style={legalStyles.legalParagraph}>
              BA Protege+ garantiza el tratamiento confidencial y seguro de todos los datos personales de acuerdo con la Ley N° 25.326 de Protección de Datos Personales de la República Argentina.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>2. Información Recolectada</Text>
            <Text style={legalStyles.legalParagraph}>
              Recolectamos datos mínimos e indispensables: nombre, apellido, correo electrónico, teléfono, fecha de nacimiento, identificador de dispositivo y registros de intentos de acceso a sitios bloqueados.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>3. Uso de Datos y Geolocalización</Text>
            <Text style={legalStyles.legalParagraph}>
              La información de geolocalización e IP se utiliza únicamente para auditar la seguridad del dispositivo y la vinculación de cuentas. Nunca comercializamos, vendemos ni compartimos datos con anunciantes ni terceros.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>4. Seguridad e Inmutabilidad</Text>
            <Text style={legalStyles.legalParagraph}>
              Toda la comunicación entre el dispositivo y nuestros servidores viaja cifrada con protocolo TLS 1.3/HTTPS. Los registros de auditoría de seguridad se guardan de forma inmutable.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>5. Derechos del Usuario</Text>
            <Text style={legalStyles.legalParagraph}>
              Como titular de los datos, tienes derecho a rectificar, actualizar o solicitar la supresión de tu información personal en cualquier momento escribiendo al soporte oficial de BA Protege+.
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
