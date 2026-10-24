// ==============================================================================
// Proyecto: BA Protege+
// Componente: SelfControlSection (Sección de Autocontrol del Responsable 24h)
// Archivo: src/components/dashboard/cuenta/SelfControlSection.tsx
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
            selfControl.status === 'TEMPORARILY_UNLOCKED'
              ? 'activo'
              : selfControl.status === 'DEACTIVATION_READY'
              ? 'activo'
              : selfControl.status === 'DEACTIVATION_PENDING'
              ? 'alerta'
              : selfControl.active
              ? 'alerta'
              : 'inactivo'
          }
          label={
            selfControl.status === 'TEMPORARILY_UNLOCKED'
              ? 'PASE 24H ACTIVO'
              : selfControl.status === 'DEACTIVATION_READY'
              ? 'DESACTIVACIÓN LISTA'
              : selfControl.status === 'DEACTIVATION_PENDING'
              ? 'ESPERA 24H'
              : selfControl.active
              ? 'ACTIVA'
              : 'INACTIVO'
          }
        />
      </View>

      <Text style={styles.descText}>
        {selfControl.status === 'TEMPORARILY_UNLOCKED'
          ? `Autoprotección desbloqueada por pase temporal. Restan ${selfControl.remainingUnlockHours ?? selfControl.remainingHours}h ${(selfControl.remainingUnlockMinutes ?? selfControl.remainingMinutes).toString().padStart(2, '0')}m para el rebloqueo automático.`
          : selfControl.status === 'DEACTIVATION_READY'
          ? 'Pasaron las 24 horas requeridas. Presiona por segunda vez para desbloquear inmediatamente por 24 hs.'
          : selfControl.status === 'DEACTIVATION_PENDING'
          ? `Desactivación habilitada en 24hs. Tiempo de espera restante: ${selfControl.remainingWaitHours ?? selfControl.remainingHours}h ${(selfControl.remainingWaitMinutes ?? selfControl.remainingMinutes).toString().padStart(2, '0')}m.`
          : selfControl.active
          ? 'Autoprotección activa. Al solicitar la desactivación se iniciará una espera obligatoria de 24 horas.'
          : 'Al activar la autoprotección mediante doble confirmación, el bloqueo se mantendrá permanente.'}
      </Text>

      {selfControl.status === 'TEMPORARILY_UNLOCKED' ? (
        <ActionButton
          title="🔒 Volver a activar ahora"
          variant="primary"
          onPress={onStartSelfControlFlow}
        />
      ) : selfControl.status === 'DEACTIVATION_READY' ? (
        <ActionButton
          title="🔓 Confirmar desactivación (Desbloqueo inmediato)"
          variant="danger"
          onPress={onDisableSelfControl}
        />
      ) : selfControl.status === 'DEACTIVATION_PENDING' ? (
        <ActionButton
          title={`🔒 Habilitado en ${selfControl.remainingWaitHours ?? selfControl.remainingHours}h ${(selfControl.remainingWaitMinutes ?? selfControl.remainingMinutes).toString().padStart(2, '0')}m`}
          variant="secondary"
          disabled
          onPress={onDisableSelfControl}
        />
      ) : selfControl.active ? (
        <ActionButton
          title="Desactivar autoprotección"
          variant="danger"
          onPress={onDisableSelfControl}
        />
      ) : (
        <ActionButton
          title="Activar autocontrol con doble confirmación"
          variant="primary"
          onPress={onStartSelfControlFlow}
        />
      )}
    </View>
  );
};
