import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getWelcomeEmail,
  getBlockedSiteAlertEmail,
  getCustomBlockedSiteAlertEmail,
  getBlockedAppAlertEmail,
  getPermissionDisabledAlertEmail,
  getUninstallAttemptAlertEmail,
  getSelfProtectionSiteReminderEmail,
  getSelfProtectionAppLimitEmail,
  getAdultProtectedSiteReminderEmail,
  getAdultProtectedAppLimitEmail,
  getPasswordResetEmail,
} from '../src/templates/emails/index.js';

const DISPLAY_NAME = 'Carlos Gutiérrez';
const PROTECTED_NAME = 'Mateo (13 años)';
const APP_NAME = 'Juegos Violentos';
const SITE_NAME = 'apuestas-online-ilegal.bet';
const PERMISSION_NAME = 'VPN, Accesibilidad';
const LINK = 'https://baprotegemas.netlify.app/activity';

const PLACEHOLDER = /%[A-Z_]+%/;

function checkTemplate(tpl: { subject: string; html: string; text: string }, expectedSubject: string, contains: string[]) {
  assert.strictEqual(tpl.subject, expectedSubject);
  assert.ok(!PLACEHOLDER.test(tpl.html), 'html no debe contener placeholders sin reemplazar');
  assert.ok(!PLACEHOLDER.test(tpl.subject), 'subject no debe contener placeholders sin reemplazar');
  assert.ok(tpl.html.includes(LINK), 'html debe incluir el link');
  for (const c of contains) {
    assert.ok(tpl.html.includes(c), `html debe incluir "${c}"`);
  }
}

test('getWelcomeEmail renderiza nombre y link sin placeholders', () => {
  const tpl = getWelcomeEmail({ displayName: DISPLAY_NAME, link: LINK });
  checkTemplate(tpl, 'Te damos la bienvenida a BA Protege +', [DISPLAY_NAME, LINK]);
});

test('getBlockedSiteAlertEmail renderiza nombre, protegido y link', () => {
  const tpl = getBlockedSiteAlertEmail({ displayName: DISPLAY_NAME, protectedName: PROTECTED_NAME, link: LINK });
  checkTemplate(tpl, 'Se intentó acceder a un sitio no autorizado por LOTBA', [DISPLAY_NAME, PROTECTED_NAME, LINK]);
});

test('getCustomBlockedSiteAlertEmail renderiza nombre, protegido y link', () => {
  const tpl = getCustomBlockedSiteAlertEmail({ displayName: DISPLAY_NAME, protectedName: PROTECTED_NAME, link: LINK });
  checkTemplate(tpl, 'Se intentó acceder a un sitio de la lista personalizada', [DISPLAY_NAME, PROTECTED_NAME, LINK]);
});

test('getBlockedAppAlertEmail usa BLOCKED_APP_NAME y no deja placeholders', () => {
  const tpl = getBlockedAppAlertEmail({ displayName: DISPLAY_NAME, protectedName: PROTECTED_NAME, appName: APP_NAME, link: LINK });
  checkTemplate(tpl, 'Se intentó utilizar una app bloqueada', [DISPLAY_NAME, PROTECTED_NAME, APP_NAME, LINK]);
});

test('getPermissionDisabledAlertEmail renderiza permiso y link', () => {
  const tpl = getPermissionDisabledAlertEmail({ displayName: DISPLAY_NAME, protectedName: PROTECTED_NAME, permissionName: PERMISSION_NAME, link: LINK });
  checkTemplate(tpl, 'Se desactivó un permiso', [DISPLAY_NAME, PROTECTED_NAME, PERMISSION_NAME, LINK]);
});

test('getUninstallAttemptAlertEmail renderiza protegido y link', () => {
  const tpl = getUninstallAttemptAlertEmail({ displayName: DISPLAY_NAME, protectedName: PROTECTED_NAME, link: LINK });
  checkTemplate(tpl, 'Se intentó desinstalar la app', [DISPLAY_NAME, PROTECTED_NAME, LINK]);
});

test('getSelfProtectionSiteReminderEmail renderiza nombre, sitio y link', () => {
  const tpl = getSelfProtectionSiteReminderEmail({ displayName: DISPLAY_NAME, siteName: SITE_NAME, link: LINK });
  checkTemplate(tpl, 'Recordá que bloqueaste este sitio para tu bienestar', [DISPLAY_NAME, SITE_NAME, LINK]);
});

test('getSelfProtectionAppLimitEmail usa LIMITED_APP_NAME y no deja placeholders', () => {
  const tpl = getSelfProtectionAppLimitEmail({ displayName: DISPLAY_NAME, appName: APP_NAME, link: LINK });
  checkTemplate(tpl, 'Estás por superar el tiempo límite en Juegos Violentos', [DISPLAY_NAME, APP_NAME, LINK]);
});

test('getAdultProtectedSiteReminderEmail renderiza nombre, sitio y link', () => {
  const tpl = getAdultProtectedSiteReminderEmail({ displayName: DISPLAY_NAME, siteName: SITE_NAME, link: LINK });
  checkTemplate(tpl, 'Recordá que bloqueaste este sitio para tu bienestar', [DISPLAY_NAME, SITE_NAME, LINK]);
});

test('getAdultProtectedAppLimitEmail usa LIMITED_APP_NAME y no deja placeholders', () => {
  const tpl = getAdultProtectedAppLimitEmail({ displayName: DISPLAY_NAME, appName: APP_NAME, link: LINK });
  checkTemplate(tpl, 'Estás por alcanzar el límite de tiempo en Juegos Violentos', [DISPLAY_NAME, APP_NAME, LINK]);
});

test('getPasswordResetEmail incluye nombre y link de restablecimiento', () => {
  const tpl = getPasswordResetEmail({ displayName: DISPLAY_NAME, link: LINK });
  checkTemplate(tpl, 'Restablecé tu contraseña de BA Protege +', [DISPLAY_NAME, LINK]);
});
