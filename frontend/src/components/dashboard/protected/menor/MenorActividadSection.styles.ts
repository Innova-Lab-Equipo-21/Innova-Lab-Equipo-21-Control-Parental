// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorActividadSection Styles
// Archivo: src/components/dashboard/protected/menor/MenorActividadSection.styles.ts
// Descripción: Estilos para la pestaña Actividad del Modo Protegido Menor.
// ==============================================================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  headerBanner: {
    backgroundColor: '#007AFF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  headerBannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerBannerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  clockIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  clockIconText: {
    fontSize: 28,
  },
  mascotIconImage: {
    width: 48,
    height: 48,
    marginRight: 8,
  },
  statTextColumn: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  statValueText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#007AFF',
    letterSpacing: -0.5,
  },
  statRestantText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 2,
  },
  appUsageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    padding: 14,
    marginBottom: 18,
    gap: 12,
  },
  appItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  appIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  progressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  appTimeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#007AFF',
  },
  blockedSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  blockedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lockIconText: {
    fontSize: 18,
  },
  blockedTextColumn: {
    flex: 1,
  },
  blockedDomainTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  blockedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 2,
  },
  protectedLockNotice: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
});
