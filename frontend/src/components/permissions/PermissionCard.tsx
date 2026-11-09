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
  locationAddress?: string | null;
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
  locationAddress,
  onToggleExpand,
  onTogglePermission,
  onDisablePermission,
  onDisabledPress,
}) => {
  return (
    <View style={styles.permCard}>
      <TouchableOpacity
        style={styles.permCardHeader}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.permTextColumn}>
          <Text style={styles.permTitle}>{item.title}</Text>
          <Text style={styles.permSubtitle}>{item.subtitle}</Text>
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
          <Text style={styles.chevronIcon}>{isExpanded ? '∧' : '∨'}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedSection}>
          <View style={styles.cardDivider} />
          <Text style={styles.expandedDetailedText}>{item.detailedText}</Text>

          {/* Bloque paso a paso pedagógico */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Pasos para activar:</Text>
            {item.steps.map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {item.key === 'location' && !!locationAddress && (
            <View style={styles.locationBox}>
              <Text style={styles.locationBoxLabel}>📍 Dirección / ubicación registrada:</Text>
              <Text style={styles.locationBoxValue}>{locationAddress}</Text>
            </View>
          )}

          <View style={styles.actionButtonRow}>
            {isGranted ? (
              <View style={styles.grantedActionsContainer}>
                <View style={styles.activeNotice}>
                  <Text style={styles.activeNoticeText}>✓ Permiso concedido y en funcionamiento</Text>
                </View>
                {canDisablePermissions && (
                  <TouchableOpacity
                    style={styles.disablePermissionButton}
                    onPress={onDisablePermission}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.disablePermissionButtonText}>
                      {item.key === 'vpn' || item.key === 'location'
                        ? 'Desactivar permiso'
                        : 'Abrir configuración para desactivar'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
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
            )}
          </View>
        </View>
      )}
    </View>
  );
};
