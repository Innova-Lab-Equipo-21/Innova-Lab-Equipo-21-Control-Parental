// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (TypeScript)
// Archivo: src/types/index.ts
// Descripción: Definición de tipos, interfaces de estado y modelos para la aplicación móvil.
// ==============================================================================

/** Límite máximo de dispositivos vinculados por responsable */
export const MAX_PARENT_DEVICES = 5;

/** Duración del bloqueo de desactivación del Autocontrol (en horas) */
export const SELF_CONTROL_LOCK_HOURS = 24;

/**
 * Modo operativo de la aplicación en el dispositivo actual.
 */
export type AppMode = 'UNSET' | 'PARENT' | 'CHILD' | 'ADULT';

/**
 * Estados de la protección reportados por el motor nativo y el backend.
 */
export type ProtectionStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'STARTING'
  | 'ERROR'
  | 'PERMISSION_REQUIRED'
  | 'SYNC_PENDING'
  | 'OUTDATED'
  | 'BYPASS_DETECTED'
  | 'UNKNOWN';

/**
 * Estado detallado de permisos del sistema reportado por cada dispositivo.
 */
export interface DevicePermissionsStatus {
  vpn: boolean;
  accessibility: boolean;
  notifications: boolean;
  batteryOptimization: boolean;
  grantedCount: number;
}

/**
 * Información de estado del dispositivo protegido.
 */
export interface DeviceInfo {
  deviceId: string;
  deviceUuid: string;
  deviceName: string;
  childName?: string;
  isProtected: boolean;
  status: ProtectionStatus;
  lastHeartbeat?: string;
  blockedCount: number;
  blocklistVersion: number;
  permissions?: DevicePermissionsStatus;
}

/**
 * Estado de Autocontrol del Responsable / Adulto.
 */
export interface SelfControlState {
  active: boolean;
  enabledAt: string | null;
  expiresAt: string | null;
  canDisable: boolean;
  remainingHours: number;
  remainingMinutes: number;
}

/**
 * Evento de intento de acceso bloqueado.
 */
export interface BlockedEventItem {
  id: string;
  attemptedDomain: string;
  sourceListType: string;
  blockedAt: string;
}

/**
 * Respuesta del puente nativo de protección (ProtectionModule).
 */
export interface NativeBlocklistInfo {
  version: number;
  totalDomains: number;
}
