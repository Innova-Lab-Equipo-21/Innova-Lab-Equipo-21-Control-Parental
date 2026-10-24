// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedInicioSection
// Archivo: src/components/dashboard/protected/ProtectedInicioSection.tsx
// Descripción: Pestaña Inicio con tarjeta de estado, card de Quiz diario (con Beti),
//              banner educativo de advertencia y resumen de actividad reciente.
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { QuizModal } from './QuizModal';
import { styles } from './ProtectedInicioSection.styles';

interface ProtectedInicioSectionProps {
  mode?: 'CHILD' | 'ADULT';
  tutorName?: string;
  onNavigateToActivity: () => void;
}

export const ProtectedInicioSection: React.FC<ProtectedInicioSectionProps> = ({
  mode = 'CHILD',
  tutorName = 'Ana',
  onNavigateToActivity,
}) => {
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [quizCompletedToday, setQuizCompletedToday] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number }>({
    score: 0,
    total: 5,
  });

  const handleCompleteQuiz = (score: number, total: number) => {
    setQuizScore({ score, total });
    setQuizCompletedToday(true);
    setShowQuizModal(false);
  };

  const handleLearnMore = () => {
    Alert.alert(
      '🛡️ Protección de navegación segura',
      mode === 'CHILD'
        ? 'Por normativa oficial de la Ciudad, el acceso a casinos y sitios de apuestas online está restringido para menores de 18 años para proteger tu bienestar. Si tienes dudas, consulta a tu tutor responsable.'
        : 'Herramientas de autoprotección activa para evitar el acceso impulsivo a páginas de apuestas online y promover hábitos digitales seguros.'
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. CARD DE ESTADO "Estás protegido" */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeaderRow}>
          <View style={styles.shieldIconBadge}>
            <Text style={styles.shieldIconText}>✓</Text>
          </View>
          <View style={styles.statusTextColumn}>
            <Text style={styles.statusTitle}>Estás protegido</Text>
            <Text style={styles.statusSubtitle}>
              Navegás de forma cuidada y más segura.
            </Text>
          </View>
        </View>
        <Text style={styles.tutorInfoText}>
          Dispositivo vinculado con responsable: <Text style={{ fontWeight: '800', color: '#1E293B' }}>{tutorName}</Text>
        </Text>
      </View>

      {/* 2. CARD DE JUEGO DIARIO ("¿HACEMOS UN QUIZ?") CON BETI */}
      {!quizCompletedToday ? (
        <View style={styles.quizCard}>
          <View style={styles.quizContentRow}>
            <Image
              source={require('../../../assets/icons/bot/beti.png')}
              style={styles.quizMascot}
              resizeMode="contain"
            />
            <View style={styles.quizTextColumn}>
              <Text style={styles.quizTitle}>¿HACEMOS UN QUIZ?</Text>
              <Text style={styles.quizSubtitle}>
                {mode === 'CHILD'
                  ? 'Info del quiz, poné a prueba tus conocimientos sobre seguridad digital de forma divertida.'
                  : 'Cuestionario diario de salud digital y toma de conciencia.'}
              </Text>
              <TouchableOpacity
                style={styles.quizStartButton}
                onPress={() => setShowQuizModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.quizStartButtonText}>Comenzar ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.quizCompletedCard}>
          <View style={styles.quizCompletedHeaderRow}>
            <Image
              source={require('../../../assets/icons/bot/beti.png')}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
            <Text style={styles.quizCompletedTitle}>
              ¡Quiz diario completado hoy! 🎯
            </Text>
          </View>

          <Text style={{ fontSize: 13, color: '#065F46', fontWeight: '700' }}>
            Puntaje: {quizScore.score} / {quizScore.total} respuestas correctas.
          </Text>

          {/* Prompt para salir a pasear e incentivo outdoor */}
          <View style={styles.outdoorPromptBox}>
            <Text style={styles.outdoorPromptTitle}>
              💡 Consejo de Beti para hoy:
            </Text>
            <Text style={styles.outdoorPromptText}>
              ¡Excelente trabajo! Te sugerimos tomar un descanso de las pantallas, salir a pasear, tomar aire fresco y disfrutar del aire libre 🌳🚶☀️
            </Text>
          </View>

          <TouchableOpacity
            style={{ marginTop: 8, alignSelf: 'flex-end' }}
            onPress={() => setShowQuizModal(true)}
          >
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#047857' }}>
              Volver a hacer el quiz 🔄
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. WARNING / EDUCATIONAL BANNER CARD CON BETI ESCUDO */}
      <View style={styles.warningBannerCard}>
        <View style={styles.warningTopHeader}>
          <Text style={styles.warningTopHeaderText}>
            {mode === 'CHILD'
              ? 'SI SOS MENOR NO PODES INGRESAR.'
              : 'PROTECCIÓN ACTIVA Y SALUD DIGITAL'}
          </Text>
        </View>

        <View style={styles.warningBodyRow}>
          <Image
            source={require('../../../assets/icons/bot/beti.png')}
            style={styles.warningMascot}
            resizeMode="contain"
          />
          <View style={styles.warningTextColumn}>
            <Text style={styles.warningTitle}>¡CUIDADO!</Text>
            <Text style={styles.warningDescription}>
              {mode === 'CHILD'
                ? 'Si sos menor no podes ingresar a sitios de adultos. Esta protección te ayudará a navegar de forma más segura y adecuada a tu edad.'
                : 'Esta protección bloquea automáticamente el acceso a casas de apuestas clandestinas y sitios de riesgo no autorizados.'}
            </Text>
            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={handleLearnMore}
              activeOpacity={0.85}
            >
              <Text style={styles.learnMoreButtonText}>Saber más ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 4. SECCIÓN ACTIVIDAD RECIENTE */}
      <View style={styles.recentActivityCard}>
        <Text style={styles.recentActivityHeaderTitle}>Actividad reciente</Text>

        <View style={styles.recentActivityBox}>
          {/* Item 1: Apps más usadas */}
          <TouchableOpacity
            style={styles.activityItemRow}
            onPress={onNavigateToActivity}
            activeOpacity={0.8}
          >
            <View style={[styles.itemIconBox, styles.greenIconBg]}>
              <Text style={styles.itemIconText}>📱</Text>
            </View>
            <View style={styles.itemTextColumn}>
              <Text style={styles.itemTitle}>Apps más usadas</Text>
              <Text style={styles.itemSubtitle}>
                Podes llevar un control de apps frecuentes
              </Text>
            </View>
            <Text style={styles.itemChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          {/* Item 2: Límite diario de uso */}
          <TouchableOpacity
            style={styles.activityItemRow}
            onPress={onNavigateToActivity}
            activeOpacity={0.8}
          >
            <View style={[styles.itemIconBox, styles.purpleIconBg]}>
              <Text style={styles.itemIconText}>⏱️</Text>
            </View>
            <View style={styles.itemTextColumn}>
              <Text style={styles.itemTitle}>Límite diario de uso 3h: 1:30h restante</Text>
              <Text style={styles.itemSubtitle}>
                Cuidamos tu tiempo en el dispositivo
              </Text>
            </View>
            <Text style={styles.itemChevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal interactivo de Quiz */}
      <QuizModal
        visible={showQuizModal}
        mode={mode}
        onClose={() => setShowQuizModal(false)}
        onCompleteQuiz={handleCompleteQuiz}
      />
    </View>
  );
};
