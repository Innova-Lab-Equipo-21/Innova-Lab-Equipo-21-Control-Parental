// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedGameModals
// Archivo: src/components/dashboard/protected/components/ProtectedGameModals.tsx
// Descripción: Orquestador liviano de los 3 modales interactivos de Pasatiempos
//              (Quiz, Sopa de letras de 3 tableros y Juego de la memoria).
// ==============================================================================

import React from 'react';
import { PasatiempoGameId } from '../../../../utils/pasatiempos';
import {
  MemoryGameModal,
  MemoryProgressPayload,
  QuizModal,
  QuizProgressPayload,
  WordSearchModal,
} from '../juegos';

export interface ProtectedGameModalsProps {
  activeGameModal: PasatiempoGameId | null;
  mode: 'CHILD' | 'ADULT';
  initialWordSearchFoundByBoard: Record<string, string[]>;
  initialMemoryAttempts: number;
  onClose: () => void;
  onProgressQuiz: (payload: QuizProgressPayload) => void;
  onCompleteQuiz: (score: number, total: number) => void;
  onProgressWordSearch: (foundByBoard: Record<string, string[]>) => void;
  onCompleteWordSearch: (foundByBoard?: Record<string, string[]>) => void;
  onProgressMemory: (payload: MemoryProgressPayload) => void;
  onCompleteMemory: (payload?: MemoryProgressPayload) => void;
}

export const ProtectedGameModals: React.FC<ProtectedGameModalsProps> = ({
  activeGameModal,
  mode,
  initialWordSearchFoundByBoard,
  initialMemoryAttempts,
  onClose,
  onProgressQuiz,
  onCompleteQuiz,
  onProgressWordSearch,
  onCompleteWordSearch,
  onProgressMemory,
  onCompleteMemory,
}) => {
  return (
    <>
      <QuizModal
        visible={activeGameModal === 'quiz'}
        mode={mode}
        onClose={onClose}
        onProgressQuiz={onProgressQuiz}
        onCompleteQuiz={onCompleteQuiz}
      />

      <WordSearchModal
        visible={activeGameModal === 'wordsearch'}
        initialFoundByBoard={initialWordSearchFoundByBoard}
        onClose={onClose}
        onProgressWordSearch={onProgressWordSearch}
        onCompleteGame={onCompleteWordSearch}
      />

      <MemoryGameModal
        visible={activeGameModal === 'memory'}
        initialAttempts={initialMemoryAttempts}
        onClose={onClose}
        onProgressMemory={onProgressMemory}
        onCompleteGame={onCompleteMemory}
      />
    </>
  );
};
