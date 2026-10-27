// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedInicioSection Styles
// Archivo: src/components/dashboard/protected/ProtectedInicioSection.styles.ts
// Descripción: Estilos visuales para la pestaña Inicio del usuario protegido.
// ==============================================================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  // Card 1: Status Card ("Estás protegido")
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shieldIconText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  statusTextColumn: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
    lineHeight: 16,
  },
  tutorInfoText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  // Card 2: Quiz Card ("¿HACEMOS UN QUIZ?")
  quizCard: {
    backgroundColor: '#16A34A',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quizContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizMascot: {
    width: 90,
    height: 90,
    marginRight: 10,
  },
  quizTextColumn: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  quizSubtitle: {
    fontSize: 11.5,
    color: '#DCFCE7',
    lineHeight: 15,
    marginBottom: 10,
  },
  quizStartButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quizStartButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },

  // Quiz Card cuando ya está completado
  quizCompletedCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  quizCompletedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizCompletedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#047857',
    marginLeft: 8,
  },
  outdoorPromptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  outdoorPromptTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 2,
  },
  outdoorPromptText: {
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 16,
  },

  // Card 3: Red Warning Banner ("SI SOS MENOR NO PODES INGRESAR")
  warningBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  warningTopHeader: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  warningTopHeaderText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  warningBodyRow: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningMascot: {
    width: 75,
    height: 75,
    marginRight: 12,
  },
  warningTextColumn: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
    marginBottom: 2,
  },
  warningDescription: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 8,
  },
  learnMoreButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-end',
  },
  learnMoreButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Section 4: Actividad Reciente Card
  recentActivityCard: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },
  recentActivityHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
    paddingLeft: 4,
  },
  recentActivityBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  greenIconBg: {
    backgroundColor: '#DCFCE7',
  },
  purpleIconBg: {
    backgroundColor: '#F3E8FF',
  },
  itemIconText: {
    fontSize: 18,
  },
  itemTextColumn: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  itemChevron: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
    marginLeft: 6,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
});
