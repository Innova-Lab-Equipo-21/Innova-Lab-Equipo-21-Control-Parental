// ==============================================================================
// Proyecto: BA Protege+
// Componente: ParentInicioSection Styles (Estilos de la Pantalla de Inicio del Tutor)
// Archivo: src/components/dashboard/inicio/ParentInicioSection.styles.ts
// Descripción: Estilos compactos sin scroll para la Home del Responsable:
//              1) Card dinámico con estilo de referencia (borde azul, escudo, engrenaje)
//              2) Card de dispositivos protegidos (badges y CTA + "Nuevo dispositivo")
//              3) Cards de Sitios y Apps bloqueados con CTA Editar (Estilo imagen de referencia)
//              4) Gráfico histórico compacto de intentos interceptados
//              5) Enlace a Preguntas frecuentes
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // ----------------------------------------------------------------------------
  // Saludo dinámico conciso (1 sola línea)
  // ----------------------------------------------------------------------------
  greetingText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.2,
  },

  // ----------------------------------------------------------------------------
  // Sección 1: Card Dinámico de Estado (Estilo Referencia Imagen)
  // Borde redondeado azul, fondo azul claro, escudo, textos y engrenaje.png
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
    marginBottom: 8,
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
  // Sección 2: Card de Dispositivos Protegidos
  // Dispositivos protegidos (badges) + CTA (+) "Nuevo dispositivo"
  // ----------------------------------------------------------------------------
  devicesCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  devicesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  devicesHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#374151',
  },
  devicesCountSummary: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0072CE',
  },
  devicesCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 114, 206, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  devicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  devicesRowSparse: {
    justifyContent: 'flex-start',
    gap: 14,
  },
  deviceBadgeItem: {
    alignItems: 'center',
    flex: 1,
  },
  deviceBadgeItemSparse: {
    flex: 0,
    minWidth: 52,
  },
  deviceBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceBadgeLetter: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  deviceBadgeName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
    textAlign: 'center',
  },
  addDeviceBadgeCircle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  addDeviceBadgePlus: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: -1,
  },

  // ----------------------------------------------------------------------------
  // Sección 3: Cards de Sitios y Apps Bloqueados con CTA Editar
  // ----------------------------------------------------------------------------
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
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
    fontSize: 66,
    fontWeight: '800',
    color: '#0072CE',
    textAlign: 'center',
    lineHeight: 70,
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
  cardEditBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cardEditBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ----------------------------------------------------------------------------
  // Sección 4: Gráfico Histórico Compacto de Intentos
  // ----------------------------------------------------------------------------
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#111827',
  },
  chartArea: {
    height: 60,
    width: '100%',
    position: 'relative',
    marginVertical: 2,
  },
  chartBaseline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: '#E5E7EB',
  },
  chartEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartEmptyText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  chartDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  chartDateText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    gap: 8,
  },
  legendEmptyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 1,
  },
  chartMoreBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartMoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },

  // ----------------------------------------------------------------------------
  // Sección 5: Enlace de Preguntas Frecuentes
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
