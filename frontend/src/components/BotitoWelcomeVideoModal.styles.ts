// ==============================================================================
// Proyecto: BA Protege+
// Componente: BotitoWelcomeVideoModal (Estilos)
// Archivo: src/components/BotitoWelcomeVideoModal.styles.ts
// Descripción: Estilos para el modal de bienvenida con el video local
//              botito_bienvenida.mp4 durante el registro y la vinculación.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
  },
  videoSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  videoFrame: {
    width: '66%',
    maxWidth: 256,
    maxHeight: '94%',
    aspectRatio: 480 / 848,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackImage: {
    width: '78%',
    height: '78%',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
  },
  loadingBox: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  successBox: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  successBadge: {
    backgroundColor: colors.statusActiveBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  successBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#146C43',
  },
  successTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3C4654',
    textAlign: 'center',
    marginBottom: 18,
  },
  ctaWrapper: {
    width: '100%',
  },
});
