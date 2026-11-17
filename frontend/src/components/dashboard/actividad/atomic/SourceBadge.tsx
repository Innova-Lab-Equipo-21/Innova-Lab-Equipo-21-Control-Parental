// ==============================================================================
// Proyecto: BA Protege+
// Componente: SourceBadge (Badge de fuente con alto contraste)
// Archivo: src/components/dashboard/actividad/atomic/SourceBadge.tsx
// Descripción: Insignia que identifica el origen de un evento: Lista LOTBA
//              (azul), Personalizada (ámbar) o Anti-bypass (rojo).
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { analyticsPalette as palette } from '../palette';
import { SourceType } from '../types';
import { styles } from './SourceBadge.styles';

export interface SourceBadgeProps {
  source: SourceType;
  label?: string;
}

const DEFAULT_LABELS: Record<SourceType, string> = {
  lotba: 'LOTBA',
  custom: 'Personalizada',
  bypass: 'BYPASS',
};

const TEXT_COLORS: Record<SourceType, string> = {
  lotba: palette.lotbaBlueDark,
  custom: palette.customAmberDark,
  bypass: palette.dangerDark,
};

const BG_STYLES: Record<SourceType, object> = {
  lotba: styles.bgLotba,
  custom: styles.bgCustom,
  bypass: styles.bgBypass,
};

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, label }) => {
  return (
    <View style={[styles.base, BG_STYLES[source]]}>
      <Text style={[styles.text, { color: TEXT_COLORS[source] }]}>
        {label ?? DEFAULT_LABELS[source]}
      </Text>
    </View>
  );
};
