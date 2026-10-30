// ==============================================================================
// Proyecto: BA Protege+
// Componente: ProtectedCuentaSection Styles
// Archivo: src/components/dashboard/protected/ProtectedCuentaSection.styles.ts
// Descripción: Estilos para la pestaña Cuenta del usuario protegido.
// ==============================================================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  // Card Perfil
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  profileTextColumn: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  userRoleBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 2,
  },
  deviceUuidText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },

  // Card Tutor Responsable
  tutorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  tutorTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  tutorDetail: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },

  // Card Asistencia 24hs (Línea Gratuita)
  helpCard: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1.5,
    borderColor: '#D8B4FE',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7E22CE',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#581C87',
    lineHeight: 17,
    marginBottom: 12,
  },
  callButton: {
    backgroundColor: '#7E22CE',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Card Ajustes y PIN de Responsable
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  settingValueText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#16A34A',
  },

  // Botones de Salida
  exitButton: {
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  exitButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
});
