// ==============================================================================
// Proyecto: BA Protege+
// Componente: Permissions Types
// Archivo: src/components/permissions/types.ts
// Descripción: Interfaces y tipos comunes para el módulo de permisos.
// ==============================================================================

import { ImageSourcePropType } from 'react-native';

export interface PermissionItemState {
  vpn: boolean;
  accessibility: boolean;
  notifications: boolean;
  batteryOptimization: boolean;
  location: boolean;
  usageStats: boolean;
}

export interface PermissionDefinition {
  key: keyof PermissionItemState;
  title: string;
  detailedText: string;
  steps: string[];
  actionLabel: string;
  loadingKey: string;
}

export interface PermissionCardItem extends PermissionDefinition {
  onAction: () => void;
}

export interface FeedbackModalState {
  visible: boolean;
  imageSource?: ImageSourcePropType;
  title: string;
  message: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onConfirm?: () => void;
  onSecondaryPress?: () => void;
}
