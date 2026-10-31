// ==============================================================================
// Proyecto: BA Protege+
// Componente: ParentInicioSection Styles (Estilos de la Pantalla de Inicio del Tutor)
// Archivo: src/components/dashboard/inicio/ParentInicioSection.styles.ts
// Descripción: Estilos compactos sin scroll para la Home del Responsable:
//              1) Card dinámico con estilo de referencia (borde azul, escudo, engrenaje)
//              2) Card de dispositivos en 2 secciones (Mi dispositivo con toggle + Dispositivos protegidos)
//              3) Cards de Sitios y Apps con colores oficiales del app y botón circular (+)
//              4) Gráfico histórico compacto de intentos interceptados
//              5) Enlace a Preguntas frecuentes
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    justifyContent: 'space-between',
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
  // Sección 2: Card de Dispositivos Dividido en 2 Secciones
  // Secc 1: Mi dispositivo: Autocontrol (con toggle) Activado/Desactivado
  // Secc 2: Dispositivos protegidos (badges) + CTA @dispositivos.png
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
  // Sub-sección 1: Mi dispositivo
  selfControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 7,
  },
  selfControlLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selfControlTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
  },
  selfControlSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginRight: 4,
  },
  selfControlRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 7,
  },
  // Sub-sección 2: Dispositivos protegidos
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
    gap: 6,
  },
  devicesCtaIcon: {
    width: 17,
    height: 17,
    tintColor: '#0072CE',
    resizeMode: 'contain',
  },
  devicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  deviceBadgeItem: {
    alignItems: 'center',
    flex: 1,
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

  // ----------------------------------------------------------------------------
  // Sección 3: Cards Sitios y Apps (Colores del App + Botón Circular +)
  // ----------------------------------------------------------------------------
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#EAF3FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#B6D4FE',
    justifyContent: 'space-between',
    minHeight: 88,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0072CE',
  },
  metricBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  metricNumberCol: {
    flex: 1,
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0072CE',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  metricSubLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: -2,
  },
  circularAddBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0072CE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0072CE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  circularAddBtnText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: -2,
    lineHeight: 22,
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
