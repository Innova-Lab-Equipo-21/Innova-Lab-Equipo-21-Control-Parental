// ==============================================================================
// Proyecto: BA Protege+
// Componente: FaqModal (Modal de Preguntas Frecuentes - FAQ)
// Archivo: src/components/dashboard/cuenta/FaqModal.tsx
// Descripción: Modal Bottom Sheet institucional con las preguntas frecuentes
//              y respuestas sobre el funcionamiento de BA Protege+.
// ==============================================================================

import React, { useEffect, useState } from 'react';
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
    question: '¿Qué es BA Protege + y cómo protege a las personas?',
    answer:
      'Es una aplicación gratuita desarrollada en conjunto por el Gobierno de la Ciudad de Buenos Aires y la Lotería de la Ciudad (LOTBA) para proteger a las personas contra los sitios y apps de juegos y apuestas ilegales. Permite recibir avisos ante intentos de acceso a sitios y apps no autorizados por LOTBA, crear listas personalizadas de bloqueos y administrar tiempos de uso en las aplicaciones.',
  },
  {
    question: '¿La aplicación tiene algún costo?',
    answer: 'No, BA Protege + es gratuita y de acceso libre.',
  },
  {
    question: '¿En qué dispositivos se puede usar la aplicación?',
    answer:
      'Funciona en sistemas operativos Android con versión 8.0 (Oreo) y las siguientes, tanto en celulares como en tablets.',
  },
  {
    question: '¿Qué significa “Proteger otro dispositivo”?',
    answer:
      'Que podés vincular el celular o la tablet de otra persona mediante un código QR o PIN para bloquear sitios de juegos y apuestas ilegales no autorizados por LOTBA, crear listas personalizadas de bloqueos, administrar tiempos de uso de las aplicaciones y recibir avisos de intentos de evasión de los bloqueos.',
  },
  {
    question: '¿Qué significa “Ejercer autoprotección”?',
    answer:
      'Que podés agregar sitios para bloquear y administrar el tiempo de uso de las aplicaciones en tu dispositivo para cuidar tu propio bienestar digital, con funcionalidades pensadas para evitar cambios impulsivos o sin intención. Por ejemplo, si restringís un sitio nuevo o establecés un límite de tiempo para usar una aplicación, no vas a poder cambiarlo hasta dentro de 24 horas.',
  },
  {
    question: '¿Cómo funciona la autoprotección de 24 horas?',
    answer:
      'Cuando agregás a tu lista personalizada de bloqueos un sitio nuevo o establecés un tiempo de uso de una aplicación, tenés que esperar un día para desbloquearlos. Esto es para evitar que haya cambios impulsivos y que la autoprotección sea efectiva.',
  },
  {
    question: '¿Cómo se vinculan las cuentas de las personas responsables y protegidas?',
    answer:
      'La vinculación de los dispositivos de ambos perfiles se realiza una sola vez. La persona responsable carga los datos de la persona protegida y la app genera un código QR y un PIN de 6 dígitos. Para vincular ambas cuentas, hay que escanear el QR o ingresar el PIN en el dispositivo protegido.',
  },
  {
    question: '¿Qué sitios se bloquean automáticamente al instalar la aplicación?',
    answer:
      'BA Protege + bloquea de forma preventiva y automática los sitios de juegos y apuestas ilegales que no están autorizados por LOTBA, es decir, aquellos que no terminan en “.bet.ar”. Además, permite agregar otros sitios a una lista personalizada de bloqueos y administrar el tiempo de uso de las aplicaciones.',
  },
  {
    question: '¿Para qué es el permiso “Protección antidesinstalación”?',
    answer:
      'Para evitar que la aplicación se elimine por error o sin autorización, y que vos y los tuyos sigan protegidos contra los sitios y las apps de juegos y apuestas ilegales.',
  },
  {
    question: '¿Para qué es el permiso “Filtro para bloquear sitios no seguros”?',
    answer:
      'Para restringir de forma preventiva los sitios y apps de juegos y apuestas ilegales no autorizados por LOTBA y los que agregues a tu lista personalizada.',
  },
  {
    question: '¿Qué pasa si una persona protegida intenta desinstalar la app?',
    answer:
      'La aplicación cuenta con una protección antidesinstalación para evitar que se elimine por error o sin autorización. Además, envía un aviso ante un intento de desinstalación.',
  },
  {
    question: '¿La aplicación accede a chats, fotos o mensajes privados?',
    answer:
      'Para nada. Solamente detecta a qué sitios web intenta conectarse el celular para impedir el acceso a sitios de juegos y apuestas ilegales no autorizados por LOTBA o aquellos que estén en la lista personalizada de bloqueos. La aplicación no está diseñada para leer mensajes, fotos, audios ni correos privados.',
  },
  {
    question: '¿Qué hacer si un sitio legítimo es bloqueado por error?',
    answer:
      'Si un sitio o app legítimo queda restringido por error, podés escribirnos a baprotegemas@gmail.com y te responderemos enseguida.',
  },
];

export const FaqModal: React.FC<FaqModalProps> = ({ visible, onClose }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    if (visible) {
      setExpandedIndex(0);
    }
  }, [visible]);

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
            <Text style={legalStyles.legalModalTitle}>Preguntas frecuentes</Text>
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
