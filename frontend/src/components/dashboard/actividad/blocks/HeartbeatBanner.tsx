// ==============================================================================
// Proyecto: BA Protege+
// Componente: HeartbeatBanner (Alerta de dispositivos pendientes de vinculación)
// Archivo: src/components/dashboard/actividad/blocks/HeartbeatBanner.tsx
// Descripción: Muestra los dispositivos pendientes de vinculación (o sin señal)
//              organizados en hasta 5 bloques por línea, uno por dispositivo,
//              con su ícono y color oficial, sin badge redundante "Inactivo".
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { getDeviceHighlight } from '../../../../utils/deviceColors';
import { styles } from './HeartbeatBanner.styles';

export interface HeartbeatAlertItem {
  id: string;
  label: string;
  colorIndex?: number;
  text?: string;
}

export interface HeartbeatBannerProps {
  alerts: HeartbeatAlertItem[];
}

const MAX_BLOCKS_PER_ROW = 5;

const chunkRows = <T,>(items: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
};

export const HeartbeatBanner: React.FC<HeartbeatBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const rows = chunkRows(alerts, MAX_BLOCKS_PER_ROW);
  const headerText =
    alerts.length === 1
      ? 'Pendiente de vinculación con el código'
      : `Pendientes de vinculación con el código (${alerts.length})`;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.headerText}>{headerText}</Text>
      </View>

      <View style={styles.rowsWrap}>
        {rows.map((row, rowIdx) => {
          const isCompact = row.length >= 3;
          return (
            <View key={`alert-row-${rowIdx}`} style={styles.blocksRow}>
              {row.map((item, idx) => {
                const highlight = getDeviceHighlight(
                  item.id,
                  item.label,
                  item.label,
                  item.colorIndex ?? rowIdx * MAX_BLOCKS_PER_ROW + idx
                );
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.deviceBlock,
                      isCompact && styles.deviceBlockCompact,
                    ]}
                  >
                    <View
                      style={[
                        styles.deviceAvatar,
                        isCompact && styles.deviceAvatarCompact,
                        {
                          backgroundColor: highlight.bgColor,
                          borderColor: highlight.borderColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.deviceAvatarIcon,
                          isCompact && styles.deviceAvatarIconCompact,
                        ]}
                      >
                        {highlight.icon}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.deviceName,
                        isCompact && styles.deviceNameCompact,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
};
