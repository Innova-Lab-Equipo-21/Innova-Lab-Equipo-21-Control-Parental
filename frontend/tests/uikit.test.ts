// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Tests automatizados — Kit UI/UX)
// Archivo: tests/uikit.test.ts
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { colors, typography } from '../src/theme/index.js';

describe('Kit UI/UX y Jerarquía de Tokens (uikit.txt)', () => {
  test('Los colores oficiales del uikit.txt deben estar configurados correctamente', () => {
    assert.equal(colors.primary, '#007AFF', 'Primary debe ser #007AFF');
    assert.equal(colors.secondary, '#28A745', 'Secondary debe ser #28A745');
    assert.equal(colors.textPrimary, '#1C1C1E', 'Text Primary debe ser #1C1C1E');
    assert.equal(colors.textSecondary, '#8E8E93', 'Text Secondary debe ser #8E8E93');
    assert.equal(colors.background, '#F8F9FA', 'Background debe ser #F8F9FA');
    assert.equal(colors.feedbackError, '#DC3545', 'Feedback Error debe ser #DC3545');
    assert.equal(colors.feedbackWarning, '#FFC107', 'Feedback Warning debe ser #FFC107');
  });

  test('La escala de tipografía debe respetar las especificaciones del UI Kit', () => {
    assert.equal(typography.header.fontSize, 24);
    assert.equal(typography.subtitle.fontSize, 18);
    assert.equal(typography.body.fontSize, 14);
    assert.equal(typography.caption.fontSize, 12);
  });

  test('Los estados de badge para protección deben incluir activo y danger (desbloqueado)', () => {
    assert.equal(colors.statusActive, '#28A745');
    assert.equal(colors.statusActiveBg, '#D1E7DD');
    assert.equal(colors.statusDanger, '#DC3545');
    assert.equal(colors.statusDangerBg, '#F8D7DA');
  });
});
