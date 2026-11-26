// ==============================================================================
// Proyecto: BA Protege+
// Componente: AdultoInicioSection Styles
// Archivo: src/components/dashboard/protected/adulto/AdultoInicioSection.styles.ts
// Descripción: Estilos visuales para la pestaña Inicio del Modo Protegido Adulto,
//              replicando la jerarquía visual y proporciones de Inicio del Modo
//              Responsable (Saludo, Estado de permisos, Quiz, Sitios/Apps,
//              Tiempo de uso de mis apps y Ver preguntas frecuentes).
// ==============================================================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },

  // ----------------------------------------------------------------------------
  // Saludo dinámico conciso
  // ----------------------------------------------------------------------------
  greetingText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.2,
  },

  // ----------------------------------------------------------------------------
  // Sección 1: Card Dinámico de Estado ("DISPOSITIVO NO PROTEGIDO" / "ESTÁS PROTEGIDO")
  // ----------------------------------------------------------------------------
  statusCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#0072CE',
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    minHeight: 64,
  },
  statusCardAlert: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  statusLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusShieldIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
    resizeMode: 'contain',
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0072CE',
    letterSpacing: 0.3,
  },
  statusTitleAlert: {
    color: '#B45309',
  },
  statusSubtitle: {
    fontSize: 11,
    color: '#0072CE',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 14,
  },
  statusSubtitleAlert: {
    color: '#92400E',
  },
  gearBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 114, 206, 0.08)',
  },
  gearIcon: {
    width: 22,
    height: 22,
    tintColor: '#0072CE',
    resizeMode: 'contain',
  },

  // ----------------------------------------------------------------------------
  // Sección 2: Card de Quiz Diario (sin opción de repetir una vez completado)
  // ----------------------------------------------------------------------------
  quizCard: {
    backgroundColor: '#16A34A',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  quizContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizMascot: {
    width: 72,
    height: 72,
    marginRight: 10,
  },
  quizTextColumn: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  quizSubtitle: {
    fontSize: 11.5,
    color: '#DCFCE7',
    lineHeight: 15,
    marginBottom: 8,
  },
  quizStartButton: {
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
  quizStartButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  quizCompletedCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  quizCompletedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedMascotSmall: {
    width: 38,
    height: 38,
    marginRight: 8,
  },
  quizCompletedTitleCol: {
    flex: 1,
    marginRight: 6,
  },
  quizCompletedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
  },
  completedSummaryText: {
    fontSize: 11.5,
    color: '#065F46',
    fontWeight: '700',
    marginTop: 1,
  },
  completedStatusPill: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedStatusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065F46',
  },
  outdoorPromptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  outdoorPromptTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 2,
  },
  outdoorPromptText: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 15,
  },

  // ----------------------------------------------------------------------------
  // Sección 3: Cards de Sitios y Apps Bloqueados
  // ----------------------------------------------------------------------------
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#EAF3FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#B6D4FE',
    justifyContent: 'space-between',
    minHeight: 135,
    shadowColor: '#0072CE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabelLeft: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0072CE',
    alignSelf: 'flex-start',
  },
  metricLabelRight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0072CE',
    alignSelf: 'flex-end',
  },
  metricNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: '#0072CE',
    textAlign: 'center',
    lineHeight: 68,
    letterSpacing: -1.5,
    marginVertical: 2,
  },
  metricSubLabelLeft: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0072CE',
    alignSelf: 'flex-start',
  },
  metricSubLabelRight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0072CE',
    alignSelf: 'flex-end',
  },
  cardActionBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cardActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ----------------------------------------------------------------------------
  // Sección 4: Tiempo de uso de mis apps (con CTA hacia Actividad)
  // ----------------------------------------------------------------------------
  usageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  usageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#111827',
  },
  usageListContainer: {
    gap: 7,
    marginBottom: 4,
  },
  usageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usageAppName: {
    width: 72,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#374151',
  },
  usageProgressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
    overflow: 'hidden',
  },
  usageProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  usageDurationText: {
    width: 44,
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'right',
  },
  usageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  usageSummaryText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4B5563',
    flex: 1,
    marginRight: 8,
  },
  usageMoreBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usageMoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },

  // ----------------------------------------------------------------------------
  // Sección 5: Enlace a Preguntas Frecuentes
  // ----------------------------------------------------------------------------
  faqLinkBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  faqLinkText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0072CE',
  },
});
