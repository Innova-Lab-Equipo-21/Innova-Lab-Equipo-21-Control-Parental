// ==============================================================================
// Proyecto: BA Protege+
// Componente: HourlyAttemptsCard (Bloque 4: Franja horaria de intentos 24h)
// Archivo: src/components/dashboard/actividad/HourlyAttemptsCard.tsx
// ==============================================================================

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  ActivityMetricsSnapshot,
  HourlyAttemptBucket,
  formatHourRangeLabel,
  formatMetricNumber,
} from '../../../utils/activityMetrics';
import { styles as baseStyles } from './ActivitySection.styles';
import { styles } from './HourlyAttemptsCard.styles';

const MAX_BAR_HEIGHT = 82;

export interface HourlyAttemptsCardProps {
  hourly: HourlyAttemptBucket[];
  maxHourlyTotal: number;
  peakHour: ActivityMetricsSnapshot['peakHour'];
  inspectedHour: number | null;
  inspectedBucket: HourlyAttemptBucket | null;
  onToggleInspectedHour: (hour: number) => void;
}

export const HourlyAttemptsCard: React.FC<HourlyAttemptsCardProps> = ({
  hourly,
  maxHourlyTotal,
  peakHour,
  inspectedHour,
  inspectedBucket,
  onToggleInspectedHour,
}) => {
  return (
    <View style={baseStyles.card}>
      <View style={baseStyles.cardHeaderRow}>
        <Text style={baseStyles.sectionCardTitle}>
          Franja horaria de intentos
        </Text>
        {inspectedBucket ? (
          <Text style={styles.peakLabel}>
            <Text style={styles.peakPrefix}>Franja: </Text>
            <Text style={styles.peakStrong}>
              {formatHourRangeLabel(inspectedBucket.hour)} (
              {formatMetricNumber(inspectedBucket.total)})
            </Text>
          </Text>
        ) : peakHour ? (
          <Text style={styles.peakLabel}>
            <Text style={styles.peakPrefix}>Pico: </Text>
            <Text style={styles.peakStrong}>
              {peakHour.rangeLabel} ({peakHour.formattedTotal})
            </Text>
          </Text>
        ) : (
          <Text style={styles.peakPrefix}>Sin intentos</Text>
        )}
      </View>

      <View style={styles.hourlyChartContainer}>
        {hourly.map((bucket) => {
          const isHighlighted =
            inspectedHour !== null
              ? bucket.hour === inspectedHour
              : peakHour?.hour === bucket.hour;

          if (bucket.total <= 0 || maxHourlyTotal <= 0) {
            return (
              <TouchableOpacity
                key={`hour-${bucket.hour}`}
                style={styles.hourlyBarTouch}
                activeOpacity={0.7}
                onPress={() => onToggleInspectedHour(bucket.hour)}
              >
                <View style={styles.hourlyBarColumn}>
                  <View style={styles.hourlySegmentEmpty} />
                </View>
              </TouchableOpacity>
            );
          }

          const totalHeight = Math.max(
            4,
            Math.round((bucket.total / maxHourlyTotal) * MAX_BAR_HEIGHT)
          );
          const customHeight =
            bucket.custom > 0
              ? Math.max(
                  2,
                  Math.round((bucket.custom / bucket.total) * totalHeight)
                )
              : 0;
          const lotbaHeight = Math.max(0, totalHeight - customHeight);

          return (
            <TouchableOpacity
              key={`hour-${bucket.hour}`}
              style={styles.hourlyBarTouch}
              activeOpacity={0.75}
              onPress={() => onToggleInspectedHour(bucket.hour)}
              accessibilityLabel={`Franja ${formatHourRangeLabel(bucket.hour)}: ${bucket.total} intentos`}
            >
              <View
                style={[
                  styles.hourlyBarColumn,
                  isHighlighted && styles.hourlyBarColumnHighlighted,
                ]}
              >
                {customHeight > 0 && (
                  <View
                    style={[
                      styles.hourlySegmentCustom,
                      { height: customHeight },
                    ]}
                  />
                )}
                {lotbaHeight > 0 && (
                  <View
                    style={[
                      styles.hourlySegmentLotba,
                      { height: lotbaHeight },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.hourlyAxisRow}>
        <Text style={styles.hourlyAxisText}>0 h</Text>
        <Text style={styles.hourlyAxisText}>12 h</Text>
        <Text style={styles.hourlyAxisText}>23 h</Text>
      </View>
    </View>
  );
};
