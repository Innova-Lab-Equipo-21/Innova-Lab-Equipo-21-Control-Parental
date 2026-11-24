// ==============================================================================
// Proyecto: BA Protege+
// Componente: Panel de Analítica (Datos de demostración)
// Archivo: src/components/dashboard/actividad/data.ts
// Descripción: Datos de muestra fieles al prototipo HTML para poder montar el
//              panel sin backend. En producción se reemplazan por los datos
//              reales de la API (Supabase / api.service).
// ==============================================================================

import {
  AnalyticsDevice,
  AttemptEvent,
  DayBlock,
  HourBlock,
} from './types';

/** Dispositivos protegidos del responsable. */
export const DEMO_DEVICES: AnalyticsDevice[] = [
  {
    id: 'tomas',
    label: 'Celular de Tomás',
    shortLabel: 'Tomás',
    status: 'online',
    colorIndex: 0,
    total: 890,
    lotba: 640,
    custom: 250,
    uptime: '99.8%',
    showAlert: false,
    mult: 0.62,
  },
  {
    id: 'lucia',
    label: 'Tablet de Lucía',
    shortLabel: 'Lucía',
    status: 'online',
    colorIndex: 1,
    total: 412,
    lotba: 310,
    custom: 102,
    uptime: '100%',
    showAlert: false,
    mult: 0.29,
  },
  {
    id: 'mateo',
    label: 'Celular de Mateo',
    shortLabel: 'Mateo',
    status: 'offline',
    colorIndex: 2,
    total: 124,
    lotba: 95,
    custom: 29,
    uptime: '74.2%',
    showAlert: true,
    alertText: 'Celular de Mateo dejó de reportar hace 4 h',
    alertTag: 'Sin señal VPN',
    mult: 0.09,
  },
];

/** Distribución semanal (Lunes a Domingo) = 1.426 totales (1.045 + 381). */
export const DEMO_WEEK_DATA: DayBlock[] = [
  { short: 'Lun', full: 'Lunes', lotba: 105, custom: 37 },
  { short: 'Mar', full: 'Martes', lotba: 95, custom: 33 },
  { short: 'Mié', full: 'Miércoles', lotba: 120, custom: 45 },
  { short: 'Jue', full: 'Jueves', lotba: 112, custom: 42 },
  { short: 'Vie', full: 'Viernes', lotba: 162, custom: 61 },
  { short: 'Sáb', full: 'Sábado', lotba: 250, custom: 92, isPeak: true },
  { short: 'Dom', full: 'Domingo', lotba: 201, custom: 71 },
];

/** Distribución base por franja horaria (24 bloques de 1 h). */
export const DEMO_HOURLY_DATA: HourBlock[] = [
  { label: '0h', lotba: 4, custom: 1 },
  { label: '1h', lotba: 3, custom: 1 },
  { label: '2h', lotba: 2, custom: 0 },
  { label: '3h', lotba: 1, custom: 0 },
  { label: '4h', lotba: 1, custom: 0 },
  { label: '5h', lotba: 2, custom: 1 },
  { label: '6h', lotba: 3, custom: 1 },
  { label: '7h', lotba: 5, custom: 2 },
  { label: '8h', lotba: 7, custom: 3 },
  { label: '9h', lotba: 9, custom: 3 },
  { label: '10h', lotba: 10, custom: 4 },
  { label: '11h', lotba: 12, custom: 4 },
  { label: '12h', lotba: 14, custom: 5 },
  { label: '13h', lotba: 15, custom: 6 },
  { label: '14h', lotba: 16, custom: 6 },
  { label: '15h', lotba: 18, custom: 7 },
  { label: '16h', lotba: 21, custom: 8 },
  { label: '17h', lotba: 24, custom: 9 },
  { label: '18h', lotba: 29, custom: 11 },
  { label: '19h', lotba: 35, custom: 13 },
  { label: '20h', lotba: 49, custom: 19, isPeak: true },
  { label: '21h', lotba: 34, custom: 12 },
  { label: '22h', lotba: 18, custom: 6 },
  { label: '23h', lotba: 9, custom: 3 },
];

/** Últimos sitios bloqueados (pestaña "Últimos bloqueos"). */
export const DEMO_BLOCKED_ATTEMPTS: AttemptEvent[] = [
  {
    id: 'a1',
    title: 'Sitio no autorizado',
    meta: 'Celular de Tomás · hace 4 min',
    source: 'lotba',
  },
  {
    id: 'a2',
    title: 'Sitio no autorizado',
    meta: 'Tablet de Lucía · hace 22 min',
    source: 'lotba',
  },
  {
    id: 'a3',
    title: 'sitio-bloqueado.com',
    meta: 'Celular de Tomás · hace 1 h',
    source: 'custom',
  },
];

/** Eventos Anti-bypass (Métricas #10 y #20 ya provistas por el backend). */
export const DEMO_BYPASS_EVENTS: AttemptEvent[] = [
  {
    id: 'b1',
    title: 'Intento de desactivar VPN',
    meta: 'Celular de Tomás · Hoy 20:14 h',
    source: 'bypass',
    badgeLabel: 'VPN_STOP',
  },
  {
    id: 'b2',
    title: 'Dejó de reportar (+4 h sin señal)',
    meta: 'Celular de Mateo · Hoy 13:30 h',
    source: 'bypass',
    badgeLabel: 'HEARTBEAT',
  },
  {
    id: 'b3',
    title: 'Permiso de accesibilidad revocado',
    meta: 'Celular de Mateo · Ayer 22:40 h',
    source: 'bypass',
    badgeLabel: 'PERM_FAIL',
  },
];
