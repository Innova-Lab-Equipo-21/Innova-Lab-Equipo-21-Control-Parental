// ==============================================================================
// Proyecto: BA Protege+
// Componente: DeviceCard Styles
// Archivo: src/components/dashboard/dispositivos/DeviceCard.styles.ts
// Descripción: Estilos encapsulados para la tarjeta individual de dispositivo
//              (avatar, cabecera de acciones, pie con badge y toggle de autocontrol).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  deviceAvatarIcon: {
    fontSize: 18,
  },
  deviceTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  autoprotectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoprotectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
