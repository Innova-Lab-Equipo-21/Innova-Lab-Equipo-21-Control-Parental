// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivitySection Styles
// Archivo: src/components/dashboard/actividad/ActivitySection.styles.ts
// Descripción: Estilos visuales para el historial de actividad y auditoría.
// ==============================================================================

import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  sectionTabRow: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  sectionTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  sectionTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionTabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  deviceFilterContainer: {
    marginBottom: 14,
  },
  deviceFilterTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  usageSummaryCard: {
    backgroundColor: '#007AFF10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#007AFF30',
  },
  usageSummaryTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  usageSummaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  usageAppCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  usageAppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  usageAppName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  usageAppCategory: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  usageAppTime: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
  },
  usageBarTrack: {
    height: 8,
    backgroundColor: '#EAEAEA',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  logList: {
    maxHeight: 380,
  },
  logCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  logDetail: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 6,
  },
  deviceText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
});
