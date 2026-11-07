// ==============================================================================
// Proyecto: BA Protege+
// Componente: WordSearchModal Styles
// Archivo: src/components/dashboard/protected/juegos/WordSearchModal.styles.ts
// Descripción: Estilos para el pasatiempo interactivo Sopa de letras siguiendo la
//              estética violeta de Pasatiempos cuidados y el modal de felicitaciones.
// ==============================================================================

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_MAX_WIDTH = Math.min(width * 0.94, 420);
const INNER_GRID_WIDTH = CARD_MAX_WIDTH - 52;
const CELL_SIZE = Math.floor(INNER_GRID_WIDTH / 9);

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  outerWrapper: {
    width: CARD_MAX_WIDTH,
    backgroundColor: '#F8FAFC',
    borderRadius: 26,
    padding: 16,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 12,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#334155',
    lineHeight: 17,
  },
  boardTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  boardTabPill: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardTabPillActive: {
    backgroundColor: '#6338F9',
  },
  boardTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B21B6',
    textAlign: 'center',
  },
  boardTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  purpleFrame: {
    backgroundColor: '#6338F9',
    borderRadius: 22,
    padding: 10,
  },
  whiteBoardSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  boardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  boardHintText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  gridContainer: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  gridCellSelected: {
    backgroundColor: '#6338F9',
  },
  gridCellLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  gridCellLetterSelected: {
    color: '#FFFFFF',
  },
  gridCellLetterFound: {
    color: '#1E1B4B',
    fontWeight: '900',
  },
  wordsSection: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 6,
  },
  wordsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  wordsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4C1D95',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  wordsCounterBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6338F9',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 6,
  },
  wordChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wordChipFound: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
  },
  wordBullet: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6338F9',
    marginRight: 6,
  },
  wordBulletFound: {
    color: '#16A34A',
  },
  wordChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  wordChipTextFound: {
    color: '#15803D',
    textDecorationLine: 'line-through',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  celebrationCardOuter: {
    width: '100%',
    backgroundColor: '#6338F9',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#31108F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  celebrationCardInner: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  celebrationCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationCloseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  celebrationTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 6,
  },
  celebrationSubtitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#EDE9FE',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 14,
  },
  celebrationIllustrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  celebrationBeti: {
    width: 125,
    height: 125,
  },
  celebrationCheckCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4ADE80',
    borderWidth: 3,
    borderColor: '#BBF7D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  celebrationCheckMark: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  celebrationContinueBtn: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 26,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
  },
  celebrationContinueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5B21B6',
  },
});
