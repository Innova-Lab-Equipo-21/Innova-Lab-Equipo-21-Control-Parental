// ==============================================================================
// Proyecto: BA Protege+
// Componente: GlobalRulesSection (Reglas de Control Parental Global)
// Archivo: src/components/dashboard/sitios/GlobalRulesSection.tsx
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ControlCard } from '../../ControlCard';
import { colors } from '../../../theme/colors';

interface GlobalRulesSectionProps {
  ruleBetting: boolean;
  ruleAlerts: boolean;
  ruleUninstallProtection: boolean;
  onToggleBetting: (val: boolean) => void;
  onToggleAlerts: (val: boolean) => void;
  onToggleUninstallProtection: (val: boolean) => void;
}

export const GlobalRulesSection: React.FC<GlobalRulesSectionProps> = ({
  ruleBetting,
  ruleAlerts,
  ruleUninstallProtection,
  onToggleBetting,
  onToggleAlerts,
  onToggleUninstallProtection,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.descText}>
        Administra los filtros globales aplicados a los dispositivos vinculados.
      </Text>

      <ControlCard
        title="Bloqueo de Dominios LOTBA"
        description="Bloquea el acceso a casas de apuestas online no autorizadas."
        active={ruleBetting}
        status={ruleBetting ? 'activo' : 'inactivo'}
        onToggle={onToggleBetting}
      />

      <ControlCard
        title="Alertas en Tiempo Real"
        description="Notifica inmediatamente al celular del tutor ante cualquier intento."
        active={ruleAlerts}
        status={ruleAlerts ? 'activo' : 'alerta'}
        onToggle={onToggleAlerts}
      />

      <ControlCard
        title="Protección Antidesinstalación"
        description="Impide desinstalar la app protegida sin ingresar el PIN."
        active={ruleUninstallProtection}
        status={ruleUninstallProtection ? 'activo' : 'inactivo'}
        onToggle={onToggleUninstallProtection}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  descText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
});
