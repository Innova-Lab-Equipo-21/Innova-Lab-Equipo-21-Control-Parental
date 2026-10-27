// ==============================================================================
// Proyecto: BA Protege+
// Componente: TutorPermissionsSection Styles
// Archivo: src/components/dashboard/cuenta/TutorPermissionsSection.styles.ts
// Descripción: Estilos visuales para la auditoría de permisos del dispositivo tutor.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const styles = StyleSheet.create({
  warningBannerCard: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginVertical: 4,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '800',
    color: '#856404',
  },
  warningDesc: {
    ...typography.body,
    fontSize: 12,
    color: '#856404',
    marginBottom: 6,
    lineHeight: 16,
  },
  missingItemText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#856404',
    marginLeft: 4,
    marginVertical: 2,
  },
  warningActionBox: {
    marginTop: 8,
  },
  permissionsBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionsTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  permissionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permissionsDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
