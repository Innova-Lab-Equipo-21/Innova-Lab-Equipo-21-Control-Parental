// ==============================================================================
// Proyecto: BA Protege+
// Componente: AuditEventsCard Styles
// Archivo: src/components/dashboard/actividad/blocks/AuditEventsCard.styles.ts
// Descripción: Estilos para el listado de sitios/apps bloqueados y alertas de
//              seguridad, con dropdowns inline en la misma fila (patrón app).
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  embeddedCard: {
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  tabsWrap: {
    marginBottom: 8,
  },

  filtersRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
    zIndex: 20,
  },

  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textSubtle,
    marginBottom: 4,
    paddingLeft: 2,
  },

  dropdownColList: {
    flex: 1,
    position: 'relative',
  },

  dropdownColSort: {
    flex: 1,
    position: 'relative',
  },

  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 10,
    minHeight: 35,
  },

  triggerOpen: {
    borderColor: colors.primary,
  },

  triggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  chevron: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '700',
    paddingLeft: 4,
  },

  dropdownMenu: {
    backgroundColor: colors.surface,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  menuItemLast: {
    borderBottomWidth: 0,
  },

  menuItemActive: {
    backgroundColor: colors.primaryLight,
  },

  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  menuItemTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },

  checkmark: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },

  list: {
    flexDirection: 'column',
  },

  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 12,
    color: palette.textMuted,
    fontStyle: 'italic',
  },

  attemptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceBg,
    borderRadius: 6,
  },

  attemptItemUnread: {
    backgroundColor: palette.dangerBg,
    paddingHorizontal: 8,
    marginBottom: 3,
  },

  attemptInfo: {
    flex: 1,
    flexShrink: 1,
  },

  attemptTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: palette.dangerRed,
    flexShrink: 0,
  },

  attemptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textMain,
    flexShrink: 1,
  },

  attemptTitleRead: {
    color: palette.textSubtle,
    fontWeight: '600',
  },

  attemptMeta: {
    fontSize: 10.5,
    color: palette.textMuted,
    marginTop: 1,
  },

  expandedScrollList: {
    maxHeight: 690,
  },

  listToggleBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: palette.lotbaBlueBorder,
    backgroundColor: palette.lotbaBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.lotbaBlueDark,
  },
});
