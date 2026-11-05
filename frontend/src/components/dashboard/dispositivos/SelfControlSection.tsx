// ==============================================================================
// Proyecto: BA Protege+
// Componente: SelfControlSection (Sección de Autoprotección del Responsable 24h)
// Archivo: src/components/dashboard/dispositivos/SelfControlSection.tsx
// Descripción: Tarjeta de estado y control del modo de autoprotección del responsable,
//              con visualización del cronómetro de 24 horas y acciones de activación.
// ==============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { ActionButton } from '../../ActionButton';
import { Badge } from '../../Badge';
import { SelfControlState } from '../../../types';
import { styles } from './SelfControlSection.styles';

interface SelfControlSectionProps {
  selfControl: SelfControlState;
  onStartSelfControlFlow: () => void;
  onDisableSelfControl: () => void;
}

export const SelfControlSection: React.FC<SelfControlSectionProps> = ({
  selfControl,
  onStartSelfControlFlow,
  onDisableSelfControl,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.subtitleText}>Estado de autoprotección:</Text>
        <Badge
          status={
            selfControl.status === 'DEACTIVATION_READY'
              ? 'activo'
              : selfControl.active
              ? 'activo'
              : 'inactivo'
          }
          label={
            selfControl.status === 'DEACTIVATION_READY'
              ? 'LISTO PARA DESACTIVAR'
              : selfControl.active
              ? 'ACTIVO (24H)'
              : 'INACTIVO'
          }
        />
      </View>

      <Text style={styles.descText}>
        {selfControl.status === 'DEACTIVATION_READY'
          ? 'Pasaron las 24 horas de protección obligatoria. Ya puedes desactivar la autoprotección si lo deseas.'
          : selfControl.active
          ? `Autoprotección activa. Restan ${selfControl.remainingHours}h ${selfControl.remainingMinutes.toString().padStart(2, '0')}m de protección obligatoria antes de poder desactivarla.`
          : 'Al activar la autoprotección, se impedirá deshabilitar, editar o eliminar sitios y aplicaciones bloqueadas en este dispositivo. Una vez activa, solo podrá desactivarse tras 24 horas de protección obligatoria.'}
      </Text>

      {selfControl.status === 'DEACTIVATION_READY' ? (
        <ActionButton
          title="Desactivar autoprotección"
          variant="danger"
          onPress={onDisableSelfControl}
        />
      ) : selfControl.active ? (
        <ActionButton
          title={`Habilitado en ${selfControl.remainingHours}h ${selfControl.remainingMinutes.toString().padStart(2, '0')}m`}
          variant="secondary"
          onPress={onStartSelfControlFlow}
        />
      ) : (
        <ActionButton
          title="Activar autoprotección con doble confirmación"
          variant="primary"
          onPress={onStartSelfControlFlow}
        />
      )}
    </View>
  );
};
