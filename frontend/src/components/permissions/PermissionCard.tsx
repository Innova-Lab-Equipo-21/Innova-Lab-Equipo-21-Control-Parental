// ==============================================================================
// Proyecto: BA Protege+
// Componente: PermissionCard
// Archivo: src/components/permissions/PermissionCard.tsx
// Descripción: Tarjeta individual interactiva para cada permiso con switch toggle,
//              acordeón desplegable de pasos pedagógicos y acciones de activación
//              o desactivación.
// ==============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ToggleSwitch } from '../ToggleSwitch';
import { styles } from '../../screens/PermissionsScreen.styles';
import { PermissionCardItem } from './types';

interface PermissionCardProps {
  item: PermissionCardItem;
  isGranted: boolean;
  isExpanded: boolean;
  isLoading: boolean;
  canDisablePermissions: boolean;
  onToggleExpand: () => void;
  onTogglePermission: () => void;
  onDisablePermission: () => void;
  onDisabledPress?: () => void;
}

export const PermissionCard: React.FC<PermissionCardProps> = ({
  item,
  isGranted,
  isExpanded,
  isLoading,
  canDisablePermissions,
  onToggleExpand,
  onTogglePermission,
  onDisablePermission,
  onDisabledPress,
}) => {
  const canExpand = !isGranted || canDisablePermissions;

  return (
    <View style={styles.permCard}>
      <TouchableOpacity
        style={styles.permCardHeader}
        onPress={canExpand ? onToggleExpand : undefined}
        disabled={!canExpand}
        activeOpacity={canExpand ? 0.7 : 1}
      >
        <View style={styles.permTextColumn}>
          <Text style={styles.permTitle}>{item.title}</Text>
        </View>
        <View style={styles.permRightColumn}>
          <View style={styles.toggleWrapper}>
            <ToggleSwitch
              value={isGranted}
              onValueChange={onTogglePermission}
              disabled={isLoading || (isGranted && !canDisablePermissions)}
              onDisabledPress={
                isGranted && !canDisablePermissions ? onDisabledPress : undefined
              }
            />
          </View>
          {canExpand && (
            <Text style={styles.chevronIcon}>{isExpanded ? '∧' : '∨'}</Text>
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && canExpand && (
        <View style={styles.expandedSection}>
          <View style={styles.cardDivider} />

          {isGranted ? (
            canDisablePermissions && (
              <View style={styles.actionButtonRow}>
                <TouchableOpacity
                  style={styles.disablePermissionButton}
                  onPress={onDisablePermission}
                  activeOpacity={0.8}
                >
                  <Text style={styles.disablePermissionButtonText}>Desactivar</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <>
              <Text style={styles.expandedDetailedText}>{item.detailedText}</Text>

              {/* Bloque paso a paso pedagógico */}
              <View style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>Pasos para aceptar este permiso:</Text>
                {item.steps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionButtonRow}>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={item.onAction}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.continueButtonText}>{item.actionLabel}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};
