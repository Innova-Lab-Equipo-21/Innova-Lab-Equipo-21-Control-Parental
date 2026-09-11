// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (TypeScript)
// Archivo: src/types/index.ts
// Descripción: Definición de tipos, interfaces de estado y modelos para la aplicación móvil.
// ==============================================================================

/**
 * Modo operativo de la aplicación en el dispositivo actual.
 */
export type AppMode = 'UNSET' | 'PARENT' | 'CHILD';

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
