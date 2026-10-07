// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Tests Automatizados — Onboarding y Tutoriales)
// Archivo: tests/onboarding.test.ts
// Descripción: Suite de tests unitarios para verificar la integridad del Onboarding:
//              - Flujo Wizard de 3 Pantallas.
//              - Video explicativo único oficial de onboarding.
//              - Videos tutoriales y estructura de pasos.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  TUTORIAL_VIDEOS,
  ONBOARDING_WIZARD_STEPS,
  ONBOARDING_WIZARD_VIDEO,
} from '../src/data/tutorialVideos.js';

describe('Pantalla de Onboarding y Flujo Wizard de 3 Pantallas', () => {
  test('El wizard de Onboarding debe contener exactamente 3 pantallas estructuradas', () => {
    assert.equal(ONBOARDING_WIZARD_STEPS.length, 3, 'El wizard debe constar de 3 pantallas');
    assert.equal(ONBOARDING_WIZARD_STEPS[0].stepNumber, 1);
    assert.equal(ONBOARDING_WIZARD_STEPS[1].stepNumber, 2);
    assert.equal(ONBOARDING_WIZARD_STEPS[2].stepNumber, 3);

    // Pantalla 1: Bienvenida y Privacidad
    assert.match(ONBOARDING_WIZARD_STEPS[0].title, /Protección Integral/i);
    // Pantalla 2: Modalidades
    assert.match(ONBOARDING_WIZARD_STEPS[1].title, /Modalidades/i);
    // Pantalla 3: Resumen audiovisual
    assert.match(ONBOARDING_WIZARD_STEPS[2].title, /Video/i);
  });

  test('La tercera pantalla wizard debe incluir un video resumen de pocos segundos y optativo', () => {
    assert.ok(ONBOARDING_WIZARD_VIDEO, 'Debe existir la configuración del video wizard');
    assert.equal(ONBOARDING_WIZARD_VIDEO.isOptional, true, 'El video debe ser explícitamente optativo');
    assert.ok(
      ONBOARDING_WIZARD_VIDEO.durationSeconds <= 45,
      'El video debe durar pocos segundos (<= 45s)'
    );
    assert.ok(
      ONBOARDING_WIZARD_VIDEO.durationSeconds >= 20,
      'El video debe tener duración suficiente para explicar los perfiles'
    );
    assert.match(ONBOARDING_WIZARD_VIDEO.duration, /^\d{2}:\d{2}$/, 'Debe cumplir formato mm:ss');
  });

  test('El video resumen de la pantalla 3 debe explicar los 3 perfiles de usuarios (Responsable, Menor y Dispositivo Adulto)', () => {
    const profiles = ONBOARDING_WIZARD_VIDEO.steps.map((s) => s.profile);
    assert.ok(profiles.includes('RESPONSABLE'), 'Debe explicar el perfil Responsable');
    assert.ok(profiles.includes('MENOR'), 'Debe explicar el perfil Modo Dispositivo Menor');
    assert.ok(profiles.includes('ADULTO'), 'Debe explicar el perfil Modo Dispositivo Adulto');

    for (const step of ONBOARDING_WIZARD_VIDEO.steps) {
      assert.ok(step.second >= 0, 'El segundo de inicio debe ser válido');
      assert.ok(step.title.length > 5, 'El título del perfil debe ser descriptivo');
      assert.ok(step.description.length > 10, 'La descripción audiovisual debe ser explicativa');
      assert.ok(step.emoji.length > 0, 'Debe tener emoji representativo');
      assert.ok(step.badgeColor.startsWith('#'), 'Debe tener color hexadecimal para el reproductor');
    }
  });

  test('Debe contener el video explicativo oficial de onboarding', () => {
    assert.equal(TUTORIAL_VIDEOS.length, 1, 'Debe haber exactamente 1 video explicativo de onboarding');
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
