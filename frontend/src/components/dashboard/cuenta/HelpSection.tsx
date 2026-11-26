// ==============================================================================
// Proyecto: BA Protege+
// Componente: HelpSection (Sección de Ayuda y soporte)
// Archivo: src/components/dashboard/cuenta/HelpSection.tsx
// Descripción: Sección que agrupa el Tutorial/Onboarding y Preguntas Frecuentes (FAQ)
//              con el mismo estilo visual de Información legal y valoración.
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Linking } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { FaqModal } from './FaqModal';
import { styles } from './HelpSection.styles';

export interface HelpSectionProps {
  onOpenOnboarding: () => void;
}

export const HelpSection: React.FC<HelpSectionProps> = ({ onOpenOnboarding }) => {
  const [showFaq, setShowFaq] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showOfficialChannelsModal, setShowOfficialChannelsModal] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Centro de ayuda</Text>

      <TouchableOpacity
        style={styles.helpItem}
        onPress={onOpenOnboarding}
        activeOpacity={0.8}
      >
        <Text style={styles.helpItemText}>Tutorial</Text>
        <Text style={styles.helpArrow}>➔</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.helpItem}
        onPress={() => setShowFaq(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.helpItemText}>Preguntas frecuentes</Text>
        <Text style={styles.helpArrow}>➔</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.helpItem}
        onPress={() => setShowContactModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.helpItemText}>Contacto</Text>
        <Text style={styles.helpArrow}>➔</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.helpItem}
        onPress={() => setShowOfficialChannelsModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.helpItemText}>Canales de ayuda oficiales</Text>
        <Text style={styles.helpArrow}>➔</Text>
      </TouchableOpacity>

      <FaqModal visible={showFaq} onClose={() => setShowFaq(false)} />

      {/* Modal de Contacto */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
      >
        <TouchableOpacity
          style={styles.infoModalOverlay}
          activeOpacity={1}
          onPress={() => setShowContactModal(false)}
        >
          <View
            style={styles.infoModalCard}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>Contacto</Text>
              <TouchableOpacity
                onPress={() => setShowContactModal(false)}
                style={styles.infoModalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.infoModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.infoModalBody}>
              Podés escribirnos a{' '}
              <Text
                style={styles.infoModalLink}
                onPress={() => Linking.openURL('mailto:baprotegemas@gmail.com')}
              >
                baprotegemas@gmail.com
              </Text>{' '}
              y te vamos a responder enseguida.
            </Text>

            <ActionButton
              title="Cerrar"
              variant="primary"
              onPress={() => setShowContactModal(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Canales de ayuda oficiales */}
      <Modal
        visible={showOfficialChannelsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOfficialChannelsModal(false)}
      >
        <TouchableOpacity
          style={styles.infoModalOverlay}
          activeOpacity={1}
          onPress={() => setShowOfficialChannelsModal(false)}
        >
          <View
            style={styles.infoModalCard}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>Canales de ayuda oficiales</Text>
              <TouchableOpacity
                onPress={() => setShowOfficialChannelsModal(false)}
                style={styles.infoModalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.infoModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.infoModalBody}>
              Si estás atravesando una situación de consumo problemático del juego, podés comunicarte con el{' '}
              <Text
                style={styles.infoModalLink}
                onPress={() => Linking.openURL('tel:08006666006')}
              >
                0800-666-6006
              </Text>{' '}
              (de la Lotería de la Ciudad) o con la{' '}
              <Text
                style={styles.infoModalLink}
                onPress={() => Linking.openURL('tel:108')}
              >
                Línea 108
              </Text>{' '}
              (opción 3). También podés llamar al{' '}
              <Text
                style={styles.infoModalLink}
                onPress={() => Linking.openURL('tel:08003330333')}
              >
                0800-333-0333
              </Text>{' '}
              del programa de juego responsable.
            </Text>

            <ActionButton
              title="Cerrar"
              variant="primary"
              onPress={() => setShowOfficialChannelsModal(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
