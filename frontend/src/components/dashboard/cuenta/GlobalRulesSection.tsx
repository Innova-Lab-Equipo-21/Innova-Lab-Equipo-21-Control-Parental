// ==============================================================================
// Proyecto: BA Protege+
// Componente: GlobalRulesSection (Reglas de protección global)
// Archivo: src/components/dashboard/cuenta/GlobalRulesSection.tsx
// Descripción: Sección que presenta los 5 controles globales de protección con
//              toggles en el estándar azul de la app: Bloqueo sitios LotBA, Alertas,
//              Antidesinstalación, Autocontrol y Permisos. Bloqueo sitios LotBA nunca se desactiva.
// ==============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ToggleSwitch } from '../../ToggleSwitch';
import { SelfControlState } from '../../../types';
import { apiService } from '../../../services/api.service';
import { styles } from './GlobalRulesSection.styles';

export interface GlobalRulesSectionProps {
  ruleAlerts: boolean;
  ruleUninstallProtection: boolean;
  rulePermissions?: boolean;
  selfControl?: SelfControlState;
  onToggleAlerts: (val: boolean) => void;
  onToggleUninstallProtection: (val: boolean) => void;
  onTogglePermissions?: (val: boolean) => void;
  onStartSelfControlFlow?: () => void;
  onDisableSelfControl?: () => void;
  onOpenPermissions?: () => void;
}

export const GlobalRulesSection: React.FC<GlobalRulesSectionProps> = ({
  ruleAlerts,
  ruleUninstallProtection,
  selfControl,
  onToggleAlerts,
  onToggleUninstallProtection,
  onStartSelfControlFlow,
  onDisableSelfControl,
  onOpenPermissions,
}) => {
  const isAutocontrolActive = Boolean(
    selfControl?.active ||
    selfControl?.status === 'ACTIVE_LOCKED' ||
    selfControl?.status === 'DEACTIVATION_PENDING'
  );

  const handleToggleLotba = () => {
    Alert.alert(
      'Protección obligatoria',
      'El bloqueo de sitios de apuestas no autorizadas por LOTBA es obligatorio y no puede desactivarse por normativa oficial.'
    );
  };

  const handleSelfControlPress = async () => {
    let currentSc = selfControl;
    try {
      currentSc = await apiService.getSelfControlStatus();
    } catch {
      // Usar estado en memoria como respaldo
    }
    if (!currentSc) return;

    if (currentSc.status === 'TEMPORARILY_UNLOCKED') {
      const unlH = currentSc.remainingUnlockHours ?? currentSc.remainingHours ?? 0;
      const unlM = (currentSc.remainingUnlockMinutes ?? currentSc.remainingMinutes ?? 0).toString().padStart(2, '0');
      const unlS = (currentSc.remainingUnlockSeconds ?? currentSc.remainingSeconds ?? 0).toString().padStart(2, '0');
      Alert.alert(
        'Autocontrol del responsable',
        `El sistema está desbloqueado temporalmente. Restan ${unlH}h ${unlM}m ${unlS}s para el rebloqueo automático.\n\n¿Deseás volver a activar el autocontrol ahora?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reactivar ahora', onPress: onStartSelfControlFlow },
        ]
      );
    } else if (currentSc.status === 'DEACTIVATION_READY') {
      Alert.alert(
        'Autocontrol del responsable',
        'Pasaron las 24 horas requeridas de espera. Presioná confirmar para desbloquear inmediatamente por un pase temporal de 24 horas.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar desbloqueo (24 hs)', onPress: onDisableSelfControl },
        ]
      );
    } else if (currentSc.status === 'DEACTIVATION_PENDING') {
      const waitH = currentSc.remainingWaitHours ?? currentSc.remainingHours ?? 0;
      const waitM = (currentSc.remainingWaitMinutes ?? currentSc.remainingMinutes ?? 0).toString().padStart(2, '0');
      const waitS = (currentSc.remainingWaitSeconds ?? currentSc.remainingSeconds ?? 0).toString().padStart(2, '0');
      Alert.alert(
        'Autocontrol en espera de 24hs',
        `La desactivación ya fue solicitada. Tiempo restante de espera: ${waitH}h ${waitM}m ${waitS}s.\n\nDurante este lapso, el bloqueo se mantendrá activo.`
      );
    } else if (currentSc.active) {
      Alert.alert(
        'Autocontrol del responsable activo',
        'El autocontrol está activo en tu dispositivo impidiendo acceder o eliminar sitios y aplicaciones bloqueadas.\n\nAl solicitar la desactivación se iniciará una espera obligatoria de 24 horas. ¿Deseás solicitar la desactivación ahora?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Solicitar desactivación (espera 24h)', onPress: onDisableSelfControl },
        ]
      );
    } else {
      if (onStartSelfControlFlow) {
        onStartSelfControlFlow();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Reglas de protección global</Text>

      {/* 1. Bloqueo sitios LotBA (Inmutable / Siempre activo) */}
      <TouchableOpacity
        style={styles.ruleItem}
        activeOpacity={0.8}
        onPress={handleToggleLotba}
      >
        <Text style={styles.ruleItemText}>🛡️ Bloqueo sitios LotBA</Text>
        <ToggleSwitch
          value={true}
          onValueChange={handleToggleLotba}
          activeColor="#007AFF"
        />
      </TouchableOpacity>

      {/* 2. Alertas */}
      <View style={styles.ruleItem}>
        <Text style={styles.ruleItemText}>🔔 Alertas</Text>
        <ToggleSwitch
          value={ruleAlerts}
          onValueChange={onToggleAlerts}
          activeColor="#007AFF"
        />
      </View>

      {/* 3. Antidesinstalación */}
      <View style={styles.ruleItem}>
        <Text style={styles.ruleItemText}>🔒 Antidesinstalación</Text>
        <ToggleSwitch
          value={ruleUninstallProtection}
          onValueChange={onToggleUninstallProtection}
          activeColor="#007AFF"
        />
      </View>

      {/* 4. Autocontrol */}
      <TouchableOpacity
        style={styles.ruleItem}
        activeOpacity={0.8}
        onPress={handleSelfControlPress}
      >
        <Text style={styles.ruleItemText}>⏱️ Autocontrol</Text>
        <ToggleSwitch
          value={isAutocontrolActive}
          onValueChange={handleSelfControlPress}
          activeColor="#007AFF"
        />
      </TouchableOpacity>

      {/* 5. Permisos (Navegación con flecha hacia la pantalla de auditoría) */}
      <TouchableOpacity
        style={styles.ruleItem}
        activeOpacity={0.8}
        onPress={() => {
          if (onOpenPermissions) onOpenPermissions();
        }}
      >
        <Text style={styles.ruleItemText}>⚙️ Permisos</Text>
        <Text style={styles.ruleArrow}>➔</Text>
      </TouchableOpacity>
    </View>
  );
};
