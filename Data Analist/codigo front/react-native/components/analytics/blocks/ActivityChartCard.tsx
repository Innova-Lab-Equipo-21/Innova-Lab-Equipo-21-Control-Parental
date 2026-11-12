// ==============================================================================
// Proyecto: BA Protege+
// Componente: ActivityChartCard (Gráfico interactivo de actividad)
// Archivo: components/analytics/ActivityChartCard.tsx
// Descripción: CORRECCIÓN 4 del prototipo: permite alternar entre "Por día (Sem)"
//              y "Franja horaria" con selector de día estilo Google Maps,
//              inspector interactivo y gráfico apilado.
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SegmentedTabs } from '../atomic/SegmentedTabs';
import { StackedBarChart } from '../atomic/StackedBarChart';
import { ChartBar, ChartView } from '../types';
import { InspectorInfo } from '../hooks/useAnalyticsPanel';
import { cardStyles } from '../card.styles';
import { styles } from './ActivityChartCard.styles';

export interface DaySelectorOption {
  short: string;
  index: number;
}

export interface ActivityChartCardProps {
  chartView: ChartView;
  onChangeChartView: (view: ChartView) => void;
  daySelector: DaySelectorOption[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  peakInfo: { label: string; value: string };
  inspector: InspectorInfo;
  chartBars: ChartBar[];
  selectedChartIndex: number;
  onSelectChart: (index: number) => void;
}

export const ActivityChartCard: React.FC<ActivityChartCardProps> = ({
  chartView,
  onChangeChartView,
  daySelector,
  selectedDayIndex,
  onSelectDay,
  peakInfo,
  inspector,
  chartBars,
  selectedChartIndex,
  onSelectChart,
}) => {
  return (
    <View style={cardStyles.card}>
      <View style={styles.topBar}>
        <View style={styles.tabsWrap}>
          <SegmentedTabs
            tabs={[
              { key: 'daily', label: 'Por día (Sem)' },
              { key: 'hourly', label: 'Franja horaria' },
            ]}
            activeKey={chartView}
            onChange={(key) => onChangeChartView(key as ChartView)}
          />
        </View>
        <View style={styles.peakPill}>
          <Text style={styles.peakPillText}>
            {peakInfo.label}{' '}
            <Text style={styles.peakPillStrong}>({peakInfo.value})</Text>
          </Text>
        </View>
      </View>

      {chartView === 'hourly' ? (
        <View style={styles.daySelector}>
          {daySelector.map((day) => {
            const active = day.index === selectedDayIndex;
            return (
              <TouchableOpacity
                key={day.index}
                activeOpacity={0.7}
                onPress={() => onSelectDay(day.index)}
                style={[styles.dayPill, active && styles.dayPillActive]}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    active && styles.dayPillTextActive,
                  ]}
                >
                  {day.short}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      <View style={styles.inspector}>
        <Text style={styles.inspectorLeft}>{inspector.label}</Text>
        <View style={styles.inspectorRight}>
          <Text style={styles.inspectorLotba}>
            ● {inspector.lotba} LOTBA
          </Text>
          <Text style={styles.inspectorCustom}>
            ● {inspector.custom} Pers.
          </Text>
        </View>
      </View>

      <StackedBarChart
        bars={chartBars}
        mode={chartView}
        selectedIndex={selectedChartIndex}
        onSelect={onSelectChart}
      />
    </View>
  );
};
