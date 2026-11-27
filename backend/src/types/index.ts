// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/types/index.ts
// Descripción: Definición de interfaces y tipos TypeScript compartidos en la capa de Backend.
// ==============================================================================

import { Request } from 'express';

/**
 * Carga útil (Payload) decodificada desde el token JWT.
 */
export interface JwtUserPayload {
  userId: string;
  email: string;
}

/**
 * Extensión de la interfaz Request de Express para incluir el usuario autenticado.
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

/**
 * Estructura de respuesta estándar para la API REST.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

/**
 * Detalle granular de los 6 permisos reales reportados por Android.
 */
export interface DevicePermissionsDetail {
  vpn?: boolean;
  accessibility?: boolean;
  notifications?: boolean;
  batteryOptimization?: boolean;
  location?: boolean;
  usageStats?: boolean;
}

/**
 * Datos enviados por el dispositivo en el reporte periódico de telemetría (Heartbeat).
 */
export interface HeartbeatPayload {
  deviceUuid: string;
  vpnActive: boolean;
  permissionsOk: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  blocklistVersion: number;
  appVersion?: string;
  permissions?: DevicePermissionsDetail;
}

export interface FirebaseAuthLoginResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  displayName?: string;
  registered?: boolean;
}

export interface FirebaseAuthOobResponse {
  email: string;
  oobCode: string;
  mode: string;
}
