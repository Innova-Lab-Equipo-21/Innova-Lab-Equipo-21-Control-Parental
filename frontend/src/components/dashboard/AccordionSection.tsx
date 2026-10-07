// ==============================================================================
// Proyecto: BA Protege+
// Componente: AccordionSection (Sección Desplegable para Panel del Responsable)
// Archivo: src/components/dashboard/AccordionSection.tsx
// Descripción: Componente contenedor desplegable (Acordeón) con encabezado,
//              insignias de estado e indicador de expansión.
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Badge } from '../Badge';

interface AccordionSectionProps {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  badgeStatus?: 'activo' | 'inactivo' | 'alerta';
  icon?: string;
  initialExpanded?: boolean;
  children: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  subtitle,
  badgeLabel,
  badgeStatus = 'activo',
  icon = '📁',
  initialExpanded = false,
  children,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.textCol}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.rightRow}>
          {badgeLabel ? <Badge status={badgeStatus} label={badgeLabel} /> : null}
          <Text style={styles.arrow}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 4,
  },
  content: {
    padding: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: '#FAFAFA',
  },
});
