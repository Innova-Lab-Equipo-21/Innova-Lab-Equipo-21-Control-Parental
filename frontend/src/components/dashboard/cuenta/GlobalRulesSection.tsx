// ==============================================================================
// Proyecto: BA Protege+
// Componente: GlobalRulesSection (Reglas de protección global)
// Archivo: src/components/dashboard/cuenta/GlobalRulesSection.tsx
// Descripción: Sección que presenta los controles globales de protección con
//              toggles en el estándar azul de la app: Bloqueo sitios LotBA,
//              Antidesinstalación, Autoprotección y Permisos. Bloqueo sitios LotBA
//              nunca se desactiva y utiliza el modal estándar FeedbackModal.
// ==============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ToggleSwitch } from '../../ToggleSwitch';
import { FeedbackModal } from '../../FeedbackModal';
import { getBotMascotImage } from '../protected/botAssets';
import { SelfControlState } from '../../../types';
import { styles } from './GlobalRulesSection.styles';

export interface GlobalRulesSectionProps {
  ruleAlerts?: boolean;
  ruleUninstallProtection: boolean;
  rulePermissions?: boolean;
  selfControl?: SelfControlState;
  isAutoproteccionDisabled?: boolean;
  showAutoproteccion?: boolean;
  profileType?: 'PARENT' | 'CHILD' | 'ADULT';
  onToggleAlerts?: (val: boolean) => void;
  onToggleUninstallProtection: (val: boolean) => void;
  onTogglePermissions?: (val: boolean) => void;
  onStartSelfControlFlow?: () => void;
  onDisableSelfControl?: () => void;
  onOpenPermissions?: () => void;
}

export const GlobalRulesSection: React.FC<GlobalRulesSectionProps> = ({
  ruleUninstallProtection,
  selfControl,
  isAutoproteccionDisabled = false,
  showAutoproteccion = true,
  profileType = 'PARENT',
  onToggleUninstallProtection,
  onStartSelfControlFlow,
  onOpenPermissions,
}) => {
  const [showLotbaModal, setShowLotbaModal] = useState<boolean>(false);
  const [showAntiUninstallLockedModal, setShowAntiUninstallLockedModal] = useState<boolean>(false);

  const isAutoproteccionActive = Boolean(
    selfControl?.active ||
    selfControl?.status === 'ACTIVE_LOCKED' ||
    selfControl?.status === 'DEACTIVATION_PENDING'
  );

  const handleToggleLotba = () => {
    setShowLotbaModal(true);
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

      {/* 2. Antidesinstalación (Bloqueada en ON cuando Autoprotección está activa) */}
      <TouchableOpacity
        style={styles.ruleItem}
        activeOpacity={0.8}
        onPress={() => {
          if (isAutoproteccionActive) {
            setShowAntiUninstallLockedModal(true);
          } else {
            onToggleUninstallProtection(!ruleUninstallProtection);
          }
        }}
      >
        <Text style={styles.ruleItemText}>🔒 Antidesinstalación</Text>
        <ToggleSwitch
          value={isAutoproteccionActive ? true : ruleUninstallProtection}
          onValueChange={(val) => {
            if (isAutoproteccionActive) {
              setShowAntiUninstallLockedModal(true);
            } else {
              onToggleUninstallProtection(val);
            }
          }}
          disabled={isAutoproteccionActive}
          onDisabledPress={() => {
            if (isAutoproteccionActive) {
              setShowAntiUninstallLockedModal(true);
            }
          }}
          activeColor="#007AFF"
        />
      </TouchableOpacity>

      {/* 3. Autoprotección (Excluida en modos protegidos) */}
      {showAutoproteccion && (
        <TouchableOpacity
          style={styles.ruleItem}
          activeOpacity={0.8}
          onPress={handleSelfControlPress}
        >
          <Text style={styles.ruleItemText}>⏱️ Autoprotección</Text>
          <ToggleSwitch
            value={isAutoproteccionActive}
            onValueChange={handleSelfControlPress}
            disabled={isAutoproteccionDisabled}
            onDisabledPress={handleSelfControlPress}
            activeColor="#007AFF"
          />
        </TouchableOpacity>
      )}

      {/* 4. Permisos (Navegación con flecha hacia la pantalla de auditoría) */}
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

      {/* Modal Estándar de Retroalimentación para Protección Obligatoria LOTBA */}
      <FeedbackModal
        visible={showLotbaModal}
        imageSource={getBotMascotImage(profileType === 'CHILD' ? 'CHILD' : 'ADULT', 'pensando')}
        title="Protección obligatoria"
        message="El bloqueo de sitios de apuestas no autorizadas por LOTBA es obligatorio y no puede desactivarse por normativa oficial."
        buttonText="Entendido"
        onClose={() => setShowLotbaModal(false)}
      />

      {/* Modal Estándar de Retroalimentación cuando Antidesinstalación está Bloqueada por Autoprotección */}
      <FeedbackModal
        visible={showAntiUninstallLockedModal}
        imageSource={getBotMascotImage(profileType === 'CHILD' ? 'CHILD' : 'ADULT', 'nervioso')}
        title="Antidesinstalación protegida"
        message="La protección antidesinstalación no puede desactivarse mientras la Autoprotección de 24 horas esté activa."
        buttonText="Entendido"
        onClose={() => setShowAntiUninstallLockedModal(false)}
      />
    </View>
  );
};
