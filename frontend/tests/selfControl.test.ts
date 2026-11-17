import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_PROTECTED_DEVICES,
  SELF_CONTROL_LOCK_HOURS,
} from '../src/types/index.js';
import { apiService } from '../src/services/api.service.js';
import {
  isItemEnabledForResponsable,
  hasActiveSitesOrAppsForResponsable,
} from '../src/utils/responsibleFirstAccess.js';

describe('Autocontrol del Tutor y Límite de 5 Dispositivos', () => {
  test('El límite máximo de dispositivos por responsable debe ser 5', () => {
    assert.equal(MAX_PROTECTED_DEVICES, 5, 'El límite de dispositivos debe ser exactamente 5');
  });

  test('La duración del período de protección obligatoria antes de permitir desactivar debe ser de 24 horas', () => {
    assert.equal(SELF_CONTROL_LOCK_HOURS, 24, 'El temporizador de espera debe requerir 24 horas');
  });

  test('1- Estado inicial: desativado (INACTIVE, active=false)', async () => {
    const status = await apiService.resetSelfControl();
    assert.equal(status.active, false, 'El estado inicial debe ser inactivo');
    assert.equal(status.status, 'INACTIVE', 'El status debe ser INACTIVE');
    assert.equal(status.canDisable, true);
  });

  test('2- Ao ativar, contar tempo (24h) para desativação mantendo a função ativada e bloqueada', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;

    const status = await apiService.enableSelfControl();
    assert.equal(status.active, true, 'La función debe quedar activada');
    assert.equal(status.status, 'ACTIVE_LOCKED', 'El status debe ser ACTIVE_LOCKED');
    assert.equal(status.canDisable, false, 'En ese período, la desactivación NO está permitida');
    assert.equal(status.remainingHours, 24, 'Restan 24 horas para permitir desactivar');
  });

  test('3- Nesse período de 24h, a desativação não é permitida (mostrar aviso / erro ao tentar desativar)', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;
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

  test('4- Ao passar 24h, permitir a desativação da função (DEACTIVATION_READY y canDisable=true)', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;
    await apiService.enableSelfControl();

    // Avanzar 25 horas (ya pasaron las 24h)
    simulatedNow += 25 * 3600 * 1000;

    const readyStatus = await apiService.getSelfControlStatus();
    assert.equal(readyStatus.active, true, 'Permanece activa hasta que el tutor decida desactivarla');
    assert.equal(readyStatus.status, 'DEACTIVATION_READY', 'Pasa a estado DEACTIVATION_READY');
    assert.equal(readyStatus.canDisable, true, 'Ahora la desactivación es permitida');
  });

  test('5- Al desactivar una vez pasadas las 24h, vuelve al estado inicial desativado (INACTIVE, active=false)', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;
    await apiService.enableSelfControl();

    // Avanzar 25 horas
    simulatedNow += 25 * 3600 * 1000;

    // Desactivar
    const disabledStatus = await apiService.disableSelfControl();
    assert.equal(disabledStatus.active, false, 'La función queda desativada');
    assert.equal(disabledStatus.status, 'INACTIVE', 'Vuelve al estado inicial INACTIVE');
    assert.equal(disabledStatus.enabledAt, null);
    assert.equal(disabledStatus.canDisableAt, null);
  });

  test('6- Al volver a activar manualmente, el tiempo de 24 horas vuelve a correr desde el inicio', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;
    await apiService.enableSelfControl();
    simulatedNow += 25 * 3600 * 1000;
    await apiService.disableSelfControl(); // Desativada

    // Reactivar manualmente
    simulatedNow += 5 * 3600 * 1000;
    const reactivated = await apiService.enableSelfControl();
    assert.equal(reactivated.active, true, 'Se activa nuevamente');
    assert.equal(reactivated.status, 'ACTIVE_LOCKED');
    assert.equal(reactivated.canDisable, false, 'El tiempo de 24h vuelve a correr');
    assert.equal(reactivated.remainingHours, 24);
  });

  test('7- Autoprotección debe estar deshabilitada solo cuando no hay sitios ni apps registrados (0 sitios y 0 apps) y habilitada si existe al menos uno', () => {
    const isAutoproteccionDisabled = (sitesCount: number, appsCount: number, isActive = false) =>
      !isActive && sitesCount + appsCount === 0;

    assert.equal(isAutoproteccionDisabled(0, 0), true, 'Sin sitios ni apps debe estar deshabilitada');
    assert.equal(isAutoproteccionDisabled(1, 0), false, 'Con al menos 1 sitio y 0 apps debe estar habilitada');
    assert.equal(isAutoproteccionDisabled(0, 1), false, 'Con 0 sitios y al menos 1 app debe estar habilitada');
    assert.equal(isAutoproteccionDisabled(2, 1), false, 'Con sitios y apps debe estar habilitada');
    assert.equal(isAutoproteccionDisabled(0, 0, true), false, 'Si ya está activa debe permitir consultar estado');
  });

  test('8- Autoprotección solo debe estar disponible si existe al menos un sitio o app habilitada para el dispositivo del Responsable ("Mi dispositivo")', () => {
    // Caso 1: Sitio con applyToAll: false y asignado solo a dispositivo protegido (ej: casino.bet)
    const siteOnlyProtectedDevice = {
      id: 'site-1',
      domain: 'casino.bet',
      isActive: true,
      applyToAll: false,
      deviceIds: ['device-protected-1'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(
      isItemEnabledForResponsable(siteOnlyProtectedDevice),
      false,
      'Un sitio asignado solo a un dispositivo protegido no debe contar para el Responsable'
    );
    assert.equal(
      hasActiveSitesOrAppsForResponsable([siteOnlyProtectedDevice], []),
      false,
      'Con solo sitios de dispositivos protegidos, Autoprotección no debe estar disponible'
    );

    // Caso 2: Sitio con applyToAll: true (regla global)
    const siteGlobal = {
      id: 'site-2',
      domain: 'apuestas.com',
      isActive: true,
      applyToAll: true,
      deviceIds: ['device-protected-1'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(
      isItemEnabledForResponsable(siteGlobal),
      true,
      'Un sitio con regla global (applyToAll: true) aplica a Mi dispositivo'
    );
    assert.equal(
      hasActiveSitesOrAppsForResponsable([siteGlobal], []),
      true,
      'Con regla global activa, Autoprotección debe estar disponible'
    );

    // Caso 3: Sitio con applyToAll: false pero deviceIds incluye "self"
    const siteSelf = {
      id: 'site-3',
      domain: 'ruleta.bet',
      isActive: true,
      applyToAll: false,
      deviceIds: ['self'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(
      isItemEnabledForResponsable(siteSelf),
      true,
      'Un sitio que incluye "self" aplica a Mi dispositivo'
    );
    assert.equal(
      hasActiveSitesOrAppsForResponsable([siteSelf], []),
      true,
      'Con sitio en "self", Autoprotección debe estar disponible'
    );

    // Caso 4: Sitio asignado a "self" pero pausado/desactivado (isActive: false)
    const siteSelfInactive = {
      id: 'site-4',
      domain: 'poker.net',
      isActive: false,
      applyToAll: false,
      deviceIds: ['self'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(
      isItemEnabledForResponsable(siteSelfInactive),
      false,
      'Un sitio inactivo no debe habilitar Autoprotección'
    );
    assert.equal(
      hasActiveSitesOrAppsForResponsable([siteSelfInactive], []),
      false,
      'Con solo sitios inactivos, Autoprotección no debe estar disponible'
    );

    // Caso 5: App asignada solo a dispositivo protegido
    const appOnlyProtected = {
      id: 'app-1',
      appName: 'Casino App',
      packageName: 'com.casino.app',
      isActive: true,
      applyToAll: false,
      deviceIds: ['device-protected-1'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(
      isItemEnabledForResponsable(appOnlyProtected),
      false,
      'Una app asignada solo a dispositivo protegido no debe contar para el Responsable'
    );
    assert.equal(
      hasActiveSitesOrAppsForResponsable([], [appOnlyProtected]),
      false,
      'Con solo apps de dispositivos protegidos, Autoprotección no debe estar disponible'
    );

    // Caso 6: App asignada a "self"
    const appSelf = {
      id: 'app-2',
      appName: 'Bet App',
      packageName: 'com.bet.app',
      isActive: true,
      applyToAll: false,
      deviceIds: ['self'],
      createdAt: new Date().toISOString(),
    };
    assert.equal(
      isItemEnabledForResponsable(appSelf),
      true,
      'Una app asignada a "self" aplica a Mi dispositivo'
    );
    assert.equal(
      hasActiveSitesOrAppsForResponsable([], [appSelf]),
      true,
      'Con app en "self", Autoprotección debe estar disponible'
    );
  });
});
