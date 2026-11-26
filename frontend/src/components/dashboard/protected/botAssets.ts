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

export const BOTITO_ASSETS: Record<BotMood, ImageSourcePropType> = {
  feliz: require('../../../assets/icons/bot/menor/botito_feliz.png'),
  pensando: require('../../../assets/icons/bot/menor/botito_pensando.png'),
  nervioso: require('../../../assets/icons/bot/menor/botito_nervioso.png'),
  triste: require('../../../assets/icons/bot/menor/botito_triste.png'),
};

export const BOTI_ASSETS: Record<BotMood, ImageSourcePropType> = BOTITO_ASSETS;

export function getBotMascotImage(
  _mode: ProtectedBotProfile,
  mood: BotMood
): ImageSourcePropType {
  return BOTITO_ASSETS[mood];
}

export function getBotMascotImageForContext(
  mode: ProtectedBotProfile,
  context: BotInteractionContext
): ImageSourcePropType {
  return getBotMascotImage(mode, getContextBotMood(context));
}
