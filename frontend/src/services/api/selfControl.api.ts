// ==============================================================================
// Proyecto: BA Protege+
// Componente: Autocontrol y Autoprotección del Tutor (SelfControl API)
// Archivo: src/services/api/selfControl.api.ts
// ==============================================================================

import {
  SELF_CONTROL_LOCK_HOURS,
  SELF_CONTROL_UNLOCK_WINDOW_HOURS,
  SelfControlState,
} from '../../types';
import { apiClient, safeStorage, timestampProvider } from './client';

export const selfControlApi = {
  // --------------------------------------------------------------------------
  // Autocontrol / Autoprotección del Tutor (Temporizador de 24hs al solicitar y pase de 24hs)
  // --------------------------------------------------------------------------
  async enableSelfControl(): Promise<SelfControlState> {
    const now = await timestampProvider.now();

    await safeStorage.setItem('@ba_protege_self_control_active', 'true');
    await safeStorage.setItem('@ba_protege_self_control_enabled_at', new Date(now).toISOString());
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_requested_at');
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_available_at');
    await safeStorage.removeItem('@ba_protege_self_control_unlocked_at');
    await safeStorage.removeItem('@ba_protege_self_control_auto_relock_at');
    await safeStorage.removeItem('@ba_protege_self_control_can_disable_at');
    await safeStorage.removeItem('@ba_protege_self_control_expires_at');

    try {
      await apiClient.post('/self-control/enable', { enabledAt: now }, { timeout: 1000 });
    } catch (e) {
      // Modo offline / demo
    }

    return this.getSelfControlStatus();
  },

  async requestDeactivation(): Promise<SelfControlState> {
    const current = await this.getSelfControlStatus();
    if (!current.active) return current;

    const now = await timestampProvider.now();
    const deactivationAvailableAt = now + SELF_CONTROL_LOCK_HOURS * 60 * 60 * 1000;

    await safeStorage.setItem(
      '@ba_protege_self_control_deactivation_requested_at',
      new Date(now).toISOString()
    );
    await safeStorage.setItem(
      '@ba_protege_self_control_deactivation_available_at',
      new Date(deactivationAvailableAt).toISOString()
    );

    return this.getSelfControlStatus();
  },

  async confirmDeactivation(): Promise<SelfControlState> {
    const status = await this.getSelfControlStatus();

    if (!status.canDisable || status.status !== 'DEACTIVATION_READY') {
      const waitText = `${status.remainingHours}h ${status.remainingMinutes.toString().padStart(2, '0')}m`;
      throw new Error(
        `La desactivación se habilitará en 24 horas.\nTiempo restante: ${waitText}.`
      );
    }

    const now = await timestampProvider.now();
    const autoRelockAt = now + SELF_CONTROL_UNLOCK_WINDOW_HOURS * 60 * 60 * 1000;

    // Desbloqueo real inmediato con pase temporal de 24 horas
    await safeStorage.setItem('@ba_protege_self_control_active', 'false');
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_requested_at');
    await safeStorage.removeItem('@ba_protege_self_control_deactivation_available_at');
    await safeStorage.setItem('@ba_protege_self_control_unlocked_at', new Date(now).toISOString());
    await safeStorage.setItem('@ba_protege_self_control_auto_relock_at', new Date(autoRelockAt).toISOString());

    try {
      await apiClient.post('/self-control/disable', { autoRelockAt }, { timeout: 1000 });
    } catch (e) {
      // Modo offline / demo
    }

    return this.getSelfControlStatus();
  },

  async disableSelfControl(): Promise<SelfControlState> {
    const status = await this.getSelfControlStatus();

    // Caso 1: Autoprotección activa sin solicitud previa -> Clic 1: Inicia temporizador de 24hs
    if (status.status === 'ACTIVE_LOCKED') {
      return this.requestDeactivation();
    }

    // Caso 2: Temporizador corriendo pero aún no pasaron 24hs
    if (status.status === 'DEACTIVATION_PENDING') {
      const waitText = `${status.remainingHours}h ${status.remainingMinutes.toString().padStart(2, '0')}m`;
      throw new Error(
        `La desactivación se habilitará en 24 horas.\nTiempo restante: ${waitText}.`
      );
    }

    // Caso 3: Ya pasaron las 24hs -> Clic 2: Desbloqueo real inmediato con pase temporal
    if (status.status === 'DEACTIVATION_READY' || status.canDisable) {
      return this.confirmDeactivation();
    }

    return status;
  },

  async getSelfControlStatus(): Promise<SelfControlState> {
    const now = await timestampProvider.now();
    const activeStr = await safeStorage.getItem('@ba_protege_self_control_active');
    const enabledAt = await safeStorage.getItem('@ba_protege_self_control_enabled_at');
    const deactivationRequestedAt = await safeStorage.getItem(
      '@ba_protege_self_control_deactivation_requested_at'
    );
    const deactivationAvailableAt =
      (await safeStorage.getItem('@ba_protege_self_control_deactivation_available_at')) ||
      (await safeStorage.getItem('@ba_protege_self_control_can_disable_at')) ||
      (await safeStorage.getItem('@ba_protege_self_control_expires_at'));
    const unlockedAt = await safeStorage.getItem('@ba_protege_self_control_unlocked_at');
    const autoRelockAt = await safeStorage.getItem('@ba_protege_self_control_auto_relock_at');

    // 1. Caso: Pase temporal de 24 horas activo
    if (unlockedAt && autoRelockAt && activeStr !== 'true') {
      const autoRelockTime = new Date(autoRelockAt).getTime();
      if (now >= autoRelockTime) {
        // Cumplido el plazo de 24hs de pase temporal -> se vuelve a activar automáticamente!
        return this.enableSelfControl();
      }

      const remainingUnlockMs = Math.max(0, autoRelockTime - now);
      const remainingUnlockTotalSeconds = Math.floor(remainingUnlockMs / 1000);
      const remainingUnlockHours = Math.floor(remainingUnlockTotalSeconds / 3600);
      const remainingUnlockMinutes = Math.floor((remainingUnlockTotalSeconds % 3600) / 60);
      const remainingUnlockSeconds = remainingUnlockTotalSeconds % 60;

      return {
        active: false,
        status: 'TEMPORARILY_UNLOCKED',
        enabledAt: null,
        deactivationRequestedAt: null,
        deactivationAvailableAt: null,
        canDisableAt: null,
        expiresAt: autoRelockAt,
        canDisable: false,
        unlockedAt,
        autoRelockAt,
        remainingHours: remainingUnlockHours,
        remainingMinutes: remainingUnlockMinutes,
        remainingSeconds: remainingUnlockSeconds,
        remainingUnlockHours,
        remainingUnlockMinutes,
        remainingUnlockSeconds,
      };
    }

    const isActive = activeStr === 'true';

    // 2. Caso: Inactivo totalmente
    if (!isActive || !enabledAt) {
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

    // 3. Caso: Autoprotección activa con solicitud de desactivación iniciada
    if (deactivationAvailableAt) {
      const availableTime = new Date(deactivationAvailableAt).getTime();
      const remainingWaitMs = availableTime - now;

      if (remainingWaitMs <= 0) {
        // Pasaron las 24 horas: el botón cambia de estado para permitir el desbloqueo real (segundo clic)
        return {
          active: true,
          status: 'DEACTIVATION_READY',
          enabledAt,
          deactivationRequestedAt,
          deactivationAvailableAt,
          canDisableAt: deactivationAvailableAt,
          expiresAt: deactivationAvailableAt,
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

      // Temporizador de 24 horas corriendo: la desactivación se habilitará en 24 horas
      const totalWaitSeconds = Math.max(0, Math.floor(remainingWaitMs / 1000));
      const remainingWaitHours = Math.floor(totalWaitSeconds / 3600);
      const remainingWaitMinutes = Math.floor((totalWaitSeconds % 3600) / 60);
      const remainingWaitSeconds = totalWaitSeconds % 60;

      return {
        active: true,
        status: 'DEACTIVATION_PENDING',
        enabledAt,
        deactivationRequestedAt,
        deactivationAvailableAt,
        canDisableAt: deactivationAvailableAt,
        expiresAt: deactivationAvailableAt,
        canDisable: false,
        unlockedAt: null,
        autoRelockAt: null,
        remainingHours: remainingWaitHours,
        remainingMinutes: remainingWaitMinutes,
        remainingSeconds: remainingWaitSeconds,
        remainingWaitHours,
        remainingWaitMinutes,
        remainingWaitSeconds,
      };
    }

    // 4. Caso: Autoprotección activa estándar (muestra botón "Desactivar autoprotección")
    return {
      active: true,
      status: 'ACTIVE_LOCKED',
      enabledAt,
      deactivationRequestedAt: null,
      deactivationAvailableAt: null,
      canDisableAt: null,
      expiresAt: null,
      canDisable: false,
      unlockedAt: null,
      autoRelockAt: null,
      remainingHours: 0,
      remainingMinutes: 0,
    };
  },
};
