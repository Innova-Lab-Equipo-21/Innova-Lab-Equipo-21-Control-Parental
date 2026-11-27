// ==============================================================================
// Proyecto: BA Protege+
// Componente: MenorCuentaSection Styles
// Archivo: src/components/dashboard/protected/menor/MenorCuentaSection.styles.ts
// Descripción: Estilos modulares para la pestaña Cuenta del Modo Protegido Menor,
//              replicando el diseño institucional de Perfil y cuenta.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  profileSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  profilePhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  footer: {
    marginTop: 12,
    marginBottom: 12,
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  versionTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  versionSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
