// ==============================================================================
// Proyecto: BA Protege+
// Componente: TotalBlocksCard (Bloqueos totales + Historial por dispositivo)
// Archivo: src/components/dashboard/actividad/blocks/TotalBlocksCard.tsx
// Descripción: Muestra el total real de bloqueos frenados y, debajo, el gráfico
//              de "Historial de intentos a sitios bloqueados" con líneas por
//              dispositivo respetando sus colores oficiales y "Yo" siempre primero.
// ==============================================================================

import React, { useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import { DeviceHistorySeries } from '../types';
import { cardStyles } from '../card.styles';
import { styles } from './TotalBlocksCard.styles';

interface Point {
  x: number;
  y: number;
}

interface ChartPolylineProps {
  points: Point[];
  color: string;
  strokeWidth?: number;
}

/**
 * Renderizador matemático de polilíneas continuas en React Native puro (60fps),
 * reutilizando el estilo visual del gráfico histórico de Inicio.
 */
const ChartPolyline: React.FC<ChartPolylineProps> = ({
  points,
  color,
  strokeWidth = 2.2,
}) => {
  if (!points || points.length < 2) return null;

  return (
    <>
      {points.slice(0, -1).map((p1, idx) => {
        const p2 = points[idx + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return null;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        return (
          <View
            key={`seg-${idx}`}
            style={{
              position: 'absolute',
              left: midX - len / 2,
              top: midY - strokeWidth / 2,
              width: len,
              height: strokeWidth,
              borderRadius: strokeWidth / 2,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
    </>
  );
};

export interface TotalBlocksCardProps {
  totalBlocks: number;
  historySeries: DeviceHistorySeries[];
  historyDateLabels: [string, string, string];
}

const CHART_HEIGHT = 60;
const TOP_PADDING = 8;
const BASELINE_Y = CHART_HEIGHT - 4;

export const TotalBlocksCard: React.FC<TotalBlocksCardProps> = ({
  totalBlocks,
  historySeries,
  historyDateLabels,
}) => {
  const [chartWidth, setChartWidth] = useState<number>(300);
  const formatted = totalBlocks.toLocaleString('es-AR');

  const maxValue = Math.max(
    0,
    ...historySeries.flatMap((s) => s.values)
  );
  const hasAttempts = totalBlocks > 0 && maxValue > 0;

  const buildPoints = (values: number[]): Point[] => {
    const count = values.length;
    if (count < 2) return [];
    const safeMax = Math.max(1, maxValue);
    const drawableHeight = BASELINE_Y - TOP_PADDING;
    const width = chartWidth > 0 ? chartWidth : 300;

    return values.map((val, idx) => {
      const x = (idx / (count - 1)) * width;
      const ratio = Math.max(0, Math.min(1, val / safeMax));
      const y = BASELINE_Y - ratio * drawableHeight;
      return { x, y };
    });
  };

  return (
    <View style={cardStyles.card}>
      <Text style={styles.kpiLabel}>Bloqueos totales</Text>

      <View style={styles.mainRow}>
        <Text style={styles.kpiNumber}>{formatted}</Text>
        <Text style={styles.kpiSub}>intentos frenados</Text>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>
          Historial de intentos a sitios bloqueados
        </Text>

        <View
          style={styles.chartArea}
          onLayout={(e: LayoutChangeEvent) => {
            const { width } = e.nativeEvent.layout;
            if (width > 0) setChartWidth(width);
          }}
        >
          <View style={styles.chartBaseline} />
          {hasAttempts ? (
            [...historySeries].reverse().map((series) => (
              <ChartPolyline
                key={series.id}
                points={buildPoints(series.values)}
                color={series.color}
                strokeWidth={2.2}
              />
            ))
          ) : (
            <View style={styles.chartEmptyContainer}>
              <Text style={styles.chartEmptyText}>Sin intentos registrados</Text>
            </View>
          )}
        </View>

        <View style={styles.chartDatesRow}>
          <Text style={styles.chartDateText}>{historyDateLabels[0]}</Text>
          <Text style={styles.chartDateText}>{historyDateLabels[1]}</Text>
          <Text style={styles.chartDateText}>{historyDateLabels[2]}</Text>
        </View>

        <View style={styles.legendRow}>
          {historySeries.map((series) => (
            <View key={`legend-${series.id}`} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: series.color }]}
              />
              <Text style={styles.legendText} numberOfLines={1}>
                {series.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
