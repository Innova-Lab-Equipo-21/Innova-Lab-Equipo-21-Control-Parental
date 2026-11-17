// ==============================================================================
// Proyecto: BA Protege+
// Componente: HeartbeatBanner (Alerta de salud operativa)
// Archivo: components/analytics/HeartbeatBanner.tsx
// Descripción: Banner de alerta que indica que un dispositivo dejó de reportar
//              (Métricas #19 permissionsOk y #21 lastHeartbeatAt).
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './HeartbeatBanner.styles';

export interface HeartbeatBannerProps {
  text: string;
  tag?: string;
}

export const HeartbeatBanner: React.FC<HeartbeatBannerProps> = ({
  text,
  tag,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      {tag ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}
    </View>
  );
};
