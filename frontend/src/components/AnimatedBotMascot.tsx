// ==============================================================================
// Proyecto: BA Protege+
// Componente: AnimatedBotMascot (Mascota Boti / Botito Animada Reutilizable)
// Archivo: src/components/AnimatedBotMascot.tsx
// Descripción: Componente modular para mostrar a Botito (o Boti) con entrada
//              suave, flotación vertical y balanceo sutil en cualquier pantalla.
// ==============================================================================

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from 'react-native';
import {
  BOTI_ASSETS,
  BOTITO_ASSETS,
} from './dashboard/protected/botAssets';
import { BotMood } from '../utils/botMascots';

export type BotMascotVariant = 'botito' | 'boti';

export interface AnimatedBotMascotProps {
  /** Emoción de la mascota (por defecto: 'feliz'). */
  mood?: BotMood;
  /** Personaje: 'botito' (por defecto) o 'boti'. */
  variant?: BotMascotVariant;
  /** Recurso de imagen personalizado (tiene prioridad sobre variant/mood). */
  source?: ImageSourcePropType;
  /** Tamaño cuadrado en px (por defecto: 112). */
  size?: number;
  /** Desplazamiento vertical de la flotación en px (por defecto: 8). */
  floatDistance?: number;
  /** Habilita o pausa la animación (por defecto: true). */
  animated?: boolean;
  /** Clave opcional para reiniciar la animación de entrada al cambiar de estado/paso. */
  restartKey?: string | number;
  /** Etiqueta de accesibilidad opcional. */
  accessibilityLabel?: string;
  /** Estilos adicionales aplicados a la imagen animada. */
  style?: StyleProp<ImageStyle>;
}

export const AnimatedBotMascot: React.FC<AnimatedBotMascotProps> = ({
  mood = 'feliz',
  variant = 'botito',
  source,
  size = 112,
  floatDistance = 8,
  animated = true,
  restartKey,
  accessibilityLabel,
  style,
}) => {
  const entrance = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const float = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      entrance.setValue(1);
      float.setValue(0);
      sway.setValue(0);
      return;
    }

    entrance.setValue(0);
    float.setValue(0);
    sway.setValue(0);

    const entranceAnim = Animated.timing(entrance, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: -1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnim.start();
    floatLoop.start();
    swayLoop.start();

    return () => {
      entranceAnim.stop();
      floatLoop.stop();
      swayLoop.stop();
    };
  }, [animated, restartKey, entrance, float, sway]);

  const resolvedSource =
    source ?? (variant === 'boti' ? BOTI_ASSETS[mood] : BOTITO_ASSETS[mood]);

  const defaultLabel =
    accessibilityLabel ??
    `${variant === 'boti' ? 'Boti' : 'Botito'} ${mood}`;

  const animatedStyle = {
    width: size,
    height: size,
    opacity: entrance,
    transform: [
      {
        scale: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [0.85, 1],
        }),
      },
      {
        translateY: float.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -floatDistance],
        }),
      },
      {
        rotate: sway.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-3deg', '0deg', '3deg'],
        }),
      },
    ],
  };

  return (
    <Animated.Image
      source={resolvedSource}
      style={[animatedStyle, style]}
      resizeMode="contain"
      accessibilityLabel={defaultLabel}
    />
  );
};
