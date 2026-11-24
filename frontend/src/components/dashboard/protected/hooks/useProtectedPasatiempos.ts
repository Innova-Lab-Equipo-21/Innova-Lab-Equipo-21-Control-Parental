// ==============================================================================
// Proyecto: BA Protege+
// Hook: useProtectedPasatiempos
// Archivo: src/components/dashboard/protected/hooks/useProtectedPasatiempos.ts
// Descripción: Gestiona el estado, persistencia diaria (local + backend), Racha,
//              precisión semanal y handlers de progreso/conclusión de los juegos
//              (Quiz, Sopa de letras de 3 tableros y Juego de la memoria).
// ==============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
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
      setQuizScore({
        score: res.todayRecord.quiz.correctAnswers,
        total: res.todayRecord.quiz.totalQuestions,
      });
    } catch {
      // Mantener datos en memoria
    }
  }, [storageDeviceKey, profileKey]);

  useEffect(() => {
    loadPasatiemposHistory();
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
      if (foundByBoard) {
        handleProgressWordSearch(foundByBoard);
      }
      handleMarkGameCompleted('wordsearch');
    },
    [handleProgressWordSearch, handleMarkGameCompleted]
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
      if (payload) {
        const next = updateMemoryMetrics(todayRecord, {
          matchedPairs: payload.matchedPairs,
          totalPairs: payload.totalPairs,
          attempts: payload.attempts,
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
      }
      handleMarkGameCompleted('memory');
    },
    [todayRecord, persistPasatiemposUpdate, handleMarkGameCompleted]
  );

  const streakDays = useMemo(
    () => computePasatiemposStreakDays(pasatiemposHistory, profileKey),
    [pasatiemposHistory, profileKey]
  );

  const weeklyQuizAccuracyPct = useMemo(
    () => computeWeeklyQuizAccuracyPct(pasatiemposHistory),
    [pasatiemposHistory]
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
