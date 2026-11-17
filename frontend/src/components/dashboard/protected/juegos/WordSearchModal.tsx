// ==============================================================================
// Proyecto: BA Protege+
// Componente: WordSearchModal (Sopa de letras)
// Archivo: src/components/dashboard/protected/juegos/WordSearchModal.tsx
// Descripción: Pasatiempo interactivo de Sopa de letras con 3 tableros temáticos,
//              selección intuitiva por toque y celebración con Beti al completar.
// ==============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  WORD_SEARCH_BOARDS,
  GridCellCoord,
  buildWordSearchGrid,
  getWordCells,
  getStraightLineCells,
  findMatchingWordPlacement,
} from '../../../../utils/pasatiempos';
import { BOTITO_ASSETS } from '../botAssets';
import { styles } from './WordSearchModal.styles';

interface WordSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onCompleteGame: () => void;
}

export const WordSearchModal: React.FC<WordSearchModalProps> = ({
  visible,
  onClose,
  onCompleteGame,
}) => {
  const [boardIndex, setBoardIndex] = useState<number>(0);
  const [selectedCells, setSelectedCells] = useState<GridCellCoord[]>([]);
  const [foundByBoard, setFoundByBoard] = useState<Record<string, string[]>>({});
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const currentBoard = WORD_SEARCH_BOARDS[boardIndex] || WORD_SEARCH_BOARDS[0];
  const foundWords = foundByBoard[currentBoard.id] || [];

  const grid = useMemo(() => buildWordSearchGrid(currentBoard), [currentBoard]);

  const foundCellColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const placement of currentBoard.words) {
      if (foundWords.includes(placement.word)) {
        for (const cell of getWordCells(placement)) {
          map[`${cell.row}-${cell.col}`] = placement.color;
        }
      }
    }
    return map;
  }, [currentBoard, foundWords]);

  if (!visible) return null;

  const isCellSelected = (row: number, col: number): boolean =>
    selectedCells.some((c) => c.row === row && c.col === col);

  const markWordFound = (word: string) => {
    const updated = [...foundWords, word];
    setFoundByBoard((prev) => ({
      ...prev,
      [currentBoard.id]: updated,
    }));
    setSelectedCells([]);

    if (updated.length >= currentBoard.words.length) {
      setShowCelebration(true);
      onCompleteGame();
    }
  };

  const handleCellPress = (row: number, col: number) => {
    const tapped: GridCellCoord = { row, col };

    if (selectedCells.length === 0) {
      setSelectedCells([tapped]);
      return;
    }

    const first = selectedCells[0];

    if (selectedCells.length === 1 && first.row === row && first.col === col) {
      setSelectedCells([]);
      return;
    }

    const straightLine = getStraightLineCells(first, tapped);
    if (straightLine && straightLine.length >= 2) {
      const matchedDirect = findMatchingWordPlacement(
        currentBoard,
        straightLine,
        foundWords
      );
      if (matchedDirect) {
        markWordFound(matchedDirect.word);
        return;
      }
    }

    const last = selectedCells[selectedCells.length - 1];
    const dRow = row - last.row;
    const dCol = col - last.col;
    const isAdjacent =
      Math.abs(dRow) <= 1 && Math.abs(dCol) <= 1 && (dRow !== 0 || dCol !== 0);

    if (isAdjacent && !isCellSelected(row, col)) {
      if (selectedCells.length === 1) {
        const nextSelection = [...selectedCells, tapped];
        const match = findMatchingWordPlacement(currentBoard, nextSelection, foundWords);
        if (match) {
          markWordFound(match.word);
        } else {
          setSelectedCells(nextSelection);
        }
        return;
      }

      const expectedDRow = selectedCells[1].row - selectedCells[0].row;
      const expectedDCol = selectedCells[1].col - selectedCells[0].col;
      if (dRow === expectedDRow && dCol === expectedDCol) {
        const nextSelection = [...selectedCells, tapped];
        const match = findMatchingWordPlacement(currentBoard, nextSelection, foundWords);
        if (match) {
          markWordFound(match.word);
        } else {
          setSelectedCells(nextSelection);
        }
        return;
      }
    }

    setSelectedCells([tapped]);
  };

  const handleSelectBoard = (idx: number) => {
    setBoardIndex(idx);
    setSelectedCells([]);
    setShowCelebration(false);
  };

  const handleFinishCelebration = () => {
    setFoundByBoard((prev) => ({
      ...prev,
      [currentBoard.id]: [],
    }));
    setSelectedCells([]);
    setShowCelebration(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.outerWrapper}>
          <View style={styles.topHeaderRow}>
            <Text style={styles.screenTitle}>Pasatiempos</Text>
            <TouchableOpacity
              style={styles.closeIconButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityLabel="Cerrar sopa de letras"
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.boardTabsRow}>
            {WORD_SEARCH_BOARDS.map((b, idx) => {
              const active = idx === boardIndex;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.boardTabPill, active && styles.boardTabPillActive]}
                  onPress={() => handleSelectBoard(idx)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.boardTabText, active && styles.boardTabTextActive]}
                    numberOfLines={1}
                  >
                    {b.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.purpleFrame}>
              <View style={styles.whiteBoardSheet}>
                <Text style={styles.boardTitle}>{currentBoard.title}</Text>
                <Text style={styles.boardHintText}>
                  Tocá la primera y la última letra de cada palabra
                </Text>

                <View style={styles.gridContainer}>
                  {grid.map((rowLetters, rIdx) => (
                    <View key={rIdx} style={styles.gridRow}>
                      {rowLetters.map((letter, cIdx) => {
                        const selected = isCellSelected(rIdx, cIdx);
                        const foundBg = foundCellColors[`${rIdx}-${cIdx}`];

                        return (
                          <TouchableOpacity
                            key={`${rIdx}-${cIdx}`}
                            style={[
                              styles.gridCell,
                              foundBg ? { backgroundColor: foundBg } : null,
                              selected && styles.gridCellSelected,
                            ]}
                            onPress={() => handleCellPress(rIdx, cIdx)}
                            activeOpacity={0.75}
                          >
                            <Text
                              style={[
                                styles.gridCellLetter,
                                foundBg ? styles.gridCellLetterFound : null,
                                selected && styles.gridCellLetterSelected,
                              ]}
                            >
                              {letter}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>

                <View style={styles.wordsSection}>
                  <View style={styles.wordsHeaderRow}>
                    <Text style={styles.wordsSectionTitle}>
                      Encuentra las palabras:
                    </Text>
                    <Text style={styles.wordsCounterBadge}>
                      {foundWords.length}/{currentBoard.words.length}
                    </Text>
                  </View>

                  <View style={styles.wordsGrid}>
                    {currentBoard.words.map((item) => {
                      const isFound = foundWords.includes(item.word);
                      return (
                        <View
                          key={item.word}
                          style={[
                            styles.wordChip,
                            isFound && styles.wordChipFound,
                          ]}
                        >
                          <Text
                            style={[
                              styles.wordBullet,
                              isFound && styles.wordBulletFound,
                            ]}
                          >
                            {isFound ? '✓' : '•'}
                          </Text>
                          <Text
                            style={[
                              styles.wordChipText,
                              isFound && styles.wordChipTextFound,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {showCelebration && (
            <View style={styles.celebrationOverlay}>
              <View style={styles.celebrationCardOuter}>
                <View style={styles.celebrationCardInner}>
                  <TouchableOpacity
                    style={styles.celebrationCloseBtn}
                    onPress={handleFinishCelebration}
                    accessibilityLabel="Cerrar felicitación"
                  >
                    <Text style={styles.celebrationCloseText}>✕</Text>
                  </TouchableOpacity>

                  <Text style={styles.celebrationTitle}>¡FELICITACIONES!!</Text>
                  <Text style={styles.celebrationSubtitle}>
                    ¡Completaste la sopa de letras!{'\n'}¡Seguí así!
                  </Text>

                  <View style={styles.celebrationIllustrationRow}>
                    <Image
                      source={BOTITO_ASSETS.feliz}
                      style={styles.celebrationBeti}
                      resizeMode="contain"
                    />
                    <View style={styles.celebrationCheckCircle}>
                      <Text style={styles.celebrationCheckMark}>✓</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.celebrationContinueBtn}
                    onPress={handleFinishCelebration}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.celebrationContinueText}>
                      Continuar ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
