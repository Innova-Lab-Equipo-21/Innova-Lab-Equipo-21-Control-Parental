// ==============================================================================
// Proyecto: BA Protege+
// Módulo: Utilidades de Mascotas por Perfil y Sentimiento (Boti & Botito)
// Archivo: src/utils/botMascots.ts
// Descripción: Centraliza la selección semántica de emociones para:
//              - Boti   (Modo Protegido Adulto: boti_feliz, boti_pensando,
//                        boti_nervioso, boti_triste)
//              - Botito (Modo Protegido Menor: botito_feliz, botito_pensando,
//                        botito_nervioso, botito_triste)
// ==============================================================================

export type ProtectedBotProfile = 'ADULT' | 'CHILD';

export type BotMood = 'feliz' | 'pensando' | 'nervioso' | 'triste';

export type BotInteractionContext =
  | 'profile_avatar'
  | 'celebration'
  | 'all_games_completed'
  | 'block_success'
  | 'pin_authorized'
  | 'game_invite'
  | 'quiz_question'
  | 'learn_more_info'
  | 'usage_stats'
  | 'minor_warning'
  | 'permanent_block_warning'
  | 'pin_required'
  | 'locked_permission'
  | 'unlock_denied'
  | 'validation_error'
  | 'pin_incorrect';

/**
 * Devuelve el nombre del personaje según el perfil protegido:
 * - ADULT -> "Boti"
 * - CHILD -> "Botito"
 */
export function getBotMascotName(mode: ProtectedBotProfile): 'Boti' | 'Botito' {
  return mode === 'ADULT' ? 'Boti' : 'Botito';
}

/**
 * Determina el sentimiento del bot al finalizar el Quiz según el puntaje obtenido:
 * - >= 60% (ej. 3 a 5 de 5): 'feliz'
 * - >= 40% (ej. 2 de 5):     'pensando'
 * - <  40% (ej. 0 o 1 de 5): 'triste'
 */
export function getQuizResultMood(score: number, total: number): BotMood {
  const safeTotal = Math.max(1, total);
  const ratio = score / safeTotal;
  if (ratio >= 0.6) {
    return 'feliz';
  }
  if (ratio >= 0.4) {
    return 'pensando';
  }
  return 'triste';
}

/**
 * Asocia cada contexto de pantalla, modal o alerta con la emoción adecuada.
 */
export function getContextBotMood(context: BotInteractionContext): BotMood {
  switch (context) {
    case 'profile_avatar':
    case 'celebration':
    case 'all_games_completed':
    case 'block_success':
    case 'pin_authorized':
      return 'feliz';

    case 'game_invite':
    case 'quiz_question':
    case 'learn_more_info':
    case 'usage_stats':
      return 'pensando';

    case 'minor_warning':
    case 'permanent_block_warning':
    case 'pin_required':
    case 'locked_permission':
      return 'nervioso';

    case 'unlock_denied':
    case 'validation_error':
    case 'pin_incorrect':
      return 'triste';
  }
}
