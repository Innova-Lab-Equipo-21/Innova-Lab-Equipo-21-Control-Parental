// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests — Utilidades de dominio)
// Archivo: tests/domain.test.ts
// Descripción: Casos de normalización de dominios ingresados por el tutor.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDomain } from '../src/utils/domain.js';

describe('normalizeDomain', () => {
  const casos: Array<[string, string]> = [
    ['Apuestas.com', 'apuestas.com'],
    ['  https://www.Apuestas.com/promo?x=1#top  ', 'apuestas.com'],
    ['http://apuestas.com:8080', 'apuestas.com'],
    ['usuario:clave@apuestas.com', 'apuestas.com'],
    ['https://u:p@www.apuestas.com:443/a', 'apuestas.com'],
    ['apuestas.com.', 'apuestas.com'],
    ['//apuestas.com/x', 'apuestas.com'],
    ['sub.apuestas.com', 'sub.apuestas.com'],
  ];

  for (const [entrada, esperado] of casos) {
    test(`"${entrada}" → "${esperado}"`, () => {
      assert.equal(normalizeDomain(entrada), esperado);
    });
  }
});