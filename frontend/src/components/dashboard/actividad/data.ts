// ==============================================================================
// Proyecto: BA Protege+
// Componente: Panel de Analítica (Estructuras vacías por defecto)
// Archivo: src/components/dashboard/actividad/data.ts
// Descripción: Define únicamente estructuras vacías en cero para la grilla semanal
//              (7 días) y la grilla horaria (24 horas) cuando aún no existen eventos
//              reales en PostgreSQL. Sin datos ficticios ni cuentas de demostración.
// ==============================================================================

import { DayBlock, HourBlock } from './types';

/** Distribución semanal vacía (Lunes a Domingo en 0). */
export const EMPTY_WEEK_DATA: DayBlock[] = [
  { short: 'Lun', full: 'Lunes', lotba: 0, custom: 0 },
  { short: 'Mar', full: 'Martes', lotba: 0, custom: 0 },
  { short: 'Mié', full: 'Miércoles', lotba: 0, custom: 0 },
  { short: 'Jue', full: 'Jueves', lotba: 0, custom: 0 },
  { short: 'Vie', full: 'Viernes', lotba: 0, custom: 0 },
  { short: 'Sáb', full: 'Sábado', lotba: 0, custom: 0 },
  { short: 'Dom', full: 'Domingo', lotba: 0, custom: 0 },
];

/** Distribución horaria vacía (24 franjas de 1 h en 0). */
export const EMPTY_HOURLY_DATA: HourBlock[] = Array.from({ length: 24 }, (_, hour) => ({
  label: `${hour}h`,
  lotba: 0,
  custom: 0,
}));
