// ==============================================================================
// Proyecto: BA Protege+
// Componente: AuditEventsCard Styles
// Archivo: src/components/dashboard/actividad/blocks/AuditEventsCard.styles.ts
// Descripción: Estilos para el listado de eventos de auditoría (bloqueos y
//              anti-bypass), filas de eventos y metadatos de intentos.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { analyticsPalette as palette } from '../palette';

export const styles = StyleSheet.create({
  tabsWrap: {
    marginBottom: 8,
  },

  filtersWrap: {
    backgroundColor: palette.offWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 6,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textSubtle,
    width: 52,
  },

  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },

  filterChip: {
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.cardBorder,
  },

  filterChipActive: {
    backgroundColor: '#E5F1FF',
    borderColor: '#0284c7',
  },

  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.textSubtle,
  },

  filterChipTextActive: {
    color: '#0369a1',
    fontWeight: '800',
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
    paddingVertical: 6.5,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceBg,
  },

  attemptInfo: {
    flex: 1,
    flexShrink: 1,
  },

  attemptTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textMain,
  },

  attemptMeta: {
    fontSize: 10.5,
    color: palette.textMuted,
    marginTop: 1,
  },
});
