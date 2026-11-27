// ==============================================================================
// Proyecto: BA Protege+
// Hook: useProtectedPasatiempos
// Archivo: src/components/dashboard/protected/hooks/useProtectedPasatiempos.ts
// Descripción: Gestiona el estado, persistencia diaria (local + backend), Racha,
//              precisión semanal y handlers de progreso/conclusión de los juegos
//              (Quiz, Sopa de letras de 3 tableros y Juego de la memoria).
// ==============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import {
  CompletedGamesState,
  INITIAL_COMPLETED_GAMES,
  PasatiempoGameId,
  canPlayPasatiempoGame,
  getCompletedGamesCount,
} from '../../../../utils/pasatiempos';
import {
  DailyPasatiemposRecord,
  computePasatiemposStreakDays,
  computeWeeklyQuizAccuracyPct,
  createEmptyDailyPasatiemposRecord,
  extractFoundByBoardMap,
  getLocalDateKey,
  toCompletedGamesState,
  updateMemoryMetrics,
  updateQuizMetrics,
  updateWordSearchMetrics,
} from '../../../../utils/pasatiemposMetrics';
import { QuizProgressPayload } from '../juegos/QuizModal';
import { MemoryProgressPayload } from '../juegos/MemoryGameModal';
import { apiService } from '../../../../services/api.service';

function deriveCompletedGamesOrder(record: DailyPasatiemposRecord): PasatiempoGameId[] {
  const entries: Array<{ id: PasatiempoGameId; completedAt: string; fallbackIdx: number }> = [];
  if (record.quiz.status === 'completed') {
    entries.push({
      id: 'quiz',
      completedAt: record.quiz.completedAt || '',
      fallbackIdx: 0,
    });
  }
  if (record.wordsearch.status === 'completed') {
    entries.push({
      id: 'wordsearch',
      completedAt: record.wordsearch.completedAt || '',
      fallbackIdx: 1,
    });
  }
  if (record.memory.status === 'completed') {
    entries.push({
      id: 'memory',
      completedAt: record.memory.completedAt || '',
      fallbackIdx: 2,
    });
  }

  entries.sort((a, b) => {
    if (a.completedAt && b.completedAt && a.completedAt !== b.completedAt) {
      return a.completedAt.localeCompare(b.completedAt);
    }
    return a.fallbackIdx - b.fallbackIdx;
  });

  return entries.map((e) => e.id);
}

export interface UseProtectedPasatiemposParams {
  deviceUuid: string;
  mode: 'CHILD' | 'ADULT';
}

export interface UseProtectedPasatiemposResult {
  completedGames: CompletedGamesState;
  completedGamesOrder: PasatiempoGameId[];
  completedCount: number;
  activeGameModal: PasatiempoGameId | null;
  setActiveGameModal: (game: PasatiempoGameId | null) => void;
  quizScore: { score: number; total: number };
  todayRecord: DailyPasatiemposRecord;
  streakDays: number;
  weeklyQuizAccuracyPct: number;
  initialWordSearchFoundByBoard: Record<string, string[]>;
  loadPasatiemposHistory: () => Promise<void>;
  handleOpenChildGame: (gameId: PasatiempoGameId) => void;
  handleProgressQuiz: (payload: QuizProgressPayload) => void;
  handleCompleteQuiz: (score: number, total: number) => void;
  handleProgressWordSearch: (foundByBoard: Record<string, string[]>) => void;
  handleCompleteWordSearch: (foundByBoard?: Record<string, string[]>) => void;
  handleProgressMemory: (payload: MemoryProgressPayload) => void;
  handleCompleteMemory: (payload?: MemoryProgressPayload) => void;
}

export function useProtectedPasatiempos({
  deviceUuid,
  mode,
}: UseProtectedPasatiemposParams): UseProtectedPasatiemposResult {
  const profileKey: 'ADULTO' | 'MENOR' = mode === 'ADULT' ? 'ADULTO' : 'MENOR';
  const storageDeviceKey = deviceUuid || 'local';

  const [completedGames, setCompletedGames] = useState<CompletedGamesState>(
    INITIAL_COMPLETED_GAMES
  );
  const [completedGamesOrder, setCompletedGamesOrder] = useState<PasatiempoGameId[]>([]);
  const [activeGameModal, setActiveGameModal] = useState<PasatiempoGameId | null>(null);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number }>({
    score: 0,
    total: 5,
  });
  const [todayRecord, setTodayRecord] = useState<DailyPasatiemposRecord>(() =>
    createEmptyDailyPasatiemposRecord(storageDeviceKey, profileKey)
  );
  const [pasatiemposHistory, setPasatiemposHistory] = useState<DailyPasatiemposRecord[]>([]);
  const [remoteStreakDays, setRemoteStreakDays] = useState<number | null>(null);
  const [remoteWeeklyQuizAccuracyPct, setRemoteWeeklyQuizAccuracyPct] = useState<number | null>(
    null
  );

  const loadPasatiemposHistory = useCallback(async () => {
    const todayKey = getLocalDateKey();
    try {
      const res = await apiService.getDevicePasatiemposHistory(
        storageDeviceKey,
        profileKey,
        todayKey
      );
      setTodayRecord(res.todayRecord);
      setPasatiemposHistory(res.history);
      setCompletedGames(toCompletedGamesState(res.todayRecord));
      setCompletedGamesOrder(deriveCompletedGamesOrder(res.todayRecord));
      setQuizScore({
        score: res.todayRecord.quiz.correctAnswers,
        total: res.todayRecord.quiz.totalQuestions,
      });
      setRemoteStreakDays(
        typeof res.streakDays === 'number' ? res.streakDays : null
      );
      setRemoteWeeklyQuizAccuracyPct(
        typeof res.weeklyQuizAccuracyPct === 'number'
          ? res.weeklyQuizAccuracyPct
          : null
      );
    } catch {
      // Mantener datos en memoria
    }
  }, [storageDeviceKey, profileKey]);

  useEffect(() => {
    loadPasatiemposHistory();
  }, [loadPasatiemposHistory]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        loadPasatiemposHistory();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [loadPasatiemposHistory]);

  const persistPasatiemposUpdate = useCallback(
    (
      nextRecord: DailyPasatiemposRecord,
      syncPayload?: {
        gameType: 'QUIZ' | 'WORDSEARCH' | 'MEMORY';
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
        correctCount: number;
        wrongCount: number;
        totalItems: number;
        attempts?: number;
        details?: Record<string, unknown> | null;
        completedAt?: string | null;
      }
    ) => {
      setTodayRecord(nextRecord);
      setCompletedGames(toCompletedGamesState(nextRecord));
      setQuizScore({
        score: nextRecord.quiz.correctAnswers,
        total: nextRecord.quiz.totalQuestions,
      });
      setRemoteStreakDays(null);
      setRemoteWeeklyQuizAccuracyPct(null);

      apiService
        .saveLocalDailyPasatiempos(storageDeviceKey, nextRecord)
        .then((updatedHistory) => {
          setPasatiemposHistory(updatedHistory);
        })
        .catch(() => {});

      if (syncPayload) {
        apiService
          .reportPasatiempoProgress({
            deviceUuid: storageDeviceKey,
            dateKey: nextRecord.dateKey,
            ...syncPayload,
          })
          .then((res) => {
            const payload = res?.data;
            if (typeof payload?.streakDays === 'number') {
              setRemoteStreakDays(payload.streakDays);
            }
            if (typeof payload?.weeklyQuizAccuracyPct === 'number') {
              setRemoteWeeklyQuizAccuracyPct(payload.weeklyQuizAccuracyPct);
            }
          })
          .catch(() => {});
      }
    },
    [storageDeviceKey]
  );

  const handleMarkGameCompleted = useCallback((gameId: PasatiempoGameId) => {
    setCompletedGames((prev) => ({
      ...prev,
      [gameId]: true,
    }));
    setCompletedGamesOrder((prev) =>
      prev.includes(gameId) ? prev : [...prev, gameId]
    );
  }, []);

  const handleOpenChildGame = useCallback(
    (gameId: PasatiempoGameId) => {
      if (!canPlayPasatiempoGame(completedGames, gameId)) {
        return;
      }
      setActiveGameModal(gameId);
    },
    [completedGames]
  );

  const handleProgressQuiz = useCallback(
    (payload: QuizProgressPayload) => {
      const next = updateQuizMetrics(todayRecord, {
        correctAnswers: payload.correctAnswers,
        wrongAnswers: payload.wrongAnswers,
        totalQuestions: payload.totalQuestions,
        completed: false,
      });
      persistPasatiemposUpdate(next, {
        gameType: 'QUIZ',
        status: 'IN_PROGRESS',
        correctCount: next.quiz.correctAnswers,
        wrongCount: next.quiz.wrongAnswers,
        totalItems: next.quiz.totalQuestions,
        attempts: next.quiz.answeredCount,
      });
    },
    [todayRecord, persistPasatiemposUpdate]
  );

  const handleCompleteQuiz = useCallback(
    (score: number, total: number) => {
      const wrong = Math.max(0, total - score);
      const next = updateQuizMetrics(todayRecord, {
        correctAnswers: score,
        wrongAnswers: wrong,
        totalQuestions: total,
        completed: true,
      });
      persistPasatiemposUpdate(next, {
        gameType: 'QUIZ',
        status: 'COMPLETED',
        correctCount: next.quiz.correctAnswers,
        wrongCount: next.quiz.wrongAnswers,
        totalItems: next.quiz.totalQuestions,
        attempts: next.quiz.totalQuestions,
        completedAt: next.quiz.completedAt || new Date().toISOString(),
      });
      handleMarkGameCompleted('quiz');
      setActiveGameModal(null);
    },
    [todayRecord, persistPasatiemposUpdate, handleMarkGameCompleted]
  );

  const handleProgressWordSearch = useCallback(
    (foundByBoard: Record<string, string[]>) => {
      const next = updateWordSearchMetrics(todayRecord, foundByBoard);
      const statusUpper =
        next.wordsearch.status === 'completed'
          ? 'COMPLETED'
          : next.wordsearch.status === 'in_progress'
            ? 'IN_PROGRESS'
            : 'PENDING';
      persistPasatiemposUpdate(next, {
        gameType: 'WORDSEARCH',
        status: statusUpper,
        correctCount: next.wordsearch.foundWordsTotal,
        wrongCount: next.wordsearch.missingWordsTotal,
        totalItems: next.wordsearch.totalWords,
        attempts: next.wordsearch.foundWordsTotal,
        details: { foundByBoard },
        completedAt: next.wordsearch.completedAt || null,
      });
    },
    [todayRecord, persistPasatiemposUpdate]
  );

  const handleCompleteWordSearch = useCallback(
    (foundByBoard?: Record<string, string[]>) => {
      const completedIso = todayRecord.wordsearch.completedAt || new Date().toISOString();
      const baseNext = foundByBoard
        ? updateWordSearchMetrics(todayRecord, foundByBoard)
        : todayRecord;
      const next: DailyPasatiemposRecord = {
        ...baseNext,
        wordsearch: {
          ...baseNext.wordsearch,
          status: 'completed',
          foundWordsTotal: foundByBoard
            ? baseNext.wordsearch.foundWordsTotal
            : baseNext.wordsearch.totalWords,
          missingWordsTotal: foundByBoard
            ? baseNext.wordsearch.missingWordsTotal
            : 0,
          completedBoardsCount: baseNext.wordsearch.totalBoardsCount,
          accuracyPct: foundByBoard ? baseNext.wordsearch.accuracyPct : 100,
          completedAt: baseNext.wordsearch.completedAt || completedIso,
        },
        updatedAt: new Date().toISOString(),
      };
      persistPasatiemposUpdate(next, {
        gameType: 'WORDSEARCH',
        status: 'COMPLETED',
        correctCount: next.wordsearch.foundWordsTotal,
        wrongCount: next.wordsearch.missingWordsTotal,
        totalItems: next.wordsearch.totalWords,
        attempts: next.wordsearch.foundWordsTotal,
        details: foundByBoard ? { foundByBoard } : { foundByBoard: extractFoundByBoardMap(next) },
        completedAt: next.wordsearch.completedAt || completedIso,
      });
      handleMarkGameCompleted('wordsearch');
    },
    [todayRecord, persistPasatiemposUpdate, handleMarkGameCompleted]
  );

  const handleProgressMemory = useCallback(
    (payload: MemoryProgressPayload) => {
      const isCompleted = payload.matchedPairs >= payload.totalPairs;
      const next = updateMemoryMetrics(todayRecord, {
        matchedPairs: payload.matchedPairs,
        totalPairs: payload.totalPairs,
        attempts: payload.attempts,
        completed: isCompleted,
      });
      persistPasatiemposUpdate(next, {
        gameType: 'MEMORY',
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        correctCount: next.memory.matchedPairs,
        wrongCount: next.memory.unmatchedPairs,
        totalItems: next.memory.totalPairs,
        attempts: next.memory.attempts,
        completedAt: next.memory.completedAt || null,
      });
    },
    [todayRecord, persistPasatiemposUpdate]
  );

  const handleCompleteMemory = useCallback(
    (payload?: MemoryProgressPayload) => {
      const effectivePayload = payload || {
        matchedPairs: todayRecord.memory.totalPairs,
        totalPairs: todayRecord.memory.totalPairs,
        attempts: Math.max(todayRecord.memory.attempts, todayRecord.memory.totalPairs),
      };
      const next = updateMemoryMetrics(todayRecord, {
        matchedPairs: effectivePayload.matchedPairs,
        totalPairs: effectivePayload.totalPairs,
        attempts: effectivePayload.attempts,
        completed: true,
      });
      persistPasatiemposUpdate(next, {
        gameType: 'MEMORY',
        status: 'COMPLETED',
        correctCount: next.memory.matchedPairs,
        wrongCount: next.memory.unmatchedPairs,
        totalItems: next.memory.totalPairs,
        attempts: next.memory.attempts,
        completedAt: next.memory.completedAt || new Date().toISOString(),
      });
      handleMarkGameCompleted('memory');
    },
    [todayRecord, persistPasatiemposUpdate, handleMarkGameCompleted]
  );

  const streakDays = useMemo(
    () =>
      remoteStreakDays !== null
        ? remoteStreakDays
        : computePasatiemposStreakDays(pasatiemposHistory, profileKey),
    [remoteStreakDays, pasatiemposHistory, profileKey]
  );

  const weeklyQuizAccuracyPct = useMemo(
    () =>
      remoteWeeklyQuizAccuracyPct !== null
        ? remoteWeeklyQuizAccuracyPct
        : computeWeeklyQuizAccuracyPct(pasatiemposHistory),
    [remoteWeeklyQuizAccuracyPct, pasatiemposHistory]
  );

  const initialWordSearchFoundByBoard = useMemo(
    () => extractFoundByBoardMap(todayRecord),
    [todayRecord]
  );

  const completedCount = getCompletedGamesCount(completedGames);

  return {
    completedGames,
    completedGamesOrder,
    completedCount,
    activeGameModal,
    setActiveGameModal,
    quizScore,
    todayRecord,
    streakDays,
    weeklyQuizAccuracyPct,
    initialWordSearchFoundByBoard,
    loadPasatiemposHistory,
    handleOpenChildGame,
    handleProgressQuiz,
    handleCompleteQuiz,
    handleProgressWordSearch,
    handleCompleteWordSearch,
    handleProgressMemory,
    handleCompleteMemory,
  };
}
