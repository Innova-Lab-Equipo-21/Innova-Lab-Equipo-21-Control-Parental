// ==============================================================================
// Proyecto: BA Protege+
// Componente: Autoprotección del Tutor (SelfControl API)
// Archivo: src/services/api/selfControl.api.ts
// Descripción: Gestión 100% real contra PostgreSQL (/self-control/*) de la
//              Autoprotección del Responsable con bloqueo obligatorio de 24 horas:
//              - Estado inicial: desactivado (INACTIVE)
//              - Al activar (con doble confirmación): persiste en PostgreSQL y cuenta
//                24h obligatorias (ACTIVE_LOCKED) sin permitir desactivación.
//              - Al pasar 24h: permite la desactivación (DEACTIVATION_READY).
//              - Al desactivar: persiste en PostgreSQL y vuelve a INACTIVE.
// ==============================================================================

import {
  SELF_CONTROL_LOCK_HOURS,
  SelfControlState,
} from '../../types';
import { apiClient, safeStorage, timestampProvider } from './client';

const SELF_CONTROL_CACHE_KEYS = [
  '@ba_protege_self_control_active',
  '@ba_protege_self_control_enabled_at',
  '@ba_protege_self_control_can_disable_at',
  '@ba_protege_self_control_deactivation_requested_at',
  '@ba_protege_self_control_deactivation_available_at',
  '@ba_protege_self_control_unlocked_at',
  '@ba_protege_self_control_auto_relock_at',
  '@ba_protege_self_control_expires_at',
] as const;

function extractSelfControlError(err: any, fallback: string): string {
  const apiMessage = err?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
    return apiMessage.trim();
  }
  if (
    typeof err?.message === 'string' &&
    err.message.trim().length > 0 &&
    !err.message.includes('status code')
  ) {
    return err.message.trim();
  }
  return fallback;
}

function createInactiveState(): SelfControlState {
  return {
    active: false,
    status: 'INACTIVE',
    enabledAt: null,
    deactivationRequestedAt: null,
    deactivationAvailableAt: null,
    canDisableAt: null,
    expiresAt: null,
    canDisable: true,
    unlockedAt: null,
    autoRelockAt: null,
    remainingHours: 0,
    remainingMinutes: 0,
    remainingSeconds: 0,
    remainingWaitHours: 0,
    remainingWaitMinutes: 0,
    remainingWaitSeconds: 0,
  };
}

function normalizeServerSelfControlDTO(dto: any): SelfControlState {
  if (!dto || !dto.active || dto.status === 'INACTIVE') {
    return createInactiveState();
  }

  const remainingHours = Math.max(0, Number(dto.remainingHours ?? 0));
  const remainingMinutes = Math.max(0, Number(dto.remainingMinutes ?? 0));
  const remainingSeconds = Math.max(0, Number(dto.remainingSeconds ?? 0));
  const status =
    dto.status === 'DEACTIVATION_READY' || dto.canDisable === true
      ? 'DEACTIVATION_READY'
      : 'ACTIVE_LOCKED';

  return {
    active: true,
    status,
    enabledAt: dto.enabledAt ?? null,
    deactivationRequestedAt: dto.deactivationRequestedAt ?? null,
    deactivationAvailableAt: dto.deactivationAvailableAt ?? dto.canDisableAt ?? null,
    canDisableAt: dto.canDisableAt ?? dto.deactivationAvailableAt ?? null,
    expiresAt: null,
    canDisable: status === 'DEACTIVATION_READY',
    unlockedAt: null,
    autoRelockAt: null,
    remainingHours,
    remainingMinutes,
    remainingSeconds,
    remainingWaitHours: remainingHours,
    remainingWaitMinutes: remainingMinutes,
    remainingWaitSeconds: remainingSeconds,
  };
}

async function clearSelfControlCache(): Promise<void> {
  for (const key of SELF_CONTROL_CACHE_KEYS) {
    await safeStorage.removeItem(key);
  }
}

async function syncSelfControlCache(state: SelfControlState): Promise<void> {
  if (!state.active || !state.enabledAt) {
    await clearSelfControlCache();
    await safeStorage.setItem('@ba_protege_self_control_active', 'false');
    return;
  }

  await safeStorage.setItem('@ba_protege_self_control_active', 'true');
  await safeStorage.setItem('@ba_protege_self_control_enabled_at', state.enabledAt);
  if (state.canDisableAt) {
    await safeStorage.setItem('@ba_protege_self_control_can_disable_at', state.canDisableAt);
  }
  await safeStorage.removeItem('@ba_protege_self_control_deactivation_requested_at');
  await safeStorage.removeItem('@ba_protege_self_control_deactivation_available_at');
  await safeStorage.removeItem('@ba_protege_self_control_unlocked_at');
  await safeStorage.removeItem('@ba_protege_self_control_auto_relock_at');
  await safeStorage.removeItem('@ba_protege_self_control_expires_at');
}

async function readCachedSelfControlStatus(): Promise<SelfControlState> {
  const now = await timestampProvider.now();
  const activeStr = await safeStorage.getItem('@ba_protege_self_control_active');
  const enabledAt = await safeStorage.getItem('@ba_protege_self_control_enabled_at');
  const canDisableAt = await safeStorage.getItem('@ba_protege_self_control_can_disable_at');

  if (activeStr !== 'true' || !enabledAt) {
    return createInactiveState();
  }

  const enabledTime = new Date(enabledAt).getTime();
  const targetCanDisableTime = canDisableAt
    ? new Date(canDisableAt).getTime()
    : enabledTime + SELF_CONTROL_LOCK_HOURS * 60 * 60 * 1000;

  const remainingMs = targetCanDisableTime - now;

  if (remainingMs > 0) {
    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const remainingHours = Math.floor(totalSeconds / 3600);
    const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    return {
      active: true,
      status: 'ACTIVE_LOCKED',
      enabledAt,
      deactivationRequestedAt: null,
      deactivationAvailableAt: new Date(targetCanDisableTime).toISOString(),
      canDisableAt: new Date(targetCanDisableTime).toISOString(),
      expiresAt: null,
      canDisable: false,
      unlockedAt: null,
      autoRelockAt: null,
      remainingHours,
      remainingMinutes,
      remainingSeconds,
      remainingWaitHours: remainingHours,
      remainingWaitMinutes: remainingMinutes,
      remainingWaitSeconds: remainingSeconds,
    };
  }

  return {
    active: true,
    status: 'DEACTIVATION_READY',
    enabledAt,
    deactivationRequestedAt: null,
    deactivationAvailableAt: new Date(targetCanDisableTime).toISOString(),
    canDisableAt: new Date(targetCanDisableTime).toISOString(),
    expiresAt: null,
    canDisable: true,
    unlockedAt: null,
    autoRelockAt: null,
    remainingHours: 0,
    remainingMinutes: 0,
    remainingSeconds: 0,
    remainingWaitHours: 0,
    remainingWaitMinutes: 0,
    remainingWaitSeconds: 0,
  };
}

export const selfControlApi = {
  // --------------------------------------------------------------------------
  // Limpiar caché local de Autoprotección (ej. al cerrar sesión o en pruebas)
  // --------------------------------------------------------------------------
  async resetSelfControl(): Promise<SelfControlState> {
    await clearSelfControlCache();
    await safeStorage.setItem('@ba_protege_self_control_active', 'false');
    return createInactiveState();
  },

  // --------------------------------------------------------------------------
  // Activación de Autoprotección: persiste en PostgreSQL y activa bloqueo 24h
  // --------------------------------------------------------------------------
  async enableSelfControl(): Promise<SelfControlState> {
    try {
      const response = await apiClient.post('/self-control/enable', {}, { timeout: 10000 });
      const serverData = response.data?.data;
      if (!serverData) {
        throw new Error('El servidor no devolvió el estado actualizado de autoprotección.');
      }

      const normalized = normalizeServerSelfControlDTO(serverData);
      await syncSelfControlCache(normalized);
      return normalized;
    } catch (err: any) {
      throw new Error(
        extractSelfControlError(
          err,
          'No se pudo activar la autoprotección. Verificá tu conexión e intentá nuevamente.'
        )
      );
    }
  },

  // --------------------------------------------------------------------------
  // Desactivación de Autoprotección: validada y persistida en PostgreSQL
  // --------------------------------------------------------------------------
  async disableSelfControl(): Promise<SelfControlState> {
    try {
      const response = await apiClient.post('/self-control/disable', {}, { timeout: 10000 });
      const serverData = response.data?.data;
      const normalized = serverData
        ? normalizeServerSelfControlDTO(serverData)
        : createInactiveState();
      await syncSelfControlCache(normalized);
      return normalized;
    } catch (err: any) {
      throw new Error(
        extractSelfControlError(
          err,
          'No se pudo desactivar la autoprotección. Verificá tu conexión e intentá nuevamente.'
        )
      );
    }
  },

  // Compatibilidad con flujos heredados
  async requestDeactivation(): Promise<SelfControlState> {
    return this.disableSelfControl();
  },

  async confirmDeactivation(): Promise<SelfControlState> {
    return this.disableSelfControl();
  },

  // --------------------------------------------------------------------------
  // Consulta del estado actual de Autoprotección (PostgreSQL como fuente de verdad)
  // --------------------------------------------------------------------------
  async getSelfControlStatus(): Promise<SelfControlState> {
    try {
      const response = await apiClient.get('/self-control/status', { timeout: 10000 });
      const serverData = response.data?.data;
      if (serverData) {
        const normalized = normalizeServerSelfControlDTO(serverData);
        await syncSelfControlCache(normalized);
        return normalized;
      }
      const inactive = createInactiveState();
      await syncSelfControlCache(inactive);
      return inactive;
    } catch (err: any) {
      // Solo lectura desde caché local si el dispositivo está estrictamente sin conexión
      if (!err?.response) {
        return readCachedSelfControlStatus();
      }
      throw new Error(
        extractSelfControlError(
          err,
          'No se pudo consultar el estado de autoprotección.'
        )
      );
    }
  },
};
