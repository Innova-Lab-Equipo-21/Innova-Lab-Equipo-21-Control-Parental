// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Tests automatizados — Autocontrol y Límite de 5 Dispositivos)
// Archivo: tests/selfControl.test.ts
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_PARENT_DEVICES, SELF_CONTROL_LOCK_HOURS } from '../src/types/index.js';
import { apiService } from '../src/services/api.service.js';

describe('Autocontrol del Responsable y Límite de 5 Dispositivos', () => {
  test('El límite máximo de dispositivos por responsable debe ser 5', () => {
    assert.equal(MAX_PARENT_DEVICES, 5, 'El límite de dispositivos debe ser exactamente 5');
  });

  test('La duración del bloqueo de autocontrol debe ser de 24 horas', () => {
    assert.equal(SELF_CONTROL_LOCK_HOURS, 24, 'El bloqueo de autocontrol debe durar 24 horas');
  });

  test('Activar autocontrol debe guardar un estado activo con fecha de vencimiento a 24hs', async () => {
    const status = await apiService.enableSelfControl();
    assert.equal(status.active, true, 'El autocontrol debe quedar activo');
    assert.equal(status.canDisable, false, 'No debe permitir desactivar antes de 24hs');
    assert.ok(status.expiresAt, 'Debe registrar fecha de vencimiento');
  });

  test('Intentar desactivar el autocontrol antes de cumplir 24hs debe lanzar una excepción de seguridad', async () => {
    await apiService.enableSelfControl();

    await assert.rejects(
      async () => {
        await apiService.disableSelfControl();
      },
      (err: any) => {
        return (
          err instanceof Error &&
          /bloquead/i.test(err.message)
        );
      },
      'Debe denegar la desactivación indicando que el autocontrol está bloqueado por 24hs',
    );
  });
});
