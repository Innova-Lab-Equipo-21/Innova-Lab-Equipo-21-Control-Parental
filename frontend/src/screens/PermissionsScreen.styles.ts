// ==============================================================================
// Proyecto: BA Protege+
// Componente: PermissionsScreen Styles
// Archivo: src/screens/PermissionsScreen.styles.ts
// Descripción: Estilos visuales con encabezado institucional estándar (idéntico a
//              Elegir protección) y distribución uniforme de tarjetas para ocupar
//              todo el alto de la pantalla sin scroll en reposo.
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Top Header Bar institucional estándar (idéntico a Elegir protección)
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
  // Subheader estándar con botón volver y título de 22px
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
  // Contenido principal que llena el espacio
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  // Banner de información azul institucional
  infoBox: {
    backgroundColor: '#F0F7FF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    marginBottom: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#007AFF',
  },
  infoDescription: {
    fontSize: 12,
    color: '#1C1C1E',
    lineHeight: 16.5,
  },
  // Contenedor de tarjetas distribuido uniformemente en el espacio vertical
  cardsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 8,
    gap: 8,
  },
  // Tarjetas de Permisos individuales
  permCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
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
    marginRight: 10,
  },
  permTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  permSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 14,
  },
  permRightColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '700',
    marginLeft: 2,
    width: 14,
    textAlign: 'center',
  },
  // Sección expandida
  expandedSection: {
    marginTop: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 10,
  },
  expandedDetailedText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    marginBottom: 10,
  },
  // Bloque de pasos para activar
  stepsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 10,
  },
  stepsTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  stepNumberBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E7F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007AFF',
  },
  stepText: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  actionButtonRow: {
    marginTop: 4,
  },
  activeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  activeNoticeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#16A34A',
  },
  // Caja de Ubicación GPS
  locationBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  locationBoxLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  locationBoxValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  // Sección Inferior (Footer Buttons)
  footerSection: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButtonSecondary: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
  },
  continueButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2.5,
      },
    }),
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
