// ==============================================================================
// Proyecto: BA Protege+
// Componente: BrandHeader (Cabecera de marca BA Protege+)
// Archivo: src/components/dashboard/actividad/blocks/BrandHeader.tsx
// Descripción: Cabecera superior con el nombre de marca y la píldora de
//              sincronización de listas LOTBA (Métrica #9 blocklist_version).
// ==============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './BrandHeader.styles';

export interface BrandHeaderProps {
  /** Versión de blocklist sincronizada, ej. "v24.11". */
  blocklistVersion?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  blocklistVersion = 'v24.11',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.brandTitle}>BA{'\n'}Protege +</Text>
      <View style={styles.syncPill}>
        <View style={styles.syncDot} />
        <Text style={styles.syncText}>
          Listas LOTBA {blocklistVersion} al día
        </Text>
      </View>
    </View>
  );
};
