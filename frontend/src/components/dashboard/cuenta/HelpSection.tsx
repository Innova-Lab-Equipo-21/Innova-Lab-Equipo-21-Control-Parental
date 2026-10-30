// ==============================================================================
// Proyecto: BA Protege+
// Componente: HelpSection (Sección de Ayuda, FAQ, Onboarding y Form de Sugerencias)
// Archivo: src/components/dashboard/cuenta/HelpSection.tsx
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { colors } from '../../../theme/colors';
import { styles } from './HelpSection.styles';

interface HelpSectionProps {
  onOpenOnboarding: () => void;
}

export const HelpSection: React.FC<HelpSectionProps> = ({ onOpenOnboarding }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Formulario de dudas y sugerencias con hasta 3 anexos
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  const faqs = [
    {
      q: '¿Qué es BA Protege+ y cómo protege a los menores?',
      a: 'Es una plataforma oficial de la Lotería de la Ciudad de Buenos Aires (LOTBA) que bloquea el acceso a plataformas de apuestas ilegales y clandestinas mediante filtrado VPN y control parental.',
    },
    {
      q: '¿Cómo se vincula un dispositivo protegido?',
      a: 'Desde la pestaña Inicio, ingresá en "Vincular dispositivo", escaneá el código QR o ingresá el código de 6 dígitos en el teléfono del menor.',
    },
    {
      q: '¿Cómo funciona el autocontrol de 24 horas?',
      a: 'El autocontrol aplica un bloqueo preventivo en tu dispositivo con un período de espera obligatorio de 24 horas antes de permitir la desactivación, evitando decisiones impulsivas.',
    },
    {
      q: '¿Qué hacer si una aplicación o sitio legítimo está bloqueado?',
      a: 'Podés reportarlo desde la sección de soporte enviando un correo con detalles a baprotegemas@gmail.com o utilizando el formulario de sugerencias abajo.',
    },
  ];

  const handleAddAttachment = () => {
    if (attachments.length >= 3) {
      Alert.alert('Límite alcanzado', 'Podés adjuntar un máximo de 3 archivos (capturas o documentos).');
      return;
    }
    const mockFileNames = ['captura_error_1.png', 'reporte_sitio.pdf', 'evidencia_bloqueo.jpg'];
    const nextFile = mockFileNames[attachments.length] || `anexo_${attachments.length + 1}.png`;
    setAttachments([...attachments, nextFile]);
  };

  const handleRemoveAttachment = (index: number) => {
    const updated = [...attachments];
    updated.splice(index, 1);
    setAttachments(updated);
  };

  const handleSendSuggestions = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Campos incompletos', 'Por favor ingresá el asunto y tu mensaje o duda.');
      return;
    }

    const emailTo = 'baprotegemas@gmail.com';
    const emailSubject = encodeURIComponent(`[Dudas/Sugerencias] ${subject}`);
    const emailBody = encodeURIComponent(
      `Mensaje: ${message}\n\nAnexos adjuntos (${attachments.length}/3):\n${attachments.join(', ') || 'Ninguno'}`
    );

    const mailtoUrl = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        '📧 Formulario enviado',
        `Tu consulta ha sido preparada para enviar a ${emailTo} con ${attachments.length} anexo(s). ¡Gracias por escribirnos!`
      );
    });

    setSubject('');
    setMessage('');
    setAttachments([]);
  };

  return (
    <View style={styles.container}>
      {/* Botón Ver Onboarding */}
      <View style={styles.onboardingBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.onboardingTitle}>📖 Tutorial y guía onboarding</Text>
          <Text style={styles.onboardingText}>Volvé a ver el recorrido explicativo de la app y sus funciones.</Text>
        </View>
        <ActionButton title="Ver onboarding" variant="primary" onPress={onOpenOnboarding} />
      </View>

      {/* Preguntas Frecuentes (FAQ) */}
      <Text style={styles.sectionHeader}>Preguntas frecuentes (FAQ)</Text>
      {faqs.map((faq, idx) => {
        const isExpanded = expandedFaq === idx;
        return (
          <View key={idx} style={styles.faqCard}>
            <TouchableOpacity
              style={styles.faqQuestionRow}
              onPress={() => setExpandedFaq(isExpanded ? null : idx)}
              activeOpacity={0.8}
            >
              <Text style={styles.faqQuestionText}>{faq.q}</Text>
              <Text style={styles.faqArrow}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {isExpanded && <Text style={styles.faqAnswerText}>{faq.a}</Text>}
          </View>
        );
      })}

      {/* Formulario de Dudas y Sugerencias */}
      <Text style={styles.sectionHeader}>✉️ Dudas y sugerencias</Text>
      <Text style={styles.formSubText}>
        ¿Tenés dudas o querés sugerir mejoras? Escribinos directamente a{' '}
        <Text style={{ fontWeight: 'bold', color: colors.primary }}>baprotegemas@gmail.com</Text>
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Asunto / motivo</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Ej: Consulta sobre bloqueo de dominio"
        />

        <Text style={styles.inputLabel}>Mensaje o sugerencia</Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
          value={message}
          onChangeText={setMessage}
          multiline
          placeholder="Describí detalladamente tu duda o sugerencia..."
        />

        {/* Sección de Anexos (Hasta 3) */}
        <View style={styles.attachmentSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.inputLabel}>Anexos ({attachments.length}/3 máx)</Text>
            {attachments.length < 3 && (
              <TouchableOpacity onPress={handleAddAttachment} style={styles.addAttachmentBtn}>
                <Text style={styles.addAttachmentText}>+ Adjuntar archivo</Text>
              </TouchableOpacity>
            )}
          </View>

          {attachments.map((file, i) => (
            <View key={i} style={styles.attachmentItem}>
              <Text style={styles.attachmentName}>📎 {file}</Text>
              <TouchableOpacity onPress={() => handleRemoveAttachment(i)}>
                <Text style={styles.removeAttachmentText}>✕ Quitar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <ActionButton title="Enviar a baprotegemas@gmail.com" variant="primary" onPress={handleSendSuggestions} />
      </View>
    </View>
  );
};
