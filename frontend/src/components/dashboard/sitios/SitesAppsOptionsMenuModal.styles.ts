// ==============================================================================
// Proyecto: BA Protege+
// Componente: SitesAppsOptionsMenuModal Styles
// Archivo: src/components/dashboard/sitios/SitesAppsOptionsMenuModal.styles.ts
// Descripción: Estilos encapsulados para el modal directo de opciones de gestión
//              de sitios y apps (búsqueda limpia, badges de dispositivos sin emojis,
//              badges de ordenación y switch oficial de acciones en lote).
// ==============================================================================

import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  /** Overlay transparente oscuro al fondo */
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  /** Tarjeta principal Bottom Sheet en la parte inferior */
  bottomSheetCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  /** Tirador táctil superior */
  bottomSheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  /** Encabezado del Bottom Sheet */
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sheetCloseBtn: {
    padding: 6,
  },
  sheetCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  sheetSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'none',
    letterSpacing: 0.3,
    marginTop: 14,
    marginBottom: 8,
  },
  /** Caja de búsqueda integrada en el modal (sin título de sección arriba) */
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  searchClearBtn: {
    padding: 6,
  },
  searchClearText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  /** Contenedor flex en envolvente para insignias/chips */
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  /** Contenedor en una sola línea para las 3 opciones de Filtrar por origen */
  originBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  /** Insignia/Chip individual de selección */
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  /** Ajuste compacto para que las 3 opciones de origen quepan en una sola línea */
  originFilterBadge: {
    paddingHorizontal: 11,
    justifyContent: 'center',
    flexShrink: 1,
  },
  /** Insignia/Chip activa seleccionada */
  filterBadgeActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  originFilterBadgeText: {
    fontSize: 12,
  },
  filterBadgeTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  /** Fila compacta y limpia para la Acción en Lote (sin fondo gris, sin ícono y sin subtítulo) */
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginVertical: 4,
    minHeight: 40,
  },
  batchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  /** Dropdown de selección de dispositivo estilo app */
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 4,
  },
  dropdownValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dropdownChevron: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownMenuCard: {
    width: '100%',
    maxHeight: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dropdownMenuHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  dropdownItemActive: {
    backgroundColor: '#E5F1FF',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dropdownItemTextActive: {
    fontWeight: '800',
    color: colors.primary,
  },
  dropdownCheckmark: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  /** Botón Confirmar / Listo */
  sheetConfirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  sheetConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
