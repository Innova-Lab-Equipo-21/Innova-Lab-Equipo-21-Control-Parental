// ==============================================================================
// Proyecto: BA Protege+
// Componente: SeccionDesplegable (Sección Desplegable para Panel del Responsable)
// Archivo: src/components/dashboard/SeccionDesplegable.tsx
// Descripción: Componente contenedor desplegable (Acordeón) con encabezado,
//              insignias de estado e indicador de expansión.
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Badge } from '../Badge';
import { styles } from './SeccionDesplegable.styles';

interface SeccionDesplegableProps {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  badgeStatus?: 'activo' | 'inactivo' | 'alerta';
  icon?: string;
  initialExpanded?: boolean;
  children: React.ReactNode;
}

export const SeccionDesplegable: React.FC<SeccionDesplegableProps> = ({
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

// Aliases para compatibilidad hacia atrás
export const AccordionSection = SeccionDesplegable;
