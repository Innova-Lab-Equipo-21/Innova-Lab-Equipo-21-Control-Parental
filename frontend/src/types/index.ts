// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (TypeScript)
// Archivo: src/types/index.ts
// Descripción: Definición de tipos, interfaces de estado y modelos para la aplicación móvil.
// ==============================================================================

/** Límite máximo de dispositivos protegidos vinculados por responsable (No incluye el propio) */
export const MAX_PROTECTED_DEVICES = 5;

/** Duración del bloqueo de desactivación del Autocontrol (en horas) */
export const SELF_CONTROL_LOCK_HOURS = 24;

/** Duración del desbloqueo temporal antes del re-bloqueo automático (en horas) */
export const SELF_CONTROL_UNLOCK_WINDOW_HOURS = 24;

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
 * Estado detallado de los 6 permisos del sistema reportado por cada dispositivo.
 */
export interface DevicePermissionsStatus {
  vpn: boolean;
  accessibility: boolean;
  notifications: boolean;
  batteryOptimization: boolean;
  location: boolean;
  usageStats: boolean;
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
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  profileType?: 'Menor' | 'Adulto' | 'Responsable';
  deviceModel?: string;
  createdAt?: string;
  pairedAt?: string;
  colorIndex?: number;
  pairingCode?: string;
  pairingExpiresAt?: string;
}

/**
 * Estado de Autocontrol / Autoprotección del Tutor:
 * - INACTIVE: Sin autoprotección activa.
 * - ACTIVE_LOCKED: Autoprotección activa. Se muestra botón para "Desactivar autoprotección".
 * - DEACTIVATION_PENDING: Al hacer clic, se inicia temporizador de 24hs y la UI avisa que "La desactivación se habilitará en 24 horas".
 * - DEACTIVATION_READY: Pasaron las 24hs. El botón cambia de estado para permitir el desbloqueo real con un segundo clic.
 * - TEMPORARILY_UNLOCKED: Desbloqueado inmediatamente con pase temporal de 24 horas. Cumplido ese plazo, se vuelve a activar automáticamente.
 */
export type SelfControlLifecycleStatus =
  | 'INACTIVE'
  | 'ACTIVE_LOCKED'
  | 'DEACTIVATION_PENDING'
  | 'DEACTIVATION_READY'
  | 'TEMPORARILY_UNLOCKED'
  // Compatibilidad hacia atrás
  | 'LOCKED_WAITING'
  | 'LOCKED_CAN_DISABLE';

export interface SelfControlState {
  active: boolean;
  status?: SelfControlLifecycleStatus;
  enabledAt: string | null;
  deactivationRequestedAt?: string | null;
  deactivationAvailableAt?: string | null;
  canDisableAt?: string | null;
  expiresAt: string | null;
  canDisable: boolean;
  unlockedAt?: string | null;
  autoRelockAt?: string | null;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds?: number;
  remainingWaitHours?: number;
  remainingWaitMinutes?: number;
  remainingWaitSeconds?: number;
  remainingLockHours?: number;
  remainingLockMinutes?: number;
  remainingUnlockHours?: number;
  remainingUnlockMinutes?: number;
  remainingUnlockSeconds?: number;
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

/**
 * Origen del registro de bloqueo personalizado:
 * - RESPONSABLE: creado por el tutor/responsable desde su panel.
 * - ADULTO_PROTEGIDO: auto-agregado por un adulto protegido en su dispositivo.
 */
export type BlockOrigin = 'RESPONSABLE' | 'ADULTO_PROTEGIDO';

/**
 * Filtro rápido por origen de bloqueo en el panel del responsable.
 */
export type BlockOriginFilter = 'all' | 'responsable' | 'adulto_protegido';

/**
 * Metadatos opcionales para identificar bloqueos creados por un adulto protegido.
 */
export interface BlockOriginMeta {
  createdBy?: BlockOrigin;
  createdByName?: string;
  sourceDeviceId?: string;
}

/**
 * Dominio bloqueado personalizado por el responsable o por un adulto protegido.
 */
export interface CustomBlockedDomain {
  id: string;
  domain: string;
  category?: string;
  isActive: boolean;
  applyToAll: boolean; // Regra 4: Bloqueio em todos os dispositivos
  deviceIds: string[]; // Regra 3: Lista personalizada por dispositivo
  createdAt: string;
  createdBy?: BlockOrigin;
  createdByName?: string;
  sourceDeviceId?: string;
}

/**
 * Aplicación bloqueada personalizada por el responsable o por un adulto protegido.
 */
export interface CustomBlockedApp {
  id: string;
  appName: string;
  packageName: string;
  category?: string;
  isActive: boolean;
  applyToAll: boolean;
  deviceIds: string[];
  dailyLimitMinutes?: number; // Límite de tiempo diario general (indeterminado por defecto si es undefined)
  deviceLimits?: Record<string, number | undefined>; // Límite de tiempo diario específico configurado por dispositivo
  createdAt: string;
  createdBy?: BlockOrigin;
  createdByName?: string;
  sourceDeviceId?: string;
}

/**
 * Registro de tiempo de uso de aplicación por dispositivo.
 */
export interface AppUsageItem {
  id: string;
  appName: string;
  packageName: string;
  category?: string;
  timeInMinutes: number;
  lastUsed?: string;
}

/**
 * Lista personalizada de bloqueo con versión y colección de dominios.
 */
export interface CustomBlocklist {
  id: string;
  name: string;
  type: string;
  version: number;
  domains: CustomBlockedDomain[];
  apps?: CustomBlockedApp[];
}

