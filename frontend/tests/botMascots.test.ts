// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Mascotas Boti (Adulto) y Botito (Menor)
// Archivo: tests/botMascots.test.ts
// Descripción: Verifica el mapeo de sentimientos (feliz, pensando, nervioso,
//              triste), la existencia de los 8 recursos gráficos y su uso
//              consistente en las pantallas, juegos y modales protegidos.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getBotMascotName,
  getContextBotMood,
  getQuizResultMood,
} from '../src/utils/botMascots.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Mascotas Boti (Adulto) y Botito (Menor) — Lógica de sentimientos', () => {
  test('Asigna Boti al modo Protegido Adulto y Botito al modo Protegido Menor', () => {
    assert.equal(getBotMascotName('ADULT'), 'Boti');
    assert.equal(getBotMascotName('CHILD'), 'Botito');
  });

  test('Calcula el sentimiento al finalizar el Quiz según el porcentaje de aciertos', () => {
    assert.equal(getQuizResultMood(5, 5), 'feliz');
    assert.equal(getQuizResultMood(3, 5), 'feliz');
    assert.equal(getQuizResultMood(2, 5), 'pensando');
    assert.equal(getQuizResultMood(1, 5), 'triste');
    assert.equal(getQuizResultMood(0, 5), 'triste');
  });

  test('Mapea cada contexto de modal o mensaje al sentimiento adecuado', () => {
    assert.equal(getContextBotMood('profile_avatar'), 'feliz');
    assert.equal(getContextBotMood('celebration'), 'feliz');
    assert.equal(getContextBotMood('all_games_completed'), 'feliz');
    assert.equal(getContextBotMood('block_success'), 'feliz');
    assert.equal(getContextBotMood('pin_authorized'), 'feliz');

    assert.equal(getContextBotMood('game_invite'), 'pensando');
    assert.equal(getContextBotMood('quiz_question'), 'pensando');
    assert.equal(getContextBotMood('learn_more_info'), 'pensando');
    assert.equal(getContextBotMood('usage_stats'), 'pensando');

    assert.equal(getContextBotMood('minor_warning'), 'nervioso');
    assert.equal(getContextBotMood('permanent_block_warning'), 'nervioso');
    assert.equal(getContextBotMood('pin_required'), 'nervioso');
    assert.equal(getContextBotMood('locked_permission'), 'nervioso');

    assert.equal(getContextBotMood('unlock_denied'), 'triste');
    assert.equal(getContextBotMood('validation_error'), 'triste');
    assert.equal(getContextBotMood('pin_incorrect'), 'triste');
  });
});

describe('Mascotas Boti y Botito — Recursos e integración en pantallas y modales', () => {
  test('Existen las 8 imágenes PNG en disco y están registradas en botAssets.ts', () => {
    const botAssetsSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/botAssets.ts'
      ),
      'utf8'
    );

    const expectedAssets = [
      'adulto/boti_feliz.png',
      'adulto/boti_pensando.png',
      'adulto/boti_nervioso.png',
      'adulto/boti_triste.png',
      'menor/botito_feliz.png',
      'menor/botito_pensando.png',
      'menor/botito_nervioso.png',
      'menor/botito_triste.png',
    ];

    for (const rel of expectedAssets) {
      const fullPath = path.resolve(
        __dirname,
        '../src/assets/icons/bot',
        rel
      );
      assert.equal(
        fs.existsSync(fullPath),
        true,
        `Debe existir el recurso ${rel}`
      );
      assert.equal(
        botAssetsSource.includes(rel),
        true,
        `botAssets.ts debe referenciar ${rel}`
      );
    }
  });

  test('Modo Adulto usa BOTI_ASSETS y Modo Menor usa BOTITO_ASSETS sin referencias a beti.png', () => {
    const adultoFiles = [
      'AdultoInicioSection.tsx',
      'AdultoSitiosSection.tsx',
      'AdultoAddSiteModal.tsx',
      'AdultoAddAppModal.tsx',
      'AdultoActividadSection.tsx',
      'AdultoCuentaSection.tsx',
    ];

    for (const file of adultoFiles) {
      const content = fs.readFileSync(
        path.resolve(
          __dirname,
          '../src/components/dashboard/protected/adulto',
          file
        ),
        'utf8'
      );
      assert.equal(
        content.includes('BOTI_ASSETS'),
        true,
        `${file} debe usar BOTI_ASSETS`
      );
      assert.equal(
        content.includes('BOTITO_ASSETS'),
        false,
        `${file} no debe usar BOTITO_ASSETS`
      );
      assert.equal(content.includes('beti.png'), false);
    }

    const menorFiles = [
      'MenorInicioSection.tsx',
      'MenorPasatiemposSection.tsx',
      'MenorActividadSection.tsx',
      'MenorCuentaSection.tsx',
    ];

    for (const file of menorFiles) {
      const content = fs.readFileSync(
        path.resolve(
          __dirname,
          '../src/components/dashboard/protected/menor',
          file
        ),
        'utf8'
      );
      assert.equal(
        content.includes('BOTITO_ASSETS'),
        true,
        `${file} debe usar BOTITO_ASSETS`
      );
      assert.equal(
        content.includes('BOTI_ASSETS'),
        false,
        `${file} no debe usar BOTI_ASSETS`
      );
      assert.equal(content.includes('beti.png'), false);
    }
  });
});
