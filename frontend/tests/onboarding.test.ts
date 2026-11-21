// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Tests Automatizados — Onboarding)
// Archivo: tests/onboarding.test.ts
// Descripción: Suite de tests unitarios para verificar la integridad del Onboarding:
//              - Flujo Wizard de 3 pasos en OnboardingScreen.tsx.
//              - Textos alineados al Brandbook (voseo rioplatense y Sentence case).
//              - Reproductor nativo de YouTube Shorts en el Paso 3.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const onboardingScreenPath = path.resolve(
  __dirname,
  '../src/screens/OnboardingScreen.tsx'
);
const youtubeWrapperPath = path.resolve(
  __dirname,
  '../src/components/YouTubePlayerView.tsx'
);
const protectionPackagePath = path.resolve(
  __dirname,
  '../android/app/src/main/java/com/baprotege/bridge/ProtectionPackage.kt'
);

const onboardingSource = fs.readFileSync(onboardingScreenPath, 'utf-8');
const youtubeWrapperSource = fs.readFileSync(youtubeWrapperPath, 'utf-8');
const protectionPackageSource = fs.readFileSync(protectionPackagePath, 'utf-8');

describe('Pantalla de Onboarding y Flujo Wizard de 3 Pantallas', () => {
  test('El wizard de Onboarding debe contener exactamente 3 pasos estructurados', () => {
    assert.ok(onboardingSource.includes('wizardStep === 1'), 'Debe incluir el Paso 1');
    assert.ok(onboardingSource.includes('wizardStep === 2'), 'Debe incluir el Paso 2');
    assert.ok(onboardingSource.includes('wizardStep === 3'), 'Debe incluir el Paso 3');
    assert.ok(onboardingSource.includes('[1, 2, 3].map'), 'El stepper debe mostrar 3 pasos');
  });

  test('Paso 1 debe mostrar los textos oficiales del Brandbook y Botito feliz animado', () => {
    assert.ok(
      onboardingSource.includes('¡Te damos la bienvenida a BA Protege +!'),
      'Paso 1 debe incluir el título de bienvenida'
    );
    assert.ok(
      onboardingSource.includes(
        'Una herramienta pensada para acompañar a quienes más lo necesitan.'
      ),
      'Paso 1 debe incluir el subtítulo oficial'
    );
    assert.ok(
      onboardingSource.includes('Lotería de la Ciudad de Buenos Aires (LOTBA)'),
      'Paso 1 debe mencionar a LOTBA'
    );
    assert.ok(
      onboardingSource.includes('En BA Protege + te cuidamos a vos y a los tuyos.'),
      'Paso 1 debe incluir el mensaje de cierre con voseo'
    );
    assert.ok(
      onboardingSource.includes('<AnimatedBotMascot') &&
        onboardingSource.includes('mood="feliz"'),
      'Paso 1 debe mostrar a Botito feliz animado usando AnimatedBotMascot'
    );
  });

  test('Paso 2 debe presentar Modo responsable y Modo protegido con textos del Brandbook', () => {
    assert.ok(onboardingSource.includes('¿Cómo funciona la app?'));
    assert.ok(onboardingSource.includes('Podés usarla de dos formas distintas:'));
    assert.ok(onboardingSource.includes('Modo responsable'));
    assert.ok(onboardingSource.includes('Modo protegido'));
    assert.ok(
      onboardingSource.includes(
        'Podés agregar sitios y apps personalizados para proteger a personas de tu entorno desde tu dispositivo.'
      )
    );
    assert.ok(
      onboardingSource.includes(
        'Tu dispositivo recibe la protección de una persona responsable.'
      )
    );
  });

  test('Paso 3 debe incluir el título actualizado y el video de YouTube Shorts TiF6zxlt5fU', () => {
    assert.ok(onboardingSource.includes('¿Tenés dudas?'), 'Paso 3 debe usar el título "¿Tenés dudas?"');
    assert.ok(
      onboardingSource.includes("ONBOARDING_YOUTUBE_VIDEO_ID = 'TiF6zxlt5fU'"),
      'Paso 3 debe configurar el ID de YouTube Shorts TiF6zxlt5fU'
    );
    assert.ok(
      onboardingSource.includes('<YouTubePlayerView'),
      'Paso 3 debe renderizar YouTubePlayerView al reproducir'
    );
  });

  test('El módulo nativo Android registra YouTubePlayerViewManager y existe wrapper TS', () => {
    assert.ok(
      youtubeWrapperSource.includes("const VIEW_NAME = 'YouTubePlayerView'"),
      'YouTubePlayerView.tsx debe apuntar al ViewManager YouTubePlayerView'
    );
    assert.ok(
      protectionPackageSource.includes('YouTubePlayerViewManager()'),
      'ProtectionPackage.kt debe registrar YouTubePlayerViewManager'
    );
  });
});
