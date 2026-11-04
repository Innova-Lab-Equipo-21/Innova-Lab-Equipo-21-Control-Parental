// ==============================================================================
// Proyecto: BA Protege+
// Componente: FaqModal (Modal de Preguntas Frecuentes - FAQ)
// Archivo: src/components/dashboard/cuenta/FaqModal.tsx
// Descripción: Modal Bottom Sheet institucional con las preguntas frecuentes
//              y respuestas sobre el funcionamiento de BA Protege+.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { legalStyles } from '../../auth/LegalModal.styles';
import { colors } from '../../../theme/colors';

export interface FaqModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: '1. ¿Qué es BA Protege+ y cómo protege a los menores?',
    answer:
      'Es la plataforma oficial del Gobierno de la Ciudad de Buenos Aires y LOTBA S.E. diseñada para prevenir la ludopatía digital infantil y juvenil. Bloquea el acceso a plataformas clandestinas y no autorizadas de apuestas mediante filtrado VPN local continuo.',
  },
  {
    question: '2. ¿Cómo se vincula un dispositivo protegido?',
    answer:
      'Desde la pestaña "Dispositivos" o "Panel", tocá en "Vincular dispositivo". Podés escanear el código QR con el celular del menor o ingresar manualmente el código PIN numérico de 6 dígitos generado en pantalla.',
  },
  {
    question: '3. ¿Cómo funciona el autocontrol de 24 horas?',
    answer:
      'El modo autocontrol establece una protección preventiva directamente en este dispositivo con un período obligatorio de reflexión de 24 horas antes de permitir su desactivación, evitando decisiones impulsivas.',
  },
  {
    question: '4. ¿Por qué se requieren permisos de VPN y accesibilidad?',
    answer:
      '• Servicio VPN: Crea un túnel seguro estrictamente local para interceptar y bloquear dominios de apuestas ilegales sin transmitir tus datos a servidores externos.\n• Accesibilidad: Previene que la aplicación sea cerrada por la fuerza o desinstalada sin la clave PIN del adulto responsable.',
  },
  {
    question: '5. ¿Qué hacer si un sitio legítimo es bloqueado por error?',
    answer:
      'Podés reportarlo enviándonos un correo con la dirección web o aplicación a baprotegemas@gmail.com para que nuestro equipo técnico y legal lo evalúe y actualice las listas de excepción.',
  },
  {
    question: '6. ¿Dónde puedo solicitar soporte adicional?',
    answer:
      'Escribinos en cualquier momento a baprotegemas@gmail.com o comunicate con la línea de atención ciudadana 147 del Gobierno de la Ciudad de Buenos Aires.',
  },
];

export const FaqModal: React.FC<FaqModalProps> = ({ visible, onClose }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactEmail = () => {
    Linking.openURL('mailto:baprotegemas@gmail.com?subject=Consulta%20Soporte%20BA%20Protege%2B');
  };

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
            <Text style={legalStyles.legalModalTitle}>Preguntas frecuentes (FAQ)</Text>
            <TouchableOpacity
              onPress={onClose}
              style={legalStyles.legalModalCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={legalStyles.legalModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={legalStyles.legalModalSubtitle}>
            BA Protege+ • Centro de Ayuda y Soporte Oficial
          </Text>

          <ScrollView
            style={legalStyles.legalModalBody}
            showsVerticalScrollIndicator={true}
          >
            {FAQS.map((item, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: isExpanded ? colors.primary : colors.borderLight,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => toggleFaq(index)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: colors.textPrimary,
                        flex: 1,
                        paddingRight: 8,
                      }}
                    >
                      {item.question}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.primary,
                        fontWeight: 'bold',
                      }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <Text
                      style={[
                        legalStyles.legalParagraph,
                        {
                          marginTop: 8,
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: colors.borderLight,
                        },
                      ]}
                    >
                      {item.answer}
                    </Text>
                  )}
                </View>
              );
            })}

            {/* Canal directo de contacto */}
            <TouchableOpacity
              onPress={handleContactEmail}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#E7F1FF',
                borderRadius: 10,
                padding: 12,
                marginTop: 6,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#B6D4FE',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0056B3', marginBottom: 2 }}>
                ✉️ ¿Necesitás más ayuda?
              </Text>
              <Text style={{ fontSize: 12, color: '#0A58CA' }}>
                Tocá aquí para escribirnos a baprotegemas@gmail.com
              </Text>
            </TouchableOpacity>
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
