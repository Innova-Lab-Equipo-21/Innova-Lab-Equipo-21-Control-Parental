import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_PROTECTED_DEVICES,
  SELF_CONTROL_LOCK_HOURS,
} from '../src/types/index.js';
import { apiService } from '../src/services/api.service.js';

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
});
