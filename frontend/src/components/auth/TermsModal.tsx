// ==============================================================================
// Proyecto: BA Protege+
// Componente: TermsModal (Modal de Términos y Condiciones)
// Archivo: src/components/auth/TermsModal.tsx
// Descripción: Modal Bottom Sheet que presenta los Términos y Condiciones oficiales
//              de BA Protege+ provistos por LOTBA S.E. para la protección digital
//              y filtrado preventivo.
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

export interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
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
            <Text style={legalStyles.legalModalTitle}>Términos y Condiciones</Text>
            <TouchableOpacity
              onPress={onClose}
              style={legalStyles.legalModalCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={legalStyles.legalModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={legalStyles.legalModalSubtitle}>
            BA Protege+ • Lotería de la Ciudad de Buenos Aires (LOTBA)
          </Text>

          <ScrollView
            style={legalStyles.legalModalBody}
            showsVerticalScrollIndicator={true}
          >
            <Text style={legalStyles.legalSectionTitle}>1. Aceptación del Servicio</Text>
            <Text style={legalStyles.legalParagraph}>
              Al crear una cuenta en BA Protege+, aceptas cumplir íntegramente con los presentes Términos y Condiciones. Esta plataforma es provista por el Gobierno de la Ciudad Autónoma de Buenos Aires a través de LOTBA S.E. para la prevención del juego ilegal y la protección de menores.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>2. Requisito de Mayoría de Edad</Text>
            <Text style={legalStyles.legalParagraph}>
              El registro en el Modo Responsable está reservado exclusivamente a padres, madres, tutores legales o adultos responsables mayores de 18 años. Queda estrictamente prohibida la creación de cuentas por menores de edad.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>3. Uso del Servicio de Filtrado VPN</Text>
            <Text style={legalStyles.legalParagraph}>
              La aplicación instala un túnel de filtrado local (VPN) en el dispositivo para bloquear automáticamente solicitudes hacia plataformas de apuestas no autorizadas o clandestinas enumeradas en la lista oficial de LOTBA.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>4. Protección Anti-Desinstalación</Text>
            <Text style={legalStyles.legalParagraph}>
              Con el fin de asegurar la efectividad del control parental, el sistema utiliza permisos de Accesibilidad de Android para prevenir el cierre o desinstalación no autorizada de la aplicación sin la clave PIN del tutor.
            </Text>

            <Text style={legalStyles.legalSectionTitle}>5. Modificaciones y Actualizaciones</Text>
            <Text style={legalStyles.legalParagraph}>
              LOTBA se reserva el derecho de actualizar la lista de dominios bloqueados y las funcionalidades del sistema en cualquier momento para mantener la protección activa.
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
