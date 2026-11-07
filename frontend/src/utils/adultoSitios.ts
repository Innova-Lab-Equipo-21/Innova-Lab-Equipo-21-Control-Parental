// ==============================================================================
// Proyecto: BA Protege+
// Archivo: src/utils/adultoSitios.ts
// Descripción: Utilidades puras de búsqueda, ordenamiento y textos de aviso para
//              la sección "Sitios y apps" del Modo Protegido Adulto.
//              En este modo solo se permite Buscar y Ordenar (sin filtro por
//              dispositivo ni acciones en lote) y no existe Autoprotección.
// ==============================================================================

import {
  BlockOrigin,
  BlockOriginFilter,
  CustomBlockedApp,
  CustomBlockedDomain,
  DeviceInfo,
} from '../types';

export type AdultoSortOption = 'date' | 'az';

export const ADULTO_CARD_LOCK_NOTICE =
  'Solo el responsable puede desactivar o eliminar';

export const ADULTO_SITE_MODAL_WARNING =
  'Una vez agregado este sitio web, quedará bloqueado en tu dispositivo y solo el responsable podrá desactivarlo o eliminarlo.';

export const ADULTO_APP_MODAL_WARNING =
  'Una vez agregada esta aplicación, quedará bloqueada en tu dispositivo y solo el responsable podrá desactivarla o eliminarla.';

export const ADULTO_SITE_ADDED_FEEDBACK = {
  title: 'Sitio bloqueado',
  message:
    'El sitio web fue agregado a la lista de bloqueo. Recordá que únicamente el responsable puede desactivarlo o eliminarlo.',
};

export const ADULTO_APP_ADDED_FEEDBACK = {
  title: 'Aplicación bloqueada',
  message:
    'La aplicación fue agregada a la lista de bloqueo. Recordá que únicamente el responsable puede desactivarla o eliminarla.',
};

/**
 * Evalúa si un sitio o app cumple el filtro rápido por origen de bloqueo:
 * - 'all': muestra todos los registros.
 * - 'adulto_protegido': solo registros agregados desde Modo Protegido Adulto.
 * - 'responsable': registros creados por el responsable (incluyendo existentes sin createdBy).
 */
export function matchesBlockOriginFilter(
  item: { createdBy?: BlockOrigin },
  originFilter: BlockOriginFilter = 'all'
): boolean {
  if (originFilter === 'all') {
    return true;
  }
  if (originFilter === 'adulto_protegido') {
    return item.createdBy === 'ADULTO_PROTEGIDO';
  }
  return item.createdBy !== 'ADULTO_PROTEGIDO';
}

/**
 * Devuelve la etiqueta del identificador visual para las tarjetas del Responsable
 * cuando el bloqueo fue originado por un adulto protegido, o null si fue creado por el responsable.
 */
export function getProtectedAdultOriginLabel(item: {
  createdBy?: BlockOrigin;
  createdByName?: string;
}): string | null {
  if (item.createdBy !== 'ADULTO_PROTEGIDO') {
    return null;
  }
  const cleanName = item.createdByName?.trim();
  if (cleanName && cleanName.toLowerCase() !== 'adulto protegido') {
    return `Bloqueado por ${cleanName} (protegido)`;
  }
  return 'Bloqueado por adulto protegido';
}

/**
 * Formatea el alcance de dispositivos mostrado en el pie de las tarjetas del Responsable.
 */
export function formatBlockCardDeviceScope(
  item: {
    applyToAll?: boolean;
    deviceIds?: string[];
    createdBy?: BlockOrigin;
    sourceDeviceId?: string;
  },
  devices: DeviceInfo[] = []
): string {
  if (item.applyToAll) {
    return 'Todos los dispositivos';
  }
  if (item.createdBy === 'ADULTO_PROTEGIDO') {
    const matchedDevice = devices.find(
      (d) =>
        (item.sourceDeviceId && d.deviceId === item.sourceDeviceId) ||
        item.deviceIds?.includes(d.deviceId)
    );
    if (matchedDevice) {
      return `Dispositivo: ${matchedDevice.childName || matchedDevice.deviceName}`;
    }
    if ((item.deviceIds?.length || 0) > 1) {
      return `${item.deviceIds!.length} dispositivos`;
    }
    return 'Dispositivo adulto protegido';
  }
  const count = item.deviceIds?.length || 0;
  return `${count} ${count === 1 ? 'dispositivo' : 'dispositivos'}`;
}

/**
 * Determina si un elemento bloqueado corresponde al dispositivo del Adulto Protegido actual.
 */
export function isItemVisibleForAdultoDevice(
  item: {
    isActive?: boolean;
    applyToAll?: boolean;
    deviceIds?: string[];
    createdBy?: BlockOrigin;
    sourceDeviceId?: string;
  },
  adultDeviceId?: string
): boolean {
  if (item.isActive === false) {
    return false;
  }
  if (item.applyToAll) {
    return true;
  }
  if (item.createdBy === 'ADULTO_PROTEGIDO') {
    if (!adultDeviceId || !item.sourceDeviceId) {
      return true;
    }
    return (
      item.sourceDeviceId === adultDeviceId ||
      Boolean(item.deviceIds?.includes(adultDeviceId))
    );
  }
  if (adultDeviceId && item.deviceIds?.includes(adultDeviceId)) {
    return true;
  }
  return false;
}

/**
 * Filtra por texto de búsqueda y ordena dominios bloqueados ('date' o 'az').
 */
export function filterAndSortAdultoSites(
  sites: CustomBlockedDomain[],
  search: string,
  sortBy: AdultoSortOption
): CustomBlockedDomain[] {
  const normalizedQuery = search.trim().toLowerCase();

  const filtered = sites.filter((site) =>
    normalizedQuery.length === 0
      ? true
      : site.domain.toLowerCase().includes(normalizedQuery)
  );

  return [...filtered].sort((a, b) => {
    if (sortBy === 'az') {
      return a.domain.localeCompare(b.domain);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Filtra por texto de búsqueda y ordena aplicaciones bloqueadas ('date' o 'az').
 */
export function filterAndSortAdultoApps(
  apps: CustomBlockedApp[],
  search: string,
  sortBy: AdultoSortOption
): CustomBlockedApp[] {
  const normalizedQuery = search.trim().toLowerCase();

  const filtered = apps.filter((app) =>
    normalizedQuery.length === 0
      ? true
      : app.appName.toLowerCase().includes(normalizedQuery)
  );

  return [...filtered].sort((a, b) => {
    if (sortBy === 'az') {
      return a.appName.localeCompare(b.appName);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
