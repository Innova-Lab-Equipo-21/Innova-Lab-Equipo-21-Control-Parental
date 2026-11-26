// ==============================================================================
// Proyecto: BA Protege+
// Pruebas Unitarias: Pantalla de Apertura (Video Vertical + Logo Superior)
// Archivo: tests/splashScreen.test.ts
// Descripción: Verifica la existencia de los recursos audiovisuales de apertura,
//              el puente nativo SplashVideoView y la integración en SplashScreen
//              y App.tsx.
// ==============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const frontendRoot = path.resolve(__dirname, '..');

describe('Pantalla de Apertura — Video Vertical apertura.mp4 y Logo Superior', () => {
  it('Los videos apertura.mp4, hola_botito.mp4 y botito_bienvenida.mp4 existen en src/assets/videos y en android res/raw', () => {
    const srcApertura = path.join(frontendRoot, 'src', 'assets', 'videos', 'apertura.mp4');
    const rawApertura = path.join(
      frontendRoot,
      'android',
      'app',
      'src',
      'main',
      'res',
      'raw',
      'apertura.mp4'
    );
    const srcHolaBotito = path.join(frontendRoot, 'src', 'assets', 'videos', 'hola_botito.mp4');
    const rawHolaBotito = path.join(
      frontendRoot,
      'android',
      'app',
      'src',
      'main',
      'res',
      'raw',
      'hola_botito.mp4'
    );
    const srcBotitoBienvenida = path.join(
      frontendRoot,
      'src',
      'assets',
      'videos',
      'botito_bienvenida.mp4'
    );
    const rawBotitoBienvenida = path.join(
      frontendRoot,
      'android',
      'app',
      'src',
      'main',
      'res',
      'raw',
      'botito_bienvenida.mp4'
    );
    const logoPng = path.join(frontendRoot, 'src', 'assets', 'logo', 'logo_baprotege.png');

    assert.ok(fs.existsSync(srcApertura), 'Debe existir src/assets/videos/apertura.mp4');
    assert.ok(fs.existsSync(rawApertura), 'Debe existir android/app/src/main/res/raw/apertura.mp4');
    assert.ok(fs.existsSync(srcHolaBotito), 'Debe existir src/assets/videos/hola_botito.mp4');
    assert.ok(fs.existsSync(rawHolaBotito), 'Debe existir android/app/src/main/res/raw/hola_botito.mp4');
    assert.ok(
      fs.existsSync(srcBotitoBienvenida),
      'Debe existir src/assets/videos/botito_bienvenida.mp4'
    );
    assert.ok(
      fs.existsSync(rawBotitoBienvenida),
      'Debe existir android/app/src/main/res/raw/botito_bienvenida.mp4'
    );
    assert.ok(logoPng && fs.existsSync(logoPng), 'Debe existir src/assets/logo/logo_baprotege.png');
  });

  it('SplashScreen reproduce únicamente apertura centrado sin invadir bordes y sin logo fijo', () => {
    const splashContent = fs.readFileSync(
      path.join(frontendRoot, 'src', 'components', 'SplashScreen.tsx'),
      'utf8'
    );

    assert.ok(
      splashContent.includes("SPLASH_VIDEO_RESOURCE = 'apertura'"),
      'SplashScreen debe referenciar el recurso de video apertura'
    );
    assert.ok(
      splashContent.includes('<SplashVideoView'),
      'SplashScreen debe renderizar SplashVideoView'
    );
    assert.ok(
      splashContent.includes('resizeMode="contain"'),
      'El video de apertura debe usar resizeMode="contain" para no invadir los bordes'
    );
    assert.equal(
      splashContent.includes('logo_baprotege.png'),
      false,
      'SplashScreen no debe mostrar el logo fijo adicional, solo el video'
    );
  });

  it('El módulo nativo Android registra SplashVideoViewManager en ProtectionPackage', () => {
    const pkgContent = fs.readFileSync(
      path.join(
        frontendRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        'com',
        'baprotege',
        'bridge',
        'ProtectionPackage.kt'
      ),
      'utf8'
    );

    assert.ok(
      pkgContent.includes('SplashVideoViewManager()'),
      'ProtectionPackage debe registrar SplashVideoViewManager'
    );
  });

  it('App.tsx muestra SplashScreen al iniciar y solo lo omite al volver a PERMISSIONS', () => {
    const appContent = fs.readFileSync(path.join(frontendRoot, 'src', 'App.tsx'), 'utf8');

    assert.ok(
      appContent.includes("if (session.activeScreen === 'PERMISSIONS')"),
      'App.tsx debe omitir SplashScreen únicamente al regresar a PERMISSIONS'
    );
    assert.ok(
      appContent.includes('<SplashScreen onFinish={() => setSplashFinished(true)} />'),
      'App.tsx debe renderizar SplashScreen hasta completar el video'
    );
  });
});
