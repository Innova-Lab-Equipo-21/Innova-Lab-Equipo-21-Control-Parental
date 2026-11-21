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

describe('Pantalla de Apertura — Video Vertical hola_botito.mp4 y Logo Superior', () => {
  it('El video hola_botito.mp4 existe en src/assets/videos y en android res/raw', () => {
    const srcVideo = path.join(frontendRoot, 'src', 'assets', 'videos', 'hola_botito.mp4');
    const rawVideo = path.join(
      frontendRoot,
      'android',
      'app',
      'src',
      'main',
      'res',
      'raw',
      'hola_botito.mp4'
    );
    const logoPng = path.join(frontendRoot, 'src', 'assets', 'logo', 'logo_baprotege.png');

    assert.ok(fs.existsSync(srcVideo), 'Debe existir src/assets/videos/hola_botito.mp4');
    assert.ok(fs.existsSync(rawVideo), 'Debe existir android/app/src/main/res/raw/hola_botito.mp4');
    assert.ok(fs.existsSync(logoPng), 'Debe existir src/assets/logo/logo_baprotege.png');
  });

  it('SplashScreen reproduce hola_botito a pantalla completa con logo centrado en la parte superior', () => {
    const splashContent = fs.readFileSync(
      path.join(frontendRoot, 'src', 'components', 'SplashScreen.tsx'),
      'utf8'
    );

    assert.ok(
      splashContent.includes("SPLASH_VIDEO_RESOURCE = 'hola_botito'"),
      'SplashScreen debe referenciar el recurso de video hola_botito'
    );
    assert.ok(
      splashContent.includes('<SplashVideoView'),
      'SplashScreen debe renderizar SplashVideoView'
    );
    assert.ok(
      splashContent.includes('resizeMode="cover"'),
      'El video vertical debe ocupar la pantalla completa con resizeMode="cover"'
    );
    assert.ok(
      splashContent.includes("require('../assets/logo/logo_baprotege.png')"),
      'SplashScreen debe mostrar logo_baprotege.png'
    );
    assert.ok(
      splashContent.includes('topLogoOverlay') &&
        splashContent.includes("alignItems: 'center'") &&
        splashContent.includes('top: 0'),
      'El logo debe estar posicionado y centrado en la parte superior'
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
