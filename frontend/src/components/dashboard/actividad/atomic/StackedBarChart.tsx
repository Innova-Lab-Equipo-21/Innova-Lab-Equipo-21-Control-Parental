// ==============================================================================
// Proyecto: BA Protege+
// Componente: StackedBarChart (Gráfico de barras apiladas reutilizable)
// Archivo: src/components/dashboard/actividad/atomic/StackedBarChart.tsx
// Descripción: Renderiza barras apiladas (Ámbar Personalizada arriba / Azul
//              LOTBA abajo) con efecto Von Restorff (opacidad 62% en barras
//              secundarias, 100% en pico/seleccionada), crown de pico y eje X.
//              Soporta los modos 'daily' (7 barras) y 'hourly' (24 barras).
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChartBar } from '../types';
import { styles } from './StackedBarChart.styles';

const BAR_AREA = 96;
const MIN_BAR = 8;

export interface StackedBarChartProps {
  bars: ChartBar[];
  mode: 'daily' | 'hourly';
  selectedIndex: number;
  onSelect: (index: number) => void;
  testID?: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  bars,
  mode,
  selectedIndex,
  onSelect,
  testID,
}) => {
  const totals = bars.map((b) => b.lotba + b.custom);
  const maxTotal = Math.max(...totals, 1);

  const renderBar = (bar: ChartBar, index: number) => {
    const total = bar.lotba + bar.custom;
    const barPx = Math.max(MIN_BAR, Math.round((total / maxTotal) * BAR_AREA));

    const gap = mode === 'daily' ? 2 : 1.5;
    const inner = Math.max(barPx - gap, 0);
    const customRatio = total > 0 ? bar.custom / total : 0;
    const customPx =
      bar.custom > 0 ? Math.max(3, Math.round(inner * customRatio)) : 0;
    const lotbaPx = Math.max(0, inner - customPx);

    const isSelected = index === selectedIndex;
    const emphasized = isSelected || Boolean(bar.isPeak) || Boolean(bar.isToday);

    return (
      <TouchableOpacity
        key={`bar-${index}`}
        activeOpacity={0.75}
        onPress={() => onSelect(index)}
        accessibilityLabel={`${bar.fullLabel ?? bar.label ?? index}: ${total} intentos`}
        style={[styles.col, { opacity: emphasized ? 1 : 0.62 }]}
      >
        {bar.isToday ? (
          <View
            style={[
              styles.todayCrown,
              mode === 'hourly' && styles.todayCrownHourly,
            ]}
          >
            <Text
              style={[
                styles.todayCrownText,
                mode === 'hourly' && styles.todayCrownTextHourly,
              ]}
            >
              HOY
            </Text>
          </View>
        ) : bar.isPeak ? (
          <View style={styles.crown}>
            <Text style={styles.crownText}>{bar.peakLabel ?? 'PICO'}</Text>
          </View>
        ) : null}

        {mode === 'daily' ? (
          <Text style={[styles.valueTop, emphasized && styles.valueTopEmphasis]}>
            {total}
          </Text>
        ) : null}

        <View
          style={[
            styles.stack,
            mode === 'hourly' && styles.stackHourly,
            isSelected && styles.stackSelected,
            bar.isToday && styles.stackToday,
            { height: barPx },
          ]}
        >
          {customPx > 0 ? (
            <View style={[styles.segCustom, { height: customPx }]} />
          ) : null}
          {lotbaPx > 0 ? (
            <View style={[styles.segLotba, { height: lotbaPx }]} />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View testID={testID}>
      <View style={styles.stage}>
        {bars.map((bar, index) => renderBar(bar, index))}
      </View>
      {mode === 'daily' ? (
        <View style={styles.axisDays}>
          {bars.map((bar, index) => {
            const isSelected = index === selectedIndex;
            return (
              <TouchableOpacity
                key={`axis-${index}`}
                activeOpacity={0.7}
                onPress={() => onSelect(index)}
                style={[
                  styles.axisDayCell,
                  isSelected && styles.axisDayCellActive,
                  bar.isToday && !isSelected && styles.axisDayCellToday,
                ]}
              >
                <Text
                  style={[
                    styles.axisDayLabel,
                    isSelected && styles.axisDayLabelActive,
                    bar.isToday && !isSelected && styles.axisDayLabelToday,
                  ]}
                >
                  {bar.label ?? ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.axisHours}>
          <Text style={styles.axisHourLabel}>0 h</Text>
          <Text style={styles.axisHourLabel}>6 h</Text>
          <Text style={styles.axisHourLabel}>12 h</Text>
          <Text style={styles.axisHourLabel}>18 h</Text>
          <Text style={styles.axisHourLabel}>23 h</Text>
        </View>
      )}
    </View>
  );
};
