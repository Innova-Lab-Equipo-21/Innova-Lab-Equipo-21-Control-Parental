// ==============================================================================
// Proyecto: BA Protege+
// Componente: PanelHeader (Sub-cabecera con título y selector de período)
// Archivo: components/analytics/PanelHeader.tsx
// Descripción: Sub-cabecera de la pantalla de Actividad: botón volver, título,
//              subtítulo y selector de período.
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PeriodOption, PeriodSelector } from './PeriodSelector';
import { styles } from './PanelHeader.styles';

export interface PanelHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  periodOptions: PeriodOption[];
  period: string;
  onPeriodChange: (value: string) => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title = 'Actividad del sistema',
  subtitle = 'Auditoría de bloqueos y eventos de protección',
  onBack,
  periodOptions,
  period,
  onPeriodChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <PeriodSelector
        options={periodOptions}
        value={period}
        onChange={onPeriodChange}
      />
    </View>
  );
};
