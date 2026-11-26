// ==============================================================================
// Proyecto: BA Protege+
// Componente: PasatiempoVisualIcon
// Archivo: src/components/dashboard/protected/components/PasatiempoVisualIcon.tsx
// Descripción: Ícono visual idéntico al de la sección Pasatiempos para representar
//              los 3 juegos (Sopa de letras, Juego de la memoria, Juego de preguntas)
//              en los bloques de Actividad (Responsable, Protegido Adulto y Menor).
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { PasatiempoGameId, PASATIEMPOS_CATALOG } from '../../../../utils/pasatiempos';
import { BOTITO_ASSETS } from '../botAssets';

interface PasatiempoVisualIconProps {
  gameId: PasatiempoGameId;
  size?: number;
}

const MINI_WORD_GRID = ['S', 'O', 'L', 'P', 'A', 'Z', 'M', 'A', 'R'];

export const PasatiempoVisualIcon: React.FC<PasatiempoVisualIconProps> = ({
  gameId,
  size = 40,
}) => {
  const meta = PASATIEMPOS_CATALOG[gameId] || PASATIEMPOS_CATALOG.quiz;

  if (gameId === 'quiz') {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor: '#E0F2FE' }]}>
        <Image
          source={BOTITO_ASSETS.feliz}
          style={{ width: size * 0.9, height: size * 0.9 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (gameId === 'wordsearch') {
    const scale = size / 40;
    const boardSize = Math.round(28 * scale);
    const cellSize = Math.round(7.5 * scale);
    const letterSize = Math.max(5, Math.round(5.5 * scale));

    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor: meta.bgColor }]}>
        <View style={[styles.miniGridPreview, { width: boardSize, height: boardSize, borderRadius: Math.max(4, Math.round(6 * scale)) }]}>
          {MINI_WORD_GRID.map((letter, idx) => {
            const highlight = idx < 3;
            return (
              <View
                key={idx}
                style={[
                  styles.miniGridCell,
                  {
                    width: cellSize,
                    height: cellSize,
                    borderRadius: Math.max(2, Math.round(2 * scale)),
                  },
                  highlight && styles.miniGridCellHighlight,
                ]}
              >
                <Text
                  style={[
                    styles.miniGridLetter,
                    { fontSize: letterSize },
                    highlight && styles.miniGridLetterHighlight,
                  ]}
                >
                  {letter}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // Memory
  const scale = size / 40;
  const boardSize = Math.round(28 * scale);
  const tileSize = Math.round(11 * scale);
  const fontSize = Math.max(6, Math.round(7.5 * scale));

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: meta.bgColor }]}>
      <View style={[styles.memoryMiniPreview, { width: boardSize, height: boardSize, borderRadius: Math.max(4, Math.round(6 * scale)) }]}>
        <View style={[styles.memoryMiniTileOpen, { width: tileSize, height: tileSize, borderRadius: Math.max(2, Math.round(3 * scale)) }]}>
          <Text style={{ fontSize }}>⚽</Text>
        </View>
        <View style={[styles.memoryMiniTileClosed, { width: tileSize, height: tileSize, borderRadius: Math.max(2, Math.round(3 * scale)) }]}>
          <Text style={[styles.memoryMiniQuestion, { fontSize }]}>?</Text>
        </View>
        <View style={[styles.memoryMiniTileClosed, { width: tileSize, height: tileSize, borderRadius: Math.max(2, Math.round(3 * scale)) }]}>
          <Text style={[styles.memoryMiniQuestion, { fontSize }]}>?</Text>
        </View>
        <View style={[styles.memoryMiniTileOpen, { width: tileSize, height: tileSize, borderRadius: Math.max(2, Math.round(3 * scale)) }]}>
          <Text style={{ fontSize }}>⚽</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  miniGridPreview: {
    backgroundColor: '#FFFFFF',
    padding: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  miniGridCell: {
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniGridCellHighlight: {
    backgroundColor: '#6338F9',
  },
  miniGridLetter: {
    fontWeight: '900',
    color: '#4C1D95',
  },
  miniGridLetterHighlight: {
    color: '#FFFFFF',
  },
  memoryMiniPreview: {
    backgroundColor: '#FFFFFF',
    padding: 2.5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  memoryMiniTileOpen: {
    backgroundColor: '#FEF3C7',
    borderWidth: 0.5,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryMiniTileClosed: {
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryMiniQuestion: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
