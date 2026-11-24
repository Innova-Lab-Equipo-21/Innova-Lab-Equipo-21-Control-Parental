// ==============================================================================
// Proyecto: BA Protege+
// Componente: StackedBarChart (Gráfico de barras apiladas horario)
// Archivo: src/components/dashboard/actividad/atomic/StackedBarChart.tsx
// Descripción: Renderiza barras apiladas (Ámbar Personalizada arriba / Azul
//              LOTBA abajo) para las 24 horas con efecto Von Restorff
//              (opacidad 62% en barras secundarias, 100% en pico/seleccionada)
//              y eje X horario limpio sin badges verticales.
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChartBar } from '../types';
import { styles } from './StackedBarChart.styles';

const BAR_AREA = 96;
const MIN_BAR = 8;

export interface StackedBarChartProps {
  bars: ChartBar[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  testID?: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  bars,
  selectedIndex,
  onSelect,
  testID,
}) => {
  const totals = bars.map((b) => b.lotba + b.custom);
  const maxTotal = Math.max(...totals, 1);

  const renderBar = (bar: ChartBar, index: number) => {
    const total = bar.lotba + bar.custom;
    const barPx =
      total > 0
        ? Math.max(MIN_BAR, Math.round((total / maxTotal) * BAR_AREA))
        : 4;

    const inner = Math.max(barPx - 1.5, 0);
    const customRatio = total > 0 ? bar.custom / total : 0;
    const customPx =
      bar.custom > 0 ? Math.max(3, Math.round(inner * customRatio)) : 0;
    const lotbaPx =
      bar.lotba > 0 ? Math.max(3, inner - customPx) : 0;

    const isSelected = index === selectedIndex;
    const emphasized = isSelected || Boolean(bar.isPeak);

    return (
      <TouchableOpacity
        key={`bar-${index}`}
        activeOpacity={0.75}
        onPress={() => onSelect(index)}
        accessibilityLabel={`${bar.fullLabel ?? bar.label ?? index}: ${total} intentos`}
        style={[styles.col, { opacity: emphasized ? 1 : 0.62 }]}
      >
        <View
          style={[
            styles.stack,
            isSelected && styles.stackSelected,
            { height: barPx },
          ]}
        >
          {total === 0 ? (
            <View style={styles.segEmpty} />
          ) : (
            <>
              {customPx > 0 ? (
                <View style={[styles.segCustom, { height: customPx }]} />
              ) : null}
              {lotbaPx > 0 ? (
                <View style={[styles.segLotba, { height: lotbaPx }]} />
              ) : null}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View testID={testID}>
      <View style={styles.stage}>
        {bars.map((bar, index) => renderBar(bar, index))}
      </View>
      <View style={styles.axisHours}>
        <Text style={styles.axisHourLabel}>0 h</Text>
        <Text style={styles.axisHourLabel}>6 h</Text>
        <Text style={styles.axisHourLabel}>12 h</Text>
        <Text style={styles.axisHourLabel}>18 h</Text>
        <Text style={styles.axisHourLabel}>23 h</Text>
      </View>
    </View>
  );
};
