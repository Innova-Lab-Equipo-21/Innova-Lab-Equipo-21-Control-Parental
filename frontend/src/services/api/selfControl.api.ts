// ==============================================================================
// Proyecto: BA Protege+
// Componente: Autoprotección del Tutor (SelfControl API)
// Archivo: src/services/api/selfControl.api.ts
// Descripción: Máquina de estados de Autoprotección del Responsable:
//              - Estado inicial: desactivado (INACTIVE)
//              - Al activar (con doble confirmación): cuenta tiempo de 24h para
//                desactivación manteniendo la función activada (ACTIVE_LOCKED).
//                En este período, la desactivación NO está permitida.
//              - Al pasar 24h: permite la desactivación de la función (DEACTIVATION_READY).
//                Al desactivar, vuelve al estado inicial desactivado.
// ==============================================================================

import {
  SELF_CONTROL_LOCK_HOURS,
  SelfControlState,
} from '../../types';
import { apiClient, safeStorage, timestampProvider } from './client';

export const selfControlApi = {
  // --------------------------------------------------------------------------
  // Limpiar todo el estado de Autoprotección (Reinicio al estado inicial desactivado)
  // --------------------------------------------------------------------------
  async resetSelfControl(): Promise<SelfControlState> {
    await safeStorage.setItem('@ba_protege_self_control_active', 'false');
    await safeStorage.removeItem('@ba_protege_self_control_enabled_at');
    await safeStorage.removeItem('@ba_protege_self_control_can_disable_at');
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_requested_at');
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_available_at');
    await safeStorage.removeItem('@ba_protege_self_control_unlocked_at');
    await safeStorage.removeItem('@ba_protege_self_control_auto_relock_at');
    await safeStorage.removeItem('@ba_protege_self_control_expires_at');

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
    };
  },

  // --------------------------------------------------------------------------
  // Activación de Autoprotección: inicia el cronómetro de 24 horas para desactivación
  // --------------------------------------------------------------------------
  async enableSelfControl(): Promise<SelfControlState> {
    const now = await timestampProvider.now();
    const canDisableAt = now + SELF_CONTROL_LOCK_HOURS * 60 * 60 * 1000;

    await safeStorage.setItem('@ba_protege_self_control_active', 'true');
    await safeStorage.setItem('@ba_protege_self_control_enabled_at', new Date(now).toISOString());
    await safeStorage.setItem('@ba_protege_self_control_can_disable_at', new Date(canDisableAt).toISOString());
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_requested_at');
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_available_at');
    await safeStorage.removeItem('@ba_protege_self_control_unlocked_at');
    await safeStorage.removeItem('@ba_protege_self_control_auto_relock_at');
    await safeStorage.removeItem('@ba_protege_self_control_expires_at');

    try {
      await apiClient.post('/self-control/enable', { enabledAt: now }, { timeout: 10000 });
    } catch (e) {
      // Modo offline / demo
    }

    return this.getSelfControlStatus();
  },

  // --------------------------------------------------------------------------
  // Desactivación de Autoprotección: solo permitida tras cumplirse las 24 horas
  // --------------------------------------------------------------------------
  async disableSelfControl(): Promise<SelfControlState> {
    const status = await this.getSelfControlStatus();

    // Si aún no pasaron las 24h, la desactivación NO está permitida
    if (!status.canDisable || status.status === 'ACTIVE_LOCKED') {
      const waitText = `${status.remainingHours}h ${status.remainingMinutes.toString().padStart(2, '0')}m`;
      throw new Error(
        `La desactivación no está permitida durante el período de protección obligatoria de 24 horas.\nTiempo restante: ${waitText}.`
      );
    }

    // Pasadas las 24h: desactiva y vuelve al estado inicial desactivado
    return this.resetSelfControl();
  },

  // Compatibilidad con flujos heredados
  async requestDeactivation(): Promise<SelfControlState> {
    return this.disableSelfControl();
  },

  async confirmDeactivation(): Promise<SelfControlState> {
    return this.disableSelfControl();
  },

  // --------------------------------------------------------------------------
  // Consulta del estado actual de Autoprotección
  // --------------------------------------------------------------------------
  async getSelfControlStatus(): Promise<SelfControlState> {
    const now = await timestampProvider.now();
    const activeStr = await safeStorage.getItem('@ba_protege_self_control_active');
    const enabledAt = await safeStorage.getItem('@ba_protege_self_control_enabled_at');
    const canDisableAt = await safeStorage.getItem('@ba_protege_self_control_can_disable_at');

    const isActive = activeStr === 'true';

    // 1. Estado inicial o desactivado: limpia residuos de claves previas
    if (!isActive || !enabledAt) {
      await safeStorage.removeItem('@ba_protege_self_control_active');
      await safeStorage.removeItem('@ba_protege_self_control_enabled_at');
      await safeStorage.removeItem('@ba_protege_self_control_can_disable_at');
      await safeStorage.removeItem('@ba_protege_self_control_deactivation_requested_at');
      await safeStorage.removeItem('@ba_protege_self_control_deactivation_available_at');
      await safeStorage.removeItem('@ba_protege_self_control_unlocked_at');
      await safeStorage.removeItem('@ba_protege_self_control_auto_relock_at');
      await safeStorage.removeItem('@ba_protege_self_control_expires_at');

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
      };
    }

    // 2. Estado activo: calcular tiempo restante de las 24 horas desde la activación
    const enabledTime = new Date(enabledAt).getTime();
    const targetCanDisableTime = canDisableAt
      ? new Date(canDisableAt).getTime()
      : enabledTime + SELF_CONTROL_LOCK_HOURS * 60 * 60 * 1000;

    const remainingMs = targetCanDisableTime - now;

    // Caso A: Aún no pasaron las 24h -> Función activa y desactivación NO permitida
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
        canDisable: false, // Desactivación NO permitida
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

    // Caso B: Ya pasaron las 24h -> Función continúa activa pero desactivación pasa a estar PERMITIDA
    return {
      active: true,
      status: 'DEACTIVATION_READY',
      enabledAt,
      deactivationRequestedAt: null,
      deactivationAvailableAt: new Date(targetCanDisableTime).toISOString(),
      canDisableAt: new Date(targetCanDisableTime).toISOString(),
      expiresAt: null,
      canDisable: true, // Desactivación PERMITIDA
      unlockedAt: null,
      autoRelockAt: null,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      remainingWaitHours: 0,
      remainingWaitMinutes: 0,
      remainingWaitSeconds: 0,
    };
  },
};
