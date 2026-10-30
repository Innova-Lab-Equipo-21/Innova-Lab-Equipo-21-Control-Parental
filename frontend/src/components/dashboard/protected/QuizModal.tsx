// ==============================================================================
// Proyecto: BA Protege+
// Componente: QuizModal
// Archivo: src/components/dashboard/protected/QuizModal.tsx
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

interface QuizModalProps {
  visible: boolean;
  mode?: 'CHILD' | 'ADULT';
  onClose: () => void;
  onCompleteQuiz: (score: number, total: number, outdoorTip: string) => void;
}

// Preguntas Base para Menor
const childQuestionsRaw: RawQuizQuestion[] = [
  {
    id: 1,
    question: '¿Qué hacés si un desconocido te escribe pidiendo datos o fotos?',
    description: 'Navegar seguro significa proteger tu información personal en internet.',
    stepBgColor: '#E05297',
    options: [
      { text: 'No respondo y le aviso a mi tutor', isCorrect: true },
      { text: 'Se los envío rápido', isCorrect: false },
      { text: 'Se los paso a un amigo', isCorrect: false },
      { text: 'Invento un secreto', isCorrect: false },
    ],
  },
  {
    id: 2,
    question: '¿Por qué es importante tener un límite de tiempo en el celular?',
    description: 'Descansar de las pantallas cuida tu vista y tu bienestar diario.',
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
    question: '¿Las casas de apuestas online están permitidas para menores?',
    description: 'En Argentina, la ley protege la salud de los menores de 18 años.',
    stepBgColor: '#2DD4BF',
    options: [
      { text: 'No, están estrictamente prohibidas', isCorrect: true },
      { text: 'Sí, en cualquier momento', isCorrect: false },
      { text: 'Sí, con permiso de un amigo', isCorrect: false },
      { text: 'Solo los fines de semana', isCorrect: false },
    ],
  },
  {
    id: 4,
    question: '¿Qué podés hacer si te sentís cansado o ansioso por usar el celular?',
    description: 'Tomar pausas te ayuda a sentirte con más energía y buen humor.',
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
    question: '¿Cuáles de estos datos son PRIVADOS y NUNCA se comparten en internet?',
    description: 'Cuidar tus datos privados evita riesgos en redes sociales.',
    stepBgColor: '#EAB308',
    options: [
      { text: 'Tu nombre, dirección y contraseñas', isCorrect: true },
      { text: 'Tu color de remera favorito', isCorrect: false },
      { text: 'El nombre de un superhéroe', isCorrect: false },
      { text: 'Tu deporte preferido', isCorrect: false },
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
  onCompleteQuiz,
}) => {
  // Lista de preguntas preparadas con opciones aleatorizadas por sesión
  const [preparedQuestions, setPreparedQuestions] = useState<PreparedQuestion[]>([]);
  // Índice de la pregunta actual (0 a 4). PERMANECE AL CERRAR CON 'X'
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  // Respuestas seleccionadas por el usuario para cada pregunta: { [questionIndex]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  // Estado final de completado
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    const rawList = mode === 'ADULT' ? adultQuestionsRaw : childQuestionsRaw;
    setPreparedQuestions(prepareQuestions(rawList));
  }, [mode]);

  if (!visible || preparedQuestions.length === 0) return null;

  const currentQuestion = preparedQuestions[currentStepIndex];
  const currentSelectedOptionIndex = selectedAnswers[currentStepIndex];
  const hasSelectedCurrent = currentSelectedOptionIndex !== undefined;

  const handleSelectOption = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentStepIndex]: optionIdx,
    }));
  };

  const handleGoNext = () => {
    if (!hasSelectedCurrent) return;

    if (currentStepIndex < preparedQuestions.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Fin del cuestionario (Paso 5) -> Calcular puntaje total
      setIsCompleted(true);
    }
  };

  const handleGoPrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinishQuiz = () => {
    // Calcular respuestas correctas acumuladas
    let correctCount = 0;
    preparedQuestions.forEach((q, qIdx) => {
      const selectedOptIdx = selectedAnswers[qIdx];
      if (selectedOptIdx !== undefined && q.options[selectedOptIdx]?.isCorrect) {
        correctCount += 1;
      }
    });

    const tip = '¡Excelente trabajo! Te sugerimos tomar un descanso de la pantalla, salir a pasear, airearte y disfrutar del aire libre 🌳🚶☀️';
    onCompleteQuiz(correctCount, preparedQuestions.length, tip);

    // Reiniciar para la próxima vez
    setCurrentStepIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  };

  // Al presionar 'X', solo cerramos el modal, CONSERVANDO el progreso de currentStepIndex y selectedAnswers!
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
          /* PANTALLA DE PREGUNTA (PASOS 1 A 5) */
          <View
            style={[
              styles.quizContainer,
              { backgroundColor: currentQuestion.stepBgColor },
            ]}
          >
            {/* Cabecera con número de paso y botón cerrar (X) */}
            <View style={styles.headerRow}>
              <Text style={styles.stepCounterText}>
                PREGUNTA {currentStepIndex + 1} DE {preparedQuestions.length}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
                activeOpacity={0.8}
                accessibilityLabel="Cerrar quiz"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Barra de progreso superior */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${((currentStepIndex + 1) / preparedQuestions.length) * 100}%` },
                ]}
              />
            </View>

            {/* Tarjeta de pregunta */}
            <View style={styles.questionCard}>
              <Text style={styles.questionTitle}>¿{currentQuestion.question}?</Text>
              <Text style={styles.questionSubtitle}>{currentQuestion.description}</Text>
            </View>

            {/* Grilla de 4 Opciones Aleatorizadas */}
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

            {/* BOTONES DE NAVEGACIÓN (VOLVER Y AVANZAR) */}
            <View style={styles.navigationRow}>
              {/* Botón Volver / Anterior */}
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentStepIndex === 0 && styles.navButtonDisabled,
                ]}
                onPress={handleGoPrevious}
                disabled={currentStepIndex === 0}
                activeOpacity={0.8}
              >
                <Text style={styles.navButtonText}>◄ Volver</Text>
              </TouchableOpacity>

              {/* Botón Avanzar / Siguiente */}
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
                  {currentStepIndex === preparedQuestions.length - 1 ? 'Finalizar ➔' : 'Avanzar ►'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* PANTALLA FINAL DE FELICITACIONES (PASO 6) */
          <View style={[styles.quizContainer, { backgroundColor: '#15803D' }]}>
            <View style={styles.headerRow}>
              <Text style={styles.stepCounterText}>¡QUIZ COMPLETADO!</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.completionBox}>
              <Text style={styles.completionTitle}>¡FELICITACIONES!!</Text>
              <Text style={styles.completionSubtitle}>
                ¡Completaste el quiz diario! ¡Sigue así!
              </Text>

              {/* Imagen de Beti con tilde verde de éxito */}
              <View style={styles.betiFrame}>
                <Image
                  source={require('../../../assets/icons/bot/beti.png')}
                  style={styles.betiImage}
                  resizeMode="contain"
                />
                <View style={styles.checkBadge}>
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              </View>

              {/* Puntaje obtenido */}
              {(() => {
                let correctCount = 0;
                preparedQuestions.forEach((q, qIdx) => {
                  const selOptIdx = selectedAnswers[qIdx];
                  if (selOptIdx !== undefined && q.options[selOptIdx]?.isCorrect) {
                    correctCount += 1;
                  }
                });

                return (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>
                      🎯 Obtuviste {correctCount} de {preparedQuestions.length} respuestas correctas
                    </Text>
                  </View>
                );
              })()}

              {/* Mensaje de incentivo para salir a pasear */}
              <View style={styles.outdoorIncentiveBox}>
                <Text style={styles.outdoorIncentiveTitle}>
                  🌳 ¡Momento de desconectarte!
                </Text>
                <Text style={styles.outdoorIncentiveText}>
                  ¡Excelente trabajo! Te sugerimos tomar un descanso de las pantallas, salir a pasear, tomar aire fresco y disfrutar de actividades al aire libre. ☀️🚶
                </Text>
              </View>

              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleFinishQuiz}
                activeOpacity={0.85}
              >
                <Text style={styles.finishButtonText}>Volver al Inicio ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};
