import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_PARENT_DEVICES,
  SELF_CONTROL_LOCK_HOURS,
  SELF_CONTROL_UNLOCK_WINDOW_HOURS,
} from '../src/types/index.js';
import { apiService } from '../src/services/api.service.js';

describe('Autocontrol del Tutor y Límite de 5 Dispositivos', () => {
  test('El límite máximo de dispositivos por responsable debe ser 5', () => {
    assert.equal(MAX_PARENT_DEVICES, 5, 'El límite de dispositivos debe ser exactamente 5');
  });

  test('La duración del temporizador de espera tras solicitar la desactivación debe ser de 24 horas', () => {
    assert.equal(SELF_CONTROL_LOCK_HOURS, 24, 'El temporizador de espera debe requerir 24 horas');
  });

  test('La duración del pase temporal de desbloqueo antes del re-bloqueo automático debe ser de 24 horas', () => {
    assert.equal(
      SELF_CONTROL_UNLOCK_WINDOW_HOURS,
      24,
      'El desbloqueo temporal debe durar exactamente 24 horas antes de re-bloquearse automáticamente'
    );
  });

  test('1- Al activar autoprotección, queda activa permanentemente y muestra estado ACTIVE_LOCKED', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;

    const status = await apiService.enableSelfControl();
    assert.equal(status.active, true, 'La autoprotección debe quedar activa');
    assert.equal(status.status, 'ACTIVE_LOCKED', 'El estado inicial debe ser ACTIVE_LOCKED');
    assert.equal(status.canDisable, false, 'No permite desactivación inmediata');
  });

  test('2- Al hacer primer clic en "Desactivar autoprotección", NO se desactiva: inicia temporizador de 24 horas y avisa que la desactivación se habilitará en 24 horas', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;
    await apiService.enableSelfControl();

    // Primer clic
    const pendingStatus = await apiService.disableSelfControl();

    // NO se desactiva
    assert.equal(pendingStatus.active, true, 'NO se desactiva al hacer clic por primera vez');
    assert.equal(pendingStatus.status, 'DEACTIVATION_PENDING', 'Pasa a estado DEACTIVATION_PENDING');
    assert.equal(pendingStatus.canDisable, false, 'El desbloqueo no está habilitado aún');
    assert.ok(pendingStatus.deactivationAvailableAt, 'Debe registrar la fecha en la que se habilitará la desactivación (en 24 horas)');

    const diffHours = (new Date(pendingStatus.deactivationAvailableAt!).getTime() - simulatedNow) / (3600 * 1000);
    assert.equal(diffHours, 24, 'La desactivación debe programarse para habilitarse en exactamente 24 horas');
  });

  test('2b- Durante esas 24 horas de espera, la autoprotección permanece activa y cualquier intento lanza aviso de que se habilitará en 24 horas', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;
    await apiService.enableSelfControl();
    await apiService.disableSelfControl(); // Clic 1

    // Avanzar 10 horas (aún faltan 14 horas)
    simulatedNow += 10 * 3600 * 1000;

    const midStatus = await apiService.getSelfControlStatus();
    assert.equal(midStatus.active, true, 'Sigue activa');
    assert.equal(midStatus.status, 'DEACTIVATION_PENDING');
    assert.equal(midStatus.canDisable, false);

    await assert.rejects(
      async () => {
        await apiService.disableSelfControl();
      },
      (err: any) => {
        return err instanceof Error && /habilitará en 24 horas/i.test(err.message);
      },
      'Debe advertir que la desactivación se habilitará en 24 horas'
    );
  });

  test('3- Recién cuando pasan esas 24 horas, el botón cambia de estado para permitir el desbloqueo real (DEACTIVATION_READY y canDisable=true), exigiendo un segundo clic', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;
    await apiService.enableSelfControl();
    await apiService.disableSelfControl(); // Clic 1

    // Avanzar 25 horas
    simulatedNow += 25 * 3600 * 1000;

    const readyStatus = await apiService.getSelfControlStatus();
    assert.equal(readyStatus.active, true, 'Sigue activa hasta que el usuario confirme con el segundo clic');
    assert.equal(readyStatus.status, 'DEACTIVATION_READY', 'El estado cambia a DEACTIVATION_READY');
    assert.equal(readyStatus.canDisable, true, 'El botón cambia de estado para permitir el desbloqueo');
  });

  test('4- Al hacer ese segundo clic, el sistema se desbloquea inmediatamente por un pase temporal de 24 horas, y cumplido ese plazo se vuelve a activar automáticamente', async () => {
    let simulatedNow = 1700000000000;
    apiService.getReliableTimestamp = async () => simulatedNow;
    await apiService.enableSelfControl();
    await apiService.disableSelfControl(); // Clic 1: Inicia espera 24h

    // Avanzar 25 horas
    simulatedNow += 25 * 3600 * 1000;

    // Segundo clic: Desbloqueo real inmediato
    const unlockedStatus = await apiService.disableSelfControl();
    assert.equal(unlockedStatus.active, false, 'Se desbloquea inmediatamente');
    assert.equal(unlockedStatus.status, 'TEMPORARILY_UNLOCKED', 'Estado es TEMPORARILY_UNLOCKED');
    assert.ok(unlockedStatus.autoRelockAt, 'Tiene fecha límite de 24 horas para el pase');

    // Durante las 24 horas (ej. a las 12 horas): Sigue desbloqueado
    simulatedNow += 12 * 3600 * 1000;
    const midUnlocked = await apiService.getSelfControlStatus();
    assert.equal(midUnlocked.active, false, 'Permanece desbloqueado durante el pase de 24 horas');
    assert.equal(midUnlocked.status, 'TEMPORARILY_UNLOCKED');

    // Cumplido el plazo de 24 horas (ej. 25 horas después del desbloqueo): Se vuelve a activar automáticamente
    simulatedNow += 13 * 3600 * 1000;
    const relockedStatus = await apiService.getSelfControlStatus();
    assert.equal(relockedStatus.active, true, 'Cumplido el plazo de 24hs se vuelve a activar automáticamente');
    assert.equal(relockedStatus.status, 'ACTIVE_LOCKED', 'Vuelve a estar protegida y bloqueada');
    assert.equal(relockedStatus.canDisable, false, 'Para desactivar de nuevo, requerirá reiniciar el proceso de espera');
  });
});
