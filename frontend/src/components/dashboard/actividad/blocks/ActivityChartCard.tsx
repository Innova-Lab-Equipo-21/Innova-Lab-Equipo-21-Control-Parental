// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivityChartCard (Gráfico interactivo horario)
// Archivo: src/components/dashboard/actividad/blocks/ActivityChartCard.tsx
// Descripción: Muestra la distribución horaria con selector de día, inspector
//              interactivo con rango de pico y gráfico de barras apiladas.
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StackedBarChart } from '../atomic/StackedBarChart';
import { ChartBar } from '../types';
import { InspectorInfo } from '../hooks/useAnalyticsPanel';
import { cardStyles } from '../card.styles';
import { styles } from './ActivityChartCard.styles';

export interface DaySelectorOption {
  short: string;
  index: number;
  isToday?: boolean;
}

export interface ActivityChartCardProps {
  daySelector: DaySelectorOption[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  peakInfo: { range: string | null };
  inspector: InspectorInfo;
  chartBars: ChartBar[];
  selectedChartIndex: number;
  onSelectChart: (index: number) => void;
  embedded?: boolean;
}

export const ActivityChartCard: React.FC<ActivityChartCardProps> = ({
  daySelector,
  selectedDayIndex,
  onSelectDay,
  peakInfo,
  inspector,
  chartBars,
  selectedChartIndex,
  onSelectChart,
  embedded = false,
}) => {
  return (
    <View style={embedded ? undefined : cardStyles.card}>
      <View style={styles.daySelector}>
        {daySelector.map((day) => {
          const active = day.index === selectedDayIndex;
          return (
            <TouchableOpacity
              key={day.index}
              activeOpacity={0.7}
              onPress={() => onSelectDay(day.index)}
              style={[
                styles.dayPill,
                active && styles.dayPillActive,
                day.isToday && !active && styles.dayPillToday,
              ]}
            >
              <Text
                style={[
                  styles.dayPillText,
                  active && styles.dayPillTextActive,
                  day.isToday && !active && styles.dayPillTextToday,
                ]}
              >
                {day.short}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.inspector}>
        <Text style={styles.inspectorLeft}>{inspector.label}</Text>
        <Text style={styles.inspectorPeak}>
          {peakInfo.range ? `Pico: ${peakInfo.range}` : 'Sin pico'}
        </Text>
      </View>

      <StackedBarChart
        bars={chartBars}
        selectedIndex={selectedChartIndex}
        onSelect={onSelectChart}
      />
    </View>
  );
};
