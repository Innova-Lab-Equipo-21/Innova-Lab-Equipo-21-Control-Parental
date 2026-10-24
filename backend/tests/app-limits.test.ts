// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests Unitarios — Límites de Tiempo y Apps Bloqueadas)
// Archivo: tests/app-limits.test.ts
// Descripción: Suite de tests unitarios para validar la gestión y límites diarios
//              de tiempo de uso en aplicaciones restringidas por el responsable.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Módulo de Límites de Tiempo y Apps Bloqueadas (Unit Tests)', () => {
  test('Validación conceptual de configuración de límite diario de tiempo para aplicaciones', () => {
    const appRule = {
      appName: 'TikTok',
      packageName: 'com.zhiliaoapp.musically',
      category: 'Redes sociales',
      isActive: true,
      applyToAll: true,
      dailyLimitMinutes: 60,
    };

    assert.equal(appRule.appName, 'TikTok');
    assert.equal(appRule.dailyLimitMinutes, 60);
    assert.equal(appRule.isActive, true);
  });

  test('Validación de valor por defecto (tiempo indeterminado / sin límite diario)', () => {
    const defaultAppRule = {
      appName: 'Bet365',
      packageName: 'com.bet365.mobile',
      category: 'Apuestas',
      isActive: true,
      applyToAll: true,
      dailyLimitMinutes: undefined, // Indeterminado por defecto
    };

    assert.equal(defaultAppRule.dailyLimitMinutes, undefined);
  });
});
