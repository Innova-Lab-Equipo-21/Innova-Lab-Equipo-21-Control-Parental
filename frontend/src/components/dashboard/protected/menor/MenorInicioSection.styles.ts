// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorInicioSection Styles
// Archivo: src/components/dashboard/protected/menor/MenorInicioSection.styles.ts
// Descripción: Estilos visuales para la pestaña Inicio del Modo Protegido Menor,
//              replicando la jerarquía visual de Inicio (Saludo, Estado de permisos,
//              Juegos dinámicos, Aviso educativo para menores, Tiempo de uso de
//              mis apps y Ver preguntas frecuentes).
// ==============================================================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
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
  // Sección 2: Bloque Dinámico de Juegos (Quiz / Sopa de letras / Memoria)
  // ----------------------------------------------------------------------------
  gameCard: {
    backgroundColor: '#16A34A',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  gameContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameMascot: {
    width: 72,
    height: 72,
    marginRight: 10,
  },
  gameTextColumn: {
    flex: 1,
  },
  gameProgressBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 10,
    marginBottom: 4,
  },
  gameProgressBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  gameSubtitle: {
    fontSize: 11.5,
    color: '#DCFCE7',
    lineHeight: 15,
    marginBottom: 8,
  },
  gameActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  gameStartButton: {
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
  gameStartButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  allCompletedCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  allCompletedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedMascotSmall: {
    width: 40,
    height: 40,
  },
  allCompletedTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '800',
    color: '#047857',
    marginLeft: 8,
  },
  completedSummaryText: {
    fontSize: 11.5,
    color: '#065F46',
    fontWeight: '600',
    lineHeight: 16,
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
  offlineTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  offlineTagPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  offlineTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065F46',
  },
  secondaryPasatiemposLink: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPasatiemposLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ----------------------------------------------------------------------------
  // Sección 3: Bloque "SI SOS MENOR NO PODES INGRESAR."
  // ----------------------------------------------------------------------------
  warningBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  warningTopHeader: {
    backgroundColor: '#DC2626',
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  warningTopHeaderText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  warningBodyRow: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningMascot: {
    width: 68,
    height: 68,
    marginRight: 10,
  },
  warningTextColumn: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#DC2626',
    lineHeight: 19,
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 15.5,
    marginBottom: 7,
  },
  learnMoreButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnMoreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
