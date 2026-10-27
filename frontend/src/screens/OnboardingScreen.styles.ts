// ==============================================================================
// Proyecto: BA Protege+
// Componente: OnboardingScreen Styles
// Archivo: src/screens/OnboardingScreen.styles.ts
// Descripción: Estilos visuales para el flujo de onboarding (wizard de 3 pasos).
// ==============================================================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
  },
  headerLogoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepperWrapper: {
    alignItems: 'center',
    marginVertical: 12,
    marginBottom: 28,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 240,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#007AFF',
  },
  stepCircleInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepCircleNum: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepCircleNumActive: {
    color: '#FFFFFF',
  },
  stepCircleNumInactive: {
    color: '#9CA3AF',
  },
  stepConnectorLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 6,
  },
  stepConnectorLineActive: {
    backgroundColor: '#007AFF',
  },
  stepConnectorLineInactive: {
    backgroundColor: '#E5E7EB',
  },
  contentCard: {
    marginTop: 4,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 10,
    lineHeight: 28,
  },
  subtitleBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 20,
    lineHeight: 22,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 14,
  },
  bulletList: {
    gap: 14,
    marginBottom: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletIconWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bulletText: {
    fontSize: 13.5,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
  },
  cardsContainer: {
    gap: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  modeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeCardHeader: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCardHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  modeCardBody: {
    backgroundColor: '#F0F7FF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 18,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIconWrapper: {
    marginRight: 12,
  },
  checkText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
  },
  contentCardStep3: {
    marginTop: 4,
    flex: 1,
  },
  videoWrapperVertical: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    flex: 1,
  },
  videoContainerVertical: {
    backgroundColor: '#000000',
    borderRadius: 24,
    width: '100%',
    maxWidth: 290,
    height: 460,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  videoContainer: {
    backgroundColor: '#000000',
    borderRadius: 16,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  videoPlayCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  videoPlayIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginLeft: 3,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  buttonSpacer: {
    flex: 1,
  },
  primaryButtonFull: {
    flex: 1,
    width: '100%',
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dualButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonHalf: {
    flex: 1,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
