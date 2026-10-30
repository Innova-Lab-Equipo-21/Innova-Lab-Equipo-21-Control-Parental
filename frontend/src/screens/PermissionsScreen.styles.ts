// ==============================================================================
// Proyecto: BA Protege+
// Componente: PermissionsScreen Styles
// Archivo: src/screens/PermissionsScreen.styles.ts
// Descripción: Estilos visuales para la pantalla de configuración de permisos del dispositivo.
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Top Header Bar con logo_baprotege_texto.png y fondo #EAF3FF
  topHeaderBar: {
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  topHeaderLogo: {
    width: 75,
    height: 36,
    resizeMode: 'contain',
  },
  // Subheader con botón volver y título "Permisos del Dispositivo"
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#000000',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 28,
    flex: 1,
    letterSpacing: -0.3,
  },
  moreButton: {
    padding: 4,
  },
  moreIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  // Contenido con scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  // Banner / Tarjeta de información azul (Estilo CARD 1 de WelcomeScreen)
  infoBox: {
    backgroundColor: '#F0F7FF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  infoDescription: {
    fontSize: 13.5,
    color: '#1C1C1E',
    lineHeight: 19,
  },
  // Tarjetas de Permisos individuales
  permCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
      },
      android: {
        elevation: 2.5,
      },
    }),
  },
  permCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permTextColumn: {
    flex: 1,
    marginRight: 12,
  },
  permTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  permSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 15,
  },
  permRightColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Pill badges de estado
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeInactive: {
    backgroundColor: '#F0F0F2',
  },
  statusBadgeActive: {
    backgroundColor: '#D7F5DD',
  },
  statusBadgeText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  statusBadgeTextInactive: {
    color: '#8E8E93',
  },
  statusBadgeTextActive: {
    color: '#16A34A',
    fontWeight: '700',
  },
  chevronIcon: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '700',
    marginLeft: 8,
    width: 16,
    textAlign: 'center',
  },
  // Sección expandida
  expandedSection: {
    marginTop: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  expandedPromptText: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 15,
    marginBottom: 8,
  },
  expandedDetailedText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    marginBottom: 12,
  },
  actionButtonRow: {
    marginTop: 4,
  },
  activeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  activeNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  // Caja de Ubicación GPS
  locationBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  locationBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  locationBoxValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  // Sección Inferior (Footer Buttons)
  footerSection: {
    marginTop: 16,
    gap: 12,
  },
  continueButton: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  demoButton: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
});
