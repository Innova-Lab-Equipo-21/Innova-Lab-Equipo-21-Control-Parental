// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Bloqueo Recíproco (Sitio -> App y App -> Sitio)
// Archivo: tests/bidirectionalBlocking.test.ts
// Descripción: Verifica la implementación de bidireccionalidad: cuando un sitio web
//              está bloqueado, su aplicación móvil nativa también queda bloqueada
//              (en el servicio de accesibilidad y servicio de protección).
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Bloqueo Recíproco de Sitios Web y Aplicaciones Móviles', () => {
  const protectionServicePath = path.resolve(__dirname, '../src/services/protection.service.ts');
  const a11yServicePath = path.resolve(
    __dirname,
    '../android/app/src/main/java/com/baprotege/accessibility/ProtectionAccessibilityService.kt'
  );
  const blockedScreenPath = path.resolve(
    __dirname,
    '../android/app/src/main/java/com/baprotege/BlockedScreenActivity.kt'
  );

  const protectionServiceContent = fs.readFileSync(protectionServicePath, 'utf8');
  const a11yServiceContent = fs.readFileSync(a11yServicePath, 'utf8');
  const blockedScreenContent = fs.readFileSync(blockedScreenPath, 'utf8');

  test('1. ProtectionAccessibilityService implementa mapeo de paquetes conocidos y nombres para reciprocidad', () => {
    assert.ok(
      a11yServiceContent.includes('private val APP_KNOWN_PACKAGES = mapOf('),
      'Debe definir APP_KNOWN_PACKAGES en ProtectionAccessibilityService'
    );
    assert.ok(
      a11yServiceContent.includes('private val APP_DISPLAY_NAMES = mapOf('),
      'Debe definir APP_DISPLAY_NAMES en ProtectionAccessibilityService'
    );
    assert.ok(
      a11yServiceContent.includes('fun findBlockedDomainForApp(cleanPkg: String): BlockedDomainMatch?'),
      'Debe implementar findBlockedDomainForApp para evaluar si una app pertenece a un sitio bloqueado'
    );
  });

  test('2. ProtectionAccessibilityService intercepta y bloquea apps cuyo sitio web esté bloqueado', () => {
    assert.ok(
      a11yServiceContent.includes('val domainBlock = findBlockedDomainForApp(cleanPkg)'),
      'checkAndBlockApp debe consultar findBlockedDomainForApp'
    );
    assert.ok(
      a11yServiceContent.includes('blockAppAttempt(appName = domainBlock.appDisplayName, fromSite = domainBlock.domain, isLotba = domainBlock.isLotba)'),
      'Debe llamar a blockAppAttempt pasando el sitio que originó el bloqueo'
    );
  });

  test('3. BlockedScreenActivity recibe EXTRA_FROM_SITE y muestra los mensajes exactos sin badge ni emojis', () => {
    const blockedLayoutPath = path.resolve(
      __dirname,
      '../android/app/src/main/res/layout/activity_blocked_screen.xml'
    );
    const blockedLayoutContent = fs.readFileSync(blockedLayoutPath, 'utf8');

    assert.ok(
      blockedScreenContent.includes('const val EXTRA_FROM_SITE = "extra_from_site"'),
      'Debe definir la constante EXTRA_FROM_SITE'
    );
    assert.ok(
      blockedScreenContent.includes('fromSite: String? = null'),
      'createIntent debe aceptar fromSite'
    );
    assert.ok(
      blockedScreenContent.includes('R.drawable.src_assets_icons_bot_menor_botito_nervioso'),
      'Debe mostrar botito_nervioso en la pantalla de bloqueo'
    );
    assert.ok(
      !blockedScreenContent.includes('tvBadge') &&
        !blockedScreenContent.includes('Botito te cuida') &&
        !blockedLayoutContent.includes('tvBadge'),
      'No debe mostrar el badge de Botito te cuida'
    );
    assert.ok(
      !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(blockedScreenContent) &&
        !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(blockedLayoutContent),
      'No debe contener emojis en BlockedScreenActivity ni en su layout'
    );
    assert.ok(
      blockedScreenContent.includes(
        'Esta aplicación está bloqueada para tu protección. Si querés saber más, podés conversar con la persona responsable de tu cuenta.'
      ) &&
        blockedScreenContent.includes(
          'Este sitio está bloqueado para tu protección. Si querés saber más, podés conversar con la persona responsable de tu cuenta.'
        ) &&
        blockedScreenContent.includes(
          'Recordá que bloqueaste esta aplicación para tu bienestar digital. Podés modificar tu lista de bloqueos desde “Sitios y apps”.'
        ) &&
        blockedScreenContent.includes(
          'Recordá que bloqueaste este sitio para tu bienestar digital. Podés modificar tu lista de bloqueos desde “Sitios y apps”.'
        ) &&
        blockedScreenContent.includes('Esta aplicación está bloqueada para tu protección.') &&
        blockedScreenContent.includes('Este sitio está bloqueado para tu protección.') &&
        blockedScreenContent.includes(
          'Recordá que bloqueaste esta aplicación para tu bienestar digital. Para modificar tu lista de bloqueos, podés hablar con la persona responsable de tu cuenta.'
        ) &&
        blockedScreenContent.includes(
          'Recordá que bloqueaste este sitio para tu bienestar digital. Para modificar tu lista de bloqueos, podés hablar con la persona responsable de tu cuenta.'
        ) &&
        blockedScreenContent.includes(
          '¿Querés seguir navegando o descansar de las pantallas un rato?'
        ) &&
        blockedScreenContent.includes('btnContinueBrowsing.text = "Seguir"') &&
        blockedScreenContent.includes('btnUnderstood.text = "Descansar"'),
      'Debe contener exactamente los nuevos mensajes, pregunta y botones Seguir y Descansar'
    );
  });

  test('4. ProtectionService implementa KNOWN_APPS_METADATA y getAppsForWebDomains', () => {
    assert.ok(
      protectionServiceContent.includes('public static readonly KNOWN_APPS_METADATA'),
      'ProtectionService debe definir KNOWN_APPS_METADATA'
    );
    assert.ok(
      protectionServiceContent.includes('public getAppsForWebDomains(domains: string[])'),
      'ProtectionService debe implementar getAppsForWebDomains'
    );
  });

  test('5. syncProtectionRulesWithNative combina aplicaciones derivadas de sitios web bloqueados', () => {
    assert.ok(
      protectionServiceContent.includes('const appsFromBlockedSites = this.getAppsForWebDomains(activeCustomDomains)'),
      'Debe resolver aplicaciones a partir de los dominios activos'
    );
    assert.ok(
      protectionServiceContent.includes('await this.syncProtectionRules(customDomainsOnly, allBlockedApps, lotbaDomains)'),
      'Debe enviar a Android Native la lista combinada allBlockedApps'
    );
  });

  test('6. Verificación algorítmica: Resolución de dominios a aplicaciones', () => {
    const APP_TO_WEB_DOMAINS: Record<string, string[]> = {
      youtube: ['youtube.com', 'm.youtube.com', 'youtu.be'],
      whatsapp: ['whatsapp.com', 'web.whatsapp.com'],
      tiktok: ['tiktok.com', 'm.tiktok.com'],
      instagram: ['instagram.com'],
      facebook: ['facebook.com', 'm.facebook.com'],
      bet365: ['bet365.com', 'bet365.bet.ar'],
    };

    const KNOWN_APPS_METADATA: Record<string, { appName: string; packageName: string }> = {
      youtube: { appName: 'YouTube', packageName: 'com.google.android.youtube' },
      whatsapp: { appName: 'WhatsApp', packageName: 'com.whatsapp' },
      tiktok: { appName: 'TikTok', packageName: 'com.zhiliaoapp.musically' },
      instagram: { appName: 'Instagram', packageName: 'com.instagram.android' },
      facebook: { appName: 'Facebook', packageName: 'com.facebook.katana' },
      bet365: { appName: 'Bet365', packageName: 'com.bet365' },
    };

    function resolveApps(domains: string[]) {
      const apps: any[] = [];
      const matched = new Set<string>();

      for (const raw of domains) {
        const clean = raw.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        for (const [key, doms] of Object.entries(APP_TO_WEB_DOMAINS)) {
          const match = doms.some((d) => clean === d || clean.endsWith(`.${d}`) || d.endsWith(`.${clean}`)) ||
            clean.includes(key);
          if (match && !matched.has(key)) {
            matched.add(key);
            apps.push(KNOWN_APPS_METADATA[key]);
          }
        }
      }
      return apps;
    }

    // Bloquear facebook.com resuelve la app Facebook
    const fbResult = resolveApps(['facebook.com']);
    assert.equal(fbResult.length, 1);
    assert.equal(fbResult[0].appName, 'Facebook');
    assert.equal(fbResult[0].packageName, 'com.facebook.katana');

    // Bloquear múltiples sitios resuelve las apps correspondientes sin duplicados
    const multiResult = resolveApps(['https://www.youtube.com/watch', 'facebook.com', 'm.facebook.com']);
    assert.equal(multiResult.length, 2);
    const names = multiResult.map((a) => a.appName);
    assert.ok(names.includes('YouTube'));
    assert.ok(names.includes('Facebook'));
  });
});
