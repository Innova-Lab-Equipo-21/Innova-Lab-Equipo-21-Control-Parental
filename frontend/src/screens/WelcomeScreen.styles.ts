// ==============================================================================
// Proyecto: BA Protege+
// Componente: WelcomeScreen Styles
// Archivo: src/screens/WelcomeScreen.styles.ts
// Descripción: Estilos visuales para la pantalla de selección de modo operativo.
// ==============================================================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerLogoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  backBtn: {
    marginRight: 10,
    paddingVertical: 4,
    paddingRight: 4,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 28,
    flex: 1,
  },
  mainSubtitle: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#F0F7FF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  cardDesc: {
    fontSize: 13.5,
    color: '#1C1C1E',
    lineHeight: 19,
    marginBottom: 14,
  },
  pillContainer: {
    backgroundColor: '#D0E2FF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  actionBtn: {
    backgroundColor: '#007AFF',
    height: 44,
    width: 160,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
