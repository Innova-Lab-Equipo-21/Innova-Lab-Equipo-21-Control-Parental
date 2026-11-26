// ==============================================================================
// Proyecto: BA Protege+
// Componente: ResponsibleActionScreen Styles
// Archivo: src/screens/ResponsibleActionScreen.styles.ts
// Descripción: Estilos visuales para la pantalla de acción inicial del responsable.
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  titleSection: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 32,
    marginBottom: 6,
  },
  mainSubtitle: {
    fontSize: 16.5,
    color: '#1C1C1E',
    lineHeight: 22,
    fontWeight: '500',
  },
  blocksContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#F0F7FF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 2,
    borderColor: '#007AFF',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#007AFF',
  },
  cardDesc: {
    fontSize: 14.5,
    color: '#1C1C1E',
    lineHeight: 21,
    marginBottom: 18,
  },
  actionBtn: {
    backgroundColor: '#007AFF',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  helpIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  helpIcon: {
    width: 22,
    height: 22,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
});
