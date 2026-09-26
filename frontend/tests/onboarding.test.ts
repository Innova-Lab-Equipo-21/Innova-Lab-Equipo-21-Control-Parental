// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Tests Automatizados — Onboarding y Tutoriales)
// Archivo: tests/onboarding.test.ts
// Descripción: Suite de tests unitarios para verificar la integridad del carrusel
//              de videos tutoriales del Onboarding: estructura, duración, pasos
//              cronológicos y puntos clave por cada modo de la aplicación.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TUTORIAL_VIDEOS } from '../src/data/tutorialVideos.js';

describe('Pantalla de Onboarding y Tutoriales en Video', () => {
  test('Debe contener exactamente 3 videos explicativos (uno por modo)', () => {
    assert.equal(TUTORIAL_VIDEOS.length, 3, 'Debe haber exactamente 3 videos');

    const modes = TUTORIAL_VIDEOS.map((v) => v.mode);
    assert.ok(modes.includes('PARENT'), 'Debe existir video para Modo Responsable');
    assert.ok(modes.includes('CHILD'), 'Debe existir video para Modo Menor');
    assert.ok(modes.includes('ADULT'), 'Debe existir video para Modo Adulto');
  });

  test('Cada video debe contar con duración positiva y formato mm:ss', () => {
    const durationRegex = /^\d{2}:\d{2}$/;
    for (const video of TUTORIAL_VIDEOS) {
      assert.ok(video.durationSeconds > 0, `Duración en segundos debe ser > 0 para ${video.id}`);
      assert.match(video.duration, durationRegex, `Formato debe ser mm:ss para ${video.id}`);
    }
  });

  test('Cada tutorial debe contener una secuencia ordenada de pasos', () => {
    for (const video of TUTORIAL_VIDEOS) {
      assert.ok(video.steps.length >= 3, `Debe tener al menos 3 pasos explicativos (${video.id})`);

      for (let i = 0; i < video.steps.length; i++) {
        const step = video.steps[i];
        assert.ok(step.second >= 0, 'El segundo de inicio debe ser no negativo');
        assert.ok(step.second <= video.durationSeconds, 'El segundo de inicio debe estar dentro de la duración');
        assert.ok(step.title.length > 0, 'El título del paso no puede estar vacío');
        assert.ok(step.description.length > 0, 'La descripción no puede estar vacía');

        if (i > 0) {
          assert.ok(
            step.second >= video.steps[i - 1].second,
            `Los pasos deben ser cronológicamente crecientes en ${video.id}`
          );
        }
      }
    }
  });

  test('Cada video debe contar con puntos clave (highlights) para generar confianza', () => {
    for (const video of TUTORIAL_VIDEOS) {
      assert.ok(video.highlights.length >= 3, `Debe contener al menos 3 puntos clave (${video.id})`);
      for (const h of video.highlights) {
        assert.ok(h.length > 5, 'Cada punto clave debe ser descriptivo');
      }
    }
  });
});
