// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Autocontrol del Responsable (24h en PostgreSQL)
// Archivo: tests/selfControl.test.ts
// Descripción: Valida el ciclo de vida de Autoprotección conectado a /self-control/*
//              en PostgreSQL, bloqueo obligatorio de 24 horas y reglas de habilitación.
// ==============================================================================

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_PROTECTED_DEVICES,
  SELF_CONTROL_LOCK_HOURS,
} from '../src/types/index.js';
import { apiService } from '../src/services/api.service.js';
import { apiClient, safeStorage } from '../src/services/api/client.js';
import {
  isItemEnabledForResponsable,
  hasActiveSitesOrAppsForResponsable,
} from '../src/utils/responsibleFirstAccess.js';

const LOCK_MS = SELF_CONTROL_LOCK_HOURS * 60 * 60 * 1000;

describe('Autocontrol del Tutor y Límite de 5 Dispositivos', () => {
  const originalGet = apiClient.get.bind(apiClient);
  const originalPost = apiClient.post.bind(apiClient);
  let simulatedNow = 1700000000000;
  let serverActive = false;
  let serverEnabledAt: number | null = null;

  const buildServerDto = () => {
    if (!serverActive || serverEnabledAt === null) {
      return {
        active: false,
        status: 'INACTIVE',
        enabledAt: null,
        deactivationRequestedAt: null,
        deactivationAvailableAt: null,
        canDisableAt: null,
        canDisable: true,
        remainingHours: 0,
        remainingMinutes: 0,
        remainingSeconds: 0,
        serverTime: new Date(simulatedNow).toISOString(),
      };
    }

    const canDisableAtMs = serverEnabledAt + LOCK_MS;
    const remainingMs = canDisableAtMs - simulatedNow;

    if (remainingMs > 0) {
      const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
      return {
        active: true,
        status: 'ACTIVE_LOCKED',
        enabledAt: new Date(serverEnabledAt).toISOString(),
        deactivationRequestedAt: null,
        deactivationAvailableAt: new Date(canDisableAtMs).toISOString(),
        canDisableAt: new Date(canDisableAtMs).toISOString(),
        canDisable: false,
        remainingHours: Math.floor(totalSeconds / 3600),
        remainingMinutes: Math.floor((totalSeconds % 3600) / 60),
        remainingSeconds: totalSeconds % 60,
        serverTime: new Date(simulatedNow).toISOString(),
      };
    }

    return {
      active: true,
      status: 'DEACTIVATION_READY',
      enabledAt: new Date(serverEnabledAt).toISOString(),
      deactivationRequestedAt: null,
      deactivationAvailableAt: new Date(canDisableAtMs).toISOString(),
      canDisableAt: new Date(canDisableAtMs).toISOString(),
      canDisable: true,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      serverTime: new Date(simulatedNow).toISOString(),
    };
  };

  beforeEach(async () => {
    simulatedNow = 1700000000000;
    serverActive = false;
    serverEnabledAt = null;
    safeStorage.clearMemory();
    apiService.getReliableTimestamp = async () => simulatedNow;

    (apiClient as any).get = async (url: string) => {
      if (url === '/self-control/status') {
        return { data: { success: true, data: buildServerDto() } };
      }
      throw new Error(`Unexpected GET ${url}`);
    };

    (apiClient as any).post = async (url: string) => {
      if (url === '/self-control/enable') {
        serverActive = true;
        serverEnabledAt = simulatedNow;
        return { data: { success: true, data: buildServerDto() } };
      }
      if (url === '/self-control/disable') {
        const dto = buildServerDto();
        if (dto.active && !dto.canDisable) {
          const err: any = new Error('Conflict');
          err.response = {
            status: 409,
            data: {
              message: `La desactivación no está permitida durante el período de protección obligatoria de 24 horas. Tiempo restante: ${dto.remainingHours}h ${dto.remainingMinutes.toString().padStart(2, '0')}m.`,
            },
          };
          throw err;
        }
        serverActive = false;
        serverEnabledAt = null;
        return { data: { success: true, data: buildServerDto() } };
      }
      throw new Error(`Unexpected POST ${url}`);
    };
  });

  afterEach(() => {
    (apiClient as any).get = originalGet;
    (apiClient as any).post = originalPost;
    safeStorage.clearMemory();
  });

  test('El límite máximo de dispositivos por responsable debe ser 5', () => {
    assert.equal(MAX_PROTECTED_DEVICES, 5, 'El límite de dispositivos debe ser exactamente 5');
  });

  test('La duración del período de protección obligatoria antes de permitir desactivar debe ser de 24 horas', () => {
    assert.equal(SELF_CONTROL_LOCK_HOURS, 24, 'El temporizador de espera debe requerir 24 horas');
  });

  test('1- Estado inicial: desactivado (INACTIVE, active=false)', async () => {
    const status = await apiService.getSelfControlStatus();
    assert.equal(status.active, false, 'El estado inicial debe ser inactivo');
    assert.equal(status.status, 'INACTIVE', 'El status debe ser INACTIVE');
    assert.equal(status.canDisable, true);
  });

  test('2- Al activar, persiste en /self-control/enable y cuenta 24h bloqueadas', async () => {
    const status = await apiService.enableSelfControl();
    assert.equal(status.active, true, 'La función debe quedar activada');
    assert.equal(status.status, 'ACTIVE_LOCKED', 'El status debe ser ACTIVE_LOCKED');
    assert.equal(status.canDisable, false, 'En ese período, la desactivación NO está permitida');
    assert.equal(status.remainingHours, 24, 'Restan 24 horas para permitir desactivar');
  });

  test('3- Durante las 24h, /self-control/disable rechaza la desactivación con error real', async () => {
    await apiService.enableSelfControl();

    // Avanzar 10 horas (aún restan 14 horas de protección)
    simulatedNow += 10 * 3600 * 1000;

    const midStatus = await apiService.getSelfControlStatus();
    assert.equal(midStatus.active, true, 'Sigue activa');
    assert.equal(midStatus.status, 'ACTIVE_LOCKED');
    assert.equal(midStatus.canDisable, false, 'Sigue sin permitir desactivación');
    assert.equal(midStatus.remainingHours, 14, 'Deben restar 14 horas');

    await assert.rejects(
      async () => {
        await apiService.disableSelfControl();
      },
      (err: any) => {
        return err instanceof Error && /no está permitida/i.test(err.message);
      },
      'Debe advertir que la desactivación no está permitida durante las 24 horas'
    );
  });

  test('4- Al pasar 24h, pasa a DEACTIVATION_READY y permite desactivar', async () => {
    await apiService.enableSelfControl();

    // Avanzar 25 horas (ya pasaron las 24h)
    simulatedNow += 25 * 3600 * 1000;

    const readyStatus = await apiService.getSelfControlStatus();
    assert.equal(readyStatus.active, true, 'Permanece activa hasta que el tutor decida desactivarla');
    assert.equal(readyStatus.status, 'DEACTIVATION_READY', 'Pasa a estado DEACTIVATION_READY');
    assert.equal(readyStatus.canDisable, true, 'Ahora la desactivación es permitida');
  });

  test('5- Al desactivar una vez pasadas las 24h, vuelve a INACTIVE en el servidor', async () => {
    await apiService.enableSelfControl();
    simulatedNow += 25 * 3600 * 1000;

    const disabledStatus = await apiService.disableSelfControl();
    assert.equal(disabledStatus.active, false, 'La función queda desativada');
    assert.equal(disabledStatus.status, 'INACTIVE', 'Vuelve al estado inicial INACTIVE');
    assert.equal(disabledStatus.enabledAt, null);
    assert.equal(disabledStatus.canDisableAt, null);
  });

  test('6- Al volver a activar manualmente, el tiempo de 24 horas vuelve a correr desde el inicio', async () => {
    await apiService.enableSelfControl();
    simulatedNow += 25 * 3600 * 1000;
    await apiService.disableSelfControl();

    // Reactivar manualmente
    simulatedNow += 5 * 3600 * 1000;
    const reactivated = await apiService.enableSelfControl();
    assert.equal(reactivated.active, true, 'Se activa nuevamente');
    assert.equal(reactivated.status, 'ACTIVE_LOCKED');
    assert.equal(reactivated.canDisable, false, 'El tiempo de 24h vuelve a correr');
    assert.equal(reactivated.remainingHours, 24);
  });

  test('7- Autoprotección debe estar deshabilitada solo cuando no hay sitios ni apps registrados', () => {
    const isAutoproteccionDisabled = (sitesCount: number, appsCount: number, isActive = false) =>
      !isActive && sitesCount + appsCount === 0;

    assert.equal(isAutoproteccionDisabled(0, 0), true, 'Sin sitios ni apps debe estar deshabilitada');
    assert.equal(isAutoproteccionDisabled(1, 0), false, 'Con al menos 1 sitio y 0 apps debe estar habilitada');
    assert.equal(isAutoproteccionDisabled(0, 1), false, 'Con 0 sitios y al menos 1 app debe estar habilitada');
    assert.equal(isAutoproteccionDisabled(2, 1), false, 'Con sitios y apps debe estar habilitada');
    assert.equal(isAutoproteccionDisabled(0, 0, true), false, 'Si ya está activa debe permitir consultar estado');
  });

  test('8- Autoprotección solo debe estar disponible si existe al menos un sitio o app habilitada para el Responsable', () => {
    const siteOnlyProtectedDevice = {
      id: 'site-1',
      domain: 'casino.bet',
      isActive: true,
      applyToAll: false,
      deviceIds: ['device-protected-1'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(isItemEnabledForResponsable(siteOnlyProtectedDevice), false);
    assert.equal(hasActiveSitesOrAppsForResponsable([siteOnlyProtectedDevice], []), false);

    const siteGlobal = {
      id: 'site-2',
      domain: 'apuestas.com',
      isActive: true,
      applyToAll: true,
      deviceIds: ['device-protected-1'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(isItemEnabledForResponsable(siteGlobal), true);
    assert.equal(hasActiveSitesOrAppsForResponsable([siteGlobal], []), true);

    const siteSelf = {
      id: 'site-3',
      domain: 'ruleta.bet',
      isActive: true,
      applyToAll: false,
      deviceIds: ['self'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(isItemEnabledForResponsable(siteSelf), true);
    assert.equal(hasActiveSitesOrAppsForResponsable([siteSelf], []), true);

    const siteSelfInactive = {
      id: 'site-4',
      domain: 'poker.net',
      isActive: false,
      applyToAll: false,
      deviceIds: ['self'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(isItemEnabledForResponsable(siteSelfInactive), false);
    assert.equal(hasActiveSitesOrAppsForResponsable([siteSelfInactive], []), false);

    const appOnlyProtected = {
      id: 'app-1',
      appName: 'Casino App',
      packageName: 'com.casino.app',
      isActive: true,
      applyToAll: false,
      deviceIds: ['device-protected-1'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(isItemEnabledForResponsable(appOnlyProtected), false);
    assert.equal(hasActiveSitesOrAppsForResponsable([], [appOnlyProtected]), false);

    const appSelf = {
      id: 'app-2',
      appName: 'Bet App',
      packageName: 'com.bet.app',
      isActive: true,
      applyToAll: false,
      deviceIds: ['self'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(isItemEnabledForResponsable(appSelf), true);
    assert.equal(hasActiveSitesOrAppsForResponsable([], [appSelf]), true);
  });
});
