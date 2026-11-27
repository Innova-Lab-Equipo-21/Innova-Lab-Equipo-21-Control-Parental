// ==============================================================================
// Proyecto: BA Protege+
// Módulo: Métricas, Registro de Respuestas, Conclusión y Racha de Pasatiempos
// Archivo: src/utils/pasatiemposMetrics.ts
// Descripción: Lógica pura para registrar respuestas diarias y progreso de:
//              - Quiz (respuestas correctas e incorrectas)
//              - Sopa de letras (palabras encontradas y no encontradas de las 3 sopas)
//              - Juego de la memoria (pares encontrados, no encontrados e intentos)
//              Además calcula Racha (días consecutivos), porcentaje semanal y el
//              resumen consolidado para la pestaña Actividad del Responsable,
//              Protegido Adulto y Protegido Menor.
// ==============================================================================

import { DeviceInfo } from '../types';
import { getDeviceFirstName } from './authValidation';
import { getDeviceHighlight } from './deviceColors';
import {
  CompletedGamesState,
  MEMORY_PAIRS,
  WORD_SEARCH_BOARDS,
} from './pasatiempos';

export type PasatiempoGameStatus = 'pending' | 'in_progress' | 'completed';

export interface WordSearchBoardProgress {
  boardId: string;
  title: string;
  foundWords: string[];
  foundCount: number;
  missingCount: number;
  totalWords: number;
  completed: boolean;
}

export interface QuizDailyMetrics {
  status: PasatiempoGameStatus;
  correctAnswers: number;
  wrongAnswers: number;
  answeredCount: number;
  totalQuestions: number;
  accuracyPct: number;
  completedAt?: string;
}

export interface WordSearchDailyMetrics {
  status: PasatiempoGameStatus;
  boards: WordSearchBoardProgress[];
  foundWordsTotal: number;
  missingWordsTotal: number;
  totalWords: number;
  completedBoardsCount: number;
  totalBoardsCount: number;
  accuracyPct: number;
  completedAt?: string;
}

export interface MemoryDailyMetrics {
  status: PasatiempoGameStatus;
  matchedPairs: number;
  unmatchedPairs: number;
  totalPairs: number;
  attempts: number;
  completedAt?: string;
}

export interface DailyPasatiemposRecord {
  dateKey: string; // YYYY-MM-DD
  deviceId: string;
  profileType: 'MENOR' | 'ADULTO';
  quiz: QuizDailyMetrics;
  wordsearch: WordSearchDailyMetrics;
  memory: MemoryDailyMetrics;
  updatedAt: string;
}

export interface BackendPasatiempoSessionDTO {
  id?: string;
  deviceId: string;
  dateKey: string;
  gameType: 'QUIZ' | 'WORDSEARCH' | 'MEMORY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  correctCount: number;
  wrongCount: number;
  totalItems: number;
  attempts: number;
  details?: Record<string, any> | null;
  completedAt?: string | null;
  updatedAt?: string;
}

export interface ResponsibleMinorDeviceChip {
  deviceId: string;
  label: string;
  completedCount: number;
  totalGames: number;
  streakDays: number;
}

export interface ResponsibleAdultDeviceChip {
  deviceId: string;
  label: string;
  completedToday: boolean;
  correctToday: number;
  totalQuestionsToday: number;
  streakDays: number;
  weeklyAccuracyPct: number;
}

export interface ResponsibleMinorDeviceSummary {
  deviceId: string;
  label: string;
  color: string;
  quiz: {
    status: PasatiempoGameStatus;
    correctAnswers: number;
    wrongAnswers: number;
  };
  wordsearch: {
    status: PasatiempoGameStatus;
    foundWordsTotal: number;
    missingWordsTotal: number;
  };
  memory: {
    status: PasatiempoGameStatus;
    matchedPairs: number;
    unmatchedPairs: number;
  };
  streakDays: number;
  weeklyAccuracyPct: number;
}

export interface ResponsibleAdultDeviceSummary {
  deviceId: string;
  label: string;
  color: string;
  status: PasatiempoGameStatus;
  correctToday: number;
  wrongToday: number;
  totalQuestionsToday: number;
  streakDays: number;
  weeklyAccuracyPct: number;
}

export interface ResponsiblePasatiemposSummary {
  totalGamesCatalog: number;
  menores: {
    deviceCount: number;
    chips: ResponsibleMinorDeviceChip[];
    devices: ResponsibleMinorDeviceSummary[];
    quiz: {
      status: PasatiempoGameStatus;
      completedDevices: number;
      totalDevices: number;
      accuracyPct: number;
      correctTotal: number;
      wrongTotal: number;
    };
    wordsearch: {
      status: PasatiempoGameStatus;
      completedDevices: number;
      totalDevices: number;
      foundPct: number;
      foundWordsTotal: number;
      missingWordsTotal: number;
      totalWords: number;
    };
    memory: {
      status: PasatiempoGameStatus;
      completedDevices: number;
      totalDevices: number;
      avgAttempts: number;
      matchedPairsTotal: number;
      unmatchedPairsTotal: number;
    };
    bestStreakDays: number;
    weeklyAccuracyPct: number;
  };
  adultos: {
    deviceCount: number;
    chips: ResponsibleAdultDeviceChip[];
    devices: ResponsibleAdultDeviceSummary[];
    status: PasatiempoGameStatus;
    completedDevices: number;
    totalDevices: number;
    correctToday: number;
    wrongToday: number;
    totalQuestionsToday: number;
    streakDays: number;
    weeklyAccuracyPct: number;
  };
}

export const DEFAULT_QUIZ_TOTAL = 5;
export const DEFAULT_MEMORY_PAIRS_TOTAL = MEMORY_PAIRS.length; // 6
export const DEFAULT_WORDSEARCH_TOTAL_WORDS = WORD_SEARCH_BOARDS.reduce(
  (sum, board) => sum + board.words.length,
  0
); // 8 + 6 + 6 = 20

/**
 * Formatea una fecha local en clave estable YYYY-MM-DD.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getOffsetDateKey(baseDateKey: string, daysBack: number): string {
  const [y, m, d] = baseDateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() - daysBack);
  return getLocalDateKey(dt);
}

/**
 * Crea el estado inicial vacío para las 3 sopas de letras.
 */
export function createInitialWordSearchBoards(): WordSearchBoardProgress[] {
  return WORD_SEARCH_BOARDS.map((board) => ({
    boardId: board.id,
    title: board.title,
    foundWords: [],
    foundCount: 0,
    missingCount: board.words.length,
    totalWords: board.words.length,
    completed: false,
  }));
}

/**
 * Crea un registro diario vacío de pasatiempos para un dispositivo y fecha.
 */
export function createEmptyDailyPasatiemposRecord(
  deviceId: string,
  profileType: 'MENOR' | 'ADULTO',
  dateKey: string = getLocalDateKey()
): DailyPasatiemposRecord {
  const boards = createInitialWordSearchBoards();
  return {
    dateKey,
    deviceId,
    profileType,
    quiz: {
      status: 'pending',
      correctAnswers: 0,
      wrongAnswers: 0,
      answeredCount: 0,
      totalQuestions: DEFAULT_QUIZ_TOTAL,
      accuracyPct: 0,
    },
    wordsearch: {
      status: 'pending',
      boards,
      foundWordsTotal: 0,
      missingWordsTotal: DEFAULT_WORDSEARCH_TOTAL_WORDS,
      totalWords: DEFAULT_WORDSEARCH_TOTAL_WORDS,
      completedBoardsCount: 0,
      totalBoardsCount: WORD_SEARCH_BOARDS.length,
      accuracyPct: 0,
    },
    memory: {
      status: 'pending',
      matchedPairs: 0,
      unmatchedPairs: DEFAULT_MEMORY_PAIRS_TOTAL,
      totalPairs: DEFAULT_MEMORY_PAIRS_TOTAL,
      attempts: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Recalcula las métricas de Quiz al guardar respuestas parciales o finales.
 */
export function updateQuizMetrics(
  record: DailyPasatiemposRecord,
  params: {
    correctAnswers: number;
    wrongAnswers: number;
    totalQuestions: number;
    completed: boolean;
  }
): DailyPasatiemposRecord {
  const totalQuestions = Math.max(1, params.totalQuestions);
  const correctAnswers = Math.max(0, Math.min(totalQuestions, params.correctAnswers));
  const wrongAnswers = Math.max(0, Math.min(totalQuestions - correctAnswers, params.wrongAnswers));
  const answeredCount = Math.min(totalQuestions, correctAnswers + wrongAnswers);
  const status: PasatiempoGameStatus = params.completed
    ? 'completed'
    : answeredCount > 0
      ? 'in_progress'
      : 'pending';
  const denominator = params.completed ? totalQuestions : Math.max(1, answeredCount);
  const accuracyPct =
    answeredCount > 0 || params.completed
      ? Math.round((correctAnswers / denominator) * 100)
      : 0;

  return {
    ...record,
    quiz: {
      status,
      correctAnswers,
      wrongAnswers,
      answeredCount,
      totalQuestions,
      accuracyPct,
      completedAt: params.completed
        ? record.quiz.completedAt || new Date().toISOString()
        : record.quiz.completedAt,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Recalcula las métricas de Sopa de letras considerando las 3 sopas diferentes.
 */
export function updateWordSearchMetrics(
  record: DailyPasatiemposRecord,
  foundByBoard: Record<string, string[]>
): DailyPasatiemposRecord {
  const boards: WordSearchBoardProgress[] = WORD_SEARCH_BOARDS.map((board) => {
    const validWords = new Set(board.words.map((w) => w.word));
    const uniqueFound = Array.from(
      new Set((foundByBoard[board.id] || []).filter((w) => validWords.has(w)))
    );
    const totalWords = board.words.length;
    const foundCount = uniqueFound.length;
    const missingCount = Math.max(0, totalWords - foundCount);
    return {
      boardId: board.id,
      title: board.title,
      foundWords: uniqueFound,
      foundCount,
      missingCount,
      totalWords,
      completed: foundCount >= totalWords,
    };
  });

  const foundWordsTotal = boards.reduce((sum, b) => sum + b.foundCount, 0);
  const totalWords = boards.reduce((sum, b) => sum + b.totalWords, 0);
  const missingWordsTotal = Math.max(0, totalWords - foundWordsTotal);
  const completedBoardsCount = boards.filter((b) => b.completed).length;
  const allBoardsCompleted = completedBoardsCount >= boards.length && boards.length > 0;
  const status: PasatiempoGameStatus = allBoardsCompleted
    ? 'completed'
    : foundWordsTotal > 0
      ? 'in_progress'
      : 'pending';
  const accuracyPct = totalWords > 0 ? Math.round((foundWordsTotal / totalWords) * 100) : 0;

  return {
    ...record,
    wordsearch: {
      status,
      boards,
      foundWordsTotal,
      missingWordsTotal,
      totalWords,
      completedBoardsCount,
      totalBoardsCount: boards.length,
      accuracyPct,
      completedAt: allBoardsCompleted
        ? record.wordsearch.completedAt || new Date().toISOString()
        : record.wordsearch.completedAt,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Recalcula las métricas de Juego de la memoria (pares encontrados, no encontrados e intentos).
 */
export function updateMemoryMetrics(
  record: DailyPasatiemposRecord,
  params: {
    matchedPairs: number;
    totalPairs?: number;
    attempts: number;
    completed?: boolean;
  }
): DailyPasatiemposRecord {
  const totalPairs = Math.max(1, params.totalPairs ?? DEFAULT_MEMORY_PAIRS_TOTAL);
  const matchedPairs = Math.max(0, Math.min(totalPairs, params.matchedPairs));
  const unmatchedPairs = Math.max(0, totalPairs - matchedPairs);
  const attempts = Math.max(0, params.attempts);
  const isCompleted = params.completed ?? matchedPairs >= totalPairs;
  const status: PasatiempoGameStatus = isCompleted
    ? 'completed'
    : attempts > 0 || matchedPairs > 0
      ? 'in_progress'
      : 'pending';

  return {
    ...record,
    memory: {
      status,
      matchedPairs,
      unmatchedPairs,
      totalPairs,
      attempts,
      completedAt: isCompleted
        ? record.memory.completedAt || new Date().toISOString()
        : record.memory.completedAt,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Convierte un DailyPasatiemposRecord al mapa simple CompletedGamesState usado en Inicio y Pasatiempos.
 */
export function toCompletedGamesState(record: DailyPasatiemposRecord): CompletedGamesState {
  return {
    quiz: record.quiz.status === 'completed',
    wordsearch: record.wordsearch.status === 'completed',
    memory: record.memory.status === 'completed',
  };
}

/**
 * Extrae el mapa { [boardId]: foundWords[] } de un registro diario de Sopa de letras.
 */
export function extractFoundByBoardMap(
  record?: DailyPasatiemposRecord | null
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  if (!record?.wordsearch?.boards) return map;
  for (const board of record.wordsearch.boards) {
    map[board.boardId] = [...board.foundWords];
  }
  return map;
}

/**
 * Calcula la racha en días consecutivos a partir del historial de registros diarios.
 * - ADULTO: días consecutivos con Cuestionario diario (Quiz) completado.
 * - MENOR: días consecutivos con al menos un pasatiempo completado.
 */
export function computePasatiemposStreakDays(
  history: DailyPasatiemposRecord[],
  profileType: 'MENOR' | 'ADULTO',
  todayKey: string = getLocalDateKey()
): number {
  const completedDates = new Set<string>();
  for (const day of history) {
    const isCompletedDay =
      profileType === 'ADULTO'
        ? day.quiz.status === 'completed'
        : day.quiz.status === 'completed' ||
          day.wordsearch.status === 'completed' ||
          day.memory.status === 'completed';
    if (isCompletedDay) {
      completedDates.add(day.dateKey);
    }
  }

  if (completedDates.size === 0) return 0;

  let streak = 0;
  let offset = completedDates.has(todayKey) ? 0 : 1;

  while (offset < 365) {
    const key = getOffsetDateKey(todayKey, offset);
    if (completedDates.has(key)) {
      streak += 1;
      offset += 1;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calcula el porcentaje semanal de aciertos en el Cuestionario diario (últimos 7 días).
 */
export function computeWeeklyQuizAccuracyPct(
  history: DailyPasatiemposRecord[],
  todayKey: string = getLocalDateKey()
): number {
  const minKey = getOffsetDateKey(todayKey, 6);
  const windowRecords = history.filter(
    (d) =>
      d.dateKey >= minKey &&
      d.dateKey <= todayKey &&
      (d.quiz.status === 'completed' || d.quiz.answeredCount > 0)
  );

  const totalCorrect = windowRecords.reduce((sum, d) => sum + d.quiz.correctAnswers, 0);
  const totalQuestions = windowRecords.reduce(
    (sum, d) =>
      sum +
      (d.quiz.status === 'completed'
        ? d.quiz.totalQuestions
        : Math.max(1, d.quiz.answeredCount)),
    0
  );

  if (totalQuestions <= 0) return 0;
  return Math.round((totalCorrect / totalQuestions) * 100);
}

/**
 * Reconstruye un DailyPasatiemposRecord a partir de sesiones DTO recibidas del backend.
 */
export function hydrateDailyRecordFromSessions(
  deviceId: string,
  profileType: 'MENOR' | 'ADULTO',
  dateKey: string,
  sessions: BackendPasatiempoSessionDTO[]
): DailyPasatiemposRecord {
  let record = createEmptyDailyPasatiemposRecord(deviceId, profileType, dateKey);
  let latestUpdatedAt: string | null = null;

  for (const s of sessions) {
    if (s.dateKey !== dateKey) continue;
    if (s.updatedAt && (!latestUpdatedAt || s.updatedAt > latestUpdatedAt)) {
      latestUpdatedAt = s.updatedAt;
    }
    const game = s.gameType.toUpperCase();
    if (game === 'QUIZ') {
      record = updateQuizMetrics(record, {
        correctAnswers: s.correctCount,
        wrongAnswers: s.wrongCount,
        totalQuestions: s.totalItems || DEFAULT_QUIZ_TOTAL,
        completed: s.status === 'COMPLETED',
      });
      if (s.completedAt) {
        record = {
          ...record,
          quiz: {
            ...record.quiz,
            completedAt: s.completedAt,
          },
        };
      }
    } else if (game === 'WORDSEARCH') {
      const boardsDetail = s.details?.foundByBoard as Record<string, string[]> | undefined;
      if (boardsDetail && typeof boardsDetail === 'object') {
        record = updateWordSearchMetrics(record, boardsDetail);
        if (s.status === 'COMPLETED' || s.completedAt) {
          record = {
            ...record,
            wordsearch: {
              ...record.wordsearch,
              status: s.status === 'COMPLETED' ? 'completed' : record.wordsearch.status,
              completedAt: s.completedAt || record.wordsearch.completedAt,
            },
          };
        }
      } else if (s.status === 'COMPLETED' || s.correctCount > 0) {
        const totalWords = s.totalItems || DEFAULT_WORDSEARCH_TOTAL_WORDS;
        const foundTotal =
          s.status === 'COMPLETED' && s.correctCount === 0
            ? totalWords
            : Math.min(totalWords, s.correctCount);
        record = {
          ...record,
          wordsearch: {
            ...record.wordsearch,
            status:
              s.status === 'COMPLETED'
                ? 'completed'
                : foundTotal > 0
                  ? 'in_progress'
                  : 'pending',
            foundWordsTotal: foundTotal,
            missingWordsTotal: Math.max(0, totalWords - foundTotal),
            totalWords,
            completedBoardsCount:
              s.status === 'COMPLETED'
                ? record.wordsearch.totalBoardsCount
                : record.wordsearch.completedBoardsCount,
            accuracyPct: totalWords > 0 ? Math.round((foundTotal / totalWords) * 100) : 0,
            completedAt: s.completedAt || (s.status === 'COMPLETED' ? s.updatedAt || record.updatedAt : undefined),
          },
        };
      }
    } else if (game === 'MEMORY') {
      record = updateMemoryMetrics(record, {
        matchedPairs: s.correctCount,
        totalPairs: s.totalItems || DEFAULT_MEMORY_PAIRS_TOTAL,
        attempts: s.attempts,
        completed: s.status === 'COMPLETED',
      });
      if (s.completedAt) {
        record = {
          ...record,
          memory: {
            ...record.memory,
            completedAt: s.completedAt,
          },
        };
      }
    }
  }

  if (latestUpdatedAt) {
    record = { ...record, updatedAt: latestUpdatedAt };
  }

  return record;
}

/**
 * Construye el resumen consolidado del bloque Pasatiempos para el Responsable,
 * separando Menores de edad (3 juegos) y Mayores de edad (Cuestionario diario),
 * respetando el dispositivo seleccionado en los filtros.
 */
export function buildResponsiblePasatiemposSummary(params: {
  devices: DeviceInfo[];
  recordsByDeviceId: Record<string, DailyPasatiemposRecord>;
  streakByDeviceId?: Record<string, number>;
  weeklyQuizPctByDeviceId?: Record<string, number>;
  colorByDeviceId?: Record<string, string>;
  selectedDeviceId?: string;
}): ResponsiblePasatiemposSummary {
  const {
    devices,
    recordsByDeviceId,
    streakByDeviceId = {},
    weeklyQuizPctByDeviceId = {},
    colorByDeviceId = {},
    selectedDeviceId = 'all',
  } = params;

  const protectedDevices = devices.filter(
    (d) => d.deviceId !== 'self' && d.profileType !== 'Responsable'
  );

  const filteredDevices =
    selectedDeviceId === 'all'
      ? protectedDevices
      : selectedDeviceId === 'self'
        ? []
        : protectedDevices.filter(
            (d) => d.deviceId === selectedDeviceId || d.deviceUuid === selectedDeviceId
          );

  const sortByFirstName = (a: DeviceInfo, b: DeviceInfo) =>
    getDeviceFirstName(a.childName || a.deviceName || '').localeCompare(
      getDeviceFirstName(b.childName || b.deviceName || ''),
      'es',
      { sensitivity: 'base' }
    );

  const menoresDevices = filteredDevices
    .filter((d) => d.profileType !== 'Adulto')
    .sort(sortByFirstName);
  const adultosDevices = filteredDevices
    .filter((d) => d.profileType === 'Adulto')
    .sort(sortByFirstName);

  const resolveDeviceColor = (
    dev: DeviceInfo,
    devId: string,
    label: string,
    fallbackIndex: number
  ): string => {
    const mapped =
      colorByDeviceId[devId] ??
      (dev.deviceUuid ? colorByDeviceId[dev.deviceUuid] : undefined);
    if (mapped) return mapped;
    return getDeviceHighlight(devId, label, label, fallbackIndex + 1).color;
  };

  const resolveAggregateStatus = (
    statuses: PasatiempoGameStatus[]
  ): PasatiempoGameStatus => {
    if (statuses.length === 0) return 'pending';
    if (statuses.every((s) => s === 'completed')) return 'completed';
    if (statuses.some((s) => s === 'completed' || s === 'in_progress')) {
      return 'in_progress';
    }
    return 'pending';
  };

  // --- Menores de edad ---
  let quizCompleted = 0;
  let quizCorrectTotal = 0;
  let quizWrongTotal = 0;
  let quizQuestionsDenom = 0;
  const quizStatuses: PasatiempoGameStatus[] = [];

  let wsCompleted = 0;
  let wsFoundTotal = 0;
  let wsMissingTotal = 0;
  let wsWordsTotal = 0;
  const wsStatuses: PasatiempoGameStatus[] = [];

  let memCompleted = 0;
  let memAttemptsSum = 0;
  let memAttemptsCount = 0;
  let memMatchedTotal = 0;
  let memUnmatchedTotal = 0;
  const memStatuses: PasatiempoGameStatus[] = [];

  let bestMinorStreak = 0;
  let minorWeeklyPctSum = 0;
  let minorWeeklyCount = 0;

  const minorDeviceSummaries: ResponsibleMinorDeviceSummary[] = [];

  const minorChips: ResponsibleMinorDeviceChip[] = menoresDevices.map((dev, idx) => {
    const devId = dev.deviceId || dev.deviceUuid || `minor-${idx}`;
    const label = getDeviceFirstName(
      dev.childName || dev.deviceName || `Menor ${idx + 1}`
    );
    const color = resolveDeviceColor(dev, devId, label, idx);
    const rec =
      recordsByDeviceId[devId] ||
      recordsByDeviceId[dev.deviceUuid] ||
      createEmptyDailyPasatiemposRecord(devId, 'MENOR');
    const streakDays = streakByDeviceId[devId] ?? streakByDeviceId[dev.deviceUuid] ?? 0;
    if (streakDays > bestMinorStreak) bestMinorStreak = streakDays;

    const weeklyPct =
      weeklyQuizPctByDeviceId[devId] ??
      weeklyQuizPctByDeviceId[dev.deviceUuid] ??
      rec.quiz.accuracyPct;
    if (weeklyPct > 0 || rec.quiz.status === 'completed') {
      minorWeeklyPctSum += weeklyPct;
      minorWeeklyCount += 1;
    }

    const qDone = rec.quiz.status === 'completed';
    const wDone = rec.wordsearch.status === 'completed';
    const mDone = rec.memory.status === 'completed';
    const doneCount = (qDone ? 1 : 0) + (wDone ? 1 : 0) + (mDone ? 1 : 0);

    quizStatuses.push(rec.quiz.status);
    wsStatuses.push(rec.wordsearch.status);
    memStatuses.push(rec.memory.status);

    if (qDone) quizCompleted += 1;
    quizCorrectTotal += rec.quiz.correctAnswers;
    quizWrongTotal += rec.quiz.wrongAnswers;
    if (qDone || rec.quiz.answeredCount > 0) {
      quizQuestionsDenom += qDone ? rec.quiz.totalQuestions : rec.quiz.answeredCount;
    }

    if (wDone) wsCompleted += 1;
    wsFoundTotal += rec.wordsearch.foundWordsTotal;
    wsMissingTotal += rec.wordsearch.missingWordsTotal;
    wsWordsTotal += rec.wordsearch.totalWords;

    if (mDone) memCompleted += 1;
    if (rec.memory.attempts > 0) {
      memAttemptsSum += rec.memory.attempts;
      memAttemptsCount += 1;
    }
    memMatchedTotal += rec.memory.matchedPairs;
    memUnmatchedTotal += rec.memory.unmatchedPairs;

    minorDeviceSummaries.push({
      deviceId: devId,
      label,
      color,
      quiz: {
        status: rec.quiz.status,
        correctAnswers: rec.quiz.correctAnswers,
        wrongAnswers: rec.quiz.wrongAnswers,
      },
      wordsearch: {
        status: rec.wordsearch.status,
        foundWordsTotal: rec.wordsearch.foundWordsTotal,
        missingWordsTotal: rec.wordsearch.missingWordsTotal,
      },
      memory: {
        status: rec.memory.status,
        matchedPairs: rec.memory.matchedPairs,
        unmatchedPairs: rec.memory.unmatchedPairs,
      },
      streakDays,
      weeklyAccuracyPct: weeklyPct,
    });

    return {
      deviceId: devId,
      label,
      completedCount: doneCount,
      totalGames: 3,
      streakDays,
    };
  });

  // --- Mayores de edad (Protegidos Adultos) ---
  let adultCompleted = 0;
  let adultCorrectToday = 0;
  let adultWrongToday = 0;
  let adultTotalQuestionsToday = 0;
  let adultBestStreak = 0;
  let adultWeeklyPctSum = 0;
  let adultWeeklyCount = 0;
  const adultStatuses: PasatiempoGameStatus[] = [];

  const adultDeviceSummaries: ResponsibleAdultDeviceSummary[] = [];

  const adultChips: ResponsibleAdultDeviceChip[] = adultosDevices.map((dev, idx) => {
    const devId = dev.deviceId || dev.deviceUuid || `adult-${idx}`;
    const label = getDeviceFirstName(
      dev.childName || dev.deviceName || `Adulto ${idx + 1}`
    );
    const color = resolveDeviceColor(dev, devId, label, menoresDevices.length + idx);
    const rec =
      recordsByDeviceId[devId] ||
      recordsByDeviceId[dev.deviceUuid] ||
      createEmptyDailyPasatiemposRecord(devId, 'ADULTO');
    const streakDays = streakByDeviceId[devId] ?? streakByDeviceId[dev.deviceUuid] ?? 0;
    const weeklyPct =
      weeklyQuizPctByDeviceId[devId] ??
      weeklyQuizPctByDeviceId[dev.deviceUuid] ??
      rec.quiz.accuracyPct;

    adultStatuses.push(rec.quiz.status);

    const done = rec.quiz.status === 'completed';
    if (done) adultCompleted += 1;
    adultCorrectToday += rec.quiz.correctAnswers;
    adultWrongToday += rec.quiz.wrongAnswers;
    adultTotalQuestionsToday += rec.quiz.totalQuestions;
    if (streakDays > adultBestStreak) adultBestStreak = streakDays;
    if (weeklyPct > 0 || done) {
      adultWeeklyPctSum += weeklyPct;
      adultWeeklyCount += 1;
    }

    adultDeviceSummaries.push({
      deviceId: devId,
      label,
      color,
      status: rec.quiz.status,
      correctToday: rec.quiz.correctAnswers,
      wrongToday: rec.quiz.wrongAnswers,
      totalQuestionsToday: rec.quiz.totalQuestions,
      streakDays,
      weeklyAccuracyPct: weeklyPct,
    });

    return {
      deviceId: devId,
      label,
      completedToday: done,
      correctToday: rec.quiz.correctAnswers,
      totalQuestionsToday: rec.quiz.totalQuestions,
      streakDays,
      weeklyAccuracyPct: weeklyPct,
    };
  });

  return {
    totalGamesCatalog: 4, // 3 de menores + Cuestionario diario adultos
    menores: {
      deviceCount: menoresDevices.length,
      chips: minorChips,
      devices: minorDeviceSummaries,
      quiz: {
        status: resolveAggregateStatus(quizStatuses),
        completedDevices: quizCompleted,
        totalDevices: menoresDevices.length,
        accuracyPct:
          quizQuestionsDenom > 0
            ? Math.round((quizCorrectTotal / quizQuestionsDenom) * 100)
            : 0,
        correctTotal: quizCorrectTotal,
        wrongTotal: quizWrongTotal,
      },
      wordsearch: {
        status: resolveAggregateStatus(wsStatuses),
        completedDevices: wsCompleted,
        totalDevices: menoresDevices.length,
        foundPct: wsWordsTotal > 0 ? Math.round((wsFoundTotal / wsWordsTotal) * 100) : 0,
        foundWordsTotal: wsFoundTotal,
        missingWordsTotal: wsMissingTotal,
        totalWords: wsWordsTotal,
      },
      memory: {
        status: resolveAggregateStatus(memStatuses),
        completedDevices: memCompleted,
        totalDevices: menoresDevices.length,
        avgAttempts: memAttemptsCount > 0 ? Math.round(memAttemptsSum / memAttemptsCount) : 0,
        matchedPairsTotal: memMatchedTotal,
        unmatchedPairsTotal: memUnmatchedTotal,
      },
      bestStreakDays: bestMinorStreak,
      weeklyAccuracyPct:
        minorWeeklyCount > 0 ? Math.round(minorWeeklyPctSum / minorWeeklyCount) : 0,
    },
    adultos: {
      deviceCount: adultosDevices.length,
      chips: adultChips,
      devices: adultDeviceSummaries,
      status: resolveAggregateStatus(adultStatuses),
      completedDevices: adultCompleted,
      totalDevices: adultosDevices.length,
      correctToday: adultCorrectToday,
      wrongToday: adultWrongToday,
      totalQuestionsToday:
        adultosDevices.length > 0 ? adultTotalQuestionsToday : DEFAULT_QUIZ_TOTAL,
      streakDays: adultBestStreak,
      weeklyAccuracyPct:
        adultWeeklyCount > 0 ? Math.round(adultWeeklyPctSum / adultWeeklyCount) : 0,
    },
  };
}
