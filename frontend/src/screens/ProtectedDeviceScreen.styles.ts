// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedDeviceScreen Styles
// Archivo: src/screens/ProtectedDeviceScreen.styles.ts
// Descripción: Estilos visuales para el panel del dispositivo protegido con soporte
//              para 3 módulos de navegación y Botón Flotante (FAB +).
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Top Header Bar Institucional (#EAF3FF)
  topHeaderBar: {
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topHeaderLogo: {
    width: 80,
    height: 34,
    resizeMode: 'contain',
  },
  modeBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modeBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#007AFF',
  },

  // Main Scroll Body
  scrollBody: {
    flex: 1,
  },
  pasatiemposProgressPill: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pasatiemposProgressPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0056B3',
  },

  // FAB Floating Action Button (+) para Bloquear Sitio/App
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 18,
    zIndex: 99,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginRight: 6,
    lineHeight: 22,
  },
  fabLabelText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // Pin Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  pinMascotImage: {
    width: 72,
    height: 72,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    ...typography.header,
    color: '#0F172A',
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.body,
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 13,
  },
  pinDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  pinDotFilled: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
});
