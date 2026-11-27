// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedDeviceScreen Styles
// Archivo: src/screens/ProtectedDeviceScreen.styles.ts
// Descripción: Estilos estructurales del marco principal del dispositivo
//              protegido (top bar institucional, contenedor scroll y badge).
// ==============================================================================

import { StyleSheet } from 'react-native';

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
  scrollContent: {
    paddingBottom: 85,
    flexGrow: 1,
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
});
