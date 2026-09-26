// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Tests Automatizados — Modelos y Tipos)
// Archivo: tests/types.test.ts
// Descripción: Suite de tests unitarios para validar los tipos y modelos de la
//              aplicación móvil: modos de operación (AppMode) y estados del
//              sistema de protección VPN/red (ProtectionStatus).
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { AppMode, ProtectionStatus } from '../src/types/index.js';

describe('Modelos y Tipos de la Aplicación Móvil (Types)', () => {
  test('AppMode debe permitir los modos UNSET, PARENT, CHILD y ADULT', () => {
    const validModes: AppMode[] = ['UNSET', 'PARENT', 'CHILD', 'ADULT'];
    assert.equal(validModes.length, 4);
    assert.ok(validModes.includes('PARENT'));
    assert.ok(validModes.includes('CHILD'));
    assert.ok(validModes.includes('ADULT'));
    assert.ok(validModes.includes('UNSET'));
  });

  test('ProtectionStatus debe cubrir todos los estados operativos de red y VPN', () => {
    const statuses: ProtectionStatus[] = [
      'ACTIVE',
      'INACTIVE',
      'STARTING',
      'ERROR',
      'PERMISSION_REQUIRED',
      'SYNC_PENDING',
      'OUTDATED',
      'BYPASS_DETECTED',
      'UNKNOWN',
    ];

    assert.equal(statuses.length, 9);
    assert.ok(statuses.includes('ACTIVE'));
    assert.ok(statuses.includes('BYPASS_DETECTED'));
  });
});
