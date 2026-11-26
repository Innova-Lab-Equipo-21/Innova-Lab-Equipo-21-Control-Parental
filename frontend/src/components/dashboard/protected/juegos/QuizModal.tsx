// ==============================================================================
// Proyecto: BA Protege+
// Componente: QuizModal
// Archivo: src/components/dashboard/protected/juegos/QuizModal.tsx
// Descripción: Modal interactivo de Quiz con preguntas y opciones desordenadas
//              aleatoriamente, botones para Volver y Avanzar, botón de cierre (X)
//              con reanudación en la pregunta donde quedó el usuario.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { getBotMascotName, getQuizResultMood } from '../../../../utils/botMascots';
import { getBotMascotImage } from '../botAssets';
import { styles } from './QuizModal.styles';

export interface RawQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface RawQuizQuestion {
  id: number;
  question: string;
  description: string;
  options: RawQuizOption[];
  stepBgColor: string;
}

export interface PreparedOption extends RawQuizOption {
  label: string; // 'A', 'B', 'C', 'D'
}

export interface PreparedQuestion {
  id: number;
  question: string;
  description: string;
  options: PreparedOption[];
  stepBgColor: string;
}

export interface QuizProgressPayload {
  correctAnswers: number;
  wrongAnswers: number;
  answeredCount: number;
  totalQuestions: number;
}

interface QuizModalProps {
  visible: boolean;
  mode?: 'CHILD' | 'ADULT';
  onClose: () => void;
  onProgressQuiz?: (progress: QuizProgressPayload) => void;
  onCompleteQuiz: (score: number, total: number, outdoorTip: string) => void;
}

// Preguntas Base para Menor
const childQuestionsRaw: RawQuizQuestion[] = [
  {
    id: 1,
    question: '¿Qué hacés si un desconocido te escribe pidiendo datos o fotos?',
    description:
      'Recordá que navegar en internet de forma segura implica proteger tu información personal.',
    stepBgColor: '#E05297',
    options: [
      {
        text: 'No respondo y le aviso a una persona adulta de confianza.',
        isCorrect: true,
      },
      { text: 'Se los envío rápido', isCorrect: false },
      { text: 'Se los paso a un amigo', isCorrect: false },
      { text: 'Invento un secreto', isCorrect: false },
    ],
  },
  {
    id: 2,
    question: '¿Por qué es importante tener un límite de tiempo en el celular?',
    description: 'Recordá qué ganás cuando te alejás un momento del celular.',
    stepBgColor: '#38BDF8',
    options: [
      { text: 'Para salir a jugar al aire libre', isCorrect: true },
      { text: 'Para que no se rompa la pantalla', isCorrect: false },
      { text: 'Porque no hay internet de noche', isCorrect: false },
      { text: 'Para no cargar la batería nunca', isCorrect: false },
    ],
  },
  {
    id: 3,
    question:
      '¿Se puede jugar a apostar plata en páginas de internet y aplicaciones cuando uno es menor de 18 años?',
    description: 'Recordá que hay espacios pensados según la edad de cada persona.',
    stepBgColor: '#2DD4BF',
    options: [
      { text: 'No, está prohibido', isCorrect: true },
      { text: 'Sí, en cualquier momento', isCorrect: false },
      { text: 'Sí, con permiso de un amigo', isCorrect: false },
      { text: 'Solo los fines de semana', isCorrect: false },
    ],
  },
  {
    id: 4,
    question: '¿Qué podés hacer si te sentís cansado o con ganas de dejar el celular?',
    description:
      'Pensá qué actividades te ayudan a sentirte mejor después de estar un rato largo mirando la pantalla.',
    stepBgColor: '#84CC16',
    options: [
      { text: 'Apagar la pantalla y salir a caminar', isCorrect: true },
      { text: 'Seguir 5 horas más en redes', isCorrect: false },
      { text: 'Abrir 10 juegos juntos', isCorrect: false },
      { text: 'Apretar botones rápido', isCorrect: false },
    ],
  },
  {
    id: 5,
    question:
      'Si alguien te manda un mensaje con una oferta que promete plata o premios rápidos, ¿qué es mejor hacer?',
    description: 'Pensá en cómo cuidarte antes de hacer clic.',
    stepBgColor: '#EAB308',
    options: [
      { text: 'Pasar mis datos', isCorrect: false },
      { text: 'No entrar ni compartir datos y avisar en casa', isCorrect: true },
      { text: 'Reenviarlo a todos mis contactos', isCorrect: false },
      { text: 'Aceptar todo sin leer', isCorrect: false },
    ],
  },
];

// Preguntas Base para Adulto
const adultQuestionsRaw: RawQuizQuestion[] = [
  {
    id: 1,
    question: '¿Cuál es el beneficio de hacer pausas activas de la tecnología?',
    description: 'Aumenta el rendimiento mental y reduce los niveles de ansiedad acumulada.',
    stepBgColor: '#E05297',
    options: [
      { text: 'Evitar el agotamiento digital', isCorrect: true },
      { text: 'Acumular notificaciones sin leer', isCorrect: false },
      { text: 'Gastar menos datos móviles', isCorrect: false },
      { text: 'Ningún beneficio directo', isCorrect: false },
    ],
  },
  {
    id: 2,
    question: '¿Qué actitud ayuda a controlar los impulsos de juego online?',
    description: 'Identificar emociones previas evita conductas compulsivas.',
    stepBgColor: '#38BDF8',
    options: [
      { text: 'Pausar, respirar y buscar otra actividad', isCorrect: true },
      { text: 'Actuar sin reflexionar', isCorrect: false },
      { text: 'Pedir prestado dinero', isCorrect: false },
      { text: 'Ignorar las señales de estrés', isCorrect: false },
    ],
  },
  {
    id: 3,
    question: '¿Qué recurso gratuito de contención 24hs ofrece la Ciudad?',
    description: 'Línea de orientación profesional y confidencial sobre ludopatía.',
    stepBgColor: '#2DD4BF',
    options: [
      { text: 'Línea 0800-444-5682', isCorrect: true },
      { text: 'Envío de correos masivos', isCorrect: false },
      { text: 'Encuestas automáticas', isCorrect: false },
      { text: 'Foros anónimos sin moderador', isCorrect: false },
    ],
  },
  {
    id: 4,
    question: '¿Cómo podés promover hábitos de desconexión saludables en familia?',
    description: 'El ejemplo en casa fomenta una relación equilibrada con las pantallas.',
    stepBgColor: '#84CC16',
    options: [
      { text: 'Definir momentos sin pantallas y salir a pasear', isCorrect: true },
      { text: 'Usar el celular en la mesa comiendo', isCorrect: false },
      { text: 'Dejar las alertas activas toda la noche', isCorrect: false },
      { text: 'Prohibir la tecnología por completo', isCorrect: false },
    ],
  },
  {
    id: 5,
    question: '¿Qué señal indica que necesitás desconectarte del celular hoy?',
    description: 'Escuchar al cuerpo ayuda a prevenir la saturación digital.',
    stepBgColor: '#EAB308',
    options: [
      { text: 'Sensación de irritabilidad o fatiga visual', isCorrect: true },
      { text: 'Tener 100% de batería restante', isCorrect: false },
      { text: 'Tener buena señal de Wi-Fi', isCorrect: false },
      { text: 'Recibir una actualización de app', isCorrect: false },
    ],
  },
];

/** Función de ordenamiento aleatorio (Fisher-Yates shuffle) */
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/** Prepara las preguntas desordenando aleatoriamente sus opciones */
const prepareQuestions = (rawQuestions: RawQuizQuestion[]): PreparedQuestion[] => {
  const labels = ['A', 'B', 'C', 'D'];
  return rawQuestions.map((q) => {
    const shuffledRawOptions = shuffleArray(q.options);
    const preparedOptions: PreparedOption[] = shuffledRawOptions.map((opt, idx) => ({
      ...opt,
      label: labels[idx] || `${idx + 1}`,
    }));
    return {
      ...q,
      options: preparedOptions,
    };
  });
};

export const QuizModal: React.FC<QuizModalProps> = ({
  visible,
  mode = 'CHILD',
  onClose,
  onProgressQuiz,
  onCompleteQuiz,
}) => {
  const [preparedQuestions, setPreparedQuestions] = useState<PreparedQuestion[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    const rawList = mode === 'ADULT' ? adultQuestionsRaw : childQuestionsRaw;
    setPreparedQuestions(prepareQuestions(rawList));
  }, [mode]);

  if (!visible || preparedQuestions.length === 0) return null;

  const currentQuestion = preparedQuestions[currentStepIndex];
  const currentSelectedOptionIndex = selectedAnswers[currentStepIndex];
  const hasSelectedCurrent = currentSelectedOptionIndex !== undefined;

  const computeCounts = (answersMap: { [qIdx: number]: number }): QuizProgressPayload => {
    let correctAnswers = 0;
    let wrongAnswers = 0;
    preparedQuestions.forEach((q, qIdx) => {
      const selIdx = answersMap[qIdx];
      if (selIdx !== undefined) {
        if (q.options[selIdx]?.isCorrect) {
          correctAnswers += 1;
        } else {
          wrongAnswers += 1;
        }
      }
    });
    return {
      correctAnswers,
      wrongAnswers,
      answeredCount: correctAnswers + wrongAnswers,
      totalQuestions: preparedQuestions.length,
    };
  };

  const handleSelectOption = (optionIdx: number) => {
    const nextAnswers = {
      ...selectedAnswers,
      [currentStepIndex]: optionIdx,
    };
    setSelectedAnswers(nextAnswers);
    if (onProgressQuiz) {
      onProgressQuiz(computeCounts(nextAnswers));
    }
  };

  const handleGoNext = () => {
    if (!hasSelectedCurrent) return;

    if (onProgressQuiz) {
      onProgressQuiz(computeCounts(selectedAnswers));
    }

    if (currentStepIndex < preparedQuestions.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleGoPrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinishQuiz = () => {
    let correctCount = 0;
    preparedQuestions.forEach((q, qIdx) => {
      const selectedOptIdx = selectedAnswers[qIdx];
      if (selectedOptIdx !== undefined && q.options[selectedOptIdx]?.isCorrect) {
        correctCount += 1;
      }
    });

    const tip =
      '¡Excelente trabajo! Te sugerimos tomar un descanso de la pantalla, salir a pasear, airearte y disfrutar del aire libre 🌳🚶☀️';
    onCompleteQuiz(correctCount, preparedQuestions.length, tip);

    setCurrentStepIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.8)' }]}>
        {!isCompleted ? (
          <View
            style={[
              styles.quizContainer,
              { backgroundColor: currentQuestion.stepBgColor },
            ]}
          >
            <View style={styles.headerRow}>
              <Text style={styles.stepCounterText}>
                Pregunta {currentStepIndex + 1} de {preparedQuestions.length}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
                activeOpacity={0.8}
                accessibilityLabel="Cerrar juego de preguntas"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${((currentStepIndex + 1) / preparedQuestions.length) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.questionCard}>
              <Image
                source={getBotMascotImage(mode, 'pensando')}
                style={styles.questionMascot}
                resizeMode="contain"
              />
              <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
              <Text style={styles.questionSubtitle}>{currentQuestion.description}</Text>
            </View>

            <View style={styles.optionsGrid}>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentSelectedOptionIndex === idx;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => handleSelectOption(idx)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.optionBadge,
                        isSelected && styles.optionBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionBadgeText,
                          isSelected && styles.optionBadgeTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    <Text style={styles.optionText} numberOfLines={3}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.navigationRow}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentStepIndex === 0 && styles.navButtonDisabled,
                ]}
                onPress={handleGoPrevious}
                disabled={currentStepIndex === 0}
                activeOpacity={0.8}
              >
                <Text style={styles.navButtonText}>Volver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.navButtonPrimary,
                  !hasSelectedCurrent && styles.navButtonDisabled,
                ]}
                onPress={handleGoNext}
                disabled={!hasSelectedCurrent}
                activeOpacity={0.85}
              >
                <Text style={[styles.navButtonText, styles.navButtonPrimaryText]}>
                  {currentStepIndex === preparedQuestions.length - 1 ? 'Finalizar' : 'Avanzar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.quizContainer, { backgroundColor: '#15803D' }]}>
            <View style={styles.headerRow}>
              <Text style={styles.stepCounterText}>Juego de preguntas completado</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleFinishQuiz}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {(() => {
              let correctCount = 0;
              preparedQuestions.forEach((q, qIdx) => {
                const selOptIdx = selectedAnswers[qIdx];
                if (selOptIdx !== undefined && q.options[selOptIdx]?.isCorrect) {
                  correctCount += 1;
                }
              });

              const resultMood = getQuizResultMood(correctCount, preparedQuestions.length);
              const mascotName = getBotMascotName(mode);
              const isChild = mode === 'CHILD';
              const isHighScore = resultMood === 'feliz';

              const headerTitle = isChild
                ? isHighScore
                  ? '¡Felicitaciones!'
                  : '¡Bien!'
                : resultMood === 'feliz'
                ? '¡Felicitaciones!'
                : resultMood === 'pensando'
                ? '¡Buen intento!'
                : '¡A seguir aprendiendo!';

              const headerSubtitle = isChild
                ? isHighScore
                  ? 'Completaste el juego de preguntas. ¡Muy bien!'
                  : 'Completaste el juego de preguntas.'
                : resultMood === 'feliz'
                ? '¡Completaste el juego de preguntas! ¡Seguí así!'
                : resultMood === 'pensando'
                ? 'Completaste el juego de preguntas. ¡Seguí reflexionando sobre tus hábitos!'
                : 'Completaste el juego de preguntas. ¡Estos consejos te ayudarán a cuidarte mejor!';

              const scoreLabel = isChild
                ? `Tuviste ${correctCount} de ${preparedQuestions.length} respuestas correctas.`
                : `🎯 Obtuviste ${correctCount} de ${preparedQuestions.length} respuestas correctas`;

              const incentiveTitle = isChild
                ? `Consejo de ${mascotName}:`
                : `🌳 Consejo de ${mascotName}:`;

              const incentiveText = isChild
                ? isHighScore
                  ? 'Podés charlar en casa o contarle a una persona adulta cómo te fue haciendo el juego de preguntas. ¡Y si querés, también podés salir un rato al aire libre!'
                  : 'Podés charlar en casa o contarle a una persona adulta cómo te fue y volver a intentarlo cuando quieras. ¡También podés salir un rato al aire libre!'
                : '¡Recordá hacer pausas de las pantallas y disfrutar también de actividades al aire libre! ☀️🚶';

              return (
                <View style={styles.completionBox}>
                  <Text style={styles.completionTitle}>{headerTitle}</Text>
                  <Text style={styles.completionSubtitle}>{headerSubtitle}</Text>

                  <View style={styles.betiFrame}>
                    <Image
                      source={getBotMascotImage(mode, resultMood)}
                      style={styles.betiImage}
                      resizeMode="contain"
                    />
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkBadgeText}>✓</Text>
                    </View>
                  </View>

                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>{scoreLabel}</Text>
                  </View>

                  <View style={styles.outdoorIncentiveBox}>
                    <Text style={styles.outdoorIncentiveTitle}>{incentiveTitle}</Text>
                    <Text style={styles.outdoorIncentiveText}>{incentiveText}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.finishButton}
                    onPress={handleFinishQuiz}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.finishButtonText}>Continuar</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        )}
      </View>
    </Modal>
  );
};
