// ==============================================================================
// Proyecto: BA Protege+
// Componente: MemoryGameModal (Juego de la memoria — 12 piezas)
// Archivo: src/components/dashboard/protected/juegos/MemoryGameModal.tsx
// Descripción: Juego interactivo de la memoria con 12 fichas (6 pares temáticos),
//              volteo por toque y pantalla de felicitación con Beti al completar.
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  MEMORY_PAIRS,
  MemoryCardItem,
  areMemoryCardsMatching,
  createMemoryDeck,
  isMemoryGameCompleted,
} from '../../../../utils/pasatiempos';
import { BOTITO_ASSETS } from '../botAssets';
import { styles } from './MemoryGameModal.styles';

export interface MemoryGameModalProps {
  visible: boolean;
  onClose: () => void;
  onCompleteGame: () => void;
}

export const MemoryGameModal: React.FC<MemoryGameModalProps> = ({
  visible,
  onClose,
  onCompleteGame,
}) => {
  const [deck, setDeck] = useState<MemoryCardItem[]>(() => createMemoryDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  const handleCardPress = (cardIndex: number) => {
    if (showCelebration || isChecking) return;

    const card = deck[cardIndex];
    if (!card) return;

    const isAlreadyMatched = matchedPairIds.includes(card.pairId);
    const isAlreadyFlipped = flippedIndices.includes(cardIndex);
    if (isAlreadyMatched || isAlreadyFlipped) return;

    if (flippedIndices.length === 0) {
      setFlippedIndices([cardIndex]);
      return;
    }

    if (flippedIndices.length === 1) {
      const firstIndex = flippedIndices[0];
      const nextFlipped = [firstIndex, cardIndex];
      setFlippedIndices(nextFlipped);
      setMoves((prev) => prev + 1);

      if (areMemoryCardsMatching(deck, firstIndex, cardIndex)) {
        const updatedMatched = [...matchedPairIds, card.pairId];
        setMatchedPairIds(updatedMatched);
        setFlippedIndices([]);

        if (isMemoryGameCompleted(updatedMatched)) {
          setShowCelebration(true);
          onCompleteGame();
        }
      } else {
        setIsChecking(true);
        flipTimeoutRef.current = setTimeout(() => {
          setFlippedIndices([]);
          setIsChecking(false);
        }, 700);
      }
    }
  };

  const handleFinishCelebration = () => {
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
    }
    setDeck(createMemoryDeck());
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMoves(0);
    setIsChecking(false);
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
              accessibilityLabel="Cerrar juego de la memoria"
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.amberFrame}>
              <View style={styles.whiteBoardSheet}>
                <Text style={styles.boardTitle}>Juego de la memoria</Text>
                <Text style={styles.boardHintText}>
                  Dá vuelta dos fichas para encontrar los 6 pares iguales
                </Text>

                <View style={styles.gridContainer}>
                  {deck.map((card, index) => {
                    const isMatched = matchedPairIds.includes(card.pairId);
                    const isFlipped = flippedIndices.includes(index);
                    const isFaceUp = isMatched || isFlipped;

                    return (
                      <TouchableOpacity
                        key={card.uid}
                        style={[
                          styles.memoryCard,
                          isFaceUp
                            ? [
                                { backgroundColor: card.bgColor },
                                isMatched
                                  ? styles.memoryCardMatched
                                  : styles.memoryCardFlipped,
                              ]
                            : styles.memoryCardBack,
                        ]}
                        onPress={() => handleCardPress(index)}
                        disabled={isFaceUp || isChecking || showCelebration}
                        activeOpacity={0.85}
                        accessibilityLabel={
                          isFaceUp
                            ? `Ficha ${card.label}`
                            : `Ficha oculta ${index + 1} de 12`
                        }
                      >
                        {isFaceUp ? (
                          <>
                            {isMatched && (
                              <View style={styles.matchedCheckBadge}>
                                <Text style={styles.matchedCheckText}>✓</Text>
                              </View>
                            )}
                            <Text style={styles.cardEmoji}>{card.emoji}</Text>
                            <Text style={styles.cardLabel} numberOfLines={1}>
                              {card.label}
                            </Text>
                          </>
                        ) : (
                          <View style={styles.memoryCardBackInner}>
                            <Text style={styles.memoryCardQuestion}>?</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.footerStatusRow}>
                  <Text style={styles.progressInfoText}>
                    Pares encontrados: {matchedPairIds.length} / {MEMORY_PAIRS.length}
                  </Text>
                  <View style={styles.movesPill}>
                    <Text style={styles.movesPillText}>Intentos: {moves}</Text>
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
                    ¡Completaste el juego de la memoria!{'\n'}¡Seguí así!
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
