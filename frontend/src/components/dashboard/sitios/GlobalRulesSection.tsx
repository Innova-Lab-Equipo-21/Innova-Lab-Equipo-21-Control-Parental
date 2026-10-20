// ==============================================================================
// Proyecto: BA Protege+
// Componente: GlobalRulesSection (Reglas de Control Parental Global)
// Archivo: src/components/dashboard/sitios/GlobalRulesSection.tsx
// ==============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { ControlCard } from '../../ControlCard';
import { styles } from './GlobalRulesSection.styles';

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
        title="Bloqueo de sitios LOTBA"
        description="Bloquea permanentemente el acceso a casas de apuestas online no autorizadas. (Obligatorio en todos los dispositivos)"
        active={true}
        disabled={true}
        status="activo"
        onToggle={() => {}}
      />

      <ControlCard
        title="Alertas en tiempo real"
        description="Notifica inmediatamente al celular del tutor ante cualquier intento."
        active={ruleAlerts}
        status={ruleAlerts ? 'activo' : 'alerta'}
        onToggle={onToggleAlerts}
      />

      <ControlCard
        title="Protección antidesinstalación"
        description="Impide desinstalar la app protegida sin ingresar el PIN."
        active={ruleUninstallProtection}
        status={ruleUninstallProtection ? 'activo' : 'inactivo'}
        onToggle={onToggleUninstallProtection}
      />
    </View>
  );
};
