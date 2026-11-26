// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorPasatiemposSection
// Archivo: src/components/dashboard/protected/menor/MenorPasatiemposSection.tsx
// Descripción: Pantalla "Pasatiempos" exclusiva para el Modo Protegido Menor,
//              donde puede jugar a los 3 pasatiempos (Quiz, Sopa de letras y
//              Juego de la memoria). Una vez completado un juego, pasa al final
//              de la lista y queda inactivo sin opción de volver a jugarlo.
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  CompletedGamesState,
  PASATIEMPOS_CATALOG,
  PasatiempoGameId,
  SCREEN_FREE_SUGGESTION,
  areAllGamesCompleted,
  canPlayPasatiempoGame,
  getOrderedPasatiemposForDisplay,
} from '../../../../utils/pasatiempos';
import { BOTITO_ASSETS } from '../botAssets';
import { styles } from './MenorPasatiemposSection.styles';

interface MenorPasatiemposSectionProps {
  completedGames: CompletedGamesState;
  completedGamesOrder?: PasatiempoGameId[];
  onSelectGame: (gameId: PasatiempoGameId) => void;
}

const MINI_WORD_GRID = ['S', 'O', 'L', 'P', 'A', 'Z', 'M', 'A', 'R'];

export const MenorPasatiemposSection: React.FC<MenorPasatiemposSectionProps> = ({
  completedGames,
  completedGamesOrder = [],
  onSelectGame,
}) => {
  const allCompleted = areAllGamesCompleted(completedGames);
  const orderedGameIds = getOrderedPasatiemposForDisplay(
    completedGames,
    completedGamesOrder
  );

  const renderGameVisual = (gameId: PasatiempoGameId, isDone: boolean) => {
    if (gameId === 'quiz') {
      return (
        <Image
          source={isDone ? BOTITO_ASSETS.feliz : BOTITO_ASSETS.pensando}
          style={styles.mascotImage}
          resizeMode="contain"
        />
      );
    }

    if (gameId === 'wordsearch') {
      return (
        <View style={styles.miniGridPreview}>
          {MINI_WORD_GRID.map((letter, idx) => {
            const highlight = idx < 3;
            return (
              <View
                key={idx}
                style={[
                  styles.miniGridCell,
                  highlight && !isDone && styles.miniGridCellHighlight,
                  isDone && styles.miniGridCellInactive,
                ]}
              >
                <Text
                  style={[
                    styles.miniGridLetter,
                    highlight && !isDone && styles.miniGridLetterHighlight,
                    isDone && styles.miniGridLetterInactive,
                  ]}
                >
                  {letter}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.memoryMiniPreview}>
        <View
          style={[
            styles.memoryMiniTileOpen,
            isDone && styles.memoryMiniTileInactive,
          ]}
        >
          <Text style={styles.memoryMiniEmoji}>⚽</Text>
        </View>
        <View
          style={[
            styles.memoryMiniTileClosed,
            isDone && styles.memoryMiniTileInactive,
          ]}
        >
          <Text style={styles.memoryMiniQuestion}>?</Text>
        </View>
        <View
          style={[
            styles.memoryMiniTileClosed,
            isDone && styles.memoryMiniTileInactive,
          ]}
        >
          <Text style={styles.memoryMiniQuestion}>?</Text>
        </View>
        <View
          style={[
            styles.memoryMiniTileOpen,
            isDone && styles.memoryMiniTileInactive,
          ]}
        >
          <Text style={styles.memoryMiniEmoji}>⚽</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {allCompleted && (
        <View style={styles.offlineSuggestionCard}>
          <Image
            source={BOTITO_ASSETS.feliz}
            style={styles.offlineMascot}
            resizeMode="contain"
          />
          <View style={styles.offlineTextCol}>
            <Text style={styles.offlineTitle}>
              Ya completaste todos los pasatiempos. ¡Muy bien!
            </Text>
            <Text style={styles.offlineSubtitle}>
              Ahora es un buen momento para alejarse de las pantallas.
            </Text>
            <Text style={styles.offlineBody}>
              Podés salir a pasear o distraerte con otra actividad.
            </Text>
          </View>
        </View>
      )}

      {orderedGameIds.map((gameId) => {
        const meta = PASATIEMPOS_CATALOG[gameId];
        const canPlay = canPlayPasatiempoGame(completedGames, gameId);
        const isDone = !canPlay;

        return (
          <View
            key={gameId}
            style={[
              styles.gameCard,
              isDone ? styles.gameCardInactive : { backgroundColor: meta.bgColor },
            ]}
          >
            <View style={styles.gameCardContentRow}>
              <View
                style={[
                  styles.visualBadgeContainer,
                  isDone && styles.visualBadgeContainerInactive,
                ]}
              >
                {renderGameVisual(gameId, isDone)}
              </View>

              <View style={styles.gameTextColumn}>
                <View style={styles.titleBadgeRow}>
                  <Text
                    style={[
                      styles.gameTitle,
                      isDone && styles.gameTitleInactive,
                    ]}
                  >
                    {meta.title}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.gameDescription,
                    isDone
                      ? styles.gameDescriptionInactive
                      : { color: meta.lightTextColor },
                  ]}
                >
                  {meta.cardDescription}
                </Text>

                {canPlay ? (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => onSelectGame(gameId)}
                    activeOpacity={0.85}
                    accessibilityLabel={`Jugar ${meta.title}`}
                  >
                    <Text style={styles.playButtonText}>Comenzar</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={styles.inactiveButton}
                    accessibilityState={{ disabled: true }}
                  >
                    <Text style={styles.inactiveButtonText}>Completado</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};
