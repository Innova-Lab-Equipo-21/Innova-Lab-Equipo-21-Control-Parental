// ==============================================================================
// Proyecto: BA Protege+
// Módulo: Lógica de Primer Acceso del Responsable ("Elegir protección")
// Archivo: src/utils/responsibleFirstAccess.ts
// Descripción: Gestiona la visualización única de la pantalla "Elegir protección"
//              en el primer acceso del usuario Responsable, el aviso de lista vacía
//              para Autoprotección y la redirección automática a Inicio (Home).
// ==============================================================================

import { safeStorage } from '../services/api/client';

export type ResponsibleInitialAction = 'NONE' | 'SUPERVISE' | 'SELF_CONTROL';

export const AUTOPROTECCION_EMPTY_LIST_MESSAGE =
  'Para activar la autoprotección, primero necesitás incluir al menos un sitio web o aplicación en la lista con el botón +.';

const FIRST_ACCESS_KEY_PREFIX = '@ba_protege_responsible_first_access_done_';

/**
 * Construye una clave estable por usuario Responsable priorizando email normalizado
 * (presente tanto en backend como en modo demo y Google Auth) o ID.
 */
export function getResponsibleFirstAccessKey(
  user?: { id?: string; email?: string } | null
): string {
  const normalizedEmail = user?.email?.trim().toLowerCase();
  const identifier = normalizedEmail || user?.id?.trim() || 'default';
  return `${FIRST_ACCESS_KEY_PREFIX}${identifier}`;
}

/**
 * Verifica si el usuario Responsable ya completó la pantalla inicial "Elegir protección",
 * o si ya cuenta con dispositivos registrados (en cuyo caso "Elegir protección" no debe aparecer).
 */
export async function hasCompletedResponsibleFirstAccess(
  user?: { id?: string; email?: string } | null,
  registeredDevicesCount?: number
): Promise<boolean> {
  // Si ya tiene al menos 1 dispositivo registrado, no debe mostrarse "Elegir protección"
  if (typeof registeredDevicesCount === 'number' && registeredDevicesCount > 0) {
    return true;
  }

  try {
    const key = getResponsibleFirstAccessKey(user);
    const stored = await safeStorage.getItem(key);
    if (stored === 'true') {
      return true;
    }

    // Si existen dispositivos registrados en el almacenamiento local, no mostrar "Elegir protección"
    const localDevsRaw = await safeStorage.getItem('@ba_protege_devices_list');
    if (localDevsRaw) {
      const parsed = JSON.parse(localDevsRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Determina si debe mostrarse la pantalla "Elegir protección".
 * Garantiza que "Elegir protección" aparezca solamente cuando el Responsable no tenga ningún dispositivo registrado.
 */
export function shouldShowResponsibleActionScreen(
  hasSelectedAction: boolean,
  deviceCount: number
): boolean {
  if (deviceCount > 0) {
    return false;
  }
  return !hasSelectedAction;
}

/**
 * Registra que el usuario Responsable ya completó su elección inicial de protección,
 * evitando que "Elegir protección" vuelva a mostrarse en futuros accesos.
 */
export async function markResponsibleFirstAccessCompleted(
  user?: { id?: string; email?: string } | null
): Promise<void> {
  try {
    const key = getResponsibleFirstAccessKey(user);
    await safeStorage.setItem(key, 'true');
  } catch {
    // Continuar en memoria si falla almacenamiento
  }
}

/**
 * Restablece el indicador de primer acceso (útil para pruebas automatizadas).
 */
export async function resetResponsibleFirstAccess(
  user?: { id?: string; email?: string } | null
): Promise<void> {
  try {
    const key = getResponsibleFirstAccessKey(user);
    await safeStorage.removeItem(key);
  } catch {
    // Ignorar error de limpieza
  }
}

/**
 * Determina si debe mostrarse el aviso indicando que se requiere al menos un sitio o app
 * antes de poder activar la Autoprotección.
 */
export function shouldShowAutoproteccionEmptyNotice(
  sitesCount: number,
  appsCount: number,
  isAutoproteccionActive: boolean
): boolean {
  return !isAutoproteccionActive && sitesCount + appsCount === 0;
}

/**
 * Determina si un sitio o aplicación personalizada está activa y asignada al dispositivo
 * del Responsable ("Mi dispositivo"), ya sea por regla global (applyToAll: true) o
 * por asignación explícita (deviceIds incluye 'self').
 */
export function isItemEnabledForResponsable(
  item?: { isActive?: boolean; applyToAll?: boolean; deviceIds?: string[] } | null
): boolean {
  if (!item) return false;
  if (item.isActive === false) return false;
  return (
    item.applyToAll === true ||
    (Array.isArray(item.deviceIds) && item.deviceIds.includes('self'))
  );
}

/**
 * Cuenta cuántos elementos están activos y asignados al Responsable.
 */
export function countItemsForResponsable<
  T extends { isActive?: boolean; applyToAll?: boolean; deviceIds?: string[] }
>(items?: T[] | null): number {
  if (!Array.isArray(items)) return 0;
  return items.filter(isItemEnabledForResponsable).length;
}

/**
 * Determina si el Responsable tiene al menos un sitio o aplicación activa habilitada para su dispositivo.
 */
export function hasActiveSitesOrAppsForResponsable(
  customSites?: { isActive?: boolean; applyToAll?: boolean; deviceIds?: string[] }[] | null,
  customApps?: { isActive?: boolean; applyToAll?: boolean; deviceIds?: string[] }[] | null
): boolean {
  return countItemsForResponsable(customSites) + countItemsForResponsable(customApps) > 0;
}

/**
 * Determina si tras activar la Autoprotección el usuario debe ser redirigido a Inicio (Home).
 */
export function shouldRedirectToHomeAfterSelfControlActivation(
  activeTab: string,
  redirectPending: boolean
): boolean {
  return redirectPending || activeTab === 'sitios';
}
