// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/utils/domain.ts
// Descripción: Utilidades para normalizar los dominios que ingresa el tutor.
// ==============================================================================

/**
 * Deja solo el dominio de lo que escribe el tutor: en minúscula, sin esquema (https://),
 * sin credenciales (usuario@), sin puerto, sin www., sin rutas ni parámetros y sin punto final.
 * Ejemplo: "https://www.Apuestas.com/promo?x=1" → "apuestas.com".
 */
export function normalizeDomain(raw: string): string {
  let value = raw.trim().toLowerCase();
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  value = value.replace(/^\/\//, '');
  value = value.split(/[/?#]/)[0];
  value = value.split('@').pop() ?? value;
  value = value.split(':')[0];
  return value.replace(/^www\./, '').replace(/\.+$/, '');
}