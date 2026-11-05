// ==============================================================================
// Proyecto: BA Protege+
// Componente: GlobalRulesSection (Reglas de protección global)
// Archivo: src/components/dashboard/cuenta/GlobalRulesSection.tsx
// Descripción: Sección que presenta los 5 controles globales de protección con
//              toggles en el estándar azul de la app: Bloqueo sitios LotBA, Alertas,
//              Antidesinstalación, Autoprotección y Permisos. Bloqueo sitios LotBA nunca se desactiva.
// ==============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ToggleSwitch } from '../../ToggleSwitch';
import { SelfControlState } from '../../../types';
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
  const isAutoproteccionActive = Boolean(
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

  const handleSelfControlPress = () => {
    if (onStartSelfControlFlow) {
      onStartSelfControlFlow();
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

      {/* 4. Autoprotección */}
      <TouchableOpacity
        style={styles.ruleItem}
        activeOpacity={0.8}
        onPress={handleSelfControlPress}
      >
        <Text style={styles.ruleItemText}>⏱️ Autoprotección</Text>
        <ToggleSwitch
          value={isAutoproteccionActive}
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
