// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Tests Automatizados — Design System y Colores)
// Archivo: tests/theme.test.ts
// Descripción: Suite de tests unitarios para verificar la consistencia del Design
//              System: tokens de color, estados de protección y contrastes de
//              legibilidad del sistema de diseño oficial de la aplicación.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { colors } from '../src/theme/colors.js';

describe('Design System y Tokens de Color (Frontend Theme)', () => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  test('Todos los tokens principales deben ser códigos hexadecimales válidos', () => {
    assert.match(colors.primary, hexColorRegex, 'Primary debe ser un hex válido');
    assert.match(colors.primaryDark, hexColorRegex, 'PrimaryDark debe ser un hex válido');
    assert.match(colors.background, hexColorRegex, 'Background debe ser un hex válido');
    assert.match(colors.surface, hexColorRegex, 'Surface debe ser un hex válido');
  });

  test('Los estados de protección deben contar con colores y fondos definidos', () => {
    assert.match(colors.statusActive, hexColorRegex);
    assert.match(colors.statusActiveBg, hexColorRegex);
    assert.match(colors.statusInactive, hexColorRegex);
    assert.match(colors.statusInactiveBg, hexColorRegex);
    assert.match(colors.statusWarning, hexColorRegex);
    assert.match(colors.statusDanger, hexColorRegex);
  });

  test('La legibilidad de textos y contrastes debe tener tokens configurados', () => {
    assert.ok(colors.textPrimary);
    assert.ok(colors.textSecondary);
    assert.ok(colors.textLight);
    assert.equal(colors.textLight, '#FFFFFF');
  });
});
