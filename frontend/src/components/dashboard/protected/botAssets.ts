// ==============================================================================
// Proyecto: BA Protege+
// Módulo: Mapa Estático de Imágenes de Mascotas (Boti & Botito)
// Archivo: src/components/dashboard/protected/botAssets.ts
// Descripción: Resuelve de forma estática las imágenes de Boti (Modo Protegido
//              Adulto) y Botito (Modo Protegido Menor) según cada sentimiento.
// ==============================================================================

import { ImageSourcePropType } from 'react-native';
import {
  BotInteractionContext,
  BotMood,
  ProtectedBotProfile,
  getContextBotMood,
} from '../../../utils/botMascots';

export const BOTI_ASSETS: Record<BotMood, ImageSourcePropType> = {
  feliz: require('../../../assets/icons/bot/adulto/boti_feliz.png'),
  pensando: require('../../../assets/icons/bot/adulto/boti_pensando.png'),
  nervioso: require('../../../assets/icons/bot/adulto/boti_nervioso.png'),
  triste: require('../../../assets/icons/bot/adulto/boti_triste.png'),
};

export const BOTITO_ASSETS: Record<BotMood, ImageSourcePropType> = {
  feliz: require('../../../assets/icons/bot/menor/botito_feliz.png'),
  pensando: require('../../../assets/icons/bot/menor/botito_pensando.png'),
  nervioso: require('../../../assets/icons/bot/menor/botito_nervioso.png'),
  triste: require('../../../assets/icons/bot/menor/botito_triste.png'),
};

export function getBotMascotImage(
  mode: ProtectedBotProfile,
  mood: BotMood
): ImageSourcePropType {
  return mode === 'ADULT' ? BOTI_ASSETS[mood] : BOTITO_ASSETS[mood];
}

export function getBotMascotImageForContext(
  mode: ProtectedBotProfile,
  context: BotInteractionContext
): ImageSourcePropType {
  return getBotMascotImage(mode, getContextBotMood(context));
}
