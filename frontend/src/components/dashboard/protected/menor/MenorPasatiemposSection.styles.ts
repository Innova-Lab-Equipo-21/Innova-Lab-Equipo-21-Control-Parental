// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorPasatiemposSection Styles
// Archivo: src/components/dashboard/protected/menor/MenorPasatiemposSection.styles.ts
// Descripción: Estilos para la pantalla "Pasatiempos" exclusiva del Modo Protegido
//              Menor con tarjetas activas e inactivas (completadas al final).
// ==============================================================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
  },
  gameCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  gameCardInactive: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.78,
  },
  gameCardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visualBadgeContainer: {
    width: 82,
    height: 82,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  visualBadgeContainerInactive: {
    backgroundColor: '#F1F5F9',
    opacity: 0.65,
  },
  mascotImage: {
    width: 74,
    height: 74,
  },
  miniGridPreview: {
    width: 58,
    height: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  miniGridCell: {
    width: 15,
    height: 15,
    borderRadius: 4,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniGridCellHighlight: {
    backgroundColor: '#6338F9',
  },
  miniGridCellInactive: {
    backgroundColor: '#E2E8F0',
  },
  miniGridLetter: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4C1D95',
  },
  miniGridLetterHighlight: {
    color: '#FFFFFF',
  },
  miniGridLetterInactive: {
    color: '#64748B',
  },
  memoryMiniPreview: {
    width: 58,
    height: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  memoryMiniTileOpen: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryMiniTileClosed: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryMiniTileInactive: {
    backgroundColor: '#CBD5E1',
    borderColor: '#94A3B8',
  },
  memoryMiniEmoji: {
    fontSize: 11,
  },
  memoryMiniQuestion: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gameTextColumn: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  gameTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  gameTitleInactive: {
    color: '#475569',
  },
  completedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  completedPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  gameDescription: {
    fontSize: 12,
    lineHeight: 16.5,
    marginBottom: 12,
    fontWeight: '500',
  },
  gameDescriptionInactive: {
    color: '#64748B',
  },
  playButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inactiveStatusPill: {
    backgroundColor: '#CBD5E1',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  inactiveStatusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  offlineSuggestionCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  offlineMascot: {
    width: 58,
    height: 58,
    marginRight: 12,
  },
  offlineTextCol: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 3,
  },
  offlineBody: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
    fontWeight: '500',
  },
});
